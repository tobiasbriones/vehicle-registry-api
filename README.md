# Vehicle Registry API

[![GitHub Repository](https://img.shields.io/static/v1?label=GITHUB&message=REPOSITORY&labelColor=555&color=0277bd&style=for-the-badge&logo=GITHUB)](https://github.com/tobiasbriones/vehicle-registry-api)

[![GitHub Project License](https://img.shields.io/github/license/tobiasbriones/vehicle-registry-api.svg?style=flat-square)](https://github.com/tobiasbriones/vehicle-registry-api/blob/main/LICENSE)

[![codecov](https://codecov.io/github/tobiasbriones/vehicle-registry-api/branch/ops/graph/badge.svg?token=LA2I0K5SLI)](https://codecov.io/github/tobiasbriones/vehicle-registry-api)

Backend API for a vehicle registration web app that allows entrance and leave.

## Getting Started

The Node + Express.js + TypeScript application provides an API for vehicle
operations.

The following scripts are **common** to the project, while the next sections
provide particular scripts for development and production.

| Command         | Description                                                  |
|-----------------|--------------------------------------------------------------|
| `npm install`   | Installs project dependencies.                               |
| `npm run lint`  | Executes ESLint to check code quality using static analysis. |
| `npm run clean` | Removes generated project files.                             |

### Development

| Command             | Description                  |
|---------------------|------------------------------|
| `npm run start:dev` | Runs the development server. |

### Deployment

| Command         | Description                                                |
|-----------------|------------------------------------------------------------|
| `npm run build` | Builds the **production** version in the `dist` directory. |
| `npm run start` | Runs the production server (`node dist/app/index.js`).     |

You can run the production app with the default script `npm start` which uses
`node`, or use the [PM2](https://www.npmjs.com/package/pm2) process manager.

To deploy the application you will need to clone the repository into your
machine and:

- `npm install`
- `npm run build`
- `npm run start`

### Testing

The application specifies unit tests to enhance its reliability and
documentation.

| Command                 | Description                                                             |
|-------------------------|-------------------------------------------------------------------------|
| `npm run test`          | Runs the test suite.                                                    |
| `npm run test:watch`    | Runs tests in watch mode for continuous testing during development.     |
| `npm run view:coverage` | Opens the coverage report generated from tests.                         |
| `npm run test:coverage` | Runs tests with coverage reporting, useful for clarity in automated CI. |

## Vehicle Registry API

| Endpoint               | Method | Description                 |
|------------------------|--------|-----------------------------|
| `/`                    | GET    | Welcome  server message.    |
| `/vehicles`            | POST   | Registers a new vehicle.    |
| `/vehicles/{ number }` | GET    | Fetches a vehicle.          |
| `/vehicles`            | GET    | Fetches a list of vehicles. |
| `/vehicles/{ number }` | PUT    | Updates a vehicle.          |
| `/vehicles/{ number }` | DELETE | Deletes a vehicles.         |

The complete API documentation is
at the [vehicle-registry-api](docs/vehicle-registry-api.md) page.

## Environment Variables

The app utilizes environment variables to set production values.

Ensure *not to commit any environment variable* files (e.g., `.env`, `.dev.env`,
etc.) to the repository, even if they are for testing purposes, or they (still)
don't contain any sensitive information.

The production file is `.env` and must be at the root of the project when
deploying. You should also consider adding environment variables directly into
your deployment environment (e.g. Render, AWS, etc.) instead of using a
`.env` file.

### Setting Variables

The following variables work for production and development modes. Ensure to set
the proper values in a `.env` file (recommended for development) or directly
into your production environment.

| Variable      | Description                                                                              | Value              | Dev Value                |
|---------------|------------------------------------------------------------------------------------------|--------------------|--------------------------|
| `PORT`        | Port on which the application listens for incoming connections.                          | `3000`             | `3000`                   |
| `ENV_MODE`    | Mode of the environment the application runs on (development, staging, production, etc). | `production`       | `development`            |
| `DB_USER`     | Username for the PostgreSQL database connection.                                         | `${ db_user }`     | `tobi`                   |
| `DB_HOST`     | Hostname of the PostgreSQL database server.                                              | `${ db_hostname }` | `localhost`              |
| `DB_NAME`     | Name of the PostgreSQL database to connect to.                                           | `vehicle_registry` | `local_vehicle_registry` |
| `DB_PASSWORD` | Password for the PostgreSQL user.                                                        | `${ db_password }` | `${ dev_db_password }`   |
| `DB_PORT`     | Port on which the PostgreSQL database server is running.                                 | `5432`             | `5432`                   |

## Testing HTTP Request

The [./http](http) project contains `http` files with requests you can run from
your IDE to test the application API.

## Database

The [./database](database) project defines the PSQL source code and
documentation for the database of the Vehicle Registry application.

## About

**Vehicle Registry API**

Vehicle registration web API.

Copyright © 2024 Tobias Briones. All rights reserved.

### License

This project is licensed under the [MIT](LICENSE).
