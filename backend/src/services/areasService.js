const db = require('../db/pool');

async function getAllAreas() {
  const result = await db.query(
    'SELECT id, nombre, descripcion, email_contacto FROM areas ORDER BY nombre'
  );
  return result.rows;
}

module.exports = { getAllAreas };
