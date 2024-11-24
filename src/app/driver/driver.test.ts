// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import {
    driverFromUpdateBody,
    driverRegistrationSchema,
    DriverUpdateBody,
    driverUpdateSchema,
} from "./driver";

describe("Driver Model", () => {
    describe("driverRegistrationSchema", () => {
        it("should validate a valid driver registration", () => {
            const validDriver = {
                licenseId: "12345-ABCDE",
                firstName: "John",
                surname: "Doe",
                secondName: "Michael",
                secondSurname: "Smith",
            };
            expect(() => driverRegistrationSchema.parse(validDriver))
                .not
                .toThrow();
        });

        it(
            "should throw error for invalid licenseId (less than 6 characters)",
            () => {
                const invalidDriver = {
                    licenseId: "1234",
                    firstName: "John",
                    surname: "Doe",
                };
                expect(() => driverRegistrationSchema.parse(invalidDriver))
                    .toThrow();
            },
        );

        it(
            "should throw error for invalid licenseId (contains special characters)",
            () => {
                const invalidDriver = {
                    licenseId: "1234@abcd",
                    firstName: "John",
                    surname: "Doe",
                };
                expect(() => driverRegistrationSchema.parse(invalidDriver))
                    .toThrow();
            },
        );

        it("should throw error when required fields are missing", () => {
            const invalidDriver = {
                licenseId: "12345-ABCDE",
                firstName: "John",
            };
            expect(() => driverRegistrationSchema.parse(invalidDriver))
                .toThrow();
        });

        it("should pass when optional fields are missing", () => {
            const validDriverWithoutOptionalFields = {
                licenseId: "12345-ABCDE",
                firstName: "John",
                surname: "Doe",
            };
            expect(() => driverRegistrationSchema.parse(
                validDriverWithoutOptionalFields)).not.toThrow();
        });

    });

    describe("driverUpdateSchema", () => {
        it("should validate a valid driver update body", () => {
            const validUpdate: DriverUpdateBody = {
                firstName: "Jane",
                surname: "Doe",
                secondName: "Marie",
                secondSurname: "Smith",
            };
            expect(() => driverUpdateSchema.parse(validUpdate)).not.toThrow();
        });

        it("should throw error when required fields are missing", () => {
            const invalidUpdate = {
                firstName: "",
                surname: "Doe",
                secondName: null,
                secondSurname: null,
            };
            expect(() => driverUpdateSchema.parse(invalidUpdate))
                .toThrow();
        });

        it(
            "should pass when nullable secondName and secondSurname are null",
            () => {
                const validUpdate = {
                    firstName: "Jane",
                    surname: "Doe",
                    secondName: null,
                    secondSurname: null,
                };
                expect(() => driverUpdateSchema.parse(validUpdate))
                    .not
                    .toThrow();
            },
        );

    });

    describe("driverFromUpdateBody", () => {
        it(
            "should return a driver object with licenseId and all fields",
            () => {
                const updateBody: DriverUpdateBody = {
                    firstName: "Jane",
                    surname: "Doe",
                    secondName: "Marie",
                    secondSurname: "Smith",
                };
                const licenseId = "12345-ABCDE";
                const result = driverFromUpdateBody(licenseId, updateBody);

                expect(result).toEqual({
                    licenseId: "12345-ABCDE",
                    firstName: "Jane",
                    surname: "Doe",
                    secondName: "Marie",
                    secondSurname: "Smith",
                });
            },
        );

        it(
            "should omit undefined fields for optional secondName and secondSurname",
            () => {
                const updateBody: DriverUpdateBody = {
                    firstName: "Jane",
                    surname: "Doe",
                    secondName: null,
                    secondSurname: null,
                };
                const licenseId = "12345-ABCDE";
                const result = driverFromUpdateBody(licenseId, updateBody);

                expect(result).toEqual({
                    licenseId: "12345-ABCDE",
                    firstName: "Jane",
                    surname: "Doe",
                    secondName: undefined,
                    secondSurname: undefined,
                });
            },
        );
    });
});
