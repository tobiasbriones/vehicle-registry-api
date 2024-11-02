// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

export type ErrorType
    = "InternalError"

export const errorToStatusCode = (error: ErrorType) => {
    const map: Record<ErrorType, number> = {
        InternalError: 500,
    };

    return map[error];
};

export type Error = {
    type: ErrorType,
    msg: string,
}

export const error = (type: ErrorType, msg: string): Error => ({ type, msg });

export const internalError = (msg: string): Error => ({
    type: "InternalError",
    msg,
});

export const rejectInternalError = (msg: string): Promise<never> =>
    Promise.reject(internalError(msg));

export type HttpError = {
    statusCode: number,
    msg: string,
}

export const errorToHttp = ({ type, msg }: Error): HttpError => ({
    statusCode: errorToStatusCode(type),
    msg,
});
