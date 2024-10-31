// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

/** @type {import("ts-jest").JestConfigWithTsJest} **/
export default {
    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": [ "ts-jest", {} ],
    },
};
