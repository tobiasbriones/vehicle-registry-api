// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: MIT
// This file is part of https://github.com/tobiasbriones/vehicle-registry-api

import { MessageOf } from "@app/app.error";

export type VehicleNotFoundInfo = {
    context: MessageOf<string>,
    detail: string,
}

export const vehicleNotFoundInfo = (
    context: MessageOf<string>,
    detail: string,
): VehicleNotFoundInfo => ({ context, detail });

export type DriverNotFoundError = {
    context: MessageOf<string>,
    detail: string,
}

export const driverNotFoundInfo = (
    context: MessageOf<string>,
    detail: string,
): DriverNotFoundError => ({ context, detail });

export type IncorrectMileageInfo = {
    context: MessageOf<string>,
    detail: string,
}

export const incorrectMileageInfo = (
    context: MessageOf<string>,
    detail: string,
): IncorrectMileageInfo => ({ context, detail });

export type IncorrectEventInfo = {
    context: MessageOf<string>,
    detail: string,
}

export const incorrectEventInfo = (
    context: MessageOf<string>,
    detail: string,
): IncorrectEventInfo => ({ context, detail });
