import {
  handleDiv,
  createWeatherDiv,
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  validateCoordinates,
  validateCity,
  createDivElement,
  createImgElement,
  createDayContainer,
} from "../index.js";

describe("handleDiv function", () => {
  beforeEach(() => {
    const testDiv = document.createElement("div");
    testDiv.id = "testDiv";
    document.body.appendChild(testDiv);
  });

  afterEach(() => {
    const testDiv = document.getElementById("testDiv");
    if (testDiv) {
      testDiv.remove();
    }
  });

  it("should append weatherDiv to existing div with specified id", () => {
    const divId = "testDiv";
    handleDiv(divId);

    const weatherDiv = document.querySelector("#testDiv > div");
    expect(weatherDiv).toBeDefined();
  });

  it("should append weatherDiv to document body when divId is not provided", () => {
    handleDiv();

    const weatherDiv = document.querySelector("body > div");
    expect(weatherDiv).toBeDefined();
  });

  it("should not append weatherDiv if div with specified id does not exist", () => {
    const divId = "nonExistentDiv";
    handleDiv(divId);

    const weatherDiv = document.querySelector(`#${divId} > div`);
    expect(weatherDiv).toBeNull();
  });
});

describe("Weather Widget Tests", () => {
  const mockCityResponse = {
    location: { name: "New York" },
    forecast: {
      forecastday: [
        {
          day: {
            avgtemp_c: 20,
            condition: { text: "Clear", icon: "//example.com/icon.png" },
          },
        },
      ],
    },
  };

  const mockCoordinatesResponse = {
    location: { name: "Test City" },
    forecast: {
      forecastday: [
        {
          day: {
            avgtemp_c: 25,
            condition: { text: "Cloudy", icon: "//example.com/icon.png" },
          },
        },
      ],
    },
  };

  const mockFetch = async (url) => {
    if (url.includes("New York")) {
      return {
        ok: true,
        json: async () => mockCityResponse,
      };
    } else if (url.includes("0,0")) {
      return {
        ok: true,
        json: async () => mockCoordinatesResponse,
      };
    } else {
      return {
        ok: false,
        statusText: "Error: Failed to fetch",
      };
    }
  };

  beforeEach(() => {
    spyOn(global, "fetch").and.callFake(mockFetch);
  });

  it("should fetch weather data by city name", async () => {
    const city = "New York";
    const weatherData = await fetchWeatherByCity(city);

    expect(weatherData.location.name).toBe("New York");
    expect(weatherData.forecast.forecastday.length).toBe(1);
    expect(weatherData.forecast.forecastday[0].day.avgtemp_c).toBe(20);
    expect(weatherData.forecast.forecastday[0].day.condition.text).toBe(
      "Clear"
    );
  });

  it("should fetch weather data by coordinates", async () => {
    const lat = 0;
    const lon = 0;
    const weatherData = await fetchWeatherByCoordinates(lat, lon);

    expect(weatherData.location.name).toBe("Test City");
    expect(weatherData.forecast.forecastday.length).toBe(1);
    expect(weatherData.forecast.forecastday[0].day.avgtemp_c).toBe(25);
    expect(weatherData.forecast.forecastday[0].day.condition.text).toBe(
      "Cloudy"
    );
  });
});

describe("validateCoordinates function", () => {
  let errorMessage;

  beforeEach(() => {
    errorMessage = {
      textContent: "",
      style: { display: "none" },
    };
  });

  it("should return true for valid coordinates", () => {
    const latitude = "40";
    const longitude = "-75";
    const result = validateCoordinates(latitude, longitude, errorMessage);

    expect(result).toBe(true);
    expect(errorMessage.textContent).toBe("");
    expect(errorMessage.style.display).toBe("none");
  });

  it("should return false and set error message for latitude outside valid range", () => {
    const latitude = "100";
    const longitude = "0";
    const result = validateCoordinates(latitude, longitude, errorMessage);

    expect(result).toBe(false);
    expect(errorMessage.textContent).toBe(
      "Latitude must be a number between -90 and 90"
    );
    expect(errorMessage.style.display).toBe("block");
  });

  it("should return false and set error message for longitude outside valid range", () => {
    const latitude = "0";
    const longitude = "200";
    const result = validateCoordinates(latitude, longitude, errorMessage);

    expect(result).toBe(false);
    expect(errorMessage.textContent).toBe(
      "Longitude must be a number between -180 and 180"
    );
    expect(errorMessage.style.display).toBe("block");
  });

  it("should return false for non-numeric latitude", () => {
    const latitude = "invalid";
    const longitude = "0";
    const result = validateCoordinates(latitude, longitude, errorMessage);

    expect(result).toBe(false);
    expect(errorMessage.textContent).toBe(
      "Latitude must be a number between -90 and 90"
    );
    expect(errorMessage.style.display).toBe("block");
  });

  it("should return false for non-numeric longitude", () => {
    const latitude = "0";
    const longitude = "invalid";
    const result = validateCoordinates(latitude, longitude, errorMessage);

    expect(result).toBe(false);
    expect(errorMessage.textContent).toBe(
      "Longitude must be a number between -180 and 180"
    );
    expect(errorMessage.style.display).toBe("block");
  });
});

