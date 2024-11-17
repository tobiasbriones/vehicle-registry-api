// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { notFoundError } from "@app/app.error";
import express from "express";
import { StatusCodes } from "http-status-codes";
import { createMocks } from "node-mocks-http";
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
        const { req, res } = createMocks({ body: newVehicle });
        const mockError = new Error("Creation error");
        const next = jest.fn();

        mockVehicleService.create.mockRejectedValue(mockError);

        // Mock `res.status` and `res.json` to be jest mock functions
        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await vehicleController.create(req, res, next);

        expect(next).toHaveBeenCalledWith(mockError);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
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

        const { req, res } = createMocks({ params: { number: "VIN-999" } });
        const next = jest.fn();

        // Mock `res.status` and `res.json` to be jest mock functions
        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await vehicleController.read(req, res, next);

        expect(next)
            .toHaveBeenCalledWith(
                notFoundError(`Vehicle number not found: VIN-999`),
            );

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
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

        const { req, res } = createMocks({
            params: { number: "VIN-999" },
            body: { brand: "Toyota", model: "Corolla" },
        });
        const next = jest.fn();

        // Mock `res.status` and `res.json` to be jest mock functions
        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await vehicleController.update(req, res, next);

        expect(next)
            .toHaveBeenCalledWith(
                notFoundError(`Vehicle not found: VIN-999`),
            );

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
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

        const { req, res } = createMocks({ params: { number: "VIN-999" }, });
        const next = jest.fn();

        // Mock `res.status` and `res.json` to be jest mock functions
        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await vehicleController.delete(req, res, next);

        expect(next)
            .toHaveBeenCalledWith(
                notFoundError(`Vehicle not found: VIN-999`),
            );

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
