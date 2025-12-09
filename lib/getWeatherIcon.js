// lib/getWeatherIcon.js
export function getWeatherIcon(code) {
  if ([0, 1].includes(code)) return "☀️";      // Soleado
  if ([2].includes(code)) return "🌤";         // Parcialmente nublado
  if ([3].includes(code)) return "☁️";         // Nublado
  if ([45, 48].includes(code)) return "🌫";     // Niebla
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧"; // Lluvia
  if ([95, 96, 99].includes(code)) return "⛈"; // Tormenta

  return "❓";
}
