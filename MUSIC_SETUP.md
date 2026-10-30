# Music Feature Setup Guide

The Aura Trip music feature allows users to attach royalty-free music tracks to their posts, stories, and shorts. This guide explains how to configure music providers.

## Overview

The music system supports multiple providers:

- **Jamendo** - Large library of Creative Commons licensed music
- **Free Music Archive** - Curated collection of high-quality free music
- **Internal Library** - Upload your own licensed music tracks

## Quick Start

### 1. Get Jamendo API Access (Recommended)

Jamendo is the primary music provider with the largest catalog of CC-licensed music.

**Steps:**

1. Visit [Jamendo Developer Portal](https://devportal.jamendo.com/)
2. Click "Sign Up" or "Register" to create a developer account
3. After logging in, navigate to "My Applications"
4. Click "Create a new application"
5. Fill in the application details:
   - **Application Name:** Aura Trip
   - **Application Description:** Social media platform for travel enthusiasts
   - **Application URL:** Your domain or localhost for development
6. Submit and copy your **Client ID**

**Add to .env:**

```env
JAMENDO_CLIENT_ID=your_client_id_here
```

### 2. (Optional) Get Free Music Archive API Key

**Steps:**

1. Visit [Free Music Archive API Agreement](https://freemusicarchive.org/api-agreement)
2. Read and accept the terms
3. Submit your API key request
4. Check your email for the API key

**Add to .env:**

```env
FMA_API_KEY=your_api_key_here
```

### 3. Restart the Backend

After adding the environment variables:

```bash
cd Aura-Trip-Backend
npm run dev
```

## Testing the Music Feature

### 1. Search for Music

**Request:**

```bash
GET http://localhost:5000/api/v1/music/search?query=summer&limit=10
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Music tracks retrieved successfully",
  "data": [
    {
      "_id": "...",
      "title": "Summer Vibes",
      "artist": "Artist Name",
      "duration": 180,
      "previewUrl": "https://...",
      "license": "CC_BY"
    }
  ],
  "meta": {
    "total": 100,
    "hasMore": true,
    "limit": 10,
    "offset": 0
  }
}
```

### 2. Get Trending Tracks

**Request:**

```bash
GET http://localhost:5000/api/v1/music/trending?limit=20
```

### 3. Attach Music to a Post (Authenticated)

**Request:**

```bash
POST http://localhost:5000/api/v1/music/attach
Authorization: <your_token>
Content-Type: application/json

{
  "trackId": "track_id_from_search",
  "contentType": "post",
  "contentId": "your_post_id",
  "startTime": 0,
  "endTime": 30,
  "volume": 0.7
}
```

## Troubleshooting

### Empty Search Results

**Problem:** API returns `{"data": [], "total": 0}`

**Solutions:**

1. Check if `JAMENDO_CLIENT_ID` is set in `.env`
2. Restart the backend server after adding the env variable
3. Verify your Jamendo Client ID is valid
4. Check backend console for API errors

### 401 Unauthorized on Protected Endpoints

**Problem:** Endpoints like `/music/recently-played` return 401

**Solutions:**

1. Make sure you're logged in and have a valid auth token
2. Include the `Authorization` header with your token
3. Check if the token is being sent in the correct format (just the token value, no "Bearer " prefix)

### No Music Appearing in Frontend

**Problem:** Music picker shows "No tracks found"

**Solutions:**

1. Open browser DevTools → Network tab
2. Check if API requests are being made
3. Verify API responses return data
4. Check Redux state to see if auth token is present

## API Endpoints Reference

### Public Endpoints (No Auth Required)

- `GET /api/v1/music/search` - Search tracks
- `GET /api/v1/music/trending` - Get trending tracks
- `GET /api/v1/music/genre/:genre` - Get tracks by genre
- `GET /api/v1/music/mood/:mood` - Get tracks by mood
- `GET /api/v1/music/tracks/:id` - Get single track
- `GET /api/v1/music/content/:contentType/:contentId` - Get music for content

### Protected Endpoints (Auth Required)

- `POST /api/v1/music/attach` - Attach music to content
- `DELETE /api/v1/music/content/:contentType/:contentId` - Remove music
- `GET /api/v1/music/favorites` - Get user favorites
- `POST /api/v1/music/favorites/:trackId` - Add to favorites
- `DELETE /api/v1/music/favorites/:trackId` - Remove from favorites
- `GET /api/v1/music/recently-played` - Get recently played tracks

## Music Licensing

All tracks from Jamendo and FMA use Creative Commons licenses. The system automatically:

- Tracks attribution requirements
- Displays proper credits
- Enforces commercial use restrictions where applicable

Common licenses:

- **CC BY** - Attribution required, commercial use allowed
- **CC BY-SA** - Attribution + share-alike, commercial use allowed
- **CC BY-NC** - Attribution required, non-commercial only
- **CC0** - Public domain, no restrictions

## Rate Limits

### Jamendo

- 60 requests per minute
- 10,000 requests per day

### Free Music Archive

- 120 requests per minute
- 20,000 requests per day

The system caches results to minimize API calls.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  MusicPicker    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Music API      │
│  /api/v1/music  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Music Service  │─────▶│  Providers   │
│   - Search      │      │  - Jamendo   │
│   - Cache       │      │  - FMA       │
│   - Favorites   │      │  - Internal  │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   MongoDB       │
│  - MusicTrack   │
│  - Attachment   │
│  - Preferences  │
└─────────────────┘
```

## Support

For issues or questions:

1. Check the backend console for error messages
2. Review the API response in browser DevTools
3. Verify all environment variables are set correctly
4. Ensure you have valid API credentials from Jamendo/FMA
