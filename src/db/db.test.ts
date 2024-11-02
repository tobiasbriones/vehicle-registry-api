// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { Pool } from "pg";
import { DbConfig, newDbPool, newDbPoolFromEnv } from "./db";

jest.mock("pg", () => {
    return {
        Pool: jest.fn(),
    };
});

describe("Database Configuration", () => {
    afterEach(() => {
        jest.resetModules(); // Reset any module state after each test
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it("should create a new database pool from environment variables", () => {
        // Set environment variables
        process.env.DB_USER = "testUser";
        process.env.DB_HOST = "testHost";
        process.env.DB_NAME = "testDb";
        process.env.DB_PASSWORD = "testPassword";
        process.env.DB_PORT = "5432";

        const expectedConfig: DbConfig = {
            user: "testUser",
            host: "testHost",
            database: "testDb",
            password: "testPassword",
            port: 5432,
        };

        const pool = newDbPoolFromEnv();

        expect(Pool).toHaveBeenCalledWith(expectedConfig);
        expect(pool).toBeInstanceOf(Pool);
    });

    it(
        "should create a new database pool with default values if env vars are not set",
        () => {
            delete process.env.DB_USER;
            delete process.env.DB_HOST;
            delete process.env.DB_NAME;
            delete process.env.DB_PASSWORD;
            delete process.env.DB_PORT;

            const expectedConfig: DbConfig = {
                user: "",
                host: "",
                database: "",
                password: "",
                port: 5432,
            };

            const pool = newDbPoolFromEnv();

            expect(Pool).toHaveBeenCalledWith(expectedConfig);
            expect(pool).toBeInstanceOf(Pool);
        },
    );

    it("should create a new database pool with the given config", () => {
        const config: DbConfig = {
            user: "testUser",
            host: "testHost",
            database: "testDb",
            password: "testPassword",
            port: 5432,
        };

        newDbPool(config);

        expect(Pool).toHaveBeenCalledWith(config);
    });
});
