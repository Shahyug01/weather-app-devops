const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const result = document.getElementById("weatherResult");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") getWeather();
});

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        result.hidden = true;
        return;
    }

    message.textContent = "Loading...";
    result.hidden = true;

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) throw new Error("Location request failed.");

        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found.");
        }

        const location = geoData.results[0];

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
        );

        if (!weatherResponse.ok) throw new Error("Weather request failed.");

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        document.getElementById("cityName").textContent =
            `${location.name}, ${location.country || ""}`;
        document.getElementById("temperature").textContent =
            `Temperature: ${current.temperature_2m} °C`;
        document.getElementById("humidity").textContent =
            `Humidity: ${current.relative_humidity_2m}%`;
        document.getElementById("wind").textContent =
            `Wind speed: ${current.wind_speed_10m} km/h`;

        message.textContent = "";
        result.hidden = false;
    } catch (error) {
        message.textContent = error.message;
        result.hidden = true;
    }
}
