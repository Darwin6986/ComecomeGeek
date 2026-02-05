const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const ClientesController = require('../controllers/clientesController');

// Validaciones
const validarRegistro = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('celular')
    .notEmpty().withMessage('El celular es requerido')
    .matches(/^\d{8}$/).withMessage('El celular debe tener exactamente 8 dígitos'),
  body('habitacion').isInt({ min: 1, max: 3 }).withMessage('La habitación debe ser 1, 2 o 3')
];

const validarCelular = [
  param('celular').notEmpty().withMessage('El celular es requerido')
];

// Rutas
router.post('/registrar', validarRegistro, ClientesController.registrarCliente);
router.post('/quitar-vida', ClientesController.quitarVida);
router.get('/cliente/:celular', validarCelular, ClientesController.obtenerCliente);
router.get('/listar', ClientesController.listarClientes);
router.put('/reiniciar/:id', ClientesController.reiniciarCliente);

module.exports = router;