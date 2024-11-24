# Vehicle Registry API

## Endpoint Summary

| Endpoint               | Method | Description                 |
|------------------------|--------|-----------------------------|

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
  <summary>{ METHOD } /{ PATH }</summary>

### Description

{ DESCRIPTION }

#### Request

- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        
      }
      ```
    - **Example**:
      ```json
      {
        
      }
      ```

#### Responses

- **201 Created**
    - **Description**: { CREATED_DESCRIPTION }
    - **Content-Type**: `application/json`
    - **Schema**:
      ```json
      {
        
      }
      ```
    - **Example**:
      ```json
      {
        
      }
      ```

- **{ OTHER_STATUSES }**

- **Description**:
- **Content-Type**: `application/json`
- **Schema**:
  ```json
  {
    
  }
  ```

- **Example**:
  ```json
  {
    
  }
  ```
- **500 Internal Server Error**

</details>
