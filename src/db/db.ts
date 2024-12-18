// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import pg from "pg";

const { Pool } = pg;

export type DbConfig = {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export function newDbPool(config: DbConfig) {
    return new Pool({
        ...config,
        ssl: process.env.NODE_ENV === "production",
    });
}

export function newDbPoolFromEnv() {
    return newDbPool({
        user: process.env.DB_USER || "",
        host: process.env.DB_HOST || "",
        database: process.env.DB_NAME || "",
        password: process.env.DB_PASSWORD || "",
        port: parseInt(process.env.DB_PORT || "5432", 10),
    });
}
