--  Copyright (c) 2024 Tobias Briones. All rights reserved.
--  SPDX-License-Identifier: MIT
--  This file is part of https://github.com/tobiasbriones/vehicle-registry-api

-- Database: local_vehicle_registry

-- DROP DATABASE IF EXISTS local_vehicle_registry;

CREATE DATABASE local_vehicle_registry
    WITH
    OWNER = tobi
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
