# Vehicle Registry API

[![GitHub Repository](https://img.shields.io/static/v1?label=GITHUB&message=REPOSITORY&labelColor=555&color=0277bd&style=for-the-badge&logo=GITHUB)](https://github.com/tobiasbriones/vehicle-registry-api)

[![GitHub Project License](https://img.shields.io/github/license/tobiasbriones/vehicle-registry-api.svg?style=flat-square)](https://github.com/tobiasbriones/vehicle-registry-api/blob/main/LICENSE)

[![codecov](https://codecov.io/github/tobiasbriones/vehicle-registry-api/branch/ops/graph/badge.svg?token=LA2I0K5SLI)](https://codecov.io/github/tobiasbriones/vehicle-registry-api)

Backend API for a vehicle registration web app that allows entrance and leave.

## Getting Started

This is Node + Express.js + TypeScript application.

Run `npm install` to install dependencies on your machine.

Run `npm start` to run the development server.

Run ESLint with `npm run lint` to check code quality with static analysis.

Run `npm build` to create the production build at [./dist](dist).

Run `npm run clean` to delete generated project files.

### Testing

Run tests with `npm run test`, and watch via `npm run test:watch`.

Open up the coverage report with `npm run view:coverage`.

The command `npm run test:coverage` is the same as `test`, but it may be useful
to clarify the "coverage" option explicitly when used in automated CI.

## Environment Variables

The app utilizes environment variables to set production values.

Ensure *not to commit any environment variable* files (e.g., `.env`, `.dev.env`,
etc.) to the repository, even if they are for testing purposes, or they (still)
don't contain any sensitive information.

The production file is `.env` and must be at the root of the project when
deploying. You should also consider adding environment variables directly into
your deployment environment (e.g. Render, AWS, etc.) instead of using a
`.env` file.

### Production Variables

| Environment Variable | Description                                                                             | Default Value |
|----------------------|-----------------------------------------------------------------------------------------|---------------|
| `PORT`               | Port on which the application listens for incoming connections                          | `3000`        |
| `ENV_MODE`           | Mode of the environment the application runs on (development, staging, production, etc) | `production`  |

## About

**Vehicle Registry API**

Vehicle registration web API.

Copyright © 2024 Tobias Briones. All rights reserved.

### License

This project is licensed under the [MIT](LICENSE).
