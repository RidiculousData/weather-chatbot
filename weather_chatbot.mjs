import fetch from "node-fetch";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Function to fetch weather information from WeatherAPI
async function getWeather(city) {
  const url = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}&aqi=no`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather API request failed");

    const data = await response.json();
    const weatherDescription = data.current.condition.text;
    const temperature = data.current.temp_c;
    return `The current weather in ${city} is ${weatherDescription} with a temperature of ${temperature}°C.`;
  } catch (error) {
    return "I'm unable to retrieve the weather information at the moment.";
  }
}

// Function to handle the API request to ChatGPT with function calling
async function chatbot(userInput) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides the weather and tempurature in Celcius or Fahrenheit depending on which type of measurement most people in that city would relate to. Additionally you provide five fun activities to do in or around the city that are appropriate for the weather.",
        },
        { role: "user", content: userInput },
      ],
      functions: [
        {
          name: "getWeather",
          description: "Retrieve the current weather for a specific city.",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
                description:
                  "Name of the city for which to get the weather information.",
              },
            },
            required: ["city"],
          },
        },
      ],
      function_call: "auto",
    }),
  });

  const responseData = await response.json();
  const message = responseData.choices[0].message;

  // Check if the model requested a function call
  if (message.function_call) {
    const { city } = JSON.parse(message.function_call.arguments);
    const weatherInfo = await getWeather(city);

    // Send weather info back to ChatGPT for generating a response with activities
    const followUpResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that provides the weather and tempurature in Celcius or Fahrenheit depending on which type of measurement most people in that city would relate to. Additionally you provide five fun activities to do in or around the city that are appropriate for the weather.",
            },
            { role: "user", content: userInput },
            message,
            {
              role: "function",
              name: "getWeather",
              content: weatherInfo,
            },
          ],
        }),
      }
    );

    const followUpResponseData = await followUpResponse.json();
    return followUpResponseData.choices[0].message.content;
  } else {
    // If no function call was made, return the original response
    return message.content;
  }
}

// Create an interface for reading input from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask the user for their city
console.log("Hi, I'm your weather AI assistant.");
rl.question(
  "Let me know what city you are in, and I can provide you with up-to-date weather along with some fun activity suggestions for you: ",
  async (city) => {
    try {
      const response = await chatbot(`What's the weather like in ${city}?`);
      console.log(response);
    } catch (error) {
      console.error("There was an error processing your request.", error);
    } finally {
      rl.close();
    }
  }
);
