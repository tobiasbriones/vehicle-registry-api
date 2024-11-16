# Vehicle Registry API

[![GitHub Repository](https://img.shields.io/static/v1?label=GITHUB&message=REPOSITORY&labelColor=555&color=0277bd&style=for-the-badge&logo=GITHUB)](https://github.com/tobiasbriones/vehicle-registry-api)

[![GitHub Project License](https://img.shields.io/github/license/tobiasbriones/vehicle-registry-api.svg?style=flat-square)](https://github.com/tobiasbriones/vehicle-registry-api/blob/main/LICENSE)

[![codecov](https://codecov.io/github/tobiasbriones/vehicle-registry-api/branch/main/graph/badge.svg?token=LA2I0K5SLI)](https://codecov.io/github/tobiasbriones/vehicle-registry-api)

Backend API for a vehicle registration web app that allows entrance and leave.

## Getting Started

The Node + Express.js + TypeScript application provides an API for vehicle
operations.

### Environment Variables

The app utilizes environment variables to set production values.

I leave the following template to speed up your environment setup by copying it
to your local file or environment, so you only need to add your values.

```
PORT=3000
ENV_MODE=development
DB_USER=
DB_HOST=localhost
DB_NAME=local_vehicle_registry
DB_PASSWORD=
DB_PORT=5432
```

The complete environment variables documentation is at
the [environment-variables](docs/environment-variables.md) page.

### Project Scripts

The following scripts are **common** to the project, while the next sections
provide particular scripts for development and production.

| Command         | Description                                                  |
|-----------------|--------------------------------------------------------------|
| `npm install`   | Installs project dependencies.                               |
| `npm run lint`  | Executes ESLint to check code quality using static analysis. |
| `npm run clean` | Removes generated project files.                             |

To completely set up the application either in production or locally, ensure to
set your [environment variables](#environment-variables) accordingly.

#### Development

| Command             | Description                  |
|---------------------|------------------------------|
| `npm run start:dev` | Runs the development server. |

#### Deployment

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

#### Testing

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

The complete API documentation is at
the [vehicle-registry-api](docs/vehicle-registry-api.md) page.

## Testing HTTP Request

The [./http](http) project contains `http` files with requests you can run from
your IDE to test the application API.

## Database

The [./database](database) project defines the PSQL source code and
documentation for the database of the Vehicle Registry application.

## Contact

Tobias Briones: [GitHub](https://github.com/tobiasbriones)
[LinkedIn](https://linkedin.com/in/tobiasbriones)

## About

**Vehicle Registry API**

Vehicle registration web API.

Copyright © 2024 Tobias Briones. All rights reserved.

### License

This project is licensed under the [MIT](LICENSE).
