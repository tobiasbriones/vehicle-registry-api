// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { messageOf } from "@/app/app.error";
import { objToString } from "@/utils";
import { Pool } from "pg";
import { Driver } from "./driver";
import { DriverService, newDriverService } from "./driver.service";

jest.spyOn(console, "error").mockImplementation(() => {});

describe("DriverService create method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: DriverService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newDriverService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should insert a driver into the database and return the result",
        async () => {
            const driver: Driver = {
                licenseId: "D123456",
                firstName: "John",
                surName: "Doe",
                secondName: "Michael",
                secondSurName: "Smith",
            };

            mockPool.connect = jest.fn().mockResolvedValueOnce({
                query: jest
                    .fn()
                    .mockResolvedValueOnce({}) // Begin transaction
                    .mockResolvedValueOnce({ // Insert driver
                        rows: [ { id: 1 } ],
                        rowCount: 1,
                    })
                    .mockResolvedValueOnce({ // Insert driver_name
                        rowCount: 1,
                    }),
                release: jest.fn(),
            });

            const result = await service.create(driver);

            expect(result).toEqual(driver);
            expect(mockPool.connect).toHaveBeenCalled();
        },
    );

    it("should handle duplicate license ID errors", async () => {
        const driver: Driver = {
            licenseId: "D123456",
            firstName: "John",
            surName: "Doe",
            secondName: "Michael",
            secondSurName: "Smith",
        };

        const mockError = new Error(
            `duplicate key value violates unique constraint "driver_license_id_key"`,
        );

        mockPool.connect = jest.fn().mockResolvedValueOnce({
            query: jest.fn().mockRejectedValueOnce(mockError),
            release: jest.fn(),
        });

        await expect(service.create(driver)).rejects.toMatchObject({
            type: "DuplicateError",
            info: {
                context: messageOf("Fail to create driver", driver),
                detail: "A driver with this license ID already exists.",
            },
        });
    });

    it("should handle internal errors correctly", async () => {
        const driver: Driver = {
            licenseId: "D123456",
            firstName: "John",
            surName: "Doe",
            secondName: "Michael",
            secondSurName: "Smith",
        };

        const mockError = new Error("Unexpected error");
        mockPool.connect = jest.fn().mockResolvedValueOnce({
            query: jest.fn().mockRejectedValueOnce(mockError),
            release: jest.fn(),
        });

        await expect(service.create(driver)).rejects.toMatchObject({
            type: "InternalError",
            info: messageOf("Fail to create driver", driver),
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Fail to create driver"),
        );

        expect(console.error).toHaveBeenCalledWith(
            "Reason:",
            String(mockError),
        );
    });
});

describe("DriverService read method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: DriverService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newDriverService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the driver when found", async () => {
        const driver = {
            licenseId: "D123456",
            firstName: "John",
            surName: "Doe",
            secondName: "Michael",
            secondSurName: "Smith",
        };

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 1,
            rows: [ driver ],
        });

        const result = await service.read("D123456");

        expect(result).toEqual(driver);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining("SELECT driver.license_id"),
            [ "D123456" ],
        );
    });

    it("should return null when no driver is found", async () => {
        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
        });

        const result = await service.read("D123456");

        expect(result).toBeNull();
    });

    it("should handle errors correctly", async () => {
        const mockError = new Error("Query failed");
        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.read("D123456")).rejects.toMatchObject({
            type: "InternalError",
            info: "Fail to read driver with license ID D123456.",
        });

        expect(console.error).toHaveBeenCalled();
    });
});

describe("DriverService readAll method", () => {
    const limit = 5;
    const page = 2;
    let mockPool: jest.Mocked<Pool>;
    let service: DriverService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newDriverService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should retrieve drivers with correct limit and offset", async () => {
        const mockDrivers: Driver[] = [
            { licenseId: "D123456", firstName: "John", surName: "Doe" },
            { licenseId: "D789012", firstName: "Jane", surName: "Smith" },
        ];
        mockPool.query = jest.fn().mockResolvedValueOnce({
            rows: mockDrivers,
            rowCount: mockDrivers.length,
        });

        const result = await service.readAll(limit, page);

        const offset = (page - 1) * limit;

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining("SELECT driver.license_id"),
            [ limit, offset ],
        );

        expect(result).toEqual(mockDrivers);
    });

    it("should handle errors by rejecting with an internal error", async () => {
        const mockError = new Error("Database connection error");
        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.readAll(limit, page)).rejects.toMatchObject({
            type: "InternalError",
            info: `Failed to retrieve drivers for page ${ page } with limit ${ limit }.`,
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining(`Failed to retrieve drivers for page ${ page } with limit ${ limit }.`),
        );

        expect(console.error).toHaveBeenCalledWith(
            "Reason:",
            String(mockError),
        );
    });
});

describe("DriverService update method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: DriverService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newDriverService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should return the updated driver when update is successful",
        async () => {
            const mockDriver = {
                licenseId: "D123456",
                firstName: "John",
                surName: "Doe",
            };

            mockPool.query = jest.fn().mockResolvedValueOnce({
                rowCount: 1,
                rows: [ mockDriver ],
            });

            const result = await service.update(mockDriver);

            expect(result).toEqual(mockDriver);

            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE driver"),
                [
                    mockDriver.firstName,
                    mockDriver.surName,
                    null,
                    null,
                    mockDriver.licenseId,
                ],
            );
        },
    );

    it("should return null when no driver is updated", async () => {
        const mockDriver = {
            licenseId: "D123456",
            firstName: "John",
            surName: "Doe",
        };

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
        });

        const result = await service.update(mockDriver);

        expect(result).toBeNull();

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE driver"),
            [
                mockDriver.firstName,
                mockDriver.surName,
                null,
                null,
                mockDriver.licenseId,
            ],
        );
    });

    it("should handle errors correctly", async () => {
        const mockDriver = {
            licenseId: "D123456",
            firstName: "John",
            surName: "Doe",
        };
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.update(mockDriver)).rejects.toMatchObject({
            type: "InternalError",
            info: `Fail to update driver ${ objToString(mockDriver) } with license ID ${ mockDriver.licenseId }.`,
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Fail to update driver"),
        );

        expect(console.error).toHaveBeenCalledWith(
            "Reason:",
            String(mockError),
        );
    });
});

describe("DriverService delete method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: DriverService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newDriverService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should return true when the driver is successfully deleted",
        async () => {
            const mockLicenseId = "D123456";

            mockPool.query = jest.fn().mockResolvedValueOnce({
                rowCount: 1,
            });

            const result = await service.delete(mockLicenseId);

            expect(result).toBe(true);

            expect(mockPool.query).toHaveBeenCalledWith(
                expect.stringContaining("DELETE FROM driver"),
                [ mockLicenseId ],
            );
        },
    );

    it("should return false when no driver is deleted", async () => {
        const mockLicenseId = "D123456";

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0,
        });

        const result = await service.delete(mockLicenseId);

        expect(result).toBe(false);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM driver"),
            [ mockLicenseId ],
        );
    });

    it("should handle errors correctly", async () => {
        const mockLicenseId = "D123456";
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.delete(mockLicenseId)).rejects.toMatchObject({
            type: "InternalError",
            info: `Fail to delete driver with license ID ${ mockLicenseId }.`,
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining(`Fail to delete driver with license ID ${ mockLicenseId }.`),
        );

        expect(console.error).toHaveBeenCalledWith(
            "Reason:",
            String(mockError),
        );
    });
});
