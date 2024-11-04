# Weather Chatbot

#### Version 0.1

**Description**
This is a very simple chatbot that uses ChatGPT's Tools API to call a weather function. The purpose of this simple project was to understand how agents work in ChatGPT.

## Prerequisites

This project requires the following accounts and API keys:

- [OpenAI](openai.com)
- [WeatherAPI](weatherapi.com)

## Setup

1. Install all node dependencies
   ```
   npm install
   ```
2. Create `.env` file in the root of the project and add the following API keys. Note: no quotes or spaces needed.

   ```
   WEATHER_API_KEY=XXXXXXXX
   OPEN_API_KEY=XXXXXXX
   ```

3. To run use the following command:
   ```
   node weather_chatbot.mjs
   ```
