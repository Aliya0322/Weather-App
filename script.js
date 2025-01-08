const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const weatherInfo = document.querySelector(".weather-info");
const notFoundSection = document.querySelector(".not-found");
const searchCity = document.querySelector(".search-city");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDataTxt = document.querySelector(".current-data-txt");
const forecastItemsContainer = document.querySelector(".forecast-items-container");

const apiKey = "9fb13fa009e6c63ef8c89491f3670f88";

// Клик по кнопке поиска
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== "") { 
        updateWeatherInfo(cityInput.value);
        cityInput.value = "";
        cityInput.blur();
    }
});

// Нажатие клавиши Enter
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && cityInput.value.trim() !== "") { 
        updateWeatherInfo(cityInput.value);
        cityInput.value = "";
        cityInput.blur();
    }
});

// Функция для получения данных с API
async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json(); 
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.png';
    if (id <= 321) return 'drizzle.png';
    if (id <= 531) return 'rain.png';
    if (id <= 622) return 'snow.png';
    if (id <= 781) return 'mist.png';
    if (id <= 800) return 'clear.png';
    else return "clouds.png";
};

function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    }
    return currentDate.toLocaleDateString('en-GB', options);
}

// Функция обновления информации о погоде
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData("weather", city);

    // Если город не найден или произошла ошибка в запросе
    if (weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: {temp, humidity},
        weather: [{id, main}],
        wind: {speed},
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + ' °C';
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + "%";
    windValueTxt.textContent = speed + ' m/s';

    currentDataTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `image/weather/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city);

    // Отображаем информацию о погоде
    showDisplaySection(weatherInfo);
}

// Функция обновления прогнозов
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData("forecast", city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split("T")[0];  
    
    forecastItemsContainer.innerHTML = '';  // очищаем контейнер перед добавлением новых элементов

    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) &&
        !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastsItems(forecastWeather);
        }
    });
}

// Функция обновления отображения элементов прогноза
function updateForecastsItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{id}],
        main: {temp}
    } = weatherData;

    // Преобразуем дату в формат "DD MMM"
    const forecastDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
    });

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${forecastDate}</h5>
            <img src="image/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Функция отображения нужной секции
function showDisplaySection(section) {
    const sections = [weatherInfo, searchCity, notFoundSection];
    sections.forEach(sec => sec.style.display = "none"); // Скрыть все секции
    section.style.display = "flex"; // Показываем нужную секцию
}
