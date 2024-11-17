// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import { Pool, QueryResult } from "pg";
import { messageOf } from "@app/app.error";
import { Vehicle } from "./vehicle";
import { newVehicleService, VehicleService } from "./vehicle.service";

jest.spyOn(console, "error").mockImplementation(() => {});

describe("VehicleService create method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: VehicleService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newVehicleService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should insert a vehicle into the database and return the result",
        async () => {
            const vehicle: Vehicle = {
                brand: "Toyota",
                model: "Camry",
                number: "123ABC",
            };

            const mockResult: QueryResult = {
                rows: [ vehicle ],
                rowCount: 1,
            } as QueryResult;
            mockPool.query = jest.fn().mockResolvedValue(mockResult);

            const result = await service.create(vehicle);

            expect(mockPool.query)
                .toHaveBeenCalledWith(
                    expect.stringContaining("INSERT INTO vehicle"),
                    [ vehicle.brand, vehicle.model, vehicle.number ],
                );

            expect(result).toEqual(vehicle);
        },
    );

    it("should handle an error from the database query", async () => {
        const vehicle: Vehicle = {
            brand: "Toyota",
            model: "Camry",
            number: "123ABC",
        };

        const mockError = "Query failed";
        mockPool.query = jest.fn().mockRejectedValue(mockError);

        await expect(service.create(vehicle))
            .rejects
            .toMatchObject({
                type: "InternalError",
                info: messageOf("Fail to create vehicle", vehicle),
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining("Fail to create vehicle"),
            );

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining("Reason:"),
                mockError,
            );
    });

    it(
        "should handle unexpected row count from the database query",
        async () => {
            const mockVehicle: Vehicle = {
                brand: "Toyota",
                model: "Camry",
                number: "123ABC",
            };

            const mockResult: QueryResult = {
                rows: [ mockVehicle ],
                rowCount: 0,
            } as QueryResult;
            mockPool.query = jest.fn().mockResolvedValue(mockResult);

            await expect(service.create(mockVehicle))
                .rejects
                .toMatchObject({
                    type: "InternalError",
                    info: "Internal error. Fail to add record.",
                });

            expect(console.error)
                .toHaveBeenCalledWith(
                    expect.stringContaining(
                        "Internal error. Fail to add record."
                    ),
                );

            expect(console.error)
                .toHaveBeenCalledWith(
                    expect.stringContaining("Reason:"),
                    expect.stringContaining("Row count 0 is not 1"),
                );
        },
    );
});

describe("VehicleService read method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: VehicleService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newVehicleService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return the vehicle when found", async () => {
        const vehicle = {
            brand: "Toyota",
            model: "Corolla",
            number: "ABC123",
        };
        const mockNumber = "VIN-mock";

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 1,
            rows: [ vehicle ],
        });

        const result = await service.read(mockNumber);

        expect(result).toEqual(vehicle);

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("SELECT number, brand, model"),
                [ mockNumber ],
            );
    });

    it("should return null when no vehicle is found", async () => {
        const mockNumber = "VIN-mock";

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
        });

        const result = await service.read(mockNumber);

        expect(result).toBeNull();

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("SELECT number, brand, model"),
                [ mockNumber ],
            );
    });

    it("should handle errors correctly", async () => {
        const mockNumber = "VIN-mock";
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.read(mockNumber))
            .rejects
            .toMatchObject({
                type: "InternalError",
                info: `Fail to read vehicle with number ${ mockNumber }.`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining(`Fail to read vehicle with number ${ mockNumber }.`),
            );

        expect(console.error)
            .toHaveBeenCalledWith(
                "Reason:",
                String(mockError),
            );
    });
});

