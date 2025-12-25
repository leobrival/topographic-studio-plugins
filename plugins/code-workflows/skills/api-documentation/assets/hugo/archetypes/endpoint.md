---
title: "{{ replace .Name "-" " " | title }}"
description: ""
draft: false
weight: 10
toc: true
---

## Overview

Brief description of what this endpoint does.

## Endpoint

{{</* api-endpoint method="GET" path="/resource/{id}" auth="required" */>}}

### Description

Detailed description of the endpoint behavior.

{{</* /api-endpoint */>}}

## Parameters

### Path Parameters

{{</* param-table */>}}
{{</* param name="id" type="string" required="true" */>}}
The unique identifier of the resource.
{{</* /param */>}}
{{</* /param-table */>}}

### Query Parameters

{{</* param-table */>}}
{{</* param name="include" type="string" required="false" */>}}
Comma-separated list of related resources to include.
{{</* /param */>}}
{{</* /param-table */>}}

### Request Body

{{</* param-table */>}}
{{</* param name="name" type="string" required="true" */>}}
The name of the resource.
{{</* /param */>}}
{{</* /param-table */>}}

## Examples

### Request

{{</* code-tabs */>}}
{{</* tab name="cURL" */>}}
```bash
curl -X GET "https://api.example.com/resource/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
{{</* /tab */>}}
{{</* tab name="JavaScript" */>}}
```javascript
const response = await fetch('https://api.example.com/resource/123', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();
```
{{</* /tab */>}}
{{</* tab name="Python" */>}}
```python
import httpx

response = httpx.get(
    "https://api.example.com/resource/123",
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)
data = response.json()
```
{{</* /tab */>}}
{{</* /code-tabs */>}}

### Response

{{</* response-example status="200" description="Success" */>}}
{
  "id": "123",
  "name": "Example Resource",
  "created_at": "2024-01-15T10:30:00Z"
}
{{</* /response-example */>}}

## Errors

{{</* response-example status="404" description="Not Found" */>}}
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
{{</* /response-example */>}}

{{</* response-example status="401" description="Unauthorized" */>}}
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
{{</* /response-example */>}}
