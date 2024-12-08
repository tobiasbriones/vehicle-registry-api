# Logs

The `/logs` API requires the [vehicles](vehicles.md)
and [drivers](drivers.md) resources.

<details>
  <summary>POST /logs</summary>

## Description

Creates a new vehicle log.

### Request

- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "vehicleNumber": "string",
        "driverLicenseId": "string",
        "logType": "string",
        "mileageInKilometers": "integer"
      }
      ```
    - **Example**:
      ```json
      {
        "vehicleNumber": "ABC123",
        "driverLicenseId": "DL123456",
        "logType": "entry",
        "mileageInKilometers": 10000
      }
      ```

### Responses

- **201 Created**
    - **Description**: Vehicle log created successfully.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "id": "integer",
        "vehicleNumber": "string",
        "driverLicenseId": "string",
        "logType": "string",
        "timestamp": "string",
        "mileageInKilometers": "integer"
      }
      ```
    - **Example**:
      ```json
      {
        "id": 1,
        "vehicleNumber": "ABC123",
        "driverLicenseId": "D123456",
        "logType": "entry",
        "timestamp": "2024-12-01T10:00:00Z",
        "mileageInKilometers": 10000
      }
      ```

- **400 Bad Request**: Invalid request data.
- **422 Unprocessable Entity**
    - **Description**:
        - A vehicle or driver given was not found, so this log could not be
          created.
        - The given vehicle mileage is incorrect.
        - The given log type (`entry` or `exit`) is incoherent.
    - **Example**:
    ```json
    {
      "type": "ReferenceNotFoundError",
      "info": {
        "context": {
        "message": "Fail to create vehicle log",
        "target": {
          "driverLicenseId": "D89012",
            "vehicleNumber": "VIN-010",
            "logType": "entry",
            "mileageInKilometers": 1300
        }
      },
      "detail": "A driver with this license ID was not found."
      }
    }
    ```
  
    ```json
    {
      "type": "IncorrectValueError",
      "info": {
        "context": {
          "message": "Fail to create vehicle log",
          "target": {
            "driverLicenseId": "D890123",
            "vehicleNumber": "VIN-010",
            "logType": "exit",
            "mileageInKilometers": 1200
          }
        },
        "detail": "Error: Provided vehicle mileage 1200 is invalid. Last recorded mileage: 1300. Vehicle mileage can only be greater than or equals to the last mileage recorded (i.e., increasing) or zero (i.e., reset)."
      }
    }
    ```
  
    ```json
    {
      "type": "IncorrectValueError",
      "info": {
        "context": {
          "message": "Fail to create vehicle log",
          "target": {
            "driverLicenseId": "D890123",
            "vehicleNumber": "VIN-010",
            "logType": "entry",
            "mileageInKilometers": 1300
          }
        },
        "detail": "Error: Provided log type \"entry\" is invalid. Last recorded log: \"entry\". Log type cannot be the same of the last vehicle log."
      }
    }
    ```
- **500 Internal Server Error**: Unexpected error occurred.

</details>

<details>
  <summary>GET /logs/:id</summary>

## Description

Retrieves a specific vehicle log by ID.

### Request

- **Path Parameters**:
    - `id` (integer): The ID of the vehicle log.
- **Query Parameters**: None
- **Request Body**: None

### Responses

- **200 OK**
    - **Description**: Vehicle log retrieved successfully.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "id": "integer",
        "vehicleNumber": "string",
        "driverLicenseId": "string",
        "logType": "string",
        "timestamp": "string",
        "mileageInKilometers": "integer"
      }
      ```
    - **Example**:
      ```json
      {
        "id": 1,
        "vehicleNumber": "ABC123",
        "driverLicenseId": "D123456",
        "logType": "entry",
        "timestamp": "2024-12-01T10:00:00Z",
        "mileageInKilometers": 10000
      }
      ```

- **404 Not Found**: Log ID not found.
- **500 Internal Server Error**: Unexpected error occurred.

</details>

<details>
  <summary>GET /logs</summary>

## Description

Retrieves all vehicle logs with optional filters.

### Request

- **Path Parameters**: None
- **Query Parameters**:
    - `limit` (integer, optional): Number of logs per page (default: 10).
    - `page` (integer, optional): Page number (default: 1).
    - `vehicle-number` (string, optional): Filter by vehicle number.
    - `driver-license-id` (string, optional): Filter by driver license ID.
    - `date` (string, optional): Filter by log date (YYYY-MM-DD).
- **Request Body**: None

### Responses

- **200 OK**
    - **Description**: Logs retrieved successfully.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      [
        {
          "id": "integer",
          "vehicleNumber": "string",
          "driverLicenseId": "string",
          "logType": "string",
          "timestamp": "string",
          "mileageInKilometers": "integer"
        }
      ]
      ```
    - **Example**:
      ```json
      [
        {
          "id": 1,
          "vehicleNumber": "ABC123",
          "driverLicenseId": "DL123456",
          "logType": "entry",
          "timestamp": "2024-12-01T10:00:00Z",
          "mileageInKilometers": 10000
        }
      ]
      ```

- **500 Internal Server Error**: Unexpected error occurred.

</details>

<details>
  <summary>PUT /logs/:id</summary>

## Description

Updates a specific vehicle log by ID.

### Request

- **Path Parameters**:
    - `id` (integer): The ID of the vehicle log.
- **Query Parameters**: None
- **Request Body**:
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "logType": "string",
        "mileageInKilometers": "integer"
      }
      ```
    - **Example**:
      ```json
      {
        "logType": "exit",
        "mileageInKilometers": 10500
      }
      ```

### Responses

- **200 OK**
    - **Description**: Vehicle log updated successfully.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "id": "integer",
        "logType": "string",
        "mileageInKilometers": "integer"
      }
      ```
    - **Example**:
      ```json
      {
        "id": 1,
        "logType": "exit",
        "mileageInKilometers": 10500
      }
      ```

- **404 Not Found**: Log ID not found.
- **400 Bad Request**: Invalid request data.
- **500 Internal Server Error**: Unexpected error occurred.

</details>

<details>
  <summary>DELETE /logs/:id</summary>

## Description

Deletes a specific vehicle log by ID.

### Request

- **Path Parameters**:
    - `id` (integer): The ID of the vehicle log.
- **Query Parameters**: None
- **Request Body**: None

### Responses

- **200 OK**
    - **Description**: Vehicle log deleted successfully.
    - **Content-Type**: `application/json`
    - **Example**:
      ```json
      {
        "message": "Log with ID 1 deleted successfully."
      }
      ```

- **404 Not Found**: Log ID not found.
- **500 Internal Server Error**: Unexpected error occurred.

</details>
