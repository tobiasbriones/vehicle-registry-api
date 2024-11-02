// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { newAppRouter } from "@app/app.router";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const DEF_PORT = 3000;
const app = express();
const port = process.env.PORT || DEF_PORT;
const router = newAppRouter();

app.use(cors());
app.use(bodyParser.json());
app.use(router);

const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${ port }`);
    console.log(`[server]: environment: ${ process.env.ENV_MODE }`);
});

export { app, server };
