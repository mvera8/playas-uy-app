// lib/getWeatherCode.js
export function getWeatherCode(code) {
  const map = {
    0: "Soleado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna densa",
    56: "Llovizna helada",
    57: "Llovizna helada intensa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia intensa",
    66: "Lluvia helada",
    67: "Lluvia helada intensa",
    71: "Nieve ligera",
    73: "Nieve moderada",
    75: "Nieve intensa",
    77: "Granos de nieve",
    80: "Chaparrones ligeros",
    81: "Chaparrones moderados",
    82: "Chaparrones fuertes",
    85: "Chaparrón de nieve",
    86: "Chaparrón de nieve fuerte",
    95: "Tormenta",
    96: "Tormenta con granizo",
    99: "Tormenta fuerte con granizo",
  };

  return map[code] || "Sin datos";
}
