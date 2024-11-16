--  Copyright (c) 2024 Tobias Briones. All rights reserved.
--  SPDX-License-Identifier: MIT
--  This file is part of https://github.com/tobiasbriones/vehicle-registry-api

-- Vehicle
CREATE TABLE vehicle
(
    id     INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    number VARCHAR(20)  NOT NULL UNIQUE,
    brand  VARCHAR(100) NOT NULL,
    model  VARCHAR(100) NOT NULL
);
