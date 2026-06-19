# AI Weather Assistant

Built by Kawsar Ahmed

## Overview

AI Weather Assistant is a full-stack weather application that allows users to search for weather information by city name, postcode, or current location. The application retrieves real-time weather data from the Open-Meteo API and stores search history in a SQLite database.

## Features

### Frontend

* Search weather by city or postcode
* Current location weather using browser geolocation
* Current weather conditions
* 7-day weather forecast
* Hourly weather forecast
* Weather condition icons
* Travel advice based on weather conditions
* Error handling for invalid locations and API failures
* Search history display
* Export search history

### Backend

* REST API built with Express.js
* Open-Meteo Geocoding API integration
* Open-Meteo Forecast API integration
* SQLite database persistence
* CRUD functionality:

  * Create search records
  * Read search history
  * Update records
  * Delete records
* JSON export endpoint

## Technologies Used

### Frontend

* React
* Axios

### Backend

* Node.js
* Express.js
* SQLite3
* Axios

### APIs

* Open-Meteo Geocoding API
* Open-Meteo Weather Forecast API

## Installation

### Backend

```bash
cd server
npm install
node index.js
```

Server runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## API Endpoints

### Weather

```http
GET /weather?city=London
```

### Current Location Weather

```http
GET /weather-by-coords?latitude=52.95&longitude=-1.15
```

### Search History

```http
GET /searches
```

### Update Search

```http
PUT /searches/:id
```

### Delete Search

```http
DELETE /searches/:id
```

### Export Data

```http
GET /export
```

## PM Accelerator

PM Accelerator is a U.S.-based AI learning and product development community that helps aspiring professionals gain practical experience building AI-powered products through mentorship, collaboration, and real-world projects.
