// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import js from "@eslint/js";
import eslint from "@eslint/js";
import globals from "globals";
import tseslint, { parser as tsParser } from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    { ignores: [ "dist" ] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        files: [ "**/*.{ts}" ],
        languageOptions: {
            ecmaVersion: 2022,
            parser: tsParser,
            globals: globals.node,
            parserOptions: {
                project: [ "./tsconfig.json" ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "node": {},
        },
        rules: {
            "@typescript-eslint/consistent-type-definitions": [
                "error",
                "type",
            ],
            "node/no-missing-import": "off",
            "node/no-unsupported-features/es-syntax": "off",
            "no-unreachable": "warn",
            "no-constant-condition": [ "warn", { "checkLoops": false } ],
        },
    },
);
