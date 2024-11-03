// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { respondHttpError } from "@app/app.error";
import { Vehicle, vehicleUpdateSchema } from "@app/vehicle/vehicle";
import { VehicleService } from "@app/vehicle/vehicle.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type VehicleController = {
    create: (req: Request, res: Response) => Promise<void>,
    read: (req: Request, res: Response) => Promise<void>,
    readAll: (req: Request, res: Response) => Promise<void>,
    update: (req: Request, res: Response) => Promise<void>,
    delete: (req: Request, res: Response) => Promise<void>,
}

export const newVehicleController = (service: VehicleService): VehicleController => ({
    async create(req, res) {
        const vehicle = req.body as Vehicle;

        service
            .create(vehicle)
            .then(vehicle => res.status(StatusCodes.CREATED).json(vehicle))
            .catch(respondHttpError(res));
    },

    async read(req, res) {
        const { number } = req.params;

        const notFound = () => res
            .status(StatusCodes.NOT_FOUND)
            .json(`Vehicle number not found: ${ number }`);

        const respond = (vehicle: Vehicle | null) =>
            vehicle !== null
            ? res.status(StatusCodes.OK).json(vehicle)
            : notFound();

        service
            .read(number)
            .then(respond)
            .catch(respondHttpError(res));
    },

    async readAll(req, res) {
        const queryIntParam = (key: string, def: number) =>
            parseInt(req.query[key] as string) || def;

        const defLimit = 10;
        const defPage = 1;
        const limit = Math.max(queryIntParam("limit", defLimit), 0);
        const page = Math.max(queryIntParam("page", defPage), 1);

        service
            .readAll(limit, page)
            .then(vehicles => res.status(StatusCodes.OK).json(vehicles))
            .catch(respondHttpError(res));
    },

    async update(req, res) {
        const { number } = req.params;
        const vehicleData = vehicleUpdateSchema.parse(req.body);
        const vehicle: Vehicle = { number, ...vehicleData };

        const respond = (vehicle: Vehicle | null) =>
            vehicle !== null
            ? res.status(StatusCodes.OK).json(vehicle)
            : res.status(StatusCodes.NOT_FOUND)
                 .json({ error: `Vehicle not found: ${ number }` });

        service
            .update(vehicle)
            .then(respond)
            .catch(respondHttpError(res));
    },

    async delete(req, res) {
        const { number } = req.params;

        const respond = (deletedVehicle: boolean) =>
            deletedVehicle
            ? res.status(StatusCodes.OK)
                 .json({
                     message: `Vehicle with number ${ number } deleted successfully.`,
                 })
            : res.status(StatusCodes.NOT_FOUND)
                 .json({ error: `Vehicle not found: ${number}` });

        service
            .delete(number)
            .then(respond)
            .catch(respondHttpError(res));
    },
});
