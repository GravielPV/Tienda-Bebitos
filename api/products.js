/* ============================================
   API Serverless - Persistencia de Productos
   Usa Upstash Redis (gratis) para guardar
   los productos en la nube.
   ============================================ */

module.exports = async function handler(req, res) {
  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Headers CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(503).json({ error: "Base de datos no configurada" });
  }

  // GET - Obtener productos
  if (req.method === "GET") {
    try {
      const response = await fetch(`${UPSTASH_URL}/get/bebitos_products`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      const data = await response.json();
      if (data.result) {
        return res.status(200).json(JSON.parse(data.result));
      }
      return res.status(404).json({ error: "No hay datos guardados" });
    } catch (e) {
      return res.status(500).json({ error: "Error al cargar productos" });
    }
  }

  // POST - Guardar productos
  if (req.method === "POST") {
    try {
      const products = req.body;
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: "Datos inválidos" });
      }
      const response = await fetch(UPSTASH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "SET",
          "bebitos_products",
          JSON.stringify(products),
        ]),
      });
      const data = await response.json();
      if (data.error) {
        return res.status(500).json({ error: "Error al guardar" });
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: "Error al guardar productos" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
};
