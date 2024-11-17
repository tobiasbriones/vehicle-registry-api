// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString } from "@/utils";
import { ErrorInfo } from "@app/app.error";

/**
 * Creates a logger with a given public error message.
 *
 * @param info User friendly error message to forward in the logs
 */
export const withError = (info: ErrorInfo) => ({
    /**
     * Logs an internal error given the "public" `info` and the internal
     * `reason` that should stay private in the server logs.
     *
     * @param reason Private server error
     */
    logInternalReason(reason: unknown): Promise<never> {
        console.error(objToString(info));
        console.error("Reason:", String(reason));
        return Promise.reject(info);
    },
});
