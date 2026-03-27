# Panzer IT API Documentation

## Overview

The Panzer IT API provides comprehensive endpoints for managing cybersecurity content, leads, solutions, brands, and downloads. This API is built with security, scalability, and developer experience in mind.

## Access the Documentation

The interactive API documentation is available at:
- **Development**: `http://localhost:5000/api-docs`
- **Production**: `https://api.panzerit.com/api-docs`

## Authentication

Most admin endpoints require authentication using JWT tokens. You can authenticate by:

1. **Bearer Token**: Include `Authorization: Bearer <token>` in request headers
2. **Cookie**: JWT token stored in `jwt` cookie (set automatically after login)

### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@panzerit.com",
  "password": "your_password"
}
```

## API Endpoints Overview

### Public Endpoints (No Authentication Required)
- `GET /api/health` - Health check
- `GET /api/posts` - Get published blog posts
- `GET /api/posts/{slug}` - Get single post by slug
- `GET /api/solutions` - Get published solutions
- `GET /api/solutions/{slug}` - Get single solution by slug
- `GET /api/brands` - Get published brands
- `GET /api/brands/{slug}` - Get single brand by slug
- `GET /api/downloads` - Get published downloads
- `GET /api/downloads/{slug}/file` - Download file
- `POST /api/leads` - Submit contact form

### Admin Endpoints (Authentication Required)
- **Authentication**: `/api/auth/*`
- **Leads Management**: `/api/leads/*`
- **Content Management**: `/api/posts/*`, `/api/solutions/*`, `/api/brands/*`, `/api/downloads/*`, `/api/media/*`

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "total": 150,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

## Rate Limiting

- Global limit: 200 requests per 15 minutes per IP
- Stricter limits apply to sensitive endpoints like login and contact forms

## File Uploads

Endpoints that accept file uploads use `multipart/form-data` encoding:
- Post cover images
- Solution cover images
- Brand logos and cover images
- Download files and cover images
- **Media library files** (images and documents)

## Media Library API

The media API provides comprehensive file management capabilities:

### Media Endpoints
- `GET /api/media/folders` - Get all folders with item counts
- `POST /api/media/bulk` - Bulk upload up to 10 files
- `DELETE /api/media/bulk` - Bulk delete multiple media items
- `GET /api/media` - Get paginated list of all media
- `POST /api/media` - Upload single file
- `GET /api/media/{id}` - Get single media item details
- `PATCH /api/media/{id}` - Update media metadata
- `DELETE /api/media/{id}` - Delete media item

### Supported File Types
- **Images**: JPEG, PNG, WebP, SVG
- **Documents**: PDF
- **Max file size**: 10MB per file
- **Bulk upload**: Up to 10 files at once

### Media Features
- Automatic image optimization and WebP conversion
- Folder organization
- Alt text and captions for accessibility
- Full-text search across filenames and metadata
- Automatic thumbnail generation for images

## Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## Filtering & Sorting

Most list endpoints support:
- `search`: Full-text search
- `sort`: Comma-separated fields (use `-` for descending)
- `fields`: Comma-separated fields to include
- `category`, `status`, `tags`: Content-specific filters

## Development

To run the server locally:
```bash
cd backend
npm install
npm start
```

The API documentation will be available at `http://localhost:5000/api-docs`

## Support

For API support or questions, contact the development team at support@panzerit.com