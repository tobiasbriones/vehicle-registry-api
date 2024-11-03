# Vehicle Registry API

## Endpoint Summary

| Endpoint               | Method | Description                 |
|------------------------|--------|-----------------------------|
| `/`                    | GET    | Welcome  server message.    |
| `/vehicles`            | POST   | Registers a new vehicle.    |
| `/vehicles/{ number }` | GET    | Fetches a vehicle.          |
| `/vehicles`            | GET    | Fetches a list of vehicles. |

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

</details>

<details>
  <summary>GET /vehicles/{number}</summary>

### Description

Fetches details of a specific vehicle by its unique vehicle number.

#### Request

- **Path Parameters**:
    - `number` (string): Unique identifier for the vehicle.
- **Query Parameters**: None
- **Request Body**: None

#### Responses

- **200 OK**
    - **Description**: Vehicle details successfully retrieved.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "id": "number",
        "number": "string",
        "brand": "string",
        "model": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "id": 1,
        "number": "VIN-example",
        "brand": "Toyota",
        "model": "Corolla"
      }
      ```

- **404 Not Found**
    - **Description**: Vehicle with the specified number was not found.
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
        "error": "Vehicle number not found: VIN-example"
      }
      ```

- **500 Internal Server Error**

</details>

<details>
  <summary>GET /vehicles</summary>

### Description

Retrieves a paginated list of all vehicles in the database.

#### Request

- **Path Parameters**: None
- **Query Parameters**:
    - **limit**: Optional. The maximum number of vehicles to return per page.
      Defaults to `10`. Must be greater than or equal to `0`.
    - **page**: Optional. The page number to retrieve. Defaults to `1`. Must be
      greater than or equal to `1`.
- **Request Body**: None

#### Responses

- **200 OK**
    - **Description**: A list of vehicles for the specified page and limit.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      [
        {
          "id": "number",
          "number": "string",
          "brand": "string",
          "model": "string"
        }
      ]
      ```
    - **Example**:
      ```json
      [
        {
          "id": 1,
          "number": "VIN-123",
          "brand": "Toyota",
          "model": "Camry"
        },
        {
          "id": 2,
          "number": "VIN-456",
          "brand": "Honda",
          "model": "Civic"
        }
      ]
      ```

- **500 Internal Server Error**

</details>
