// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import {
    MessageOf,
    messageOf,
    rejectIncorrectValueError,
    rejectInternalError,
    rejectReferenceNotFoundError,
} from "@app/app.error";
import { driverSqlJsonArgs } from "@app/driver/driver";
import { DriverService } from "@app/driver/driver.service";
import {
    driverNotFoundInfo,
    incorrectEventInfo,
    incorrectMileageInfo,
    vehicleNotFoundInfo,
} from "@app/vehicle-log/vehicle-log.error";
import { vehicleSqlJsonArgs } from "@app/vehicle/vehicle";
import { VehicleService } from "@app/vehicle/vehicle.service";
import { withError } from "@log/log";
import { Pool, PoolClient, QueryResult } from "pg";
import {
    VehicleLog,
    VehicleLogCreateBody,
    VehicleLogType,
    VehicleLogUpdateBody,
} from "./vehicle-log";

export type ReadAllQueryParams = {
    vehicleNumber?: string;
    driverLicenseId?: string;
    date?: Date;
}

export type VehicleLogService = {
    create: (log: VehicleLogCreateBody) => Promise<VehicleLog>,
    read: (id: number) => Promise<VehicleLog | null>,

    readAll: (
        limit: number,
        page: number,
        params: ReadAllQueryParams,
    ) => Promise<VehicleLog[]>,

    update: (log: VehicleLogUpdateBody) => Promise<VehicleLog | null>,
    delete: (id: number) => Promise<boolean>,
}

