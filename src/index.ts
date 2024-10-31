// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Vehicle Registry Server");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${ port }`);
});
