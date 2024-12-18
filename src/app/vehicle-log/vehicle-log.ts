// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { Driver } from "@app/driver/driver";
import { Vehicle } from "@app/vehicle/vehicle";
import { z } from "zod";

export type VehicleLogType = "entry" | "exit";

/**
 * Defines a log when a vehicle accesses or leaves.
 */
export type VehicleLog = {
    id: number,
    vehicle: Vehicle,
    driver: Driver,
    logType: VehicleLogType;
    timestamp: Date;
    mileageInKilometers: number;
}

export type VehicleLogCreateBody = {
    vehicleNumber: string,
    driverLicenseId: string,
    logType: VehicleLogType;
    mileageInKilometers: number;
}

export const vehicleLogRegistrationSchema = z.object({
    driverLicenseId: z
        .string()
        .min(6)
        .max(20)
        .regex(
            /^[A-Za-z0-9-]+$/,
            "Invalid license ID format. Only letters, numbers, and hyphens are allowed.",
        ),

    vehicleNumber: z.string().max(20).trim().min(1),
    logType: z.enum([ "entry", "exit" ]),
    mileageInKilometers: z.number().min(0),
}).strict();

export type VehicleLogUpdateBody = {
    id: number,
    logType: VehicleLogType;
    mileageInKilometers: number;
};

export const vehicleLogUpdateSchema = z.object({
    logType: z.enum([ "entry", "exit" ]),
    mileageInKilometers: z.number().min(0),
}).strict();
