const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const notFound = document.querySelector(".not-found");
const searchCity = document.querySelector(".search-city");
const weatherInfo = document.querySelector(".weather-info");

const countryTxt = document.querySelector(".country-text");
const tempTxt = document.querySelector(".temp-text");
const conditionTxt = document.querySelector(".condition-text");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const forecastItemsContainer = document.querySelector(
  ".forecast-items-container",
);

const apiKey = "ef5ad8b3908c42ebf00d2625528e6fc8";

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchWeather();
  }
});

function searchWeather() {
  const city = cityInput.value.trim();

  if (!city) return;

  updateWeatherInfo(city);

  cityInput.value = "";
  cityInput.blur();
}

async function getFetchData(endpoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;

  const response = await fetch(apiUrl);
  return await response.json();
}

function getWeatherIcon(id) {
  if (id >= 200 && id <= 232) return "thunderstorm.svg";
  if (id >= 300 && id <= 321) return "drizzle.svg";
  if (id >= 500 && id <= 531) return "rain.svg";
  if (id >= 600 && id <= 622) return "snow.svg";
  if (id >= 701 && id <= 781) return "atmosphere.svg";
  if (id === 800) return "clear.svg";
  return "clouds.svg";
}

function getCurrentDate() {
  const currentDate = new Date();

  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };

  return currentDate.toLocaleDateString("en-US", options);
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData("weather", city);

  if (Number(weatherData.cod) !== 200) {
    showDisplaySection(notFound);
    return;
  }

  const {
    name: cityName,
    sys: { country },
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  countryTxt.textContent = `${cityName}, ${country}`;
  tempTxt.textContent = `${Math.round(temp)}°C`;
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = `${humidity}%`;
  windValueTxt.textContent = `${speed} m/s`;
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
  currentDateTxt.textContent = getCurrentDate();

  await updateForecastInfo(city);

  showDisplaySection(weatherInfo);
}

async function updateForecastInfo(city) {
  const forecastData = await getFetchData("forecast", city);

  const timeTaken = "12:00:00";
  const cityTimezoneOffset = forecastData.city.timezone; // seconds

  const cityTodayDate = new Date(Date.now() + cityTimezoneOffset * 1000)
    .toISOString()
    .split("T")[0];

  forecastItemsContainer.innerHTML = "";

  forecastData.list.forEach((forecastWeather) => {
    const forecastDate = forecastWeather.dt_txt.split(" ")[0];
    const forecastTime = forecastWeather.dt_txt.split(" ")[1];

    if (forecastTime === timeTaken && forecastDate !== cityTodayDate) {
      updateForecastItems(forecastWeather);
    }
  });
}

function updateForecastItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date);

  const dateOptions = {
    day: "2-digit",
    month: "short",
  };

  const dateResult = dateTaken.toLocaleDateString("en-US", dateOptions);

  const forecastItem = `
    <div class="forecast-item">
      <h5 class="forecast-item-date regular-text">${dateResult}</h5>
      <img src="assets/weather/${getWeatherIcon(id)}" alt="Weather icon" class="forecast-item-image" />
      <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
    </div>
  `;

  forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);
}

function showDisplaySection(section) {
  [weatherInfo, searchCity, notFound].forEach((item) => {
    item.style.display = "none";
  });

  section.style.display = "flex";
}
