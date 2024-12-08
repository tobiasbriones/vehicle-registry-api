// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { z } from "zod";

/**
 * Represents a person who drives a vehicle. Drivers must have a driver
 * license ID, first name and surname with optional second name and second
 * surname to be correctly identified in the system.
 */
export type Driver = {
    licenseId: string,
    firstName: string,
    surname: string,
    secondName?: string,
    secondSurname?: string,
}

export const driverFullName = (
    { firstName, secondName, surname, secondSurname }: Driver,
) => [ firstName, secondName, surname, secondSurname ]
    .filter(Boolean) // Remove undefined or falsy values
    .join(" ");

/**
 * Defines the SQL JSON arguments of the Driver model passed to the
 * `json_build_object` PSQL function when fetching a Driver record as a
 * composed object.
 *
 * The underlying SQL where these args will be placed must use the `driver`
 * and `name` variables to join the `driver` and `driver_name` tables.
 */
export const driverSqlJsonArgs: string = `
    'licenseId', driver.license_id,
    'firstName', COALESCE(name.first_name, 'N/A'),
    'surname', COALESCE(name.surname, 'N/A'),
    'secondName', name.second_name,
    'secondSurname', name.second_surname
`;

export const driverRegistrationSchema = z.object({
    licenseId: z
        .string()
        .min(6)
        .max(20)
        .regex(
            /^[A-Za-z0-9-]+$/,
            "Invalid license ID format. Only letters, numbers, and hyphens are allowed.",
        ),

    firstName: z.string().max(30).trim().min(1),
    surname: z.string().max(30).trim().min(1),
    secondName: z.string().max(30).trim().min(1).optional(),
    secondSurname: z.string().max(30).trim().min(1).optional(),
}).strict();

export const driverUpdateSchema = z.object({
    firstName: z.string().max(30).trim().min(1),
    surname: z.string().max(30).trim().min(1),
    secondName: z.string().max(30).trim().min(1).nullable(),
    secondSurname: z.string().max(30).trim().min(1).nullable(),
}).strict();

export type DriverUpdateBody = {
    firstName: string,
    surname: string,
    secondName: string | null,
    secondSurname: string | null,
}

export const driverFromUpdateBody = (
    licenseId: string,
    {
        firstName,
        surname,
        secondName,
        secondSurname,
    }: DriverUpdateBody,
): Driver => ({
    licenseId,
    firstName,
    surname,
    secondName: secondName ?? undefined,
    secondSurname: secondSurname ?? undefined,
});
