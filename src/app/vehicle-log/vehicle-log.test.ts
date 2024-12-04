// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import {
    vehicleLogRegistrationSchema,
    vehicleLogUpdateSchema,
} from "./vehicle-log";

describe("VehicleLog Schemas", () => {
    describe("vehicleLogRegistrationSchema", () => {
        test("Validates successfully with correct data", () => {
            const validData = {
                driverLicenseId: "ABC1234",
                vehicleNumber: "123XYZ",
                logType: "entry",
                mileageInKilometers: 1000,
            };

            expect(() => vehicleLogRegistrationSchema.parse(validData))
                .not
                .toThrow();
        });

        test("Fails validation with invalid driverLicenseId", () => {
            const invalidData = {
                driverLicenseId: "AB!",
                vehicleNumber: "123XYZ",
                logType: "entry",
                mileageInKilometers: 1000,
            };

            expect(() => vehicleLogRegistrationSchema.parse(invalidData))
                .toThrow(
                    "Invalid license ID format. Only letters, numbers, and hyphens are allowed.",
                );
        });

        test("Fails validation with invalid vehicleNumber", () => {
            const invalidData = {
                driverLicenseId: "ABC1234",
                vehicleNumber: "",
                logType: "entry",
                mileageInKilometers: 1000,
            };

            expect(() => vehicleLogRegistrationSchema.parse(invalidData))
                .toThrow();
        });

        test("Fails validation with invalid logType", () => {
            const invalidData = {
                driverLicenseId: "ABC1234",
                vehicleNumber: "123XYZ",
                logType: "invalid",
                mileageInKilometers: 1000,
            };

            expect(() => vehicleLogRegistrationSchema.parse(invalidData))
                .toThrow();
        });

        test("Fails validation with negative mileageInKilometers", () => {
            const invalidData = {
                driverLicenseId: "ABC1234",
                vehicleNumber: "123XYZ",
                logType: "entry",
                mileageInKilometers: -1,
            };

            expect(() => vehicleLogRegistrationSchema.parse(invalidData))
                .toThrow();
        });
    });

    describe("vehicleLogUpdateSchema", () => {
        test("Validates successfully with correct data", () => {
            const validData = {
                logType: "exit",
                mileageInKilometers: 5000,
            };

            expect(() => vehicleLogUpdateSchema.parse(validData)).not.toThrow();
        });

        test("Fails validation with invalid logType", () => {
            const invalidData = {
                logType: "invalid",
                mileageInKilometers: 5000,
            };

            expect(() => vehicleLogUpdateSchema.parse(invalidData))
                .toThrow();
        });

        test("Fails validation with negative mileageInKilometers", () => {
            const invalidData = {
                logType: "entry",
                mileageInKilometers: -500,
            };

            expect(() => vehicleLogUpdateSchema.parse(invalidData))
                .toThrow();
        });

        test("Fails validation with missing fields", () => {
            const invalidData = {
                mileageInKilometers: 500,
            };

            expect(() => vehicleLogUpdateSchema.parse(invalidData))
                .toThrow();
        });
    });
});
