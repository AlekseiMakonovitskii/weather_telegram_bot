import 'dotenv/config'
import { Telegraf } from 'telegraf'

const token = process.env.BOT_TOKEN
const apiKey = process.env.API_KEY
const bot = new Telegraf(token)

const getLocation = async (value) => {
	try {
		const res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${value}}&appid=${apiKey}`)
		const [ city ] = await res.json();
		const weather = getWeather({lat: city.lat, lon: city.lon, city: city.name});
		return weather;
	} catch (error) {
		return error;
	}
}

const getWeather = async (cityObj) => {
	const { lat, lon, city } = cityObj;
	try {
		const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
		const data = await res.json();
		return {
			city,
			weather: data.weather[0].main,
			tempeture: Math.round(data.main.temp),
			tempeture_feels_like: Math.round(data.main.feels_like),
			humidity: Math.round(data.main.humidity),
			wind: Math.round(data.wind.speed),
		}
	} catch (error) {
		return error;
	}
}

bot.start((ctx) => ctx.reply('Hello, send any city and you will get current weather in the city 🤩'));
bot.help((ctx) => ctx.reply(`Do you need help? Just send any city like 'Moscow' and the current weather will be at reply 🥳`));
bot.use((ctx, next) => {
	if (ctx.update.message) {
			ctx.deleteMessage(ctx.update.message.message_id);
	}
	return next();
});
bot.on('text', (ctx) => {
		getLocation(ctx.message.text).then(value => {
			const {city, weather, tempeture, tempeture_feels_like, humidity, wind} = value;
			let weatherEmojy = '';
				
			if (city === undefined) {
				ctx.reply(`Ops... I can't find this city on our 🌍 Please try again if you're not 👽`);
				return;
			}

			if (weather === 'Clouds') weatherEmojy = '☁️';
			if (weather === 'Clear') weatherEmojy = '☀️';
			if (weather === 'Atmosphere') weatherEmojy = '🌫️';
			if (weather === 'Snow') weatherEmojy = '❄️';
			if (weather === 'Rain') weatherEmojy = '⛈️';
			if (weather === 'Drizzle') weatherEmojy = '🌧️';
			if (weather === 'Thunderstorm') weatherEmojy = '🌪️';


			ctx.reply(
			`Current weather in ${city}:
${weather} ${weatherEmojy}
Tempeture ${tempeture}°C
Feels like ${tempeture_feels_like}°C
Humidity ${humidity}%
Wind speed is ${wind} m/s
`.trim())
		})
	}
);

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
});

bot.launch();
