require('dotenv').config();
const express = require('express');
const cors = require('cors');

const solicitudesRoutes = require('./routes/solicitudes');
const catalogosRoutes = require('./routes/catalogos');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas principales de la API
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api', catalogosRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
