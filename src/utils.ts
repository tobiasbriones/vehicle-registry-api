// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

/**
 * Converts an object to a printable string.
 *
 * @param obj object to convert to string
 * @returns {string} pretty string version representing the object
 */
export const objToString = (obj: object | undefined | null): string =>
    JSON.stringify(obj, jsonReplacer, 4);

/**
 * Converts a primitive value or object to a printable string.
 *
 * @param value value to convert to string
 * @returns {string} pretty string version representing the value
 */
export const valToString = (value: unknown): string => {
    let string: string;

    if (typeof value === "string") {
        string = value;
    }
    else if (typeof value === "object" || value === undefined || value === null) {
        string = objToString(value);
    }
    else {
        string = String(value);
    }
    return string;
};

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
