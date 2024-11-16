# Environment Variables

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
