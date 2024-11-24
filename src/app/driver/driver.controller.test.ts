// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { notFoundError } from "@app/app.error";
import express from "express";
import { StatusCodes } from "http-status-codes";
import { createMocks } from "node-mocks-http";
import { Driver } from "src/app/driver/driver";
import request from "supertest";
import { newDriverController } from "./driver.controller";

const mockDriverService = {
    create: jest.fn(),
    read: jest.fn(),
    readAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const driverController = newDriverController(mockDriverService);
const app = express();

app.use(express.json());
app.post("/drivers", driverController.create);
app.get("/drivers/:licenseId", driverController.read);
app.get("/drivers", driverController.readAll);
app.put("/drivers/:licenseId", driverController.update);
app.delete("/drivers/:licenseId", driverController.delete);

describe("DriverController", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("POST /drivers - Success", async () => {
        const newDriver = {
            licenseId: "D123456",
            firstName: "John",
            surname: "Doe",
        };
        mockDriverService.create.mockResolvedValue(newDriver);

        const response = await request(app).post("/drivers").send(newDriver);

        expect(response.status).toBe(StatusCodes.CREATED);
        expect(response.body).toEqual(newDriver);
    });

    test("POST /drivers - Failure", async () => {
        const newDriver: Driver = {
            licenseId: "D123456",
            firstName: "John",
            surname: "Doe",
        };
        const { req, res } = createMocks({ body: newDriver });
        const mockError = new Error("Creation error");
        const next = jest.fn();

        mockDriverService.create.mockRejectedValue(mockError);

        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await driverController.create(req, res, next);

        expect(next).toHaveBeenCalledWith(mockError);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    test("GET /drivers/:licenseId - Success", async () => {
        const driver: Driver = {
            licenseId: "D123456",
            firstName: "John",
            surname: "Doe",
        };
        mockDriverService.read.mockResolvedValue(driver);

        const response = await request(app).get("/drivers/D123456");

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual(driver);
    });

    test("GET /drivers/:licenseId - Not Found", async () => {
        mockDriverService.read.mockResolvedValue(null);

        const { req, res } = createMocks({ params: { licenseId: "D999999" } });
        const next = jest.fn();

        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await driverController.read(req, res, next);

        expect(next).toHaveBeenCalledWith(
            notFoundError(`Driver license ID not found: D999999`),
        );
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    test("GET /drivers - Success", async () => {
        const drivers: Driver[] = [
            { licenseId: "D123456", firstName: "John", surname: "Doe" },
            { licenseId: "D789012", firstName: "Jane", surname: "Smith" },
        ];
        mockDriverService.readAll.mockResolvedValue(drivers);

        const response = await request(app).get("/drivers");

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual(drivers);
    });

    test("PUT /drivers/:licenseId - Success", async () => {
        const updatedDriver: Driver = {
            licenseId: "D123456",
            firstName: "John",
            surname: "Smith",
        };
        mockDriverService.update.mockResolvedValue(updatedDriver);

        const response = await request(app)
            .put("/drivers/D123456")
            .send({
                firstName: "John",
                surname: "Smith",
                secondName: null,
                secondSurname: null,
            });

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual(updatedDriver);
    });

    test("PUT /drivers/:licenseId - Not Found", async () => {
        mockDriverService.update.mockResolvedValue(null);

        const { req, res } = createMocks({
            params: { licenseId: "D999999" },
            body: {
                firstName: "John",
                surname: "Smith",
                secondName: null,
                secondSurname: null,
            },
        });
        const next = jest.fn();

        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await driverController.update(req, res, next);

        expect(next).toHaveBeenCalledWith(
            notFoundError(`Driver license ID not found: D999999`),
        );
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    test("DELETE /drivers/:licenseId - Success", async () => {
        mockDriverService.delete.mockResolvedValue(true);

        const response = await request(app).delete("/drivers/D123456");

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual({
            message: "Driver with license ID D123456 deleted successfully.",
        });
    });

    test("DELETE /drivers/:licenseId - Not Found", async () => {
        mockDriverService.delete.mockResolvedValue(false);

        const { req, res } = createMocks({ params: { licenseId: "D999999" } });
        const next = jest.fn();

        res.status = jest.fn(() => res);
        res.json = jest.fn(() => res);

        await driverController.delete(req, res, next);

        expect(next).toHaveBeenCalledWith(
            notFoundError(`Driver license ID not found: D999999`),
        );
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
