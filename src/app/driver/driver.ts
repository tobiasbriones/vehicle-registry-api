// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { z } from "zod";

/**
 * Represents a person who drives a vehicle. Drivers must have a driver
 * license ID, first name and surname with optional second name and second
 * surname to be correctly identified in the system.
 */
export type Driver = {
    licenseId: string,
    firstName: string,
    surName: string,
    secondName?: string,
    secondSurName?: string,
}

export const driverRegistrationSchema = z.object({
    licenseId: z
        .string()
        .min(6)
        .max(20)
        .regex(
            /^[A-Za-z0-9-]+$/,
            "Invalid license ID format. Only letters, numbers, and hyphens are allowed.",
        ),

    firstName: z.string().max(30).trim().min(1),
    surName: z.string().max(30).trim().min(1),
    secondName: z.string().max(30).trim().min(1).optional(),
    secondSurName: z.string().max(30).trim().min(1).optional(),
}).strict();

export const driverUpdateSchema = z.object({
    firstName: z.string().max(30).trim().min(1),
    surName: z.string().max(30).trim().min(1),
    secondName: z.string().max(30).trim().min(1),
    secondSurName: z.string().max(30).trim().min(1),
}).strict();
