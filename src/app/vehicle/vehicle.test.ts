// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import {
    Vehicle,
    vehicleRegistrationSchema,
    vehicleUpdateSchema,
} from "./vehicle";

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

describe("Vehicle Registration Schema", () => {
    it("should pass with valid data", () => {
        const validData = {
            number: "123ABC",
            brand: "Toyota",
            model: "Corolla",
        };

        expect(() => vehicleRegistrationSchema.parse(validData)).not.toThrow();
    });

    it("should fail if 'number' is blank", () => {
        const invalidData = {
            number: "  ", // blank
            brand: "Toyota",
            model: "Corolla",
        };
        expect(() => vehicleRegistrationSchema.parse(invalidData))
            .toThrow();
    });

    it("should fail if 'number' exceeds 20 characters", () => {
        const invalidData = {
            number: "123456789012345678901", // 21 characters
            brand: "Toyota",
            model: "Corolla",
        };
        expect(() => vehicleRegistrationSchema.parse(invalidData))
            .toThrow();
    });

    it("should fail if 'brand' exceeds 100 characters", () => {
        const invalidData = {
            number: "123ABC",
            brand: "A".repeat(101), // 101 characters
            model: "Corolla",
        };

        expect(() => vehicleRegistrationSchema.parse(invalidData))
            .toThrow();
    });

    it("should fail if 'model' exceeds 100 characters", () => {
        const invalidData = {
            number: "123ABC",
            brand: "Toyota",
            model: "B".repeat(101), // 101 characters
        };

        expect(() => vehicleRegistrationSchema.parse(invalidData))
            .toThrow();
    });

    it("should fail if additional properties are present", () => {
        const invalidData = {
            number: "123ABC",
            brand: "Toyota",
            model: "Corolla",
            color: "Red", // Extra property
        };
        expect(() => vehicleRegistrationSchema.parse(invalidData))
            .toThrow(/Unrecognized key\(s\) in object: 'color'/);
    });
});

describe("Vehicle Update Schema", () => {
    it("should pass with valid data", () => {
        const validData = {
            brand: "Toyota",
            model: "Corolla",
        };

        expect(() => vehicleUpdateSchema.parse(validData)).not.toThrow();
    });

    it("should fail if 'brand' is blank", () => {
        const invalidData = {
            brand: "  ", // blank
            model: "Corolla",
        };
        expect(() => vehicleUpdateSchema.parse(invalidData))
            .toThrow();
    });

    it("should fail if 'brand' exceeds 100 characters", () => {
        const invalidData = {
            brand: "A".repeat(101), // 101 characters
            model: "Corolla",
        };

        expect(() => vehicleUpdateSchema.parse(invalidData))
            .toThrow();
    });

    it("should fail if 'model' exceeds 100 characters", () => {
        const invalidData = {
            brand: "Toyota",
            model: "B".repeat(101), // 101 characters
        };
        expect(() => vehicleUpdateSchema.parse(invalidData))
            .toThrow();
    });

    it("should fail if additional properties are present", () => {
        const invalidData = {
            brand: "Toyota",
            model: "Corolla",
            number: "123ABC", // Extra property
        };
        expect(() => vehicleUpdateSchema.parse(invalidData))
            .toThrow();
    });
});