export const newVehicleLogService = (
    pool: Pool,
    vehicleService: VehicleService,
    driverService: DriverService,
): VehicleLogService => ({
    async create(log) {
        const {
            vehicleNumber,
            driverLicenseId,
            logType,
            mileageInKilometers,
        } = log;

        const recordFoundOrNull = <T>(res: QueryResult): T | null =>
            res.rowCount === 1
            ? res.rows[0] as T
            : null;

        type VehicleExistsResult = { id: number } | null;

        const checkVehicleExists = async (
            client: PoolClient,
        ): Promise<VehicleExistsResult> => client
            .query(
                "SELECT id FROM vehicle WHERE number = $1",
                [ vehicleNumber ],
            )
            .then(recordFoundOrNull<VehicleExistsResult>);

        type DriverExistsResult = { id: number } | null;

        const checkDriverExists = async (
            client: PoolClient,
        ): Promise<DriverExistsResult> => client
            .query(
                "SELECT id FROM driver WHERE license_id = $1",
                [ driverLicenseId ],
            )
            .then(recordFoundOrNull<VehicleExistsResult>);

        type MileageIsValidResult = { isValid: boolean, lastMileage: number };

        const checkMileageIsValid = async (
            client: PoolClient,
            vehicleId: number,
        ): Promise<MileageIsValidResult> => client
            .query(
                `
                    WITH last_mileage AS (SELECT mileage
                                          FROM vehicle_log
                                          WHERE vehicle_id = $1
                                          ORDER BY event_timestamp DESC
                                          LIMIT 1)
                    SELECT CASE
                               WHEN NOT EXISTS (SELECT 1 FROM last_mileage)
                                   THEN TRUE -- No previous records, valid to start at any mileage
                               WHEN $2 = 0
                                   THEN TRUE -- Mileage resets are valid
                               WHEN $2 >= (SELECT mileage FROM last_mileage)
                                   THEN TRUE -- New mileage is greater or equal to the last mileage
                               ELSE FALSE -- New mileage is less than the last mileage
                               END                            AS "isValid",
                           (SELECT mileage FROM last_mileage) AS "lastMileage"

                `,
                [ vehicleId, mileageInKilometers ],
            )
            .then(res => ({
                isValid: res.rows[0].isValid,
                lastMileage: res.rows[0].lastMileage,
            }));

        type EventIsValidResult = {
            isValid: boolean,
            lastEvent: VehicleLogType
        };

        const checkEventIsValid = async (
            client: PoolClient,
            vehicleId: number,
        ): Promise<EventIsValidResult> => client
            .query(
                `
                    WITH last_event AS (SELECT event_type
                                        FROM vehicle_log
                                        WHERE vehicle_id = $1
                                        ORDER BY event_timestamp DESC
                                        LIMIT 1)
                    SELECT CASE
                               WHEN NOT EXISTS (SELECT 1 FROM last_event)
                                   THEN TRUE -- No previous records, valid to start with any event
                               WHEN $2 = 'entry' AND
                                    (SELECT event_type FROM last_event) = 'exit'
                                   THEN TRUE -- Last event was 'exit', current can be 'entry'
                               WHEN $2 = 'exit' AND
                                    (SELECT event_type FROM last_event) =
                                    'entry'
                                   THEN TRUE -- Last event was 'entry', current can be 'exit'
                               ELSE FALSE -- Invalid: Repeating the same event or invalid transition
                               END                             AS "isValid",
                           (SELECT event_type FROM last_event) AS "lastEvent";
                `,
                [ vehicleId, logType ],
            )
            .then(res => ({
                isValid: res.rows[0].isValid,
                lastEvent: res.rows[0].lastEvent,
            }));

        const rejectReason = (reason: unknown) => (context: MessageOf<string>) => {
            const reasonStr = String(reason);
            let reject;
            let info;

            if (reasonStr.includes(`Vehicle with number ${ vehicleNumber } does not exist`)) {
                reject = rejectReferenceNotFoundError;
                info = vehicleNotFoundInfo(
                    context,
                    "A vehicle with this number was not found.",
                );
            }
            else if (reasonStr.includes(`Driver with license ID ${ driverLicenseId } does not exist`)) {
                reject = rejectReferenceNotFoundError;
                info = driverNotFoundInfo(
                    context,
                    "A driver with this license ID was not found.",
                );
            }
            else if (reasonStr.includes(`Provided vehicle mileage ${ mileageInKilometers } is invalid`)) {
                reject = rejectIncorrectValueError;
                info = incorrectMileageInfo(
                    context,
                    `${ reasonStr } Vehicle mileage can only be greater than or equals to the last mileage recorded (i.e., increasing) or zero (i.e., reset).`,
                );
            }
            else if (reasonStr.includes(`Provided log type "${ logType }" is invalid`)) {
                reject = rejectIncorrectValueError;
                info = incorrectEventInfo(
                    context,
                    `${ reasonStr } Log type cannot be the same of the last vehicle log.`,
                );
            }
            else {
                reject = rejectInternalError;
                info = context;
            }

            return reject(info);
        };

        const handleError = (reason: unknown) =>
            withError(messageOf("Fail to create vehicle log", log))
                .logInternalReason(reason)
                .catch(rejectReason(reason));

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Check if vehicle exists
            const vehicleExists = await checkVehicleExists(client);

            if (vehicleExists === null) {
                throw new Error(`Vehicle with number ${ vehicleNumber } does not exist`);
            }

            const vehicleId = vehicleExists.id;

            // Check if driver exists
            const driverExists = await checkDriverExists(client);

            if (driverExists === null) {
                throw new Error(`Driver with license ID ${ driverLicenseId } does not exist`);
            }

            const driverId = driverExists.id;

            // Ensure the mileage is valid (i.e., increasing or zero)
            const isMileageValid = await checkMileageIsValid(client, vehicleId);

            if (!isMileageValid.isValid) {
                throw new Error(
                    `Provided vehicle mileage ${ mileageInKilometers } is invalid. Last recorded mileage: ${ isMileageValid.lastMileage }.`,
                );
            }

            // Ensure the event is valid (i.e., entry -> exit -> entry -> ...)
            const isEventValid = await checkEventIsValid(client, vehicleId);

            if (!isEventValid.isValid) {
                throw new Error(
                    `Provided log type "${ logType }" is invalid. Last recorded log: "${ isEventValid.lastEvent }".`,
                );
            }

            // Create vehicle log
            const createLogQuery = `
                INSERT INTO vehicle_log (vehicle_id, driver_id, event_type,
                                         event_timestamp, mileage)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
                RETURNING id, event_timestamp AS timestamp
            `;

            const queryResult = await client.query(createLogQuery, [
                    vehicleId,
                    driverId,
                    logType,
                    mileageInKilometers,
                ],
            );

            await client.query("COMMIT");

            // Read vehicle to return the final record
            const vehicle = await vehicleService.read(vehicleNumber);

            if (vehicle === null) {
                throw new Error(
                    "Fail to read vehicle after registering this vehicle log.",
                );
            }

            // Read driver to return the final record
            const driver = await driverService.read(driverLicenseId);

            if (driver === null) {
                throw new Error(
                    "Fail to read driver after registering this vehicle log.",
                );
            }

            // Read Vehicle Log query result
            let result = { id: -1, timestamp: new Date() };

            if (queryResult.rowCount === 1) {
                result = queryResult.rows[0];
            }
            else {
                throw new Error(
                    `Fail to add record. Row count ${ queryResult.rowCount } is not 1`,
                );
            }

            return {
                id: result.id,
                vehicle,
                driver,
                logType,
                timestamp: new Date(result.timestamp),
                mileageInKilometers: mileageInKilometers,
            } as VehicleLog;
        }
        catch (error) {
            await handleError(error);
            throw error;
        }
        finally {
            client.release();
        }
    },

    async read(id) {
        const query = `
            SELECT log.id,
                   json_build_object(${ vehicleSqlJsonArgs })
                                       AS vehicle,

                   json_build_object(${ driverSqlJsonArgs })
                                       AS driver,

                   log.event_type      AS "logType",
                   log.event_timestamp AS "timestamp",
                   log.mileage         AS "mileageInKilometers"
            FROM vehicle_log log
                     INNER JOIN vehicle ON log.vehicle_id = vehicle.id
                     INNER JOIN driver ON log.driver_id = driver.id
                     LEFT JOIN driver_name name ON driver.id = name.driver_id
            WHERE log.id = $1;
        `;

        const handleError = (reason: unknown) =>
            withError(`Fail to read vehicle log with ID ${ id }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ id ])
            .then(res =>
                res.rowCount === 1
                ? res.rows[0] as VehicleLog
                : null,
            )
            .catch(handleError);
    },

    async readAll(limit, page, { vehicleNumber, driverLicenseId, date }) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT vl.id,
                   v.number           AS "vehicleNumber",
                   d.license_id       AS "driverLicenseId",
                   vl.event_type      AS "eventType",
                   vl.event_timestamp AS "timestamp",
                   vl.mileage         AS "mileage"
            FROM vehicle_log vl
                     JOIN vehicle v ON vl.vehicle_id = v.id
                     JOIN driver d ON vl.driver_id = d.id
            WHERE ($1::VARCHAR IS NULL OR v.number = $1)
              AND ($2::VARCHAR IS NULL OR d.license_id = $2)
              AND ($3::DATE IS NULL OR DATE(vl.event_timestamp) = $3)
            ORDER BY vl.event_timestamp DESC
            LIMIT $4 OFFSET $5;
        `;

        const params = [
            vehicleNumber || null,
            driverLicenseId || null,
            date ? date.toISOString().split("T")[0] : null, // Convert date to
                                                            // YYYY-MM-DD
            limit,
            offset,
        ];

        const handleError = (reason: unknown) =>
            withError(`Failed to retrieve vehicle logs for page ${ page } with limit ${ limit }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, params)
            .then(res => res.rows)
            .catch(handleError);
    },

    async update(log) {
        const {
            id,
            logType,
            mileageInKilometers,
        } = log;

        const updateQuery = `
            UPDATE vehicle_log
            SET event_type = $1,
                mileage    = $2
            WHERE id = $3
            RETURNING id, vehicle_id, driver_id, event_type, event_timestamp AS timestamp, mileage;
        `;

        const handleError = (reason: unknown) =>
            withError(`Fail to update vehicle log with ID ${ id }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(updateQuery, [ logType, mileageInKilometers, id ])
            .then(res =>
                res.rowCount === 1
                ? this.read(id)
                : null)
            .catch(handleError);
    },

    async delete(id) {
        const query = `
            DELETE
            FROM vehicle_log
            WHERE id = $1;
        `;

        const handleError = (reason: unknown) =>
            withError(`Fail to delete vehicle log with ID ${ id }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ id ])
            .then(res => res.rowCount === 1)
            .catch(handleError);
    },
});
