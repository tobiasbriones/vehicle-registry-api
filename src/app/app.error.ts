// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type ErrorType
    = "InternalError"
    | "DuplicateError"
    | "ValidationError"

export const errorToStatusCode = (error: ErrorType) => {
    const map: Record<ErrorType, StatusCodes> = {
        InternalError: StatusCodes.INTERNAL_SERVER_ERROR,
        DuplicateError: StatusCodes.CONFLICT,
        ValidationError: StatusCodes.BAD_REQUEST,
    };

    return map[error];
};

export type AppError = {
    type: ErrorType,
    msg: string,
}

export const error = (type: ErrorType, msg: string): AppError => ({
    type,
    msg,
});

export const internalError = (msg: string): AppError => ({
    type: "InternalError",
    msg,
});

export const rejectInternalError = (msg: string): Promise<never> =>
    Promise.reject(internalError(msg));

export const duplicateError = (msg: string): AppError => ({
    type: "DuplicateError",
    msg,
});

export const rejectDuplicateError = (msg: string): Promise<never> =>
    Promise.reject(duplicateError(msg));

export const validationError = (msg: string): AppError => ({
    type: "ValidationError",
    msg,
});

export type HttpError = {
    statusCode: number,
    msg: string,
}

export const errorToHttp = ({ type, msg }: AppError): HttpError => ({
    statusCode: errorToStatusCode(type),
    msg,
});

export const respondHttpError = (res: Response) => (error: unknown) => {
    if (isAppError(error)) {
        const { type, msg } = error;

        res
            .status(errorToStatusCode(type))
            .json({ error: msg });
    }
    else {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: JSON.parse(objToString(error)) });
    }
};

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const handleError = respondHttpError(res);

    handleError(err);
    next(err);
}

const isNonNullObject = (obj: unknown) =>
    typeof obj === "object" && obj !== null;

const isAppError = (error: unknown): error is AppError =>
    isNonNullObject(error) &&
    "type" in error &&
    "msg" in error;
