// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

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
            const msg = `Fail to create vehicle ${ JSON.stringify(
                vehicle,
                null,
                4,
            ) }.`;

            console.error(msg, "Reason:", String(reason));
            return Promise.reject(msg);
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

            console.error(
                msg,
                "Reason:",
                `Row count ${ queryResult.rowCount } is not 1`,
            );
            result = Promise.reject(msg);
        }

        return result;
    }
}
