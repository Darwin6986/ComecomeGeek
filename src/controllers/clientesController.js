const Cliente = require('../models/Cliente');
const { validationResult } = require('express-validator');

class ClientesController {
  static async registrarCliente(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nombre, celular, habitacion } = req.body;
      
      // Verificar si el cliente ya existe
      let cliente = await Cliente.buscarPorCelular(celular);
      
      if (cliente) {
        // Si el cliente ya está bloqueado
        if (cliente.bloqueado) {
          await Cliente.registrarHistorial(
            cliente.id, 
            'INTENTO_REGISTRO', 
            'Cliente bloqueado intentó registrarse'
          );
          return res.status(403).json({
            mensaje: 'CLIENTE NO DESEADO - BLOQUEADO',
            cliente: cliente,
            advertencia: 'Este cliente ha sido bloqueado por incumplir las reglas repetidamente.'
          });
        }
        
        // Registrar el intento de registro
        await Cliente.registrarHistorial(
          cliente.id, 
          'REGISTRO', 
          `Registro del día. Vidas restantes: ${cliente.vidas}`
        );
        
        return res.json({
          mensaje: `Cliente registrado anteriormente. Vidas restantes: ${cliente.vidas}`,
          cliente: cliente
        });
      }
      
      // Crear nuevo cliente
      cliente = await Cliente.crear(nombre, celular, habitacion);
      
      // Registrar en historial
      await Cliente.registrarHistorial(
        cliente.id, 
        'REGISTRO_INICIAL', 
        'Primer registro del cliente'
      );
      
      res.status(201).json({
        mensaje: 'Cliente registrado exitosamente',
        cliente: cliente
      });
      
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async quitarVida(req, res) {
    try {
      const { celular } = req.body;
      
      const cliente = await Cliente.buscarPorCelular(celular);
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      if (cliente.bloqueado) {
        return res.status(403).json({
          mensaje: 'CLIENTE BLOQUEADO',
          detalle: 'Este cliente ya no tiene vidas disponibles.',
          cliente: cliente
        });
      }
      
      const nuevasVidas = cliente.vidas - 1;
      const clienteActualizado = await Cliente.actualizarVidas(cliente.id, nuevasVidas);
      
      // Registrar en historial
      const accion = nuevasVidas > 0 ? 'VIDA_QUITADA' : 'BLOQUEADO';
      const detalle = `Se quitó una vida. Vidas restantes: ${nuevasVidas}`;
      await Cliente.registrarHistorial(cliente.id, accion, detalle);
      
      let mensaje = '';
      if (nuevasVidas === 2) {
        mensaje = 'Se quitó 1 vida. El cliente tiene 2 vidas restantes.';
      } else if (nuevasVidas === 1) {
        mensaje = 'Se quitó 1 vida. El cliente tiene 1 vida restante. ÚLTIMA OPORTUNIDAD.';
      } else if (nuevasVidas === 0) {
        mensaje = 'CLIENTE BLOQUEADO. No tiene más vidas disponibles.';
      } else {
        mensaje = `Se quitó 1 vida. Vidas restantes: ${nuevasVidas}`;
      }
      
      res.json({
        mensaje: mensaje,
        cliente: clienteActualizado
      });
      
    } catch (error) {
      console.error('Error al quitar vida:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async obtenerCliente(req, res) {
    try {
      const { celular } = req.params;
      
      const cliente = await Cliente.buscarPorCelular(celular);
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      const historial = await Cliente.obtenerHistorial(cliente.id);
      
      res.json({
        cliente: cliente,
        historial: historial
      });
      
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async listarClientes(req, res) {
    try {
      const clientes = await Cliente.listarClientes();
      res.json(clientes);
    } catch (error) {
      console.error('Error al listar clientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async reiniciarCliente(req, res) {
    try {
      const { id } = req.params;
      
      const cliente = await Cliente.reiniciarVidas(id);
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      await Cliente.registrarHistorial(
        cliente.id, 
        'REINICIO', 
        'Vidas reiniciadas a 3'
      );
      
      res.json({
        mensaje: 'Vidas reiniciadas exitosamente',
        cliente: cliente
      });
      
    } catch (error) {
      console.error('Error al reiniciar cliente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = ClientesController;