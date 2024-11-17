// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { validationError } from "@app/app.error";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodSchema } from "zod";

export const validateBody = <T extends ZodSchema>(schema: T) => {
    return async function(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map(err => ({
                path: err.path.join("."),
                message: err.message,
            }));
            const error = validationError(errors);

            res.status(StatusCodes.BAD_REQUEST).json(error);
            return;
        }

        req.body = result.data;
        next();
    };
};
