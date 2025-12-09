// update.js
const https = require("https");
const querystring = require("querystring");
const { Client, Databases, ID, Query } = require("appwrite");
require('dotenv').config();

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT);

const databases = new Databases(client);

const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABSE;
const collectionId = process.env.EXPO_PUBLIC_APPWRITE_TABLE;

async function saveLifeguardStations(stations) {
  console.log(`💾 Guardando ${stations.length} estaciones en Appwrite...`);

  // 1) obtener todos los docs actuales
  const current = await databases.listDocuments(databaseId, collectionId, [Query.limit(100)]);

  // 2) borrar todos (modo simple)
  for (const doc of current.documents) {
    await databases.deleteDocument(databaseId, collectionId, doc.$id);
  }

  // 3) crear nuevos documentos
  for (const station of stations) {
    const [lat, lon] = [
      station.location.coordinates[1],
      station.location.coordinates[0]
    ];

    const weather = await getTemperature(lat, lon);
    const barrio = await getBarrio(lat, lon);
    console.log('barrio', barrio);
    const googleRating = await getGoogleRatingByName(station.name);

    // The 'data' object containing the document's fields
    const documentData = {
      name: station.name,
      address: station.address,
      beach: station.beach,
      healthFlag: station.healthFlag || '',
      safetyFlag: station.safetyFlag || '',
      coordinates: [lat, lon],
      temperature: weather?.temperature,
      weathercode: weather?.weathercode,
      suburb: barrio?.suburb || barrio?.neighbourhood || '',
    };

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      documentData
    );
    console.log('Document created successfully:', response);
  }

  console.log("✔ Datos guardados correctamente en Appwrite.");
}

function httpsRequest(options, body = null, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });

    req.on("error", (err) => reject(err));
    req.setTimeout(timeout, () => {
      req.destroy(new Error("Timeout"));
    });

    if (body) req.write(body);
    req.end();
  });
}

async function getToken(retries = 1) {
  const auth = Buffer.from(`${process.env.EXPO_PUBLIC_CLIENT_ID}:${process.env.EXPO_PUBLIC_CLIENT_SECRET}`).toString("base64");
  const postData = querystring.stringify({ grant_type: "client_credentials" });

  const options = {
    method: "POST",
    hostname: "mvdapi-auth.montevideo.gub.uy",
    path: "/auth/realms/pci/protocol/openid-connect/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
      "Authorization": `Basic ${auth}`,
    },
  };

  try {
    console.log("📌 Obteniendo token...");
    const res = await httpsRequest(options, postData);
    console.log("STATUS:", res.statusCode);

    // algunos endpoints devuelven HTML de error (3scale) — detectarlo antes de parsear JSON
    if (!res.body || typeof res.body !== "string") throw new Error("Respuesta vacía");

    // Si viene un HTML con "Not Found" mejor mostrarlo crudo para debug
    if (res.body.trim().startsWith("<!DOCTYPE html") || res.body.includes("Not Found")) {
      throw new Error("Respuesta HTML al pedir token: \n" + res.body.slice(0, 2000));
    }

    let parsed;
    try {
      parsed = JSON.parse(res.body);
    } catch (e) {
      throw new Error("Error parseando respuesta JSON del token: " + e.message + "\nRAW: " + res.body.slice(0, 2000));
    }

    if (res.statusCode !== 200) {
      throw new Error("Token endpoint respondió con status " + res.statusCode + " y body: " + JSON.stringify(parsed));
    }

    if (!parsed.access_token) {
      throw new Error("No vino access_token en la respuesta: " + JSON.stringify(parsed));
    }

    console.log("✔ Token OK (expires_in:", parsed.expires_in, "segundos)");
    return parsed.access_token;
  } catch (err) {
    console.error("❌ ERROR obteniendo token:", err && err.message ? err.message : err);
    if (retries > 0) {
      console.log("→ Reintentando getToken... (retries left:", retries - 1, ")");
      await new Promise((r) => setTimeout(r, 800));
      return getToken(retries - 1);
    }
    throw err;
  }
}

async function getBeaches(retries = 1) {
  try {
    const token = await getToken(1);

    const options = {
      method: "GET",
      hostname: "api.montevideo.gub.uy",
      path: "/api/environment/beaches/lifeguardstations",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    };

    console.log("🔎 Llamando a /api/environment/beaches/lifeguardstations ...");
    const res = await httpsRequest(options, null, 20000);
    console.log("STATUS:", res.statusCode);

    if (!res.body) throw new Error("Respuesta vacía del endpoint de playas");

    // Detectar HTML de error
    if (res.body.trim().startsWith("<!DOCTYPE html") || res.body.includes("Not Found") || res.body.includes("3scale")) {
      throw new Error("Respuesta HTML del API de playas: \n" + res.body.slice(0, 2000));
    }

    let parsed;
    try {
      parsed = JSON.parse(res.body);
    } catch (e) {
      throw new Error("Error parseando JSON de playas: " + e.message + "\nRAW: " + res.body.slice(0, 2000));
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error("API de playas respondió con status " + res.statusCode + " y body: " + JSON.stringify(parsed));
    }

    console.log("✔ Playas recibidas:");
    // console.log(JSON.stringify(parsed, null, 2));
    await saveLifeguardStations(parsed);
    return parsed;
  } catch (err) {
    console.error("❌ Error en getBeaches:", err && err.message ? err.message : err);
    if (retries > 0) {
      console.log("→ Reintentando getBeaches... (retries left:", retries - 1, ")");
      await new Promise((r) => setTimeout(r, 1000));
      return getBeaches(retries - 1);
    }
    throw err;
  }


}

// async function getGoogleRatingByName(name) {
//   const apiKey = process.env.GOOGLE_API_KEY;

//   const find = await httpsRequest({
//     method: "GET",
//     hostname: "maps.googleapis.com",
//     path: `/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name + " Montevideo")}&inputtype=textquery&fields=place_id&key=${apiKey}`
//   });

//   const parsed = JSON.parse(find.body);

//   if (!parsed.candidates?.length) return null;

//   const placeId = parsed.candidates[0].place_id;

//   const details = await httpsRequest({
//     method: "GET",
//     hostname: "maps.googleapis.com",
//     path: `/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${apiKey}`
//   });

//   return JSON.parse(details.body).result || null;
// }

async function getTemperature(lat, lon) {
  const res = await httpsRequest({
    method: "GET",
    hostname: "api.open-meteo.com",
    path: `/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  });

  ensureJson(res.body);

  const parsed = JSON.parse(res.body);
  return parsed.current_weather ?? null;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBarrio(lat, lon) {
  const res = await httpsRequest({
    method: "GET",
    hostname: "nominatim.openstreetmap.org",
    path: `/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`,
    headers: {
      "User-Agent": "playas-uy-app/1.0 (contacto@example.com)"
    }
  });

  // Delay requerido por Nominatim (1 segundo)
  await delay(1000);

  ensureJson(res.body);

  const parsed = JSON.parse(res.body);

  // barrio = suburb / neighbourhood / quarter
  return parsed.address ?? null;
}

function ensureJson(body) {
  if (!body || typeof body !== "string") throw new Error("Respuesta vacía");
  if (body.trim().startsWith("<")) {
    throw new Error("Respuesta HTML inesperada:\n" + body.slice(0, 500));
  }
}

// Ejecutar cuando corras `node update.js`
getBeaches().catch((e) => {
  console.error("Terminado con error:", e && e.message ? e.message : e);
  process.exitCode = 1;
});
