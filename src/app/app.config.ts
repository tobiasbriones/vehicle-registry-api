// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { newAppDatabase } from "@app/app.db";
import {
    DriverController,
    newDriverController,
} from "@app/driver/driver.controller";
import { newDriverService } from "@app/driver/driver.service";
import {
    newVehicleLogController,
    VehicleLogController,
} from "@app/vehicle-log/vehicle-log.controller";
import { newVehicleLogService } from "@app/vehicle-log/vehicle-log.service";
import {
    newVehicleController,
    VehicleController,
} from "@app/vehicle/vehicle.controller";
import { newVehicleService } from "@app/vehicle/vehicle.service";

export type AppConfig = {
    vehicleController: VehicleController
    driverController: DriverController
    vehicleLogController: VehicleLogController
}

export function newAppConfig(): AppConfig {
    const { dbPool } = newAppDatabase();
    const vehicleService = newVehicleService(dbPool);
    const driverService = newDriverService(dbPool);
    const vehicleLogService = newVehicleLogService(
        dbPool,
        vehicleService,
        driverService,
    );

    return {
        vehicleController: newVehicleController(vehicleService),
        driverController: newDriverController(driverService),
        vehicleLogController: newVehicleLogController(vehicleLogService),
    };
}
