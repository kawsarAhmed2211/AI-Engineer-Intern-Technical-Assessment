const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const db = require("./database")

app.use(cors());
app.use(express.json());

app.get("/weather", async (req, res) => {
    try {
        const locationInput = req.query.city;
        if (!locationInput) {
            return res.status(400).json({ error: "Location is required" });
        }
        const geoResponse = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationInput)}&count=1`
        );
        if (!geoResponse.data.results) {
            return res.status(404).json({ error: "Location not found" });
        }
        const location = geoResponse.data.results[0];
        const weatherResponse = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max&hourly=temperature_2m,rain,wind_speed_10m,weather_code&current=temperature_2m,apparent_temperature,rain,wind_speed_10m,weather_code&forecast_days=7`
        );
        db.run(`
                    INSERT INTO weather_searches
                    (location, country, temperature, searchDate)
                    VALUES (?, ?, ?, ?)
            `, [
                location.name,
                location.country,
                weatherResponse.data.current.temperature_2m,
                new Date().toISOString()
            ]
        );
        res.json({
            city: location.name,
            country: location.country,
            weather: weatherResponse.data.current,
            forecast: weatherResponse.data.daily,
            hourly: weatherResponse.data.hourly
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve weather" });
    }
});
app.get("/weather-by-coords", async (req, res) => {
    try {
        const latitude = req.query.latitude;
        const longitude = req.query.longitude;
        const weatherResponseByCoords = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max&hourly=temperature_2m,rain,wind_speed_10m,weather_code&current=temperature_2m,apparent_temperature,rain,wind_speed_10m,weather_code&forecast_days=7`
        );
        db.run(`
                INSERT INTO weather_searches
                (location, country, temperature, searchDate)
                VALUES (?, ?, ?, ?)
            `, [
                "Current Location",
                "",
                weatherResponseByCoords.data.current.temperature_2m,
                new Date().toISOString()
            ]
        );
        res.json({
            city: "Current Location",
            country: "",
            weather: weatherResponseByCoords.data.current,
            forecast: weatherResponseByCoords.data.daily,
            hourly: weatherResponseByCoords.data.hourly
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve weather"
        });
    }
});
app.get("/searches", (req, res) => {
    db.all(
        "SELECT * FROM weather_searches ORDER BY id DESC LIMIT 10",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );
});
app.put("/searches/:id", (req, res) => {
    const id = req.params.id;
    const { location } = req.body;
    db.run(`
        UPDATE weather_searches
        SET location = ?
        WHERE id = ?
        `,
        [location, id],
        function (err) {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({
                success: true,
                updated: this.changes
            });
        }
    );
});
app.delete("/searches/:id", (req, res) => {
    const id = req.params.id;
    db.run(
        `
        DELETE FROM weather_searches
        WHERE id = ?
        `,
        [id],
        function (err) {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({
                success: true,
                deleted: this.changes
            });
        }
    );
});
app.get("/export", (req, res) => {
    db.all(
        "SELECT * FROM weather_searches",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});