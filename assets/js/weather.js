/**
 * weather.js — WeatherWise (OpenWeatherMap integration)
 * Fetches real-time weather for Ludhiana, Punjab and maps it
 * to health-focused seasonal and weather precautions.
 */

const WEATHER_API_KEY = '0b281b58022487f3cde93eb1cdb716d8';
const WEATHER_CITY    = 'Ludhiana';

/**
 * fetchWeather — fetches current conditions and renders health precautions.
 * Called by app.js router on every visit to the Weather page.
 */
async function fetchWeather() {
  try {
    const res  = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const d    = await res.json();
    const temp = d.main.temp;
    const cond = d.weather[0].main.toLowerCase();

    // ── Current weather display ──
    document.getElementById('w-weather').innerHTML = `
      <div><b>📍 ${d.name}</b></div>
      <div>🌡️ ${temp.toFixed(1)}°C</div>
      <div>🌤️ ${d.weather[0].description}</div>
      <div>💧 Humidity: ${d.main.humidity}%</div>`;

    // ── Season detection by month ──
    const month = new Date().getMonth() + 1;   // 1-12
    let season, sPrecautions;

    if ([3, 4, 5].includes(month)) {
      season        = '🌸 Spring';
      sPrecautions  = [
        '🤧 Allergy risk high — wear masks if pollen-sensitive',
        '🥗 Balanced diet boosts immunity',
        '🌼 Great time for outdoor walks — stay hydrated',
      ];
    } else if ([6, 7, 8, 9].includes(month)) {
      season        = '🌧️ Monsoon';
      sPrecautions  = [
        '🦟 Use mosquito repellents, avoid street food',
        '☔ Carry rain gear, watch for waterlogging',
        '🥗 Avoid raw foods from outside',
      ];
    } else if ([10, 11].includes(month)) {
      season        = '🍁 Autumn';
      sPrecautions  = [
        '🧥 Evenings may be chilly — carry a jacket',
        '🍵 Drink warm fluids',
        '💊 Boost vitamin D intake',
      ];
    } else {
      season        = '❄️ Winter';
      sPrecautions  = [
        '🍲 Eat immunity-boosting foods',
        '💧 Stay hydrated even without thirst',
        '🧣 Protect extremities from cold',
      ];
    }

    document.getElementById('w-season').textContent = season;

    // ── Real-time weather precautions ──
    const wPrecautions = [];
    if      (temp > 35) wPrecautions.push('💧 Drink plenty of water — heat stroke risk');
    else if (temp < 10) wPrecautions.push('🧣 Wear warm clothes — hypothermia risk');
    else                wPrecautions.push('🙂 Moderate weather — stay hydrated and active');

    if (cond.includes('rain'))                      wPrecautions.push('🌂 Carry umbrella, wear waterproof shoes');
    if (cond.includes('clear'))                     wPrecautions.push('🕶️ Apply SPF 30+ sunscreen, wear sunglasses');
    if (cond.includes('haze') || cond.includes('smog')) wPrecautions.push('😷 Wear N95 mask outdoors');

    // ── Render pill badges ──
    const pill = (txt, bg, clr) =>
      `<span class="weather-pill" style="background:${bg};color:${clr}">${txt}</span>`;

    document.getElementById('w-season-prec').innerHTML =
      sPrecautions.map(p => pill(p, 'rgba(245,158,11,.15)', '#fbbf24')).join('');

    document.getElementById('w-weather-prec').innerHTML =
      wPrecautions.map(p => pill(p, 'rgba(6,182,212,.15)', '#22d3ee')).join('');

  } catch (e) {
    document.getElementById('w-weather').innerHTML =
      '<span style="color:var(--rose)">⚠️ Could not fetch weather. Check internet connection.</span>';
  }
}
