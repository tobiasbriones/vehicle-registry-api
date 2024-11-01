// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { Pool } from "pg";

export type DbConfig = {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export function loadDbConfigFromEnv(): DbConfig {
    return {
        user: process.env.DB_USER || "",
        host: process.env.DB_HOST || "",
        database: process.env.DB_NAME || "",
        password: process.env.DB_PASSWORD || "",
        port: parseInt(process.env.DB_PORT || "5432", 10),
    };
}

export function newDbPool(config: DbConfig) {
    return new Pool(config);
}