describe("createWeatherDiv function", () => {
  it('should create a <div> element with id "weather-container"', () => {
    const weatherDiv = createWeatherDiv();

    expect(weatherDiv.tagName).toBe("DIV");
    expect(weatherDiv.id).toBe("weather-container");
  });

  it("should return a <div> element with correct attributes", () => {
    const weatherDiv = createWeatherDiv();

    expect(weatherDiv.tagName).toBe("DIV");
    expect(weatherDiv.id).toBe("weather-container");
    expect(weatherDiv.classList.contains("weather")).toBe(false);
  });

  it("should be empty initially", () => {
    const weatherDiv = createWeatherDiv();

    expect(weatherDiv.innerHTML).toBe("");
  });
});

describe("validateCity function", () => {
  let errorMessage;

  beforeEach(() => {
    errorMessage = {
      textContent: "",
      style: { display: "none" },
    };
  });

  it("should return true for a valid city name", () => {
    const city = "New York";
    const result = validateCity(city, errorMessage);

    expect(result).toBe(true);
    expect(errorMessage.textContent).toBe("");
    expect(errorMessage.style.display).toBe("none");
  });

  it("should return false and set error message for an empty city", () => {
    const city = "";
    const result = validateCity(city, errorMessage);

    expect(result).toBe(false);
    expect(errorMessage.textContent).toBe("Please enter a valid city name");
    expect(errorMessage.style.display).toBe("block");
  });

  it("should return false and set error message for city with less than 3 characters", () => {
    const city = "NY";

    const result = validateCity(city, errorMessage);

    expect(result).toBe(false);
    expect(errorMessage.textContent).toBe("Please enter a valid city name");
    expect(errorMessage.style.display).toBe("block");
  });

  it("should return false and set error message for city with non-alphabetic characters", () => {
    const city = "New123";

    const result = validateCity(city, errorMessage);

    expect(result).toBe(false);
    expect(errorMessage.textContent).toBe("Please enter a valid city name");
    expect(errorMessage.style.display).toBe("block");
  });

  it("should return true for a valid city name with spaces", () => {
    const city = "Los Angeles";

    const result = validateCity(city, errorMessage);

    expect(result).toBe(true);
    expect(errorMessage.textContent).toBe("");
    expect(errorMessage.style.display).toBe("none");
  });

  it("should return true for a valid city name with special characters", () => {
    const city = "Saint Louis";

    const result = validateCity(city, errorMessage);

    expect(result).toBe(true);
    expect(errorMessage.textContent).toBe("");
    expect(errorMessage.style.display).toBe("none");
  });
});

describe("DOM Creation Functions", () => {
  describe("createDivElement function", () => {
    it("should create a div element with text content and class name", () => {
      const text = "Hello, world!";
      const className = "test-class";

      const div = createDivElement(text, className);

      expect(div.tagName).toBe("DIV");
      expect(div.textContent).toBe(text);
      expect(div.className).toBe(className);
    });

    it("should create a div element with text content only", () => {
      const text = "Test content";

      const div = createDivElement(text);

      expect(div.tagName).toBe("DIV");
      expect(div.textContent).toBe(text);
      expect(div.className).toBe("");
    });
  });

  describe("createImgElement function", () => {
    it("should create an img element with correct src, alt, and title attributes", () => {
      const testData = {
        icon: "//example.com/icon.png",
        text: "Weather icon",
      };

      const img = createImgElement(testData);

      expect(img.tagName).toBe("IMG");
      expect(img.src).toBe(`https:${testData.icon}`);
      expect(img.alt).toBe(testData.text);
      expect(img.title).toBe(testData.text);
    });
  });

  describe("createDayContainer function", () => {
    it("should create a day container with correct structure and content", () => {
      const testData = {
        day: "Monday",
        condition: {
          icon: "//example.com/icon.png",
          text: "Sunny",
        },
        avgTemp: 25,
      };

      const dayContainer = createDayContainer(testData);

      expect(dayContainer.tagName).toBe("DIV");
      expect(dayContainer.classList.contains("day-container")).toBe(true);

      const children = dayContainer.children;
      expect(children.length).toBe(4);

      expect(children[0].tagName).toBe("DIV");
      expect(children[0].textContent).toBe(testData.day);

      expect(children[1].tagName).toBe("IMG");
      expect(children[1].src).toBe(`https:${testData.condition.icon}`);
      expect(children[1].alt).toBe(testData.condition.text);
      expect(children[1].title).toBe(testData.condition.text);

      expect(children[2].tagName).toBe("DIV");
      expect(children[2].classList.contains("condition-description")).toBe(
        true
      );
      expect(children[2].textContent).toBe(testData.condition.text);

      expect(children[3].tagName).toBe("DIV");
      expect(children[3].textContent).toBe(`${testData.avgTemp}°C`);
    });
  });
});
