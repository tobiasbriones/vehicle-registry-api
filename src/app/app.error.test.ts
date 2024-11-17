// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { withError } from "@log/log";
import { Response } from "express";
import { objToString } from "@/utils";
import {
    duplicateError,
    error,
    errorToHttp,
    errorToStatusCode,
    internalError,
    messageOf,
    messageOfToString,
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
                const type = "InternalError";
                const info = "An internal error occurred.";
                const result = error(type, info);

                expect(result).toEqual({ type, info });
            },
        );
    });

    describe("internalError function", () => {
        it("should create an InternalError with the given message", () => {
            const info = "Internal server error.";
            const result = internalError(info);

            expect(result).toEqual({ type: "InternalError", info });
        });
    });

    describe("duplicateError function", () => {
        it("should create a DuplicateError with the given message", () => {
            const info = "Item already exists.";
            const result = duplicateError(info);

            expect(result).toEqual({ type: "DuplicateError", info });
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
                const info = "This is an internal error.";

                await expect(rejectInternalError(info))
                    .rejects
                    .toEqual(internalError(info));
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
                    info: "Internal error occurred.",
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
        const logger = withError(userMessage);
        const handledError = logger
            .logInternalReason(mockReason)
            .catch(rejectInternalError);

        await expect(handledError)
            .rejects
            .toMatchObject({
                type: "InternalError",
                info: userMessage,
            });

        // Log the user error info
        expect(console.error).toHaveBeenCalledWith(userMessage);

        // Log the private error reason that must stay in the server
        expect(console.error).toHaveBeenCalledWith(
            "Reason:",
            mockReason.toString(),
        );
    });
});

describe("messageOf utilities", () => {
    it("creates a MessageOf object", () => {
        const result = messageOf("Error occurred", { field: "name" });

        expect(result).toEqual({
            message: "Error occurred",
            target: { field: "name" },
        });
    });

    it("converts a MessageOf object to a string (with object target)", () => {
        const messageObj = messageOf("Validation failed", { field: "email" });
        const result = messageOfToString(messageObj);

        expect(result)
            .toBe(`Validation failed: ${ objToString({ field: "email" }) }.`);
    });

    it(
        "converts a MessageOf object to a string (with primitive target)",
        () => {
            const messageObj = messageOf("Invalid value", 42);
            const result = messageOfToString(messageObj);

            expect(result).toBe("Invalid value: 42.");
        },
    );

    it("handles null or undefined target gracefully", () => {
        const messageObj = messageOf("No value provided", null);
        const result = messageOfToString(messageObj);

        expect(result).toBe("No value provided: null.");

        const messageObj2 = messageOf("Missing value", undefined);
        const result2 = messageOfToString(messageObj2);

        expect(result2).toBe("Missing value: null.");
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
            .toHaveBeenCalledWith({ error: error.info });
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
