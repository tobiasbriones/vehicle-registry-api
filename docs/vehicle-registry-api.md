# Vehicle Registry API

## Endpoint Summary

| Endpoint               | Method | Description                 |
|------------------------|--------|-----------------------------|
| `/`                    | GET    | Welcome  server message.    |
| `/vehicles`            | POST   | Registers a new vehicle.    |
| `/vehicles/{ number }` | GET    | Fetches a vehicle.          |
| `/vehicles`            | GET    | Fetches a list of vehicles. |
| `/vehicles/{ number }` | PUT    | Updates a vehicle.          |
| `/vehicles/{ number }` | DELETE | Deletes a vehicles.         |

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

### Vehicles

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
        "number": "string",
        "brand": "string",
        "model": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "number": "VIN-123",
        "brand": "Toyota",
        "model": "Camry"
      }
      ```

- **409 Conflict**
    - **Description**: A vehicle with the same number already exists in the system.
    - **Content-Type**: `application/json`
    - **Schema** (`DuplicateVehicleInfo`):
      ```json
      {
        "type": "DuplicateError",
        "info": {
          "context": {
            "message": "string",
            "target": {
              "number": "string",
              "brand": "string",
              "model": "string"
            }
          }
        },
        "detail": "string"
      }
        ```
    - **Where**:
      ```typescript
      export type DuplicateVehicleInfo = {
        context: MessageOf<Vehicle>,
        detail: string,
      }
      ```
    
    - **Example**:
      ```json
      {
        "type": "DuplicateError",
        "info": {
          "context": {
            "message": "Fail to create vehicle",
            "target": {
              "number": "VIN-example",
              "brand": "Toyota",
              "model": "Camry"
            }
          },
          "detail": "A vehicle with this number already exists."
        }
      }
      ```

- **400 Bad Request**
    - **Description**: Validation error in the request body.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "type": "ValidationError",
        "info": [
          {
            "path": "string",
            "message": "string"
          }
        ]
      }
      ```
    - **Examples**:
        - **Non-blank validation error**:
          ```json
          {
            "type": "ValidationError",
            "msg": [
              {
                "path": "brand",
                "message": "String must contain at least 1 character(s)"
              }
            ]
          }
          ```
        - **Maximum length validation error**:
          ```json
          {
            "type":"ValidationError",
            "msg": [
              {
                "path": "number",
                "message": "String must contain at most 20 character(s)"
              }
            ]
          }
          ```
          ```json
          {
            "type":"ValidationError",
            "msg": [
              {
                "path": "brand",
                "message": "String must contain at most 100 character(s)"
              }
            ]
          }
          ```
          ```json
          {
            "type":"ValidationError",
            "msg": [
              {
                "path": "model",
                "message": "String must contain at most 100 character(s)"
              }
            ]
          }
          ```

- **500 Internal Server Error**

</details>

<details>
  <summary>GET /vehicles/:number</summary>

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
        "model": "Corolla"
      }
      ```

- **404 Not Found**
    - **Description**: Vehicle with the specified number was not found.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "type": "string",
        "error": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "type": "NotFoundError",
        "info": "Vehicle number not found: VIN-example"
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
          "number": "VIN-123",
          "brand": "Toyota",
          "model": "Camry"
        },
        {
          "number": "VIN-456",
          "brand": "Honda",
          "model": "Civic"
        }
      ]
      ```

- **500 Internal Server Error**

</details>

<details>
  <summary>PUT /vehicles/:number</summary>

### Description

Updates the details of an existing vehicle based on its unique number (e.g.,
VIN). Only the `brand` and `model` fields can be updated.

#### Request

- **Path Parameters**:
    - **number**: Required. The unique identifier of the vehicle to update.

- **Request Body**:
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "brand": "string",
        "model": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "brand": "Ford",
        "model": "Mustang"
      }
      ```

#### Responses

- **200 OK**
    - **Description**: The updated vehicle details.
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
        "number": "VIN-123",
        "brand": "Ford",
        "model": "Mustang"
      }
      ```

- **400 Bad Request**
    - **Description**: Invalid request body, typically due to missing or
      incorrect fields.

- **404 Not Found**
    - **Description**: The specified vehicle does not exist.

- **500 Internal Server Error**

</details>

<details>
  <summary>DELETE /vehicles/:number</summary>

### Description

Deletes a vehicle with the specified unique vehicle number.

#### Request

- **Path Parameters**:
    - **number**: Required. The unique identifier (vehicle number) of the
      vehicle to delete.

- **Request Body**: None

#### Responses

- **200 OK**
    - **Description**: Indicates that the vehicle was successfully deleted.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "message": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "message": "Vehicle with number VIN-123 deleted successfully."
      }
      ```

- **404 Not Found**
    - **Description**: Indicates that no vehicle with the specified number was
      found.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "error": "Vehicle not found: VIN-123"
      }
      ```
    - **Example**:
      ```json
      {
        "error": "Vehicle not found: VIN-123"
      }
      ```

- **500 Internal Server Error**

</details>
