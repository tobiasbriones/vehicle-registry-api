## Drivers

<details>
  <summary>POST /drivers</summary>

## Description

Registers a new driver in the database.

### Request

- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "licenseId": "string",
        "firstName": "string",
        "surname": "string",
        "secondName": "string | null",
        "secondSurname": "string | null"
      }
      ```
    - **Example**:
      ```json
      {
        "licenseId": "ID-123456",
        "firstName": "John",
        "surname": "Doe",
        "secondName": "Andrew",
        "secondSurname": "Smith"
      }
      ```

### Responses

- **201 Created**
    - **Description**: Driver successfully created.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "licenseId": "string",
        "firstName": "string",
        "surname": "string",
        "secondName": "string | null",
        "secondSurname": "string | null"
      }
      ```
    - **Example**:
      ```json
      {
        "licenseId": "ID-123456",
        "firstName": "John",
        "surname": "Doe",
        "secondName": "Andrew",
        "secondSurname": "Smith"
      }
      ```

- **409 Conflict**
    - **Description**: A driver with the same license ID already exists.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "type": "DuplicateError",
        "info": {
          "context": {
            "message": "string",
            "target": {
              "licenseId": "string",
              "firstName": "string",
              "surname": "string",
              "secondName": "string | null",
              "secondSurname": "string | null"
            }
          }
        },
        "detail": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "type": "DuplicateError",
        "info": {
          "context": {
            "message": "Fail to create driver",
            "target": {
              "licenseId": "ID-123456",
              "firstName": "John",
              "surname": "Doe",
              "secondName": "Andrew",
              "secondSurname": "Smith"
            }
          }
        },
        "detail": "A driver with this license ID already exists."
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

#### Schema Validation

All fields must adhere to the following schema:

```json
{
    "licenseId": {
        "type": "string",
        "constraints": {
            "minLength": 6,
            "maxLength": 20,
            "pattern": "^[A-Za-z0-9-]+$",
            "description": "Only letters, numbers, and hyphens are allowed."
        }
    },
    "firstName": {
        "type": "string",
        "constraints": {
            "minLength": 1,
            "maxLength": 30
        }
    },
    "surname": {
        "type": "string",
        "constraints": {
            "minLength": 1,
            "maxLength": 30
        }
    },
    "secondName": {
        "type": "string | null",
        "constraints": {
            "minLength": 1,
            "maxLength": 30,
            "optional": true
        }
    },
    "secondSurname": {
        "type": "string | null",
        "constraints": {
            "minLength": 1,
            "maxLength": 30,
            "optional": true
        }
    }
}
```

- **Example**:
  ```json
  {
    "type": "ValidationError",
    "info": [
      {
        "path": "firstName",
        "message": "String must contain at least 1 character(s)"
      }
    ]
  }
  ```

- **500 Internal Server Error**

</details>

<details>
  <summary>GET /drivers/:licenseId</summary>

## Description

Fetches details of a specific driver by their unique license ID.

### Request

- **Path Parameters**:
    - `licenseId` (string): Unique identifier for the driver.
- **Query Parameters**: None
- **Request Body**: None

### Responses

- **200 OK**
    - **Description**: Driver details successfully retrieved.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "licenseId": "string",
        "firstName": "string",
        "surname": "string",
        "secondName": "string | null",
        "secondSurname": "string | null"
      }
      ```
    - **Example**:
      ```json
      {
        "licenseId": "ID-123456",
        "firstName": "John",
        "surname": "Doe",
        "secondName": "Andrew",
        "secondSurname": "Smith"
      }
      ```

- **404 Not Found**
    - **Description**: Driver with the specified license ID was not found.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "type": "NotFoundError",
        "info": "string"
      }
      ```
    - **Example**:
      ```json
      {
        "type": "NotFoundError",
        "info": "Driver license ID not found: ID-123456"
      }
      ```

- **500 Internal Server Error**

</details>

<details>
  <summary>GET /drivers</summary>

## Description

Retrieves a paginated list of all drivers.

## Request

- **Path Parameters**: None
- **Query Parameters**:
    - `limit` (number, optional): Maximum number of results per page. Defaults
      to 10.
    - `page` (number, optional): Page number to retrieve. Defaults to 1.

## Responses

- **200 OK**
    - **Description**: List of drivers successfully retrieved.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      [
        {
          "licenseId": "string",
          "firstName": "string",
          "surname": "string",
          "secondName": "string | null",
          "secondSurname": "string | null"
        }
      ]
      ```
    - **Example**:
      ```json
      [
        {
          "licenseId": "ID-123456",
          "firstName": "John",
          "surname": "Doe",
          "secondName": "Andrew",
          "secondSurname": "Smith"
        },
        {
          "licenseId": "ID-789012",
          "firstName": "Jane",
          "surname": "Smith",
          "secondName": null,
          "secondSurname": null
        }
      ]
      ```
- **500 Internal Server Error**

</details>

<details>
  <summary>PUT /vehicles/:licenseId</summary>

## Description

Updates the details of an existing driver based on their license ID.

### Request

- **Path Parameters**:
    - `licenseId` (string, required): The unique identifier for the driver's
      license.

- **Query Parameters**: None

- **Request Body**:
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "firstName": "string (1-30 characters)",
        "surname": "string (1-30 characters)",
        "secondName": "string (1-30 characters, optional)",
        "secondSurname": "string (1-30 characters, optional)"
      }
      ```
    - **Example**:
      ```json
      {
        "firstName": "John",
        "surname": "Doe",
        "secondName": "Michael",
        "secondSurname": null
      }
      ```

### Responses

- **200 OK**
    - **Description**: Successfully updated the driver details.
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        "licenseId": "string",
        "firstName": "string",
        "surname": "string",
        "secondName": "string or null",
        "secondSurname": "string or null"
      }
      ```
    - **Example**:
      ```json
      {
        "licenseId": "A123456",
        "firstName": "John",
        "surname": "Doe",
        "secondName": "Michael",
        "secondSurname": null
      }
      ```

- **404 Not Found**
    - **Description**: Driver with the specified license ID not found.
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
        "error": "Driver license ID not found: A123456"
      }
      ```

- **500 Internal Server Error**

</details>

<details>
  <summary>DELETE /vehicles/:licenseId</summary>

## Description

Deletes an existing driver based on their license ID.

### Request

- **Path Parameters**:
    - `licenseId` (string, required): The unique identifier for the driver's
      license.

- **Query Parameters**: None

- **Request Body**: None

### Responses

- **200 OK**
    - **Description**: Successfully deleted the driver.
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
        "message": "Driver with license ID A123456 deleted successfully."
      }
      ```

- **404 Not Found**
    - **Description**: Driver with the specified license ID not found.
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
        "error": "Driver license ID not found: A123456"
      }
      ```

- **500 Internal Server Error**

</details>
