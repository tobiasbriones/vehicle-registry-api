// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { withErrorMessage } from "@log/log";
import {
    error,
    errorToHttp,
    errorToStatusCode,
    internalError,
    rejectInternalError,
} from "./app.error";

describe("Error Handling Module", () => {
    describe("errorToStatusCode", () => {
        it("should return 500 for InternalError", () => {
            expect(errorToStatusCode("InternalError")).toBe(500);
        });

        it("should return undefined for unknown error types", () => {
            expect(errorToStatusCode("UnknownError" as any)).toBeUndefined();
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
