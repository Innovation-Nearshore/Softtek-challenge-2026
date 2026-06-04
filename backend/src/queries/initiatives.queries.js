const GET_ALL_INITIATIVES = `
  SELECT
    id,
    nombre,
    responsable,
    estado,
    fecha_limite,
    prioridad,
    descripcion,
    fecha_creacion,
    fecha_actualizacion
  FROM iniciativas
  ORDER BY fecha_creacion DESC
`;

const GET_INITIATIVES_FILTERED = `
  SELECT
    id,
    nombre,
    responsable,
    estado,
    fecha_limite,
    prioridad,
    descripcion,
    fecha_creacion,
    fecha_actualizacion
  FROM iniciativas
  WHERE
    ($1::text IS NULL OR estado = $1)
    AND ($2::text IS NULL OR prioridad = $2)
  ORDER BY fecha_creacion DESC
`;

const CREATE_INITIATIVE = `
  INSERT INTO iniciativas (nombre, responsable, estado, fecha_limite, prioridad, descripcion)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
`;

const UPDATE_INITIATIVE_ESTADO = `
  UPDATE iniciativas
  SET estado = $1, fecha_actualizacion = NOW()
  WHERE id = $2
  RETURNING *
`;

module.exports = {
  GET_ALL_INITIATIVES,
  GET_INITIATIVES_FILTERED,
  CREATE_INITIATIVE,
  UPDATE_INITIATIVE_ESTADO,
};
