// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

/**
 * Converts an object to a printable string.
 *
 * @param obj object to convert to string
 * @returns {string} pretty string version representing the object
 */
export const objToString = (obj: unknown): string =>
    JSON.stringify(obj, jsonReplacer, 4);

function jsonReplacer(key: string, value: unknown) {
    if (value === undefined || value === null) {
        return null;
    }
    else if (value instanceof Error) {
        return {
            message: value.message,
        };
    }
    return value;
}
