const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "I am working"
    });
});

app.get("/weather", async (req, res) => {
    try {

        const city = req.query.city;

        if (!city) {
            return res.status(400).json({
                error: "City is required"
            });
        }

        const geoResponse = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
        );

        if (!geoResponse.data.results) {
            return res.status(404).json({
                error: "City not found"
            });
        }

        const location = geoResponse.data.results[0];

        const weatherResponse = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
        );

        res.json({
            city: location.name,
            country: location.country,
            weather: weatherResponse.data.current
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve weather"
        });

    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});