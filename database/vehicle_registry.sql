--  Copyright (c) 2024 Tobias Briones. All rights reserved.
--  SPDX-License-Identifier: MIT
--  This file is part of https://github.com/tobiasbriones/vehicle-registry-api

-- Vehicle
CREATE TABLE vehicle
(
    id     INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    number VARCHAR(20)  NOT NULL UNIQUE CHECK (TRIM(brand) <> ''),
    brand  VARCHAR(100) NOT NULL CHECK (TRIM(brand) <> ''),
    model  VARCHAR(100) NOT NULL CHECK (TRIM(brand) <> '')
);

-- Driver
CREATE TABLE driver
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    license_id VARCHAR(20) NOT NULL UNIQUE CHECK (
        TRIM(license_id) <> '' AND
        LENGTH(license_id) >= 6 AND
        LENGTH(license_id) <= 20 AND
        license_id ~ '^[A-Za-z0-9-]+$')
);

-- Driver Name
CREATE TABLE driver_name
(
    driver_id      INTEGER     NOT NULL,
    first_name     VARCHAR(30) NOT NULL CHECK (TRIM(first_name) <> ''),
    sur_name       VARCHAR(30) NOT NULL CHECK (TRIM(first_name) <> ''),
    second_name    VARCHAR(30) NULL CHECK (TRIM(first_name) <> ''),
    second_surname VARCHAR(30) NULL CHECK (TRIM(first_name) <> ''),

    FOREIGN KEY (driver_id) REFERENCES driver (id) ON DELETE CASCADE
);
