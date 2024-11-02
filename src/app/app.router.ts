// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import express from "express";

const appRouter = express.Router();

appRouter.get("/", (_, res) => {
    res.send("Vehicle Registry Server");
});

export default appRouter;
