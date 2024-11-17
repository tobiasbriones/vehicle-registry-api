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
import { withError } from "@log/log";
import { Pool } from "pg";
import { Vehicle } from "./vehicle";

export type DuplicateVehicleInfo = {
    context: MessageOf<Vehicle>,
    detail: string,
}

export const duplicateVehicleInfo
    = (context: MessageOf<Vehicle>, detail: string): DuplicateVehicleInfo =>
    ({ context, detail });

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
            RETURNING number, brand, model;
        `;

        const rejectReason = (reason: unknown) => (context: MessageOf<Vehicle>) => {
            const reasonStr = String(reason);
            let reject;
            let info;

            if (reasonStr.includes(`duplicate key value violates unique constraint "vehicle_number_key"`)) {
                reject = rejectDuplicateError;
                info = duplicateVehicleInfo(
                    context,
                    "A vehicle with this number already exists.",
                );
            }
            else {
                reject = rejectInternalError;
                info = context;
            }

            return reject(info);
        };

        const handleError = (reason: unknown) =>
            withError(messageOf("Fail to create vehicle", vehicle))
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
                withError("Internal error. Fail to add record.")
                    .logInternalReason(`Row count ${ queryResult.rowCount } is not 1`)
                    .catch(rejectInternalError);
        }

        return result;
    },

    async read(number) {
        const query = `
            SELECT number, brand, model
            FROM vehicle
            WHERE number = $1;
        `;

        const handleError = (reason: unknown) =>
            withError(`Fail to read vehicle with number ${ number }.`)
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
            SELECT number, brand, model
            FROM vehicle
            ORDER BY id DESC
            LIMIT $1 OFFSET $2;
        `;

        const handleError = (reason: unknown) =>
            withError(`Failed to retrieve vehicles for page ${ page } with limit ${ limit }.`)
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
            RETURNING number, brand, model;
        `;

        const handleError = async (reason: unknown) => {
            return withError(
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
            withError(`Fail to delete vehicle with number ${ number }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return pool
            .query(query, [ number ])
            .then(res => res.rowCount === 1)
            .catch(handleError);
    },
});
