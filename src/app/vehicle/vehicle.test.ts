// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { Vehicle } from "./vehicle";

describe("Vehicle", () => {
    it("should create a vehicle with the correct properties", () => {
        const vehicle: Vehicle = {
            brand: "Toyota",
            model: "Camry",
            number: "ABC123",
        };

        expect(vehicle.brand).toBe("Toyota");
        expect(vehicle.model).toBe("Camry");
        expect(vehicle.number).toBe("ABC123");
    });
});
