import { useEffect, useMemo, useState } from "react";
import "./App.css";

const weatherCodes = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

function App() {
  const [city, setCity] = useState("Atlanta");
  const [unit, setUnit] = useState(() => localStorage.getItem("weathercard-unit") || "fahrenheit");
  const [weather, setWeather] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState(() => readStorage("weathercard-places", ["Atlanta", "New York", "Los Angeles"]));
  const [recentSearches, setRecentSearches] = useState(() => readStorage("weathercard-recent", []));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Search a city or choose a saved place.");

  useEffect(() => {
    localStorage.setItem("weathercard-places", JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  useEffect(() => {
    localStorage.setItem("weathercard-recent", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem("weathercard-unit", unit);
  }, [unit]);

  const tempSymbol = unit === "fahrenheit" ? "F" : "C";
  const todayForecast = weather?.forecast[0];
  const alertNote = useMemo(() => {
    if (!weather) return "No active city selected";
    if (weather.current.precipitation >= 60) return "Rain likely";
    if (weather.current.wind >= 25) return "Wind advisory";
    if (weather.current.temperature >= (unit === "fahrenheit" ? 92 : 33)) return "Heat caution";
    if (weather.current.temperature <= (unit === "fahrenheit" ? 32 : 0)) return "Freezing temps";
    return "Normal conditions";
  }, [unit, weather]);
  const travelNote = useMemo(() => {
    if (!weather) return "Search a city to get a practical planning note.";
    if (weather.current.precipitation > 35) return "Carry an umbrella and leave extra travel time.";
    if (weather.current.wind > 20) return "Expect breezy conditions and secure loose items.";
    if (weather.current.temperature > (unit === "fahrenheit" ? 85 : 29)) return "Plan water breaks and lighter clothing.";
    if (weather.current.temperature < (unit === "fahrenheit" ? 45 : 7)) return "Bring a warm layer before heading out.";
    return "Comfortable conditions for errands, commuting, or outdoor plans.";
  }, [unit, weather]);

  async function getWeather(event, selectedCity = city) {
    event?.preventDefault();
    if (!selectedCity.trim()) return;

    setLoading(true);
    setMessage("Loading forecast...");

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(selectedCity)}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.length) {
        setMessage("City not found. Try a nearby major city.");
        setWeather(null);
        return;
      }

      const place = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=${unit}&wind_speed_unit=mph&forecast_days=5`
      );
      const data = await weatherRes.json();

      const result = {
        city: place.name,
        country: place.country,
        region: place.admin1 || "",
        current: {
          temperature: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          precipitation: data.current.precipitation_probability,
          wind: Math.round(data.current.wind_speed_10m),
          condition: weatherCodes[data.current.weather_code] || "Mixed conditions",
        },
        forecast: data.daily.time.map((date, index) => ({
          date,
          condition: weatherCodes[data.daily.weather_code[index]] || "Mixed",
          high: Math.round(data.daily.temperature_2m_max[index]),
          low: Math.round(data.daily.temperature_2m_min[index]),
          rain: data.daily.precipitation_probability_max[index],
        })),
        hourly: data.hourly.time.slice(0, 8).map((time, index) => ({
          time,
          temperature: Math.round(data.hourly.temperature_2m[index]),
          rain: data.hourly.precipitation_probability[index],
          condition: weatherCodes[data.hourly.weather_code[index]] || "Mixed",
        })),
      };

      setWeather(result);
      setCity(result.city);
      setRecentSearches([result.city, ...recentSearches.filter((item) => item !== result.city)].slice(0, 5));
      setMessage(`Showing ${result.city}, ${result.country}.`);
    } catch {
      setMessage("Weather data could not load right now.");
    } finally {
      setLoading(false);
    }
  }

  function saveCurrentPlace() {
    if (!weather) return;
    setSavedPlaces([weather.city, ...savedPlaces.filter((item) => item !== weather.city)].slice(0, 8));
    setMessage(`${weather.city} saved to your weather list.`);
  }

  function removePlace(place) {
    setSavedPlaces(savedPlaces.filter((item) => item !== place));
  }

  return (
    <main className="app-shell">
      <section className="weather-app">
        <header className="hero">
          <div>
            <p className="eyebrow">Weather planning dashboard</p>
            <h1>Weather Card</h1>
            <p>Search cities, compare a five-day outlook, and save places you check often.</p>
          </div>
          <div className="unit-toggle" aria-label="Temperature unit">
            {["fahrenheit", "celsius"].map((option) => (
              <button
                className={unit === option ? "active" : ""}
                key={option}
                onClick={() => setUnit(option)}
                type="button"
              >
                °{option === "fahrenheit" ? "F" : "C"}
              </button>
            ))}
          </div>
        </header>

        <form className="search-bar" onSubmit={getWeather}>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter a city"
          />
          <button disabled={loading} type="submit">{loading ? "Loading" : "Search"}</button>
        </form>

        <p className="status">{message}</p>

        <div className="dashboard">
          <aside className="side-panel">
            <section className="panel">
              <p className="eyebrow">Saved places</p>
              <div className="place-list">
                {savedPlaces.map((place) => (
                  <div className="place-row" key={place}>
                    <button onClick={(event) => getWeather(event, place)} type="button">{place}</button>
                    <button className="remove" onClick={() => removePlace(place)} type="button">Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={saveCurrentPlace} type="button" disabled={!weather}>Save current</button>
            </section>

            <section className="panel">
              <p className="eyebrow">Recent searches</p>
              <div className="chips">
                {recentSearches.map((item) => (
                  <button onClick={(event) => getWeather(event, item)} type="button" key={item}>{item}</button>
                ))}
              </div>
            </section>
          </aside>

          <section className="forecast-area">
            {weather ? (
              <>
                <section className="current-card">
                  <div>
                    <span className={`weather-mark ${getConditionType(weather.current.condition)}`}>
                      {getWeatherIcon(weather.current.condition)}
                    </span>
                    <p className="location">{weather.city}, {weather.region || weather.country}</p>
                    <h2>{weather.current.temperature}°{tempSymbol}</h2>
                    <p>{weather.current.condition}</p>
                  </div>
                  <div className="planning-note">
                    <span>{alertNote}</span>
                    <strong>{travelNote}</strong>
                  </div>
                </section>

                <section className="detail-grid">
                  <article>
                    <span>Feels like</span>
                    <strong>{weather.current.feelsLike}°{tempSymbol}</strong>
                  </article>
                  <article>
                    <span>Humidity</span>
                    <strong>{weather.current.humidity}%</strong>
                  </article>
                  <article>
                    <span>Rain chance</span>
                    <strong>{weather.current.precipitation}%</strong>
                  </article>
                  <article>
                    <span>Wind</span>
                    <strong>{weather.current.wind} mph</strong>
                  </article>
                </section>

                <section className="hourly-strip" aria-label="Hourly forecast">
                  {weather.hourly.map((hour) => (
                    <article key={hour.time}>
                      <span className={`mini-mark ${getConditionType(hour.condition)}`}>
                        {getWeatherIcon(hour.condition)}
                      </span>
                      <span>{formatHour(hour.time)}</span>
                      <strong>{hour.temperature}°</strong>
                      <p>{hour.rain}% rain</p>
                    </article>
                  ))}
                </section>

                <section className="forecast-grid">
                  {weather.forecast.map((day) => (
                    <article className={day.date === todayForecast.date ? "forecast today" : "forecast"} key={day.date}>
                      <span className={`weather-mark small ${getConditionType(day.condition)}`}>
                        {getWeatherIcon(day.condition)}
                      </span>
                      <span>{formatDay(day.date)}</span>
                      <strong>{day.high}° / {day.low}°</strong>
                      <p>{day.condition}</p>
                      <small>{day.rain}% rain</small>
                    </article>
                  ))}
                </section>
              </>
            ) : (
              <section className="empty-state">
                <h2>No forecast loaded</h2>
                <p>Search a city to see current conditions, trip notes, and a five-day forecast.</p>
              </section>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function formatDay(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatHour(time) {
  return new Date(time).toLocaleTimeString(undefined, {
    hour: "numeric",
  });
}

function getConditionType(condition) {
  const value = condition.toLowerCase();

  if (value.includes("snow")) return "snow";
  if (value.includes("sleet") || value.includes("rime") || value.includes("fog")) return "sleet";
  if (value.includes("thunder")) return "storm";
  if (value.includes("rain") || value.includes("drizzle") || value.includes("showers")) return "rain";
  if (value.includes("cloud")) return "cloud";
  return "clear";
}

function getWeatherIcon(condition) {
  const type = getConditionType(condition);

  return {
    clear: "☀",
    cloud: "☁",
    rain: "☂",
    snow: "❄",
    sleet: "◆",
    storm: "⚡",
  }[type];
}

export default App;
