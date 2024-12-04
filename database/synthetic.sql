--  Copyright (c) 2024 Tobias Briones. All rights reserved.
--  SPDX-License-Identifier: MIT
--  This file is part of https://github.com/tobiasbriones/vehicle-registry-api

-- Insert synthetic records into the vehicle table
INSERT INTO vehicle (number, brand, model)
VALUES
    ('VIN-001', 'Toyota', 'Corolla'),
    ('VIN-002', 'Honda', 'Civic'),
    ('VIN-003', 'Ford', 'Mustang'),
    ('VIN-004', 'Chevrolet', 'Camaro'),
    ('VIN-005', 'Tesla', 'Model S'),
    ('VIN-006', 'BMW', 'X5'),
    ('VIN-007', 'Audi', 'A4'),
    ('VIN-008', 'Mercedes', 'C-Class'),
    ('VIN-009', 'Nissan', 'Altima'),
    ('VIN-010', 'Hyundai', 'Elantra'),
    ('VIN-011', 'Kia', 'Soul'),
    ('VIN-012', 'Subaru', 'Outback'),
    ('VIN-013', 'Mazda', 'CX-5'),
    ('VIN-014', 'Volkswagen', 'Passat'),
    ('VIN-015', 'Chevrolet', 'Impala');

-- Insert synthetic records into the driver table (15 records)
INSERT INTO driver (license_id)
VALUES
    ('D123456'),
    ('D789012'),
    ('D345678'),
    ('D901234'),
    ('D567890'),
    ('D234567'),
    ('D890123'),
    ('D456789'),
    ('D012345'),
    ('D678901'),
    ('D234678'),
    ('D890234'),
    ('D456890'),
    ('D012678'),
    ('D678234');

-- Insert synthetic records into the driver_name table
INSERT INTO driver_name (driver_id, first_name, surname, second_name, second_surname)
VALUES
    (1, 'John', 'Doe', NULL, 'Smith'),
    (2, 'Jane', 'Doe', 'Marie', NULL),
    (3, 'Robert', 'Johnson', 'Andrew', 'Williams'),
    (4, 'Emily', 'Davis', NULL, 'Brown'),
    (5, 'Michael', 'Clark', 'Thomas', NULL),
    (1, 'Lucas', 'White', 'Jacob', 'Lee'),
    (7, 'Olivia', 'Green', NULL, 'Harris'),
    (8, 'Isabella', 'Scott', 'Ava', 'Walker'),
    (9, 'Liam', 'Adams', 'James', 'Martinez'),
    (10, 'Sophia', 'Nelson', NULL, 'Carter'),
    (5, 'James', 'King', 'Liam', 'Perez'),
    (3, 'Amelia', 'Wright', 'Hannah', 'Roberts'),
    (13, 'William', 'Lopez', NULL, 'Morris'),
    (5, 'Avery', 'Hill', 'Benjamin', 'Collins'),
    (15, 'Ethan', 'Baker', 'Elijah', 'Mitchell'),

    -- Adding records with unusual names
    (13, 'Isabel', 'de la Cruz', 'Victoria', 'Gomez')
