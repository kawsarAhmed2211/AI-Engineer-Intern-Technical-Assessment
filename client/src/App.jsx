import React, { useState, useEffect } from "react";
import axios from "axios";

const getWeatherEmoji = (code) => {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55].includes(code)) return "🌦️";
    if ([61, 63, 65].includes(code)) return "🌧️";
    if ([71, 73, 75, 77].includes(code)) return "❄️";
    if ([80, 81, 82].includes(code)) return "🌧️";
    if ([95, 96, 99].includes(code)) return "⛈️";

    return "🌤️";
};

function App() {

    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState("");
    const [selectedDay, setSelectedDay] = useState(0);
    const [searchHistory, setSearchHistory] = useState([]);

    const startHour = selectedDay * 24;
    const endHour = startHour + 24;

    const getWeather = async () => {
        if (!city.trim()) {
            setError("Please enter a city or postcode");
            return;
        }
        try {
            setError("");
            const response = await axios.get(`http://localhost:5000/weather?city=${city}`);
            setWeather(response.data);
            loadSearchHistory();
        } catch (err) {
            setWeather(null);
            if (err.response?.status === 404) {
                setError("Location not found");
            } else {
                setError("Weather service unavailable");
            }
        }
    };
    const getCurrentLocationWeather = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    setError("");
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    const response = await axios.get(`http://localhost:5000/weather-by-coords?latitude=${latitude}&longitude=${longitude}`);
                    setWeather(response.data);
                    loadSearchHistory();
                } catch (error) {
                    setError("Failed to get weather for your location.");
                }
            },
            () => {
                setError("Location permission denied.");
            }
        );
    };
    const getTravelAdvice = () => {
        if (!weather)
            return "Search for a city or postcode to receive travel advice.";
        const temp = weather.weather.temperature_2m;
        if (temp < 5)
            return "❄️ Very cold. Wear a heavy coat and warm clothing.";
        if (temp < 15)
            return "🧥 Cool weather. Bring a jacket.";
        if (temp < 25)
            return "😊 Comfortable weather for outdoor activities.";
        return "☀️ Hot weather. Stay hydrated and wear sunscreen.";
    };

    useEffect(() => {

        loadSearchHistory();

    }, []);

    const loadSearchHistory = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/searches"
            );

            setSearchHistory(response.data);

        } catch (error) {

            console.error(error);

        }

    };
    const deleteSearch = async (id) => {

        await axios.delete(
            `http://localhost:5000/searches/${id}`
        );

        loadSearchHistory();

    };
    return (
        <div
            style={{
                maxWidth: "1300px",
                margin: "0 auto",
                padding: "30px",
                color: "white"
            }}
        >
            <h1>🌦️ AI Weather Assistant</h1>
            <p>By Kawsar Ahmed</p>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px"
                }}
            >
                <input
                    type="text"
                    placeholder="Enter city or postcode..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            getWeather();
                        }
                    }}
                    style={{
                        padding: "12px",
                        width: "350px",
                        borderRadius: "10px",
                        border: "none"
                    }}
                />
                <button
                    onClick={getWeather}
                    style={{
                        padding: "12px 20px",
                        borderRadius: "10px",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    Search
                </button>
                <button
                    onClick={getCurrentLocationWeather}
                    style={{
                        padding: "12px 20px",
                        borderRadius: "10px",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "10px"
                    }}
                >
                    📍 Use My Location
                </button>
            </div>

            {error && (
                <div
                    style={{
                        border: "1px solid red",
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px"
                    }}
                >
                    {error}
                </div>
            )}
            {weather && (
                <div
                    style={{
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "25px",
                        borderRadius: "15px",
                        marginBottom: "20px",
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    <h2>📍 {weather.city}, {weather.country}</h2>
                    <h1 style={{fontSize: "80px", margin: "10px 0"}}>{getWeatherEmoji(weather.weather.weather_code)}</h1>
                    <h1 style={{fontSize: "90px", margin: 0}}>{weather.weather.temperature_2m}°C</h1>
                    <p>🌡️ Feels Like: {weather.weather.apparent_temperature}°C</p>
                    <p>🌧️ Rain: {weather.weather.rain} %</p>
                    <p>💨 Wind Speed: {weather.weather.wind_speed_10m} km/h</p>
                </div>
            )}
            {weather?.forecast && (
                <div
                    style={{
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "20px",
                        borderRadius: "15px",
                        marginBottom: "20px",
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    <h2>📅 7-Day Forecast</h2>
                    <div
                        style={{
                            display: "flex",
                            overflowX: "auto",
                            gap: "15px",
                            paddingBottom: "10px"
                        }}
                    >
                        {weather.forecast.time.map((day, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedDay(index)}
                                style={{
                                    cursor: "pointer",
                                    border: selectedDay === index ? "2px solid #4da6ff"
                                            : "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.08)",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    minWidth: "160px",
                                    textAlign: "center"
                                }}
                            >
                                <h3>
                                    {new Date(day).toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short"})}
                                </h3>
                                <h1 style={{fontSize: "55px", margin: "10px 0"}}>{getWeatherEmoji(weather.forecast.weather_code[index])}</h1>
                                <div>
                                    <p>🔺 {weather.forecast.temperature_2m_max[index]}°C</p>
                                    <p>🔻 {weather.forecast.temperature_2m_min[index]}°C</p>
                                    <p>🌧️ {weather.forecast.rain_sum[index]} %</p>
                                    <p>💨 {weather.forecast.wind_speed_10m_max[index]} km/h</p>
                                    <span style={{opacity: 0.7}}>{weather.forecast.temperature_2m_min[index]}°C</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {weather?.hourly && (
                <div
                    style={{
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "20px",
                        borderRadius: "15px",
                        marginBottom: "20px",
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)"
                    }}
                >
                    <h2>
                        Hourly Forecast -{" "}
                        {new Date(weather.forecast.time[selectedDay]).toLocaleDateString("en-GB", {weekday: "long"})}
                    </h2>
                    <div
                        style={{
                            display: "flex",
                            overflowX: "auto",
                            gap: "15px"
                        }}
                    >
                        {weather.hourly.time
                            .slice(startHour, endHour)
                            .map((time, index) => (
                                <div
                                    key={index}
                                    style={{
                                        minWidth: "100px",
                                        textAlign: "center",
                                        background: "rgba(255,255,255,0.08)",
                                        padding: "15px",
                                        borderRadius: "10px"
                                    }}
                                >
                                    <p>{new Date(time).toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"})}</p>
                                    <h2>{getWeatherEmoji(weather.hourly.weather_code[startHour + index])}</h2>
                                    <div>
                                        <p>🌡️ {weather.hourly.temperature_2m[startHour + index]}°C</p>
                                        <p>🌧️ {weather.hourly.rain[startHour + index]} %</p>
                                        <p>💨 {weather.hourly.wind_speed_10m[startHour + index]} km/h</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "20px",
                    borderRadius: "15px",
                    marginBottom: "20px",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)"
                }}
            >
                <h2>🤖 Travel Advice</h2>
                <p>{getTravelAdvice()}</p>
            </div>
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "20px",
                    borderRadius: "15px",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)"
                }}
            >
                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >
                    <a
                        href="http://localhost:5000/export"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: "inline-block",
                            padding: "12px 20px",
                            background: "#4da6ff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "10px",
                            fontWeight: "bold"
                        }}
                    >
                        📥 Export Search History (JSON)
                    </a>
                </div>
                <h2>About PM Accelerator</h2>
                <p>
                    PM Accelerator is a U.S.-based AI learning and product
                    development community that helps aspiring professionals
                    gain practical experience building AI-powered products
                    through mentorship, collaboration, and real-world projects.
                </p>
            </div>
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "20px",
                    borderRadius: "15px",
                    marginTop: "20px"
                }}
            >
                <h2>🕒 Recent Searches</h2>

                {searchHistory.length === 0 ? (
                    <p>No searches yet.</p>
                ) : (
                    searchHistory.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px",
                                marginBottom: "10px",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "10px"
                            }}
                        >
                            <div>
                                <strong>{item.location}</strong>
                                <br />
                                <small>
                                    {item.temperature}°C
                                </small>
                            </div>

                            <button
                                onClick={() => deleteSearch(item.id)}
                                style={{
                                    background: "#ff4d4d",
                                    border: "none",
                                    color: "white",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                🗑 Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;