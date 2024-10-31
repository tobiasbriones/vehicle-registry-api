# Vehicle Registry API

Backend API for a vehicle registration web app that allows entrance and leave.

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

| Environment Variable | Description                                                    | Default Value |
|----------------------|----------------------------------------------------------------|---------------|
| `PORT`               | Port on which the application listens for incoming connections | `3000`        |

## About

**Vehicle Registry API**

Vehicle registration web API.

Copyright © 2024 Tobias Briones. All rights reserved.

### License

This project is licensed under the [MIT](LICENSE).
