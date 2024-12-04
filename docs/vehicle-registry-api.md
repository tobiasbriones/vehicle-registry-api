# Vehicle Registry API

## Endpoint Summary

| Endpoint              | Method | Description                     |
|-----------------------|--------|---------------------------------|
| `/`                   | GET    | Welcome  server message.        |
| **Vehicles**          |        |                                 |
| `/vehicles`           | POST   | Registers a new vehicle.        |
| `/vehicles/:number`   | GET    | Fetches a vehicle.              |
| `/vehicles`           | GET    | Fetches a list of vehicles.     |
| `/vehicles/:number`   | PUT    | Updates a vehicle.              |
| `/vehicles/:number`   | DELETE | Deletes a vehicle.              |
| **Drivers**           |        |                                 |
| `/drivers`            | POST   | Registers a new driver.         |
| `/drivers/:licenseId` | GET    | Fetches a driver.               |
| `/drivers`            | GET    | Fetches a list of drivers.      |
| `/drivers/:licenseId` | PUT    | Updates a driver.               |
| `/drivers/:licenseId` | DELETE | Deletes a diver.                |
| **Logs**              |        |                                 |
| `/logs`               | POST   | Registers a new vehicle log.    |
| `/logs/:id`           | GET    | Fetches a vehicle log.          |
| `/logs`               | GET    | Fetches a list of vehicle logs. |
| `/logs/:id`           | PUT    | Updates a vehicle log.          |
| `/logs/:id`           | DELETE | Deletes a vehicle log.          |

## Commons

This section details common information about all the requests.

### Responses

- **500 Internal Server Error**
    - **Description**: An unexpected error occurred on the server.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "error": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "error": "Internal server error"
      }
      ```

## Endpoints

## Home

<details>
  <summary>GET /</summary>

## Description

Welcome endpoint for the Vehicle Registry Server.

## Parameters

- **None**

## Responses

- **200 OK**
    - **Content-Type**: `text/plain`
    - **Example**:
      ```json
      "Vehicle Registry Server"
      ```

</details>

- [/vehicles](app/vehicles.md)
- [/drivers](app/drivers.md)
- [/logs](app/vehicle-logs.md)