describe("Vehicle Service readAll method", () => {
    const limit = 5;
    const page = 2;
    let mockPool: jest.Mocked<Pool>;
    let service: VehicleService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newVehicleService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should retrieve vehicles with correct limit and offset", async () => {
        const mockVehicles = [
            { id: 1, number: "VIN-001", brand: "Toyota", model: "Corolla" },
            { id: 2, number: "VIN-002", brand: "Honda", model: "Civic" },
        ];
        mockPool.query = jest.fn().mockResolvedValueOnce({
            rows: mockVehicles,
            rowCount: mockVehicles.length,
        });

        const result = await service.readAll(limit, page);

        // Check if the pool.query was called with the correct SQL and
        // parameters
        const offset = (page - 1) * limit;

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("SELECT number, brand, model"),
                [ limit, offset ],
            );

        // Check if the result matches the mock data
        expect(result).toEqual(mockVehicles);
    });

    it("should handle errors by rejecting with an internal error", async () => {
        const mockError = new Error("Database connection error");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.readAll(limit, page))
            .rejects
            .toMatchObject({
                type: "InternalError",
                info: `Failed to retrieve vehicles for page ${ page } with limit ${ limit }.`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining(`Failed to retrieve vehicles for page ${ page } with limit ${ limit }.`),
            );

        expect(console.error)
            .toHaveBeenCalledWith(
                "Reason:",
                String(mockError),
            );
    });
});

describe("VehicleService update method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: VehicleService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newVehicleService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should return the updated vehicle when update is successful",
        async () => {
            const mockNumber = "VIN-mock";
            const vehicle = {
                number: mockNumber,
                brand: "Toyota",
                model: "Corolla",
            };

            mockPool.query = jest.fn().mockResolvedValueOnce({
                rowCount: 1,
                rows: [ vehicle ],
            });

            const result = await service.update(vehicle);

            expect(result).toEqual(vehicle);

            expect(mockPool.query)
                .toHaveBeenCalledWith(
                    expect.stringContaining("UPDATE vehicle"),
                    [ vehicle.brand, vehicle.model, mockNumber ],
                );
        },
    );

    it("should return null when no vehicle is updated", async () => {
        const mockNumber = "VIN-mock";
        const vehicle = {
            number: mockNumber,
            brand: "Toyota",
            model: "Corolla",
        };

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
        });

        const result = await service.update(vehicle);

        expect(result).toBeNull();

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE vehicle"),
                [ vehicle.brand, vehicle.model, mockNumber ],
            );
    });

    it("should handle errors correctly", async () => {
        const mockNumber = "VIN-mock";
        const vehicle = {
            number: mockNumber,
            brand: "Toyota",
            model: "Corolla",
        };
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.update(vehicle))
            .rejects
            .toMatchObject({
                type: "InternalError",
                info: `Fail to update vehicle ${ objToString(vehicle) } with number ${ mockNumber }.`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining(`Fail to update vehicle`),
            );

        expect(console.error)
            .toHaveBeenCalledWith(
                "Reason:",
                String(mockError),
            );
    });
});

describe("VehicleService delete method", () => {
    let mockPool: jest.Mocked<Pool>;
    let service: VehicleService;

    beforeEach(() => {
        mockPool = new Pool() as jest.Mocked<Pool>;
        service = newVehicleService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should return true when the vehicle is successfully deleted",
        async () => {
            const mockNumber = "VIN-mock";

            mockPool.query = jest.fn().mockResolvedValueOnce({
                rowCount: 1, // Simulating a successful deletion
            });

            const result = await service.delete(mockNumber);

            expect(result).toBe(true);

            expect(mockPool.query)
                .toHaveBeenCalledWith(
                    expect.stringContaining("DELETE"),
                    [ mockNumber ],
                );
        },
    );

    it("should return false when no vehicle is deleted", async () => {
        const mockNumber = "VIN-mock";

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0, // Simulating that no rows were deleted
        });

        const result = await service.delete(mockNumber);

        expect(result).toBe(false);

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("DELETE"),
                [ mockNumber ],
            );
    });

    it("should handle errors correctly", async () => {
        const mockNumber = "VIN-mock";
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.delete(mockNumber))
            .rejects
            .toMatchObject({
                type: "InternalError",
                info: `Fail to delete vehicle with number ${ mockNumber }.`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining(`Fail to delete vehicle with number ${ mockNumber }.`),
            );

        expect(console.error)
            .toHaveBeenCalledWith(
                "Reason:",
                String(mockError),
            );
    });
});
