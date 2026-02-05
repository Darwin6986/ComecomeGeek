const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importamos las rutas - PERO manejamos el error si falla
let clientesRoutes;
try {
  clientesRoutes = require('./routes/clientes');
} catch (error) {
  console.warn('⚠️  Las rutas no están disponibles:', error.message);
  clientesRoutes = null;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Configurar rutas API si están disponibles
if (clientesRoutes) {
  app.use('/api', clientesRoutes);
} else {
  // Ruta de prueba si la API no está disponible
  app.use('/api', (req, res) => {
    res.status(503).json({ 
      error: 'API no disponible', 
      mensaje: 'La base de datos no está conectada' 
    });
  });
}

// Ruta de prueba de servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    database: 'Verificando...'
  });
});

// Todas las demás rutas sirven el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta específica para el home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ ============================================`);
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ Frontend disponible en http://localhost:${PORT}`);
  console.log(`✅ API disponible en http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ ============================================\n`);
  
  // Verificar conexión a PostgreSQL
  console.log('📊 Verificando conexión a PostgreSQL...');
  
  setTimeout(async () => {
    try {
      const pool = require('./database/db');
      const result = await pool.query('SELECT NOW()');
      console.log(`✅ PostgreSQL conectado: ${result.rows[0].now}`);
    } catch (dbError) {
      console.error('❌ Error conectando a PostgreSQL:', dbError.message);
      console.log('⚠️  El servidor seguirá funcionando sin base de datos');
      console.log('⚠️  Verifica tu archivo .env y que PostgreSQL esté ejecutándose');
    }
  }, 1000);
});