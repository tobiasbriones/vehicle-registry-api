// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import { internalError } from "@log/log";
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

        const handleError = (reason: unknown) => {
            const msg = `Fail to create vehicle ${ objToString(vehicle) }.`;
            return internalError(msg, reason);
        };

        const queryResult = await this
            .pool
            .query(query, [ brand, model, number ])
            .catch(handleError);

        let result;

        if (queryResult.rowCount === 1) {
            result = queryResult.rows[0];
        }
        else {
            const msg = "Internal error. Fail to add record.";

            result = internalError(
                msg,
                `Row count ${ queryResult.rowCount } is not 1`,
            );
        }

        return result;
    }

    async read(id: number): Promise<Vehicle | null> {
        const query = `
            SELECT *
            FROM vehicle
            WHERE id = $1;
        `;

        const handleError = (reason: unknown) => {
            const msg = `Fail to read vehicle with id ${ id }.`;
            return internalError(msg, reason);
        };

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

        const handleError = (reason: unknown) => {
            const msg = `Fail to update vehicle ${ objToString(vehicle) } with id ${ id }.`;
            return internalError(msg, reason);
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

        const handleError = (reason: unknown) => {
            const msg = `Fail to delete vehicle with id ${ id }.`;
            return internalError(msg, reason);
        };

        return await this
            .pool
            .query(query, [ id ])
            .then(res => res.rowCount === 1)
            .catch(handleError);
    }
}
