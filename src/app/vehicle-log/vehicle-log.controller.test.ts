// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { notFoundError } from "@app/app.error";
import {
    newVehicleLogController,
} from "@app/vehicle-log/vehicle-log.controller";
import { VehicleLogService } from "@app/vehicle-log/vehicle-log.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
    VehicleLog,
    VehicleLogCreateBody,
    VehicleLogUpdateBody,
} from "src/app/vehicle-log/vehicle-log";

describe("VehicleLogController", () => {
    let service: jest.Mocked<VehicleLogService>;
    let controller: ReturnType<typeof newVehicleLogController>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        service = {
            create: jest.fn(),
            read: jest.fn(),
            readAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as jest.Mocked<VehicleLogService>;

        controller = newVehicleLogController(service);
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    describe("create", () => {
        it(
            "should create a vehicle log and respond with status 201",
            async () => {
                const mockBody: VehicleLogCreateBody = {
                    vehicleNumber: "VIN-123",
                    driverLicenseId: "D123456",
                    logType: "entry",
                    mileageInKilometers: 20,
                };

                const mockLog: VehicleLog = {
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
                    mileageInKilometers: 20,
                    timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                };
                mockReq.body = mockBody;
                service.create.mockResolvedValueOnce(mockLog);

                await controller.create(
                    mockReq as Request,
                    mockRes as Response,
                    mockNext as NextFunction,
                );

                expect(service.create).toHaveBeenCalledWith(mockBody);
                expect(mockRes.status)
                    .toHaveBeenCalledWith(StatusCodes.CREATED);

                expect(mockRes.json).toHaveBeenCalledWith(mockLog);
            },
        );
    });

    describe("read", () => {
        it("should return a vehicle log when found", async () => {
            const mockLog: VehicleLog = {
                id: 1,
                vehicle: {
                    number: "VIN-123",
                    brand: "Hyundai",
                    model: "Elantra",
                },
                driver: {
                    licenseId: "DL456",
                    firstName: "Joe",
                    surname: "Doe",
                },
                logType: "entry",
                mileageInKilometers: 20,
                timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
            };
            mockReq.params = { id: "1" };
            service.read.mockResolvedValueOnce(mockLog);

            await controller.read(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction,
            );

            expect(service.read).toHaveBeenCalledWith(1);
            expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockRes.json).toHaveBeenCalledWith(mockLog);
        });

        it("should call next with notFoundError if log not found", async () => {
            mockReq.params = { id: "1" };
            service.read.mockResolvedValueOnce(null);

            await controller.read(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction,
            );

            expect(service.read).toHaveBeenCalledWith(1);
            expect(mockNext).toHaveBeenCalledWith(
                notFoundError("Vehicle Log ID not found: 1"),
            );
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
                        licenseId: "DL987",
                        firstName: "Joe",
                        surname: "Doe",
                    },
                    logType: "entry",
                    mileageInKilometers: 0,
                    timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                },
            ];
            mockReq.query = { limit: "10", page: "1" };
            service.readAll.mockResolvedValueOnce(mockLogs);

            await controller.readAll(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction,
            );

            expect(service.readAll).toHaveBeenCalledWith(10, 1, {});
            expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(mockRes.json).toHaveBeenCalledWith(mockLogs);
        });
    });

    describe("update", () => {
        it(
            "should update a vehicle log and respond with updated log",
            async () => {
                const mockLog: VehicleLog = {
                    id: 1,
                    vehicle: {
                        number: "VIN-123",
                        brand: "Hyundai",
                        model: "Elantra",
                    },
                    driver: {
                        licenseId: "DL987",
                        firstName: "Joe",
                        surname: "Smith",
                    },
                    logType: "entry",
                    mileageInKilometers: 110,
                    timestamp: new Date("2024-11-27 00:18:00.755929 +00:00"),
                };
                mockReq.params = { id: "1" };
                mockReq.body = { logType: "entry", mileageInKilometers: 110 };
                service.update.mockResolvedValueOnce(mockLog);

                await controller.update(
                    mockReq as Request,
                    mockRes as Response,
                    mockNext as NextFunction,
                );

                expect(service.update).toHaveBeenCalledWith({
                    id: 1,
                    logType: "entry",
                    mileageInKilometers: 110,
                } as VehicleLogUpdateBody);

                expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
                expect(mockRes.json).toHaveBeenCalledWith(mockLog);
            },
        );

        it("should call next with notFoundError if log not found", async () => {
            mockReq.params = { id: "1" };
            mockReq.body = { logType: "entry", mileageInKilometers: 110 };
            service.update.mockResolvedValueOnce(null);

            await controller.update(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction,
            );

            expect(service.update).toHaveBeenCalledWith({
                id: 1,
                logType: "entry",
                mileageInKilometers: 110,
            } as VehicleLogUpdateBody);

            expect(mockNext).toHaveBeenCalledWith(
                notFoundError("Vehicle Log ID not found: 1"),
            );
        });
    });

    describe("delete", () => {
        it(
            "should delete a vehicle log and respond with success message",
            async () => {
                mockReq.params = { id: "1" };
                service.delete.mockResolvedValueOnce(true);

                await controller.delete(
                    mockReq as Request,
                    mockRes as Response,
                    mockNext as NextFunction,
                );

                expect(service.delete).toHaveBeenCalledWith(1);
                expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
                expect(mockRes.json).toHaveBeenCalledWith({
                    message: "Driver with license ID 1 deleted successfully.",
                });
            },
        );

        it("should call next with notFoundError if log not found", async () => {
            mockReq.params = { id: "1" };
            service.delete.mockResolvedValueOnce(false);

            await controller.delete(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction,
            );

            expect(service.delete).toHaveBeenCalledWith(1);
            expect(mockNext).toHaveBeenCalledWith(
                notFoundError("Driver license ID not found: 1"),
            );
        });
    });
});
