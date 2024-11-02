# Vehicle Registry API

## Endpoint Summary

| Endpoint    | Method | Description              |
|-------------|--------|--------------------------|
| `/`         | GET    | Welcome  server message. |
| `/vehicles` | POST   | Registers a new vehicle. |

<details>
  <summary>GET /</summary>

### Description

Welcome endpoint for the Vehicle Registry Server.

### Parameters

- **None**

### Responses

- **200 OK**
    - **Content-Type**: `text/plain`
    - **Example**:
      ```json
      "Vehicle Registry Server"
      ```

</details>

<details>
  <summary>POST /vehicles</summary>

### Description

Registers a new vehicle in the database.

#### Request

- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "number": "string",
        "brand": "string",
        "model": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "number": "VIN-example",
        "brand": "Toyota",
        "model": "Camry"
      }
      ```

#### Responses

- **201 Created**
    - **Description**: Vehicle successfully created.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "model": "string",
        "number": "string",
        "brand": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "id": 1,
        "number": "VIN-123",
        "brand": "Toyota",
        "model": "Camry"
      }
      ```

- **409 Conflict**
    - **Description**: A vehicle with the same number already exists in the
      system.
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
        "error": "A vehicle with this number already exists."
      }
      ```

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

</details>
