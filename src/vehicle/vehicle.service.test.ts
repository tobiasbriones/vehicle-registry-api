// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { Pool, QueryResult } from "pg";
import { Vehicle } from "./vehicle";
import { VehicleService } from "./vehicle.service";

jest.spyOn(console, "error").mockImplementation(() => {});

describe("VehicleService create method", () => {
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
            .toMatch(`Fail to create vehicle ${ JSON.stringify(
                vehicle,
                null,
                4,
            ) }.`);

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
                .toMatch("Internal error. Fail to add record.");

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
