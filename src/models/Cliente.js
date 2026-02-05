const pool = require('../database/db');

class Cliente {
  static async crear(nombre, celular, habitacion) {
    const query = `
      INSERT INTO clientes (nombre, celular, habitacion) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
    const values = [nombre, celular, habitacion];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async buscarPorCelular(celular) {
    const query = 'SELECT * FROM clientes WHERE celular = $1';
    const result = await pool.query(query, [celular]);
    return result.rows[0];
  }

  static async buscarPorId(id) {
    const query = 'SELECT * FROM clientes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async actualizarVidas(id, vidas) {
    const query = `
      UPDATE clientes 
      SET vidas = $1, bloqueado = ($1 <= 0)
      WHERE id = $2 
      RETURNING *`;
    const result = await pool.query(query, [vidas, id]);
    return result.rows[0];
  }

  static async registrarHistorial(clienteId, accion, detalle) {
    const query = `
      INSERT INTO historial (cliente_id, accion, detalle) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
    const result = await pool.query(query, [clienteId, accion, detalle]);
    return result.rows[0];
  }

  static async obtenerHistorial(clienteId) {
    const query = 'SELECT * FROM historial WHERE cliente_id = $1 ORDER BY fecha DESC';
    const result = await pool.query(query, [clienteId]);
    return result.rows;
  }

  static async listarClientes() {
    const query = 'SELECT * FROM clientes ORDER BY fecha_registro DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async reiniciarVidas(id) {
    const query = `
      UPDATE clientes 
      SET vidas = 3, bloqueado = false 
      WHERE id = $1 
      RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Cliente;   