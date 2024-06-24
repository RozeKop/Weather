const API_KEY = ""; /*please insert API KEY here*/
const DAYS = 14;
const DAYS_IN_WEEK = 7;
const weatherDiv = createWeatherDiv();

const style = document.createElement("style");
style.textContent = `

#weather-container{
    background-color: #9ab8ed;
    font-family: Baufra,Mulish,Kanit,Raleway, Lato, Sans-Serif, Serif;
    padding: 20px;
    border-radius: 10px;
    color: #333;
    text-align: center;
}

#input-container{
    display: flex;
    flex-direction: column;
}

.inputs input {
  width: 200px;
  padding: 8px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  max-width:150px;
}

.weather-error{
  color: red;
  margin-top: 10px;

}

#get-weather-button {
  height: 30px;
  width: 220px;
  margin: auto;
  background-color: #d3f8e2; 
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  padding: 0 0;
}
#get-weather-button:disabled {
  background-color: #ccc;
  color:grey;
  cursor: not-allowed;
}

.day-container{
    flex: 1 1 calc(33.33% - 20px);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 0 10px;
    min-height: 200px;
    justify-content: space-between;
}

#forecast{
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 10px;
    width: 100%;
}

#forecast-info{
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    align-items: center;
    flex-wrap: wrap;
  justify-content: center;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.condition-description{
    display: flex;
    flex-direction: column;
    height: 50px;
    justify-content: center;
}

@media (max-width: 630px) {
  #forecast {
  display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr ;
    grid-template-rows: 1fr 1fr ;
    row-gap: 20px;
  }

  .day-container{
  padding: 0 0 }
}

`;
document.head.appendChild(style);

async function fetchWeatherByCity(city) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=${DAYS}`
    );
    if (!response.ok)
      throw new Error("Something is wrong please try later again");
    const data = await response.json();
    return data;
  } catch (error) {
    return error.message;
  }
}

async function fetchWeatherByCoordinates(lat, lon) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=${DAYS}`
    );
    if (!response.ok)
      throw new Error("Something is wrong please try later again");
    const data = await response.json();
    return data;
  } catch (error) {
    return error.message;
  }
}

function calculateAverageTemperatures(dailyData) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let averageTemps = [0, 0, 0, 0, 0, 0, 0];
  const conditions = [];

  const forecast = dailyData.forecast.forecastday;
  const city = dailyData.location.name;
  forecast.forEach((day, index) => {
    averageTemps[index % DAYS_IN_WEEK] += day.day.avgtemp_c;
    if (index < DAYS_IN_WEEK) {
      conditions.push({
        text: day.day.condition.text,
        icon: day.day.condition.icon,
      });
    }
  });
  averageTemps = averageTemps.map((temp) =>
    (temp / (DAYS / DAYS_IN_WEEK)).toFixed(0)
  );

  const today = new Date().getUTCDay();
  const adjustedTemps = { forecast: [], city: "" };
  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const index = (today + i) % DAYS_IN_WEEK;
    adjustedTemps.forecast.push({
      day: daysOfWeek[index],
      avgTemp: averageTemps[index],
      condition: conditions[index],
    });
  }
  adjustedTemps["city"] = city;

  return adjustedTemps;
}

function createDivElement(text, className) {
  const div = document.createElement("div");
  if (className) {
    div.className = className;
  }
  div.textContent = text;
  return div;
}

function createImgElement(data) {
  const img = document.createElement("img");
  img.src = `https:${data.icon}`;
  img.alt = data.text;
  img.title = data.text;
  return img;
}

function createDayContainer(data) {
  const dayDiv = document.createElement("div");
  dayDiv.className = "day-container";

  const dayName = createDivElement(data.day);
  dayDiv.appendChild(dayName);

  const iconImg = createImgElement(data.condition);
  dayDiv.appendChild(iconImg);

  const conditionText = createDivElement(
    data.condition.text,
    "condition-description"
  );
  dayDiv.appendChild(conditionText);

  const tempText = createDivElement(`${data.avgTemp}°C`);
  dayDiv.appendChild(tempText);

  return dayDiv;
}

function createAverageTempDiv(averageTemps) {
  const averageTempDiv = document.createElement("div");
  averageTempDiv.id = "forecast-info";
  const title = document.createElement("div");
  averageTempDiv.appendChild(title);
  title.innerHTML = `Forecast For ${localStorage.getItem("weather-city")}`;
  title.style.fontWeight = "bold";

  const forecastContainer = document.createElement("div");
  forecastContainer.id = "forecast";

  averageTemps.forecast.forEach((data) => {
    const dayDiv = createDayContainer(data);
    forecastContainer.appendChild(dayDiv);
  });

  averageTempDiv.appendChild(forecastContainer);

  return averageTempDiv;
}

function createErrorDiv(message) {
  const errorMessage = document.createElement("div");
  errorMessage.className = "weather-error";
  errorMessage.innerHTML = `${message}`;

  return errorMessage;
}

