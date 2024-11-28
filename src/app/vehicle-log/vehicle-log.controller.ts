// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { notFoundError } from "@app/app.error";
import {
    VehicleLog,
    VehicleLogCreateBody,
    vehicleLogUpdateSchema,
} from "@app/vehicle-log/vehicle-log";
import { VehicleLogService } from "@app/vehicle-log/vehicle-log.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type VehicleLogController = {
    create: ControllerMethod,
    read: ControllerMethod,
    readAll: ControllerMethod,
    update: ControllerMethod,
    delete: ControllerMethod,
}

export const newVehicleLogController = (service: VehicleLogService): VehicleLogController => ({
    async create(req, res, next) {
        const vehicle = req.body as VehicleLogCreateBody;

        const respond = (log: VehicleLog) => res
            .status(StatusCodes.CREATED)
            .json(log);

        service
            .create(vehicle)
            .then(respond, next);
    },

    async read(req, res, next) {
        const idRaw = req.params.id;
        const id = parseInt(idRaw);

        const respond = (log: VehicleLog | null) =>
            log !== null
            ? res.status(StatusCodes.OK).json(log)
            : next(notFoundError(`Vehicle Log ID not found: ${ id }`));

        service
            .read(id)
            .then(respond, next);
    },

    async readAll(req, res, next) {
        const queryIntParam = (key: string, def: number) =>
            parseInt(req.query[key] as string) || def;

        const defLimit = 10;
        const defPage = 1;
        const limit = Math.max(queryIntParam("limit", defLimit), 0);
        const page = Math.max(queryIntParam("page", defPage), 1);

        const respond = (logs: VehicleLog[]) => res
            .status(StatusCodes.OK)
            .json(logs);

        service
            .readAll(limit, page)
            .then(respond, next);
    },

    async update(req, res, next) {
        const id = parseInt(req.params.id);
        const logData = vehicleLogUpdateSchema.parse(req.body);
        const logUpdate = { id, ...logData };

        const respond = (logs: VehicleLog | null) =>
            logs !== null
            ? res.status(StatusCodes.OK).json(logs)
            : next(notFoundError(`Vehicle Log ID not found: ${ id }`));

        service
            .update(logUpdate)
            .then(respond, next);
    },

    async delete(req, res, next) {
        const id = parseInt(req.params.id);

        const respond = (deletedVehicle: boolean) =>
            deletedVehicle
            ? res.status(StatusCodes.OK)
                 .json({
                     message: `Driver with license ID ${ id } deleted successfully.`,
                 })
            : next(notFoundError(`Driver license ID not found: ${ id }`));

        service
            .delete(id)
            .then(respond, next);
    },
});

type ControllerMethod = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<void>;
