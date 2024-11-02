// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { StatusCodes } from "http-status-codes";

export type ErrorType
    = "InternalError"

export const errorToStatusCode = (error: ErrorType) => {
    const map: Record<ErrorType, StatusCodes> = {
        InternalError: StatusCodes.INTERNAL_SERVER_ERROR,
    };

    return map[error];
};

export type AppError = {
    type: ErrorType,
    msg: string,
}

export const error = (type: ErrorType, msg: string): AppError => ({ type, msg });

export const internalError = (msg: string): AppError => ({
    type: "InternalError",
    msg,
});

export const rejectInternalError = (msg: string): Promise<never> =>
    Promise.reject(internalError(msg));

export type HttpError = {
    statusCode: number,
    msg: string,
}

export const errorToHttp = ({ type, msg }: AppError): HttpError => ({
    statusCode: errorToStatusCode(type),
    msg,
});