import React, { useState } from "react";
import axios from "axios";

function App() {

    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState("");

    const getWeather = async () => {

        try {

            setError("");

            const response = await axios.get(
                `http://localhost:5000/weather?city=${city}`
            );

            setWeather(response.data);

        } catch (err) {

            setWeather(null);
            setError("City not found");

        }
    };

    return (
        <div style={{ padding: "20px" }}>

            <h1>Weather App</h1>

            <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />

            <button onClick={getWeather}>
                Search
            </button>

            {error && <p>{error}</p>}

            {weather && (
                <div>

                    <h2>
                        {weather.city}, {weather.country}
                    </h2>

                    <p>
                        Temperature: {weather.weather.temperature_2m}°C
                    </p>

                    <p>
                        Humidity: {weather.weather.relative_humidity_2m}%
                    </p>

                    <p>
                        Wind Speed: {weather.weather.wind_speed_10m} km/h
                    </p>

                </div>
            )}

        </div>
    );
}

export default App;