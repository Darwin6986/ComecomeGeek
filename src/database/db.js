const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Crear la tabla si no existe
const createTableQuery = `
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  celular VARCHAR(20) UNIQUE NOT NULL,
  vidas INTEGER DEFAULT 3,
  habitacion INTEGER CHECK (habitacion IN (1, 2, 3)),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bloqueado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS historial (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  accion VARCHAR(50) NOT NULL,
  detalle TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const initializeDatabase = async () => {
  try {
    await pool.query(createTableQuery);
    console.log('✅ Tablas creadas o ya existentes');
  } catch (err) {
    console.error('❌ Error al crear tablas:', err);
  }
};

// Inicializar base de datos
initializeDatabase();

module.exports = pool;