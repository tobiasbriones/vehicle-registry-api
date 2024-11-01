// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

/**
 * It logs an internal error given the "public" message and the internal reason
 * that should stay private in the server logs.
 *
 * @param {string} msg User friendly error message to forward
 * @param reason Private server error
 * @returns {Promise<never>} Rejected Promise with the original `msg`
 */
export function internalError(msg: string, reason: unknown): Promise<never> {
    console.error(msg, "Reason:", String(reason));
    return Promise.reject(msg);
}
