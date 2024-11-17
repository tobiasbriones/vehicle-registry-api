// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { AppConfig } from "@app/app.config";
import {
    vehicleRegistrationSchema,
    vehicleUpdateSchema,
} from "@app/vehicle/vehicle";
import { VehicleController } from "@app/vehicle/vehicle.controller";
import express, { Router } from "express";
import { validateBody } from "./app.validation";

export function newAppRouter({ vehicleController }: AppConfig) {
    const router = express.Router();

    router.get("/", (_, res) => {
        res.send("Vehicle Registry Server");
    });

    routeVehicles(router, vehicleController);
    return router;
}

function routeVehicles(router: Router, vehicleController: VehicleController) {
    router.post(
        "/vehicles",
        validateBody(vehicleRegistrationSchema),
        vehicleController.create,
    );

    router.get("/vehicles/:number", vehicleController.read);

    router.get("/vehicles", vehicleController.readAll);

    router.put(
        "/vehicles/:number",
        validateBody(vehicleUpdateSchema),
        vehicleController.update,
    );

    router.delete("/vehicles/:number", vehicleController.delete);
}
