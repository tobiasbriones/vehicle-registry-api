// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import express from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { z } from "zod";
import { validateBody } from "./app.validation";

const app = express();
app.use(express.json());

// Define a sample Zod schema for testing
const vehicleSchema = z.object({
    number: z.string().min(1, { message: "Number is required" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    model: z.string().min(1, { message: "Model is required" }),
});

// Use the validation middleware with the defined schema
app.post("/vehicles", validateBody(vehicleSchema), (req, res) => {
    res.status(StatusCodes.CREATED).json(req.body);
});

describe("validateBody Middleware", () => {
    it("should return 400 Bad Request for invalid body", async () => {
        const response = await request(app)
            .post("/vehicles")
            .send({}); // Sending an empty body

        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body).toEqual({
            type: "ValidationError",
            info: [
                { path: "number", message: "Required" },
                { path: "brand", message: "Required" },
                { path: "model", message: "Required" },
            ],
        });
    });

    it("should call next middleware for valid body", async () => {
        const newVehicle = {
            number: "VIN-123",
            brand: "Toyota",
            model: "Camry",
        };

        const response = await request(app)
            .post("/vehicles")
            .send(newVehicle);

        expect(response.status).toBe(StatusCodes.CREATED);
        expect(response.body).toEqual(newVehicle);
    });
});
