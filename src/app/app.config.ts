// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { newAppDatabase } from "@app/app.db";
import {
    newVehicleController,
    VehicleController,
} from "@app/vehicle/vehicle.controller";
import { newVehicleService } from "@app/vehicle/vehicle.service";

export type AppConfig = {
    vehicleController: VehicleController
}

export function newAppConfig() {
    const { dbPool } = newAppDatabase();
    const vehicleService = newVehicleService(dbPool);

    return {
        vehicleController: newVehicleController(vehicleService),
    };
}
