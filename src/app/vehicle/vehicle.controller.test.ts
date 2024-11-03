// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import express from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { newVehicleController } from "./vehicle.controller";

const mockVehicleService = {
    create: jest.fn(),
    read: jest.fn(),
    readAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const vehicleController = newVehicleController(mockVehicleService);
const app = express();

app.use(express.json());
app.post("/vehicles", vehicleController.create);
app.get("/vehicles/:number", vehicleController.read);
app.get("/vehicles", vehicleController.readAll);
app.put("/vehicles/:number", vehicleController.update);
app.delete("/vehicles/:number", vehicleController.delete);

describe("VehicleController", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("POST /vehicles - Success", async () => {
        const newVehicle = {
            number: "VIN-123",
            brand: "Toyota",
            model: "Camry",
        };
        mockVehicleService.create.mockResolvedValue(newVehicle);

        const response = await request(app).post("/vehicles").send(newVehicle);

        expect(response.status).toBe(StatusCodes.CREATED);
        expect(response.body).toEqual(newVehicle);
    });

    test("POST /vehicles - Failure", async () => {
        const newVehicle = {
            number: "VIN-123",
            brand: "Toyota",
            model: "Camry",
        };
        mockVehicleService.create.mockRejectedValue(new Error("Creation error"));

        const response = await request(app).post("/vehicles").send(newVehicle);

        expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({ error: { message: "Creation error" } });
    });

    test("GET /vehicles/:number - Success", async () => {
        const vehicle = { number: "VIN-123", brand: "Toyota", model: "Camry" };
        mockVehicleService.read.mockResolvedValue(vehicle);

        const response = await request(app).get("/vehicles/VIN-123");

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual(vehicle);
    });

    test("GET /vehicles/:number - Not Found", async () => {
        mockVehicleService.read.mockResolvedValue(null);

        const response = await request(app).get("/vehicles/VIN-999");

        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.body)
            .toEqual({ error: "Vehicle number not found: VIN-999" });
    });

    test("GET /vehicles - Success", async () => {
        const vehicles = [
            { number: "VIN-123", brand: "Toyota", model: "Camry" },
            { number: "VIN-456", brand: "Honda", model: "Civic" },
        ];
        mockVehicleService.readAll.mockResolvedValue(vehicles);

        const response = await request(app).get("/vehicles");

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual(vehicles);
    });

    test("PUT /vehicles/:number - Success", async () => {
        const updatedVehicle = {
            number: "VIN-123",
            brand: "Toyota",
            model: "Corolla",
        };
        mockVehicleService.update.mockResolvedValue(updatedVehicle);

        const response = await request(app)
            .put("/vehicles/VIN-123")
            .send({ brand: "Toyota", model: "Corolla" });

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual(updatedVehicle);
    });

    test("PUT /vehicles/:number - Not Found", async () => {
        mockVehicleService.update.mockResolvedValue(null);

        const response = await request(app)
            .put("/vehicles/VIN-999")
            .send({ brand: "Toyota", model: "Corolla" });

        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.body).toEqual({ error: "Vehicle not found: VIN-999" });
    });

    test("DELETE /vehicles/:number - Success", async () => {
        mockVehicleService.delete.mockResolvedValue(true);

        const response = await request(app).delete("/vehicles/VIN-123");

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body)
            .toEqual({ message: "Vehicle with number VIN-123 deleted successfully." });
    });

    test("DELETE /vehicles/:number - Not Found", async () => {
        mockVehicleService.delete.mockResolvedValue(false);

        const response = await request(app).delete("/vehicles/VIN-999");

        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.body).toEqual({ error: "Vehicle not found: VIN-999" });
    });
});
