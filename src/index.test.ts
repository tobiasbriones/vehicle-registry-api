// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import request from "supertest";
import { app, server } from "./index";

describe("Vehicle Registry API", () => {
    afterAll((done) => {
        server.close(done); // Close the server after all tests
    });

    test("GET / should respond with Vehicle Registry Server", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.text).toBe("Vehicle Registry Server");
    });
});
