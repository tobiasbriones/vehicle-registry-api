// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import { rejectDuplicateError, rejectInternalError } from "@app/app.error";
import { withErrorMessage } from "@log/log";
import { Pool } from "pg";
import { Vehicle } from "./vehicle";

export class VehicleService {
    private readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(vehicle: Vehicle): Promise<Vehicle> {
        const { brand, model, number } = vehicle;
        const query = `
            INSERT INTO vehicle (brand, model, number)
            VALUES ($1, $2, $3) RETURNING *;
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

            return reject(`${ msg }\n${detailMsg}`);
        };

        const handleError = (reason: unknown) =>
            withErrorMessage(`Fail to create vehicle ${ objToString(vehicle) }.`)
                .logInternalReason(reason)
                .catch(rejectReason(reason));

        const queryResult = await this
            .pool
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
    }

    async read(id: number): Promise<Vehicle | null> {
        const query = `
            SELECT *
            FROM vehicle
            WHERE id = $1;
        `;

        const handleError = (reason: unknown) =>
            withErrorMessage(`Fail to read vehicle with id ${ id }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return this
            .pool
            .query(query, [ id ])
            .then(res => res.rowCount === 1 ? res.rows[0] : null)
            .catch(handleError);
    }

    async update(id: number, vehicle: Vehicle): Promise<Vehicle | null> {
        const { brand, model, number } = vehicle;
        const query = `
            UPDATE vehicle
            SET brand  = $1,
                model  = $2,
                number = $3
            WHERE id = $4
            RETURNING *;
        `;

        const handleError = async (reason: unknown) => {
            return withErrorMessage(
                `Fail to update vehicle ${ objToString(vehicle) } with id ${ id }.`,
            ).logInternalReason(reason)
             .catch(rejectInternalError);
        };

        return this
            .pool
            .query(query, [ brand, model, number, id ])
            .then(res => res.rowCount === 1 ? res.rows[0] : null)
            .catch(handleError);
    }

    async delete(id: number): Promise<boolean> {
        const query = `
            DELETE
            FROM vehicle
            WHERE id = $1;
        `;

        const handleError = (reason: unknown) =>
            withErrorMessage(`Fail to delete vehicle with id ${ id }.`)
                .logInternalReason(reason)
                .catch(rejectInternalError);

        return this
            .pool
            .query(query, [ id ])
            .then(res => res.rowCount === 1)
            .catch(handleError);
    }
}

export const newVehicleService = (pool: Pool) => new VehicleService(pool);
