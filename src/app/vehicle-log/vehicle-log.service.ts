// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import {
    MessageOf,
    messageOf,
    rejectInternalError,
    rejectReferenceNotFoundError,
} from "@app/app.error";
import { driverFullName } from "@app/driver/driver";
import { DriverService } from "@app/driver/driver.service";
import {
    driverNotFoundInfo,
    vehicleNotFoundInfo,
} from "@app/vehicle-log/vehicle-log.error";
import { withError } from "@log/log";
import { Pool, PoolClient, QueryResult } from "pg";
import {
    VehicleLog,
    VehicleLogCreateBody,
    VehicleLogUpdateBody,
} from "./vehicle-log";

export type VehicleLogService = {
    create: (log: VehicleLogCreateBody) => Promise<VehicleLog>,
    read: (id: number) => Promise<VehicleLog | null>,
    readAll: (limit: number, page: number) => Promise<VehicleLog[]>,
    update: (log: VehicleLogUpdateBody) => Promise<VehicleLog | null>,
    delete: (id: number) => Promise<boolean>,
}

export const newVehicleLogService = (
    pool: Pool,
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

        type VehicleExistsResult = { id: string } | null;

        const checkVehicleExists = async (
            client: PoolClient,
        ): Promise<VehicleExistsResult> => client
            .query(
                "SELECT id FROM vehicle WHERE number = $1",
                [ vehicleNumber ],
            )
            .then(recordFoundOrNull<VehicleExistsResult>);

        type DriverExistsResult = { id: string } | null;

        const checkDriverExists = async (
            client: PoolClient,
        ): Promise<DriverExistsResult> => client
            .query(
                "SELECT id FROM driver WHERE license_id = $1",
                [ driverLicenseId ],
            )
            .then(recordFoundOrNull<VehicleExistsResult>);

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

            // Create vehicle log
            const createLogQuery = `
                INSERT INTO vehicle_log (vehicle_id, driver_id, event_type,
                                         event_timestamp, mileage)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
                RETURNING id, event_timestamp AS timestamp
            `;

            const queryResult = await pool.query(createLogQuery, [
                    vehicleId,
                    driverId,
                    logType,
                    mileageInKilometers,
                ],
            );

            await client.query("COMMIT");

            // Read driver full name to return the final record
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
                vehicleNumber,
                driverFullName: driverFullName(driver),
                logType,
                timestamp: result.timestamp,
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
                   vehicle.number      AS "vehicleNumber",
                   driver.license_id   AS "driverFullName",
                   log.event_type      AS "logType",
                   log.event_timestamp AS "timestamp",
                   log.mileage         AS "mileageInKilometers"
            FROM vehicle_log log
                     INNER JOIN vehicle ON log.vehicle_id = vehicle.id
                     INNER JOIN driver ON log.driver_id = driver.id
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

    async readAll(limit, page) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT log.id,
                   vehicle.number      AS "vehicleNumber",
                   driver.license_id   AS "driverFullName",
                   log.event_type      AS "logType",
                   log.event_timestamp AS "timestamp",
                   log.mileage         AS "mileageInKilometers"
            FROM vehicle_log log
                     INNER JOIN vehicle ON log.vehicle_id = vehicle.id
                     INNER JOIN driver ON log.driver_id = driver.id
            ORDER BY log.event_timestamp DESC
            LIMIT $1 OFFSET $2;
        `;

        const handleError = (reason: unknown) =>
            withError(`Failed to retrieve vehicle logs for page ${ page } with limit ${ limit }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ limit, offset ])
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
