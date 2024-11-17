// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { notFoundError } from "@app/app.error";
import { Vehicle, vehicleUpdateSchema } from "@app/vehicle/vehicle";
import { VehicleService } from "@app/vehicle/vehicle.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type VehicleController = {
    create: ControllerMethod,
    read: ControllerMethod,
    readAll: ControllerMethod,
    update: ControllerMethod,
    delete: ControllerMethod,
}

export const newVehicleController = (service: VehicleService): VehicleController => ({
    async create(req, res, next) {
        const vehicle = req.body as Vehicle;

        const respond = (vehicle: Vehicle) => res
            .status(StatusCodes.CREATED)
            .json(vehicle);

        service
            .create(vehicle)
            .then(respond, next)
    },

    async read(req, res, next) {
        const { number } = req.params;

        const respond = (vehicle: Vehicle | null) =>
            vehicle !== null
            ? res.status(StatusCodes.OK).json(vehicle)
            : next(notFoundError(`Vehicle number not found: ${ number }`));

        service
            .read(number)
            .then(respond, next);
    },

    async readAll(req, res, next) {
        const queryIntParam = (key: string, def: number) =>
            parseInt(req.query[key] as string) || def;

        const defLimit = 10;
        const defPage = 1;
        const limit = Math.max(queryIntParam("limit", defLimit), 0);
        const page = Math.max(queryIntParam("page", defPage), 1);

        const respond = (vehicles: Vehicle[]) => res
            .status(StatusCodes.OK)
            .json(vehicles);

        service
            .readAll(limit, page)
            .then(respond, next);
    },

    async update(req, res, next) {
        const { number } = req.params;
        const vehicleData = vehicleUpdateSchema.parse(req.body);
        const vehicle: Vehicle = { number, ...vehicleData };

        const respond = (vehicle: Vehicle | null) =>
            vehicle !== null
            ? res.status(StatusCodes.OK).json(vehicle)
            : next(notFoundError(`Vehicle not found: ${ number }`));

        service
            .update(vehicle)
            .then(respond, next);
    },

    async delete(req, res, next) {
        const { number } = req.params;

        const respond = (deletedVehicle: boolean) =>
            deletedVehicle
            ? res.status(StatusCodes.OK)
                 .json({
                     message: `Vehicle with number ${ number } deleted successfully.`,
                 })
            : next(notFoundError(`Vehicle not found: ${number}`));

        service
            .delete(number)
            .then(respond, next);
    },
});

type ControllerMethod = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<void>;
