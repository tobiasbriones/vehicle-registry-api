// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

/**
 * Represents a vehicle in the system.
 */
export type Vehicle = {
    /** For example, Toyota, Ford. */
    brand: string,

    /** For example, Camry, Mustang. */
    model: string,

    /** Unique number associated with the vehicle. */
    number: string,
}