async function loadWeather() {
  const cityRadio = document.getElementById("radio-city").checked;
  const city = document.getElementById("city").value;
  const lat = document.getElementById("latitude").value;
  const lon = document.getElementById("longitude").value;

  let weatherData;

  if (cityRadio && city) {
    weatherData = await fetchWeatherByCity(city);
  } else if (!cityRadio && lat && lon) {
    weatherData = await fetchWeatherByCoordinates(lat, lon);
  } else {
    weatherData = await fetchWeatherByCity(
      localStorage.getItem("weather-city") || "Tel Aviv"
    );
  }

  while (weatherDiv.children.length > 1) {
    weatherDiv.removeChild(weatherDiv.lastChild);
  }

  if (typeof weatherData === "string") {
    const errorMessage = createErrorDiv(weatherData);
    weatherDiv.appendChild(errorMessage);

    return;
  }

  localStorage.setItem("weather-city", weatherData.location.name);

  const averageTemps = calculateAverageTemperatures(weatherData);
  const averageTempDiv = createAverageTempDiv(averageTemps);

  weatherDiv.appendChild(averageTempDiv);
}

function createInputFields() {
  const inputContainer = document.createElement("div");
  inputContainer.id = "input-container";

  inputContainer.innerHTML = `
        <div class="data" style="display:flex; align-items:center; justify-content: space-around">
          <div class="options">
              <label>
                  <input type="radio" name="location" id="radio-city" value="city" checked>
                  City Name
              </label>
              <label>
                  <input type="radio" name="location" id="radio-coordinates" value="coordinates">
                  Coordinates
              </label>
          </div>
          <div class="inputs">
              <div id="city-input-container">
                  <input type="text" id="city" placeholder="Enter city name">
              </div>
              <div id="coordinates-input-container" style="display: none;">
                  <input type="text" id="latitude" placeholder="Enter latitude">
                  <input type="text" id="longitude" placeholder="Enter longitude">
              </div>
          </div>
        </div>
        <br>
        <button id="get-weather-button" disabled >Get Weather</button>
        <div id="error-message" style="color: red; display: none; margin-top:10px"></div>
      `;

  weatherDiv.appendChild(inputContainer);

  inputContainer
    .getElementsByClassName("options")[0]
    .addEventListener("change", updateInputVisibility);
  document
    .getElementsByClassName("inputs")[0]
    .addEventListener("input", validateInputs);
  document
    .getElementById("get-weather-button")
    .addEventListener("click", loadWeather);
}

function updateInputVisibility() {
  const cityInputContainer = document.getElementById("city-input-container");
  const coordinatesInputContainer = document.getElementById(
    "coordinates-input-container"
  );
  const cityRadio = document.getElementById("radio-city").checked;

  if (cityRadio) {
    cityInputContainer.style.display = "block";
    coordinatesInputContainer.style.display = "none";
  } else {
    cityInputContainer.style.display = "none";
    coordinatesInputContainer.style.display = "block";
  }

  validateInputs();
}

function validateInputs() {
  const cityRadio = document.getElementById("radio-city").checked;
  const city = document.getElementById("city").value;
  const lat = document.getElementById("latitude").value;
  const lon = document.getElementById("longitude").value;
  const button = document.getElementById("get-weather-button");
  const errorMessage = document.getElementById("error-message");
  errorMessage.style.display = "none";
  errorMessage.textContent = "";

  let isValid = false;

  if (cityRadio && city) {
    isValid = validateCity(city, errorMessage);
  } else if (!cityRadio && (lat || lon)) {
    isValid = validateCoordinates(lat, lon, errorMessage);
  }

  button.disabled = !isValid;
}

function validateCity(city, errorMessage) {
  if (!city || city.length < 3 || !/^[a-zA-Z\s]+$/.test(city)) {
    errorMessage.textContent = "Please enter a valid city name";
    errorMessage.style.display = "block";
    return false;
  }
  return true;
}

function validateCoordinates(latitude, longitude, errorMessage) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  let isValid = true;

  if (lat !== "") {
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errorMessage.textContent = "Latitude must be a number between -90 and 90";
      errorMessage.style.display = "block";
      return false;
    }
  } else {
    isValid = true;
  }
  if (lon !== "") {
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errorMessage.textContent =
        "Longitude must be a number between -180 and 180";
      errorMessage.style.display = "block";
      return false;
    }
  } else {
    isValid = true;
  }
  return isValid;
}

function createWeatherDiv() {
  const weatherDiv = document.createElement("div");
  weatherDiv.id = "weather-container";
  return weatherDiv;
}

function handleDiv(divId) {
  const targetDiv = divId ? document.getElementById(divId) : null;

  if (targetDiv) {
    targetDiv.appendChild(weatherDiv);
  } else {
    document.body.appendChild(weatherDiv);
  }
}

handleDiv(); /*Here there is an option to sent the divId as a parameter*/
createInputFields();
loadWeather();

window.loadWeather = loadWeather;

/** don't copy this part it is for the tests */
export {
  handleDiv,
  createWeatherDiv,
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  validateCoordinates,
  validateCity,
  loadWeather,
  createDivElement,
  createImgElement,
  createDayContainer,
  createAverageTempDiv,
  calculateAverageTemperatures,
};
