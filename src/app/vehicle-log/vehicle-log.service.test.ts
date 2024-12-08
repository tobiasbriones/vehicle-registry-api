// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { AppError } from "@app/app.error";
import { Driver } from "@app/driver/driver";
import { DriverService } from "@app/driver/driver.service";
import { VehicleService } from "@app/vehicle/vehicle.service";
import { Pool, PoolClient } from "pg";
import { Vehicle } from "@app/vehicle/vehicle";
import {
    VehicleLog,
    VehicleLogCreateBody,
    VehicleLogUpdateBody,
} from "./vehicle-log";
import { newVehicleLogService, VehicleLogService } from "./vehicle-log.service";

jest.mock("pg");
jest.mock("@app/driver/driver.service");

describe("VehicleLogService", () => {
    let pool: jest.Mocked<Pool>;
    let client: jest.Mocked<PoolClient>;
    let vehicleService: jest.Mocked<VehicleService>;
    let driverService: jest.Mocked<DriverService>;
    let service: VehicleLogService;

    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        client = {
            query: jest.fn(),
            release: jest.fn(),
        } as unknown as jest.Mocked<PoolClient>;

        pool = {
            connect: jest.fn().mockResolvedValue(client),
        } as unknown as jest.Mocked<Pool>;

        vehicleService = {
            read: jest.fn(),
        } as unknown as jest.Mocked<VehicleService>;

        driverService = {
            read: jest.fn(),
        } as unknown as jest.Mocked<DriverService>;

        service = newVehicleLogService(pool, vehicleService, driverService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create a new vehicle log successfully", async () => {
            const mockLog: VehicleLogCreateBody = {
                vehicleNumber: "VIN-123",
                driverLicenseId: "DL456",
                logType: "entry",
                mileageInKilometers: 1000,
            };

            const mockVehicle: Vehicle = {
                number: "VIN-123",
                brand: "Hyundai",
                model: "Elantra",
            };

            const mockDriver: Driver = {
                licenseId: "DL456",
                firstName: "John",
                surname: "Doe",
            };

            client.query = jest
                .fn()
                .mockResolvedValueOnce({
                    command: "BEGIN",
                    rowCount: null,
                    oid: null,
                    rows: [],
                    fields: [],
                }) // Transaction begin
                .mockResolvedValueOnce({
                    rows: [ { id: 1 } ],
                    rowCount: 1,
                }) // Vehicle exists check
                .mockResolvedValueOnce({
                    rows: [ { id: 1 } ],
                    rowCount: 1,
                }) // Driver exists check
                .mockResolvedValueOnce({
                    rows: [
                        {
                            isValid: true,
                            lastMileage: 900,
                        },
                    ],
                    rowCount: 1,
                }) // Mileage valid check
                .mockResolvedValueOnce({
                    rows: [
                        {
                            isValid: true,
                            lastEvent: "exit",
                        },
                    ],
                    rowCount: 1,
                }) // Event valid check
                .mockResolvedValueOnce({
                    rows: [
                        {
                            id: 1,
                            timestamp: "2024-11-27 00:18:00.755929 +00:00",
                        },
                    ],
                    rowCount: 1,
                }); // Insert log

            vehicleService.read.mockResolvedValue(mockVehicle);
            driverService.read.mockResolvedValue(mockDriver);

            const result = await service.create(mockLog);

            expect(client.query).toHaveBeenCalledTimes(7);
            expect(result).toEqual({
                id: 1,
                vehicle: mockVehicle,
                driver: mockDriver,
                logType: "entry",
                timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                mileageInKilometers: 1000,
            } as VehicleLog);
        });

        it("should throw an error if vehicle does not exist", async () => {
            const mockLog: VehicleLogCreateBody = {
                vehicleNumber: "XYZ999",
                driverLicenseId: "DL123",
                logType: "entry",
                mileageInKilometers: 500,
            };

            client.query = jest
                .fn()
                .mockResolvedValueOnce({
                    command: "BEGIN",
                    rowCount: null,
                    oid: null,
                    rows: [],
                    fields: [],
                }) // Transaction begin
                .mockResolvedValueOnce(
                    { rows: [], rowCount: 0 },
                ); // Vehicle not found

            await expect(service.create(mockLog)).rejects.toMatchObject({
                type: "ReferenceNotFoundError",
                info: {
                    context: {
                        message: "Fail to create vehicle log",
                        target: {
                            vehicleNumber: "XYZ999",
                            driverLicenseId: "DL123",
                            logType: "entry",
                            mileageInKilometers: 500,
                        },
                    },
                    detail: "A vehicle with this number was not found.",
                },
            } as AppError);
            expect(client.query).toHaveBeenCalledTimes(2);
        });
    });

    describe("read", () => {
        it("should return a vehicle log by ID", async () => {
            const mockVehicle: Vehicle = {
                number: "VIN-123",
                brand: "Hyundai",
                model: "Elantra",
            };

            const mockDriver: Driver = {
                licenseId: "DL456",
                firstName: "John",
                surname: "Doe",
            };

            const mockLog: VehicleLog = {
                id: 1,
                vehicle: mockVehicle,
                driver: mockDriver,
                logType: "entry",
                timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                mileageInKilometers: 1000,
            };

            pool.query = jest
                .fn()
                .mockResolvedValueOnce({
                    rows: [ mockLog ],
                    rowCount: 1,
                });

            const result = await service.read(1);

            expect(pool.query)
                .toHaveBeenCalledWith(expect.any(String), [ 1 ]);

            expect(result).toEqual(mockLog);
        });

        it("should return null if vehicle log is not found", async () => {
            pool.query = jest
                .fn()
                .mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const result = await service.read(999);

            expect(result).toBeNull();
        });
    });

    describe("readAll", () => {
        it("should return a list of vehicle logs", async () => {
            const mockLogs: VehicleLog[] = [
                {
                    id: 1,
                    vehicle: {
                        number: "VIN-123",
                        brand: "Hyundai",
                        model: "Elantra",
                    },
                    driver: {
                        licenseId: "DL456",
                        firstName: "John",
                        surname: "Doe",
                    },
                    logType: "entry",
                    timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                    mileageInKilometers: 1000,
                },
            ];

            pool.query = jest
                .fn()
                .mockResolvedValueOnce({ rows: mockLogs, rowCount: 1 });

            const result = await service.readAll(10, 1, {});

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockLogs);
        });

        it("should filter a list of vehicle logs by vehicle", async () => {
            const mockLogs: VehicleLog[] = [
                {
                    id: 1,
                    vehicle: {
                        number: "VIN-123",
                        brand: "Hyundai",
                        model: "Elantra",
                    },
                    driver: {
                        licenseId: "DL456",
                        firstName: "John",
                        surname: "Doe",
                    },
                    logType: "entry",
                    timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                    mileageInKilometers: 1000,
                },

                {
                    id: 2,
                    vehicle: {
                        number: "VIN-321",
                        brand: "Mazda",
                        model: "CX-5",
                    },
                    driver: {
                        licenseId: "DL987",
                        firstName: "Joe",
                        surname: "Smith",
                    },
                    logType: "entry",
                    timestamp: new Date("2024-11-28 00:18:00.755929 +00:00"),
                    mileageInKilometers: 2000,
                },
            ];

            // Mock the database query to return filtered logs
            pool.query = jest
                .fn()
                .mockResolvedValueOnce({ rows: [ mockLogs[0] ], rowCount: 1 });

            const result = await service.readAll(
                10,
                1,
                { vehicleNumber: "VIN-123" },
            );

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining(
                    "WHERE ($1::VARCHAR IS NULL OR vehicle.number = $1)"),
                [
                    "VIN-123", // Filter by vehicleNumber
                    null,      // driverLicenseId is null
                    null,      // date is null
                    10,        // Limit
                    0,         // Offset (calculated from page - 1)
                ],
            );

            expect(result).toEqual([
                {
                    id: 1,
                    vehicle: {
                        number: "VIN-123",
                        brand: "Hyundai",
                        model: "Elantra",
                    },
                    driver: {
                        licenseId: "DL456",
                        firstName: "John",
                        surname: "Doe",
                    },
                    logType: "entry",
                    timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                    mileageInKilometers: 1000,
                } as VehicleLog,
            ]);
        });

        it("should filter a list of vehicle logs by date", async () => {
            const mockLogs: VehicleLog[] = [
                {
                    id: 1,
                    vehicle: {
                        number: "VIN-123",
                        brand: "Hyundai",
                        model: "Elantra",
                    },
                    driver: {
                        licenseId: "DL456",
                        firstName: "John",
                        surname: "Doe",
                    },
                    logType: "entry",
                    timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                    mileageInKilometers: 1000,
                },

                {
                    id: 2,
                    vehicle: {
                        number: "VIN-321",
                        brand: "Kia",
                        model: "Soul",
                    },
                    driver: {
                        licenseId: "DL987",
                        firstName: "Joe",
                        surname: "Smith",
                    },
                    logType: "entry",
                    timestamp: new Date("2024-11-28 00:18:00.755929 +00:00"),
                    mileageInKilometers: 2000,
                },
            ];

            // Mock the database query to return filtered logs
            pool.query = jest
                .fn()
                .mockResolvedValueOnce({ rows: [ mockLogs[1] ], rowCount: 1 });

            const result = await service.readAll(
                10,
                1,
                { date: new Date("2024-11-28 00:18:00.755929 +00:00") },
            );

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining(
                    "AND ($3::DATE IS NULL OR DATE(log.event_timestamp) = $3)"),
                [
                    null,         // Filter by vehicleNumber
                    null,         // driverLicenseId is null
                    "2024-11-28", // date is null
                    10,           // Limit
                    0,            // Offset (calculated from page - 1)
                ],
            );
            expect(result).toEqual([
                {
                    id: 2,
                    vehicle: {
                        number: "VIN-321",
                        brand: "Kia",
                        model: "Soul",
                    },
                    driver: {
                        licenseId: "DL987",
                        firstName: "Joe",
                        surname: "Smith",
                    },
                    logType: "entry",
                    timestamp: new Date("2024-11-28 00:18:00.755929 +00:00"),
                    mileageInKilometers: 2000,
                } as VehicleLog,
            ]);
        });
    });

    describe("update", () => {
        it("should update a vehicle log", async () => {
            const mockUpdate: VehicleLogUpdateBody = {
                id: 1,
                logType: "exit",
                mileageInKilometers: 1100,
            };

            pool.query = jest
                .fn()
                .mockResolvedValueOnce({ rowCount: 1 });

            const readSpy = jest.spyOn(service, "read").mockResolvedValueOnce({
                ...mockUpdate,
                vehicle: {
                    number: "VIN-123",
                    brand: "Hyundai",
                    model: "Elantra",
                },

                driver: {
                    licenseId: "DL456",
                    firstName: "John",
                    surname: "Doe",
                },
                timestamp: new Date("2024-11-28 00:18:00.755929 +00:00"),
            });

            const result = await service.update(mockUpdate);

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
                "exit",
                1100,
                1,
            ]);
            expect(readSpy).toHaveBeenCalledWith(1);
            expect(result).not.toBeNull();
        });
    });

    describe("delete", () => {
        it("should delete a vehicle log", async () => {
            pool.query = jest
                .fn()
                .mockResolvedValueOnce({ rowCount: 1 });

            const result = await service.delete(1);

            expect(pool.query)
                .toHaveBeenCalledWith(expect.any(String), [ 1 ]);
            expect(result).toBe(true);
        });

        it("should return false if vehicle log is not found", async () => {
            pool.query = jest
                .fn()
                .mockResolvedValueOnce({ rowCount: 0 });

            const result = await service.delete(999);

            expect(result).toBe(false);
        });
    });
});
