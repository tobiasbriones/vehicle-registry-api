// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import { Pool, QueryResult } from "pg";
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
                msg: `Fail to create vehicle ${ objToString(vehicle) }.\n`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining("Fail to create vehicle"),
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
                    msg: "Internal error. Fail to add record.",
                });

            expect(console.error)
                .toHaveBeenCalledWith(
                    expect.stringContaining(
                        "Internal error. Fail to add record."
                    ),
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
        service = new VehicleService(mockPool);
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
        const mockId = 1;

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 1,
            rows: [ vehicle ],
        });

        const result = await service.read(mockId);

        expect(result).toEqual(vehicle);

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("SELECT *"),
                [ mockId ],
            );
    });

    it("should return null when no vehicle is found", async () => {
        const mockId = 1;

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
        });

        const result = await service.read(mockId);

        expect(result).toBeNull();

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("SELECT *"),
                [ mockId ],
            );
    });

    it("should handle errors correctly", async () => {
        const mockId = 1;
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.read(mockId))
            .rejects
            .toMatchObject({
                type: "InternalError",
                msg: `Fail to read vehicle with id ${ mockId }.`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining(`Fail to read vehicle with id ${ mockId }.`),
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
        service = new VehicleService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should return the updated vehicle when update is successful",
        async () => {
            const vehicle = {
                brand: "Toyota",
                model: "Corolla",
                number: "ABC123",
            };
            const mockId = 1;

            mockPool.query = jest.fn().mockResolvedValueOnce({
                rowCount: 1,
                rows: [ vehicle ],
            });

            const result = await service.update(mockId, vehicle);

            expect(result).toEqual(vehicle);

            expect(mockPool.query)
                .toHaveBeenCalledWith(
                    expect.stringContaining("UPDATE vehicle"),
                    [ vehicle.brand, vehicle.model, vehicle.number, mockId ],
                );
        },
    );

    it("should return null when no vehicle is updated", async () => {
        const mockId = 1;
        const vehicle = {
            brand: "Toyota",
            model: "Corolla",
            number: "ABC123",
        };

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
        });

        const result = await service.update(mockId, vehicle);

        expect(result).toBeNull();

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE vehicle"),
                [ vehicle.brand, vehicle.model, vehicle.number, mockId ],
            );
    });

    it("should handle errors correctly", async () => {
        const mockId = 1;
        const vehicle = {
            brand: "Toyota",
            model: "Corolla",
            number: "ABC123",
        };
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.update(mockId, vehicle))
            .rejects
            .toMatchObject({
                type: "InternalError",
                msg: `Fail to update vehicle ${ objToString(vehicle) } with id ${ mockId }.`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining(`Fail to update vehicle`),
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
        service = new VehicleService(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it(
        "should return true when the vehicle is successfully deleted",
        async () => {
            const mockId = 1;

            mockPool.query = jest.fn().mockResolvedValueOnce({
                rowCount: 1, // Simulating a successful deletion
            });

            const result = await service.delete(mockId);

            expect(result).toBe(true);

            expect(mockPool.query)
                .toHaveBeenCalledWith(
                    expect.stringContaining("DELETE"),
                    [ mockId ],
                );
        },
    );

    it("should return false when no vehicle is deleted", async () => {
        const mockId = 1;

        mockPool.query = jest.fn().mockResolvedValueOnce({
            rowCount: 0, // Simulating that no rows were deleted
        });

        const result = await service.delete(mockId);

        expect(result).toBe(false);

        expect(mockPool.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("DELETE"),
                [ mockId ],
            );
    });

    it("should handle errors correctly", async () => {
        const mockId = 1;
        const mockError = new Error("Query failed");

        mockPool.query = jest.fn().mockRejectedValueOnce(mockError);

        await expect(service.delete(mockId))
            .rejects
            .toMatchObject({
                type: "InternalError",
                msg: `Fail to delete vehicle with id ${ mockId }.`,
            });

        expect(console.error)
            .toHaveBeenCalledWith(
                expect.stringContaining(`Fail to delete vehicle with id ${ mockId }.`),
                "Reason:",
                String(mockError),
            );
    });
});
