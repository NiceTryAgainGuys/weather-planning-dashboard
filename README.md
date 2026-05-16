# Weather Card

Weather Card is a React weather planning dashboard for searching live city forecasts, checking current conditions, and saving places users want to revisit. I built it as a portfolio project to practice API fetching, loading states, and turning raw weather data into a useful interface.

## Features

- Search live weather by city using Open-Meteo data
- View current temperature, condition, feels-like temperature, humidity, rain chance, and wind speed
- See an hourly forecast strip for quick day planning
- View a five-day forecast with highs, lows, conditions, and rain probability
- Toggle between Fahrenheit and Celsius
- Save favorite cities in browser storage
- Reopen recent searches quickly
- Show visual weather indicators for clear, cloudy, rain, snow, sleet, and storms
- Display practical warnings for rain, wind, heat, and freezing temperatures
- Generate planning notes based on temperature, rain, and wind
- Responsive layout for desktop and mobile screens

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Open-Meteo Geocoding API
- Open-Meteo Forecast API
- Local Storage

## How to Run Locally

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## What I Learned

- How to fetch data from multiple API endpoints and combine the results
- How to handle loading, error, and empty states in a React app
- How to transform API response data into cleaner UI-friendly objects
- How to build saved/recent search features with `localStorage`
- How to make weather data easier to understand with forecast cards, alerts, and planning notes

## Future Improvements

- Add geolocation support for the user's current city
- Add more detailed hourly forecasts
- Add weather maps or radar links
- Add stronger error handling for API/network issues
- Add tests for API data formatting and unit conversion behavior

## Repository Name Ideas

1. `city-weather-forecast-dashboard`
2. `weather-planning-dashboard-react`
3. `open-meteo-forecast-planner`

## GitHub About

React weather dashboard using Open-Meteo APIs with city search, saved places, forecasts, unit toggles, and planning notes.

## Suggested Topics

`react` `vite` `weather-app` `open-meteo` `api`

## Resume Bullet

- Created Weather Card, a React weather dashboard that fetches live Open-Meteo forecast data, supports saved/recent city searches, unit toggles, and responsive forecast views.

## LinkedIn Project Description

Weather Card is a React weather dashboard I built to practice working with live APIs and user-friendly data displays. The app lets users search cities, view current conditions, compare hourly and five-day forecasts, save favorite places, and switch between Fahrenheit and Celsius. This project helped me improve my API fetching, data formatting, loading/error handling, and responsive UI skills.
