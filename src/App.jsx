import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("Atlanta");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  async function getWeather(e) {
    e.preventDefault();

    setError("");
    setWeather(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

      const geoData = await geoRes.json();

      if (!geoData.results) {
        setError("City not found.");
        return;
      }

      const place = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true&temperature_unit=fahrenheit`
      );

      const weatherData = await weatherRes.json();

      setWeather({
        city: place.name,
        country: place.country,
        temp: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
      });
    } catch {
      setError("Something went wrong.");
    }
  }

  return (
    <main className="app">
      <section className="card">
        <h1>Quick Weather Card</h1>
        <p className="subtitle">
          
          Search any city and view live weather data.
        </p>

        <form onSubmit={getWeather} className="form">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city..."
          />
          <button>Search</button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-box">
            <p className="location">
              {weather.city}, {weather.country}
            </p>

            <h2>{weather.temp}°F</h2>

            <div className="details">
              <div>
                <span>Wind Speed</span>
                <strong>{weather.wind} mph</strong>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;

