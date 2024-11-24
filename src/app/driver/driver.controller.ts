// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { notFoundError } from "@app/app.error";
import {
    Driver,
    driverFromUpdateBody,
    driverUpdateSchema,
} from "@app/driver/driver";
import { DriverService } from "@app/driver/driver.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type DriverController = {
    create: ControllerMethod,
    read: ControllerMethod,
    readAll: ControllerMethod,
    update: ControllerMethod,
    delete: ControllerMethod,
}

export const newDriverController = (service: DriverService): DriverController => ({
    async create(req, res, next) {
        const vehicle = req.body as Driver;

        const respond = (vehicle: Driver) => res
            .status(StatusCodes.CREATED)
            .json(vehicle);

        service
            .create(vehicle)
            .then(respond, next);
    },

    async read(req, res, next) {
        const { licenseId } = req.params;

        const respond = (vehicle: Driver | null) =>
            vehicle !== null
            ? res.status(StatusCodes.OK).json(vehicle)
            : next(notFoundError(`Driver license ID not found: ${ licenseId }`));

        service
            .read(licenseId)
            .then(respond, next);
    },

    async readAll(req, res, next) {
        const queryIntParam = (key: string, def: number) =>
            parseInt(req.query[key] as string) || def;

        const defLimit = 10;
        const defPage = 1;
        const limit = Math.max(queryIntParam("limit", defLimit), 0);
        const page = Math.max(queryIntParam("page", defPage), 1);

        const respond = (vehicles: Driver[]) => res
            .status(StatusCodes.OK)
            .json(vehicles);

        service
            .readAll(limit, page)
            .then(respond, next);
    },

    async update(req, res, next) {
        const { licenseId } = req.params;
        const driverData = driverUpdateSchema.parse(req.body);
        const driver = driverFromUpdateBody(licenseId, driverData);

        const respond = (vehicle: Driver | null) =>
            vehicle !== null
            ? res.status(StatusCodes.OK).json(vehicle)
            : next(notFoundError(`Driver license ID not found: ${ licenseId }`));

        service
            .update(driver)
            .then(respond, next);
    },

    async delete(req, res, next) {
        const { licenseId } = req.params;

        const respond = (deletedVehicle: boolean) =>
            deletedVehicle
            ? res.status(StatusCodes.OK)
                 .json({
                     message: `Driver with license ID ${ licenseId } deleted successfully.`,
                 })
            : next(notFoundError(`Driver license ID not found: ${ licenseId }`));

        service
            .delete(licenseId)
            .then(respond, next);
    },
});

type ControllerMethod = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<void>;
