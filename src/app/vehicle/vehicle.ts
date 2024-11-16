// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { z } from "zod";

/**
 * Represents a vehicle in the system.
 */
export type Vehicle = {
    /** Unique number associated with the vehicle. */
    number: string,

    /** For example, Toyota, Ford. */
    brand: string,

    /** For example, Camry, Mustang. */
    model: string,
}

export const vehicleRegistrationSchema = z.object({
    number: z.string().max(20).trim().min(1),
    brand: z.string().max(100).trim().min(1),
    model: z.string().max(100).trim().min(1),
}).strict();

export const vehicleUpdateSchema = z.object({
    brand: z.string().max(100).trim().min(1),
    model: z.string().max(100).trim().min(1),
}).strict();
