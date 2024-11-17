// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { objToString, valToString } from "./utils";

describe("objToString", () => {
    // Use `JSON.stringify(obj, null, 4)` as the spec to avoid writing
    // multi-line strings in TS (this is straightforward in Kotlin but not
    // in TS).

    test("keeps a string value unchanged", () => {
        const msg = "Information message string.";

        expect(valToString(msg)).toEqual(msg);
    });

    test("converts a simple object to a formatted string", () => {
        const obj = { a: 1, b: "text", c: [ 1, 2, 3 ] };
        const expectedOutput = JSON.stringify(obj, null, 4);

        expect(objToString(obj)).toBe(expectedOutput);
    });

    test("converts a nested object to a formatted string", () => {
        const obj = { a: { b: { c: 1 } }, d: [ 2, 3 ] };
        const expectedOutput = JSON.stringify(obj, null, 4);

        expect(objToString(obj)).toBe(expectedOutput);
    });

    test("handles an array", () => {
        const arr = [ 1, 2, 3, { a: "test" } ];
        const expectedOutput = JSON.stringify(arr, null, 4);

        expect(objToString(arr)).toBe(expectedOutput);
    });

    test("converts an Error object to a formatted string", () => {
        const error = new Error("Test error");
        const expectedOutput = JSON.stringify({
            message: error.message,
        }, null, 4);

        expect(objToString(error)).toBe(expectedOutput);
    });

    test("handles null and undefined", () => {
        expect(objToString(null)).toBe("null");
        expect(objToString(null)).toBe("null");

        expect(objToString(undefined)).toBe("null");
        expect(objToString(undefined)).toBe("null");
    });

    test("handles empty objects and arrays", () => {
        expect(objToString({})).toBe("{}");
        expect(objToString([])).toBe("[]");
    });
});
