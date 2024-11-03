// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

/** @type {import("ts-jest").JestConfigWithTsJest} **/
export default {
    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": [ "ts-jest", {} ],
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@log/(.*)$": "<rootDir>/src/log/$1",
        "^@db/(.*)$": "<rootDir>/src/db/$1",
        "^@app/(.*)$": "<rootDir>/src/app/$1",
    },
};
