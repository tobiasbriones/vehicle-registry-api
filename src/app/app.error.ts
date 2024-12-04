// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { valToString } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type ErrorType
    = "InternalError"
    | "DuplicateError"
    | "ValidationError"
    | "NotFoundError"
    | "ReferenceNotFoundError"
    | "IncorrectValueError";

export const errorToStatusCode = (error: ErrorType) => {
    const map: Record<ErrorType, StatusCodes> = {
        InternalError: StatusCodes.INTERNAL_SERVER_ERROR,
        DuplicateError: StatusCodes.CONFLICT,
        ValidationError: StatusCodes.BAD_REQUEST,
        NotFoundError: StatusCodes.NOT_FOUND,
        ReferenceNotFoundError: StatusCodes.UNPROCESSABLE_ENTITY,
        IncorrectValueError: StatusCodes.UNPROCESSABLE_ENTITY,
    };

    return map[error];
};

export type ErrorInfo = string | object;

export type AppError = {
    type: ErrorType,
    info: ErrorInfo,
}

export const error = (type: ErrorType, info: ErrorInfo): AppError => ({
    type,
    info,
});

export const internalError = (info: ErrorInfo): AppError => ({
    type: "InternalError",
    info,
});

export const rejectInternalError = (info: ErrorInfo): Promise<never> =>
    Promise.reject(internalError(info));

export const duplicateError = (info: ErrorInfo): AppError => ({
    type: "DuplicateError",
    info,
});

export const rejectDuplicateError = (infos: ErrorInfo): Promise<never> =>
    Promise.reject(duplicateError(infos));

export const validationError = (info: ErrorInfo): AppError => ({
    type: "ValidationError",
    info,
});

export const notFoundError = (info: ErrorInfo): AppError => ({
    type: "NotFoundError",
    info,
});

export const referenceNotFoundError = (info: ErrorInfo): AppError => ({
    type: "ReferenceNotFoundError",
    info,
});

export const rejectReferenceNotFoundError = (info: ErrorInfo): Promise<never> =>
    Promise.reject(referenceNotFoundError(info));

export const incorrectValueError = (info: ErrorInfo): AppError => ({
    type: "IncorrectValueError",
    info,
});

export const rejectIncorrectValueError = (info: ErrorInfo): Promise<never> =>
    Promise.reject(incorrectValueError(info));

export type MessageOf<T> = {
    message: string,
    target: T,
}

export const messageOf = <T>(
    message: string,
    target: T,
): MessageOf<T> => ({ message, target });

export const messageOfToString = <T>(
    { message, target }: MessageOf<T>,
) => `${ message }: ${ valToString(target) }.`;

export type HttpError = {
    statusCode: number,
    info: ErrorInfo,
}

export const errorToHttp = ({ type, info }: AppError): HttpError => ({
    statusCode: errorToStatusCode(type),
    info,
});

export const respondHttpError = (res: Response) => (error: unknown) => {
    if (isAppError(error)) {
        const { type } = error;

        res
            .status(errorToStatusCode(type))
            .json(error);
    }
    else {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(error);
    }
};

export function errorHandler(
    err: AppError,
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
    "info" in error;
