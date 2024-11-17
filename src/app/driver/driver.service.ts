// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import {
    MessageOf,
    messageOf,
    rejectDuplicateError,
    rejectInternalError,
} from "@app/app.error";
import { Driver } from "@app/driver/driver";
import { withError } from "@log/log";
import { Pool } from "pg";

export type DuplicateDriverInfo = {
    context: MessageOf<Driver>,
    detail: string,
}

export const duplicateDriverInfo
    = (context: MessageOf<Driver>, detail: string): DuplicateDriverInfo =>
    ({ context, detail });

export type DriverService = {
    create: (driver: Driver) => Promise<Driver>,
    read: (licenseId: string) => Promise<Driver | null>,
    readAll: (limit: number, page: number) => Promise<Driver[]>,
    update: (driver: Driver) => Promise<Driver | null>,
    delete: (licenseId: string) => Promise<boolean>,
}

export const newDriverService = (pool: Pool): DriverService => ({
    async create(driver) {
        const {
            licenseId,
            firstName,
            surName,
            secondName,
            secondSurName,
        } = driver;

        const driverQuery = `
            INSERT INTO driver (license_id)
            VALUES ($1)
            RETURNING id;
        `;

        const driverNameQuery = `
            INSERT INTO driver_name (driver_id, first_name, sur_name,
                                     second_name, second_surname)
            VALUES ($1, $2, $3, $4, $5);
        `;

        const rejectReason = (reason: unknown) => (context: MessageOf<Driver>) => {
            const reasonStr = String(reason);
            let reject;
            let info;

            if (reasonStr.includes(`duplicate key value violates unique constraint "driver_license_id_key"`)) {
                reject = rejectDuplicateError;
                info = duplicateDriverInfo(
                    context,
                    "A driver with this license ID already exists.",
                );
            }
            else {
                reject = rejectInternalError;
                info = context;
            }

            return reject(info);
        };

        const handleError = (reason: unknown) =>
            withError(messageOf("Fail to create driver", driver))
                .logInternalReason(reason)
                .catch(rejectReason(reason));

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Insert into the driver table
            const result = await client.query(driverQuery, [ licenseId ]);
            const driverId = result.rows[0].id;

            // Insert into the driver_name table
            await client.query(driverNameQuery, [
                driverId,
                firstName,
                surName,
                secondName || null,
                secondSurName || null,
            ]);

            await client.query("COMMIT");
        }
        catch (error) {
            await client.query("ROLLBACK");
            await handleError(error);
        }
        finally {
            client.release();
        }

        return driver;
    },

    async read(licenseId) {
        const query = `
            SELECT driver.license_id   AS "licenseId",
                   name.first_name     AS "firstName",
                   name.sur_name       AS "surName",
                   name.second_name    AS "secondName",
                   name.second_surname AS "secondSurName"
            FROM driver
                     INNER JOIN driver_name name ON driver.id = name.driver_id
            WHERE driver.license_id = $1;
        `;

        const handleError = (reason: unknown) =>
            withError(`Fail to read driver with license ID ${ licenseId }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ licenseId ])
            .then(res => res.rowCount === 1 ? res.rows[0] : null)
            .catch(handleError);
    },

    async readAll(limit, page) {
        const offset = (page - 1) * limit;

        const query = `
            SELECT driver.license_id   AS "licenseId",
                   name.first_name     AS "firstName",
                   name.sur_name       AS "surName",
                   name.second_name    AS "secondName",
                   name.second_surname AS "secondSurName"
            FROM driver
                     INNER JOIN driver_name name ON driver.id = name.driver_id
            ORDER BY driver.id DESC
            LIMIT $1 OFFSET $2;
        `;

        const handleError = (reason: unknown) =>
            withError(`Failed to retrieve drivers for page ${ page } with limit ${ limit }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ limit, offset ])
            .then(res => res.rows)
            .catch(handleError);
    },

    async update(driver) {
        const {
            licenseId,
            firstName,
            surName,
            secondName,
            secondSurName,
        } = driver;

        const nameQuery = `
            UPDATE driver_name AS name
            SET first_name     = $1,
                sur_name       = $2,
                second_name    = $3,
                second_surname = $4
            FROM driver
            WHERE driver.license_id = $5
              AND name.driver_id = driver.id
            RETURNING
                first_name AS "firstName",
                sur_name AS "surName",
                second_name AS "secondName",
                second_surname AS "secondSurName";
        `;

        const handleError = async (reason: unknown) => {
            return withError(
                `Fail to update driver ${ objToString(driver) } with license ID ${ licenseId }.`,
            ).logInternalReason(reason)
             .catch(rejectInternalError);
        };

        try {
            const nameUpdateResult = await pool.query(nameQuery, [
                firstName,
                surName,
                secondName || null,
                secondSurName || null,
                licenseId,
            ]);

            if (nameUpdateResult.rowCount === 0) {
                return null;
            }

            return {
                licenseId,
                firstName: nameUpdateResult.rows[0].firstName,
                surName: nameUpdateResult.rows[0].surName,
                secondName: nameUpdateResult.rows[0].secondName,
                secondSurName: nameUpdateResult.rows[0].secondSurName,
            };
        }
        catch (error) {
            await handleError(error);
            return null;
        }
    },

    async delete(licenseId) {
        const query = `
            DELETE FROM driver
            WHERE license_id = $1;
        `;

        const handleError = (reason: unknown) =>
            withError(`Fail to delete driver with license ID ${ licenseId }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ licenseId ])
            .then(res => res.rowCount === 1)
            .catch(handleError);
    },
});
