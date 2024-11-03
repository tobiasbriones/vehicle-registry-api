// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import { rejectDuplicateError, rejectInternalError } from "@app/app.error";
import { withErrorMessage } from "@log/log";
import { Pool } from "pg";
import { Vehicle } from "./vehicle";

export type VehicleService = {
    create: (vehicle: Vehicle) => Promise<Vehicle>,
    read: (number: string) => Promise<Vehicle | null>,
    readAll: (limit: number, page: number) => Promise<Vehicle[]>,
    update: (vehicle: Vehicle) => Promise<Vehicle | null>,
    delete: (number: string) => Promise<boolean>,
}

export const newVehicleService = (pool: Pool): VehicleService => ({
    async create(vehicle) {
        const { brand, model, number } = vehicle;
        const query = `
            INSERT INTO vehicle (brand, model, number)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const rejectReason = (reason: unknown) => (msg: string) => {
            const reasonStr = String(reason);
            let detailMsg = "";
            let reject;

            if (reasonStr.includes(`duplicate key value violates unique constraint "vehicle_number_key"`)) {
                detailMsg = "A vehicle with this number already exists.";
                reject = rejectDuplicateError;
            }
            else {
                reject = rejectInternalError;
            }

            return reject(`${ msg }\n${ detailMsg }`);
        };

        const handleError = (reason: unknown) =>
            withErrorMessage(`Fail to create vehicle ${ objToString(vehicle) }.`)
                .logInternalReason(reason)
                .catch(rejectReason(reason));

        const queryResult = await pool
            .query(query, [ brand, model, number ])
            .catch(handleError);

        let result;

        if (queryResult.rowCount === 1) {
            result = queryResult.rows[0];
        }
        else {
            result =
                withErrorMessage("Internal error. Fail to add record.")
                    .logInternalReason(`Row count ${ queryResult.rowCount } is not 1`)
                    .catch(rejectInternalError);
        }

        return result;
    },

    async read(number) {
        const query = `
            SELECT *
            FROM vehicle
            WHERE number = $1;
        `;

        const handleError = (reason: unknown) =>
            withErrorMessage(`Fail to read vehicle with number ${ number }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ number ])
            .then(res => res.rowCount === 1 ? res.rows[0] : null)
            .catch(handleError);
    },

    async readAll(limit, page) {
        const offset = (page - 1) * limit;

        const query = `
            SELECT *
            FROM vehicle
            LIMIT $1 OFFSET $2;
        `;

        const handleError = (reason: unknown) =>
            withErrorMessage(`Failed to retrieve vehicles for page ${ page } with limit ${ limit }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ limit, offset ])
            .then(res => res.rows)
            .catch(handleError);
    },

    async update(vehicle) {
        const { number, brand, model } = vehicle;
        const query = `
            UPDATE vehicle
            SET brand  = $1,
                model  = $2
            WHERE number = $3
            RETURNING *;
        `;

        const handleError = async (reason: unknown) => {
            return withErrorMessage(
                `Fail to update vehicle ${ objToString(vehicle) } with number ${ number }.`,
            ).logInternalReason(reason)
             .catch(rejectInternalError);
        };

        return pool
            .query(query, [ brand, model, number ])
            .then(res => res.rowCount === 1 ? res.rows[0] : null)
            .catch(handleError);
    },

    async delete(number) {
        const query = `
            DELETE
            FROM vehicle
            WHERE number = $1;
        `;

        const handleError = (reason: unknown) =>
            withErrorMessage(`Fail to delete vehicle with number ${ number }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ number ])
            .then(res => res.rowCount === 1)
            .catch(handleError);
    },
});
