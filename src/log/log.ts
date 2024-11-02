// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

/**
 * Creates a logger with a given public error message.
 *
 * @param {string} msg User friendly error message to forward in the logs
 */
export const withErrorMessage = (msg: string) => ({
    /**
     * Logs an internal error given the "public" `msg` and the internal
     * `reason` that should stay private in the server logs.
     *
     * @param reason Private server error
     */
    logInternalReason(reason: unknown): Promise<never> {
        console.error(msg, "Reason:", String(reason));
        return Promise.reject(msg);
    },
});