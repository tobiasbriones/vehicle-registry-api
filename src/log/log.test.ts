// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { internalError } from "./log";

describe("internalError", () => {
    const mockReason = new Error("Internal database error");
    const userMessage = "Something went wrong, please try again later.";

    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should log the error message and reason to console", async () => {
        await expect(internalError(userMessage, mockReason))
            .rejects
            .toBeUndefined();

        expect(console.error)
            .toHaveBeenCalledWith(userMessage, "Reason:", mockReason);
    });
});
