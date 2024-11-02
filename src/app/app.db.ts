// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { newDbPoolFromEnv } from "@db/db";

export function newAppDatabase() {
    return {
        dbPool: newDbPoolFromEnv(),
    };
}
