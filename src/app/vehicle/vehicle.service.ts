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

            return internalError(msg, String(reason));
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
}
