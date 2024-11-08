// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { withErrorMessage } from "@log/log";
import { Response } from "express";
import {
    duplicateError,
    error,
    errorToHttp,
    errorToStatusCode,
    internalError,
    rejectInternalError,
    respondHttpError,
} from "./app.error";

describe("Error Handling Module", () => {
    describe("errorToStatusCode", () => {
        it("should return 500 for InternalError", () => {
            expect(errorToStatusCode("InternalError")).toBe(500);
        });
    });

    describe("error function", () => {
        it(
            "should create an error object with the given type and message",
            () => {
                const errorType = "InternalError" as const;
                const msg = "An internal error occurred.";
                const result = error(errorType, msg);

                expect(result).toEqual({ type: errorType, msg });
            },
        );
    });

    describe("internalError function", () => {
        it("should create an InternalError with the given message", () => {
            const msg = "Internal server error.";
            const result = internalError(msg);

            expect(result).toEqual({ type: "InternalError", msg });
        });
    });

    describe("duplicateError function", () => {
        it("should create a DuplicateError with the given message", () => {
            const msg = "Item already exists.";
            const result = duplicateError(msg);

            expect(result).toEqual({ type: "DuplicateError", msg });
        });

        it("should return the proper status code of a DuplicateError", () => {
            const code = errorToStatusCode("DuplicateError");

            // 409 Conflict
            // This status code indicates that the request could not be
            // completed due to a conflict with the current state of the
            // resource.
            expect(code).toEqual(409);
        });
    });

    describe("rejectInternalError function", () => {
        it(
            "should return a rejected promise with an InternalError",
            async () => {
                const msg = "This is an internal error.";

                await expect(rejectInternalError(msg))
                    .rejects
                    .toEqual(internalError(msg));
            },
        );
    });

    describe("errorToHttp function", () => {
        it(
            "should convert an Error to an HttpError with the correct status code and message",
            () => {
                const errorObject = internalError("Internal error occurred.");
                const result = errorToHttp(errorObject);

                expect(result).toEqual({
                    statusCode: 500,
                    msg: "Internal error occurred.",
                });
            },
        );
    });
});

describe("internalError", () => {
    const mockReason = new Error("Internal database error");
    const userMessage = "Something went wrong, please try again later.";

    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should forward the user error message", async () => {
        const logger = withErrorMessage(userMessage);
        const handledError = logger
            .logInternalReason(mockReason)
            .catch(rejectInternalError);

        await expect(handledError)
            .rejects
            .toMatchObject({
                type: "InternalError",
                msg: userMessage,
            });

        expect(console.error).toHaveBeenCalledWith(
            userMessage,
            "Reason:",
            mockReason.toString(),
        );
    });
});

describe("respondHttpError", () => {
    let res: Response;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
    });

    it("should respond with the correct status code and error message", () => {
        const error = internalError("Some internal error occurred");

        respondHttpError(res)(error);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({ error: error.msg });
    });

    it("should handle unknown errors gracefully", () => {
        // Non-standard error
        const unknownError = { reason: "An unknown error occurred" };

        respondHttpError(res)(unknownError);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json)
            .toHaveBeenCalledWith({ error: unknownError });
    });
});
