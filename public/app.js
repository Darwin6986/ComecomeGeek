class SistemaClientes {
    constructor() {
        // Usar la misma URL del servidor (relativa)
        this.API_URL = '/api';
        this.init();
    }

    init() {
        // Configurar pestañas
        this.configurarTabs();
        
        // Configurar formularios
        this.configurarFormularios();
        
        // Verificar conexión
        this.verificarConexion();
        
        // Cargar clientes inicialmente
        this.cargarClientes();
    }

    configurarTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const panels = document.querySelectorAll('.panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Actualizar botones activos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Mostrar panel activo
                panels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === tabId) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    }

    configurarFormularios() {
        // Formulario de registro
        document.getElementById('formRegistro').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarCliente();
        });

        // Formulario para quitar vida
        document.getElementById('formQuitarVida').addEventListener('submit', (e) => {
            e.preventDefault();
            this.quitarVida();
        });

        // Formulario de búsqueda
        document.getElementById('formBuscar').addEventListener('submit', (e) => {
            e.preventDefault();
            this.buscarCliente();
        });

        // Botón para cargar clientes
        document.getElementById('btnCargarClientes').addEventListener('click', () => {
            this.cargarClientes();
        });
    }

    async verificarConexion() {
        try {
            const response = await fetch(`${this.API_URL}/listar`);
            if (response.ok) {
                document.getElementById('status').textContent = '● Conectado';
                document.getElementById('status').className = 'status-online';
            }
        } catch (error) {
            document.getElementById('status').textContent = '● Desconectado';
            document.getElementById('status').className = 'status-offline';
        }
    }

    async registrarCliente() {
        const nombre = document.getElementById('nombre').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const habitacion = document.getElementById('habitacion').value;

        if (!nombre || !celular || !habitacion) {
            this.mostrarMensaje('resultadoRegistro', 'Por favor complete todos los campos', 'error');
            return;
        }

        // Validar celular (solo números, al menos 10 dígitos)
        if (!/^\d{8,}$/.test(celular)) {
            this.mostrarMensaje('resultadoRegistro', 'El celular debe contener solo números (mínimo 8 dígitos)', 'error');
            return;
        }

        this.mostrarMensaje('resultadoRegistro', 'Registrando cliente...', 'info');

        try {
            const response = await fetch(`${this.API_URL}/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, celular, habitacion })
            });

            const data = await response.json();
            
            if (response.ok) {
                let mensaje = data.mensaje;
                let tipo = 'exito';
                
                // Verificar si el cliente está bloqueado
                if (response.status === 403) {
                    mensaje = '🚫 CLIENTE NO DESEADO - BLOQUEADO 🚫';
                    tipo = 'error';
                }
                
                this.mostrarMensaje('resultadoRegistro', 
                    `<strong>${mensaje}</strong><br><br>
                    <strong>Cliente:</strong> ${data.cliente.nombre}<br>
                    <strong>Celular:</strong> ${data.cliente.celular}<br>
                    <strong>Vidas:</strong> ${data.cliente.vidas}<br>
                    <strong>Habitación:</strong> ${data.cliente.habitacion}<br>
                    <strong>Estado:</strong> ${data.cliente.bloqueado ? '🔴 BLOQUEADO' : '🟢 ACTIVO'}`, 
                    tipo
                );
                
                // Limpiar formulario si fue un nuevo registro
                if (response.status === 201) {
                    document.getElementById('formRegistro').reset();
                }
                
                // Actualizar lista de clientes
                this.cargarClientes();
            } else {
                this.mostrarMensaje('resultadoRegistro', 
                    `❌ Error: ${data.error || data.errors?.map(e => e.msg).join(', ')}`, 
                    'error'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje('resultadoRegistro', 
                '❌ Error de conexión con el servidor', 
                'error'
            );
        }
    }

    async quitarVida() {
        const celular = document.getElementById('celularQuitar').value.trim();

        if (!celular) {
            this.mostrarMensaje('resultadoQuitarVida', 'Ingrese el número de celular', 'error');
            return;
        }

        if (!/^\d{8,}$/.test(celular)) {
            this.mostrarMensaje('resultadoQuitarVida', 'El celular debe contener solo números (mínimo 8 dígitos)', 'error');
            return;
        }

        this.mostrarMensaje('resultadoQuitarVida', 'Procesando...', 'info');

        try {
            const response = await fetch(`${this.API_URL}/quitar-vida`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ celular })
            });

            const data = await response.json();
            
            if (response.ok) {
                let tipo = 'advertencia';
                let emoji = '⚠️';
                
                if (data.cliente.vidas === 0) {
                    tipo = 'error';
                    emoji = '🚫';
                } else if (data.cliente.vidas === 3) {
                    tipo = 'exito';
                    emoji = '✅';
                } else if (data.cliente.vidas === 1) {
                    emoji = '🔴';
                } else if (data.cliente.vidas === 2) {
                    emoji = '🟡';
                }
                
                this.mostrarMensaje('resultadoQuitarVida', 
                    `${emoji} <strong>${data.mensaje}</strong><br><br>
                    <strong>Cliente:</strong> ${data.cliente.nombre}<br>
                    <strong>Celular:</strong> ${data.cliente.celular}<br>
                    <strong>Vidas restantes:</strong> ${data.cliente.vidas}<br>
                    <strong>Estado:</strong> ${data.cliente.bloqueado ? '🔴 BLOQUEADO' : '🟢 ACTIVO'}`, 
                    tipo
                );
                
                // Limpiar formulario
                document.getElementById('celularQuitar').value = '';
                
                // Actualizar lista de clientes
                this.cargarClientes();
            } else {
                this.mostrarMensaje('resultadoQuitarVida', 
                    `❌ Error: ${data.error}`, 
                    'error'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje('resultadoQuitarVida', 
                '❌ Error de conexión con el servidor', 
                'error'
            );
        }
    }

    async buscarCliente() {
        const celular = document.getElementById('celularBuscar').value.trim();

        if (!celular) {
            this.mostrarMensaje('resultadoBusqueda', 'Ingrese el número de celular', 'error');
            return;
        }

        if (!/^\d{8,}$/.test(celular)) {
            this.mostrarMensaje('resultadoBusqueda', 'El celular debe contener solo números (mínimo 8 dígitos)', 'error');
            return;
        }

        this.mostrarMensaje('resultadoBusqueda', 'Buscando cliente...', 'info');
        document.getElementById('historialCliente').innerHTML = '';

        try {
            const response = await fetch(`${this.API_URL}/cliente/${celular}`);
            const data = await response.json();
            
            if (response.ok) {
                const cliente = data.cliente;
                const historial = data.historial;
                
                let estadoHTML = '';
                let emoji = '';
                if (cliente.bloqueado) {
                    estadoHTML = '<span style="color: #e74c3c; font-weight: bold;">🔴 BLOQUEADO</span>';
                    emoji = '🚫';
                } else if (cliente.vidas === 1) {
                    estadoHTML = '<span style="color: #f39c12; font-weight: bold;">🟡 ÚLTIMA VIDA</span>';
                    emoji = '⚠️';
                } else {
                    estadoHTML = '<span style="color: #2ecc71; font-weight: bold;">🟢 ACTIVO</span>';
                    emoji = '✅';
                }
                
                this.mostrarMensaje('resultadoBusqueda', 
                    `${emoji} <strong>Cliente encontrado:</strong><br><br>
                    <strong>Nombre:</strong> ${cliente.nombre}<br>
                    <strong>Celular:</strong> ${cliente.celular}<br>
                    <strong>Vidas:</strong> ${cliente.vidas}<br>
                    <strong>Habitación:</strong> ${cliente.habitacion}<br>
                    <strong>Estado:</strong> ${estadoHTML}<br>
                    <strong>Fecha de registro:</strong> ${new Date(cliente.fecha_registro).toLocaleDateString()}`, 
                    'exito'
                );
                
                // Mostrar historial
                this.mostrarHistorial(historial);
            } else {
                this.mostrarMensaje('resultadoBusqueda', 
                    `❌ ${data.error}`, 
                    'error'
                );
                document.getElementById('historialCliente').innerHTML = '';
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarMensaje('resultadoBusqueda', 
                '❌ Error de conexión con el servidor', 
                'error'
            );
        }
    }

    async cargarClientes() {
        try {
            const response = await fetch(`${this.API_URL}/listar`);
            const clientes = await response.json();
            
            if (response.ok) {
                this.mostrarListaClientes(clientes);
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            document.getElementById('listaClientes').innerHTML = 
                '<div class="mensaje-error">❌ Error al cargar la lista de clientes</div>';
        }
    }

    mostrarMensaje(elementId, mensaje, tipo = 'info') {
        const elemento = document.getElementById(elementId);
        elemento.innerHTML = `
            <div class="mensaje-${tipo}">
                ${mensaje}
            </div>
        `;
        elemento.style.display = 'block';
    }

    mostrarHistorial(historial) {
        const contenedor = document.getElementById('historialCliente');
        
        if (historial.length === 0) {
            contenedor.innerHTML = '<p>📭 No hay historial registrado para este cliente.</p>';
            return;
        }
        
        let html = '<h3><i class="fas fa-history"></i> Historial de Actividades</h3>';
        html += '<div class="tabla-container"><table>';
        html += '<tr><th>Fecha</th><th>Acción</th><th>Detalle</th></tr>';
        
        historial.forEach(item => {
            let emoji = '📝';
            if (item.accion.includes('BLOQUEADO')) emoji = '🚫';
            if (item.accion.includes('VIDA_QUITADA')) emoji = '💔';
            if (item.accion.includes('REINICIO')) emoji = '🔄';
            if (item.accion.includes('REGISTRO_INICIAL')) emoji = '👤';
            
            html += `
                <tr>
                    <td>${new Date(item.fecha).toLocaleString()}</td>
                    <td>${emoji} ${item.accion}</td>
                    <td>${item.detalle || '-'}</td>
                </tr>
            `;
        });
        
        html += '</table></div>';
        contenedor.innerHTML = html;
    }

    mostrarListaClientes(clientes) {
        const contenedor = document.getElementById('listaClientes');
        
        if (clientes.length === 0) {
            contenedor.innerHTML = '<p>📭 No hay clientes registrados.</p>';
            return;
        }
        
        let html = '<div class="tabla-container"><table>';
        html += `
            <tr>
                <th>Nombre</th>
                <th>Celular</th>
                <th>Vidas</th>
                <th>Habitación</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
            </tr>
        `;
        
        clientes.forEach(cliente => {
            let claseFila = '';
            let estado = '';
            let emoji = '';
            
            if (cliente.bloqueado) {
                claseFila = 'cliente-bloqueado';
                estado = '<span style="color: #e74c3c;">🚫 BLOQUEADO</span>';
                emoji = '🚫';
            } else if (cliente.vidas === 1) {
                claseFila = 'cliente-advertencia';
                estado = '<span style="color: #f39c12;">⚠️ ÚLTIMA VIDA</span>';
                emoji = '⚠️';
            } else if (cliente.vidas === 2) {
                estado = '<span style="color: #f1c40f;">🟡 ADVERTENCIA</span>';
                emoji = '🟡';
            } else {
                estado = '<span style="color: #2ecc71;">🟢 ACTIVO</span>';
                emoji = '🟢';
            }
            
            let vidasHTML = '';
            for (let i = 0; i < cliente.vidas; i++) {
                vidasHTML += '<i class="fas fa-heart vida-icon"></i>';
            }
            
            html += `
                <tr class="${claseFila}">
                    <td>${cliente.nombre}</td>
                    <td>${cliente.celular}</td>
                    <td class="vidas">${vidasHTML} (${cliente.vidas})</td>
                    <td>${cliente.habitacion}</td>
                    <td>${emoji} ${estado}</td>
                    <td>${new Date(cliente.fecha_registro).toLocaleDateString()}</td>
                    <td>
                        <button onclick="sistema.reiniciarCliente(${cliente.id})" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-redo"></i> Reiniciar
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</table></div>';
        contenedor.innerHTML = html;
    }

    async reiniciarCliente(id) {
        if (!confirm('¿Está seguro de reiniciar las vidas de este cliente a 3?\n\n⚠️ Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/reiniciar/${id}`, {
                method: 'PUT'
            });

            const data = await response.json();
            
            if (response.ok) {
                alert(`✅ ${data.mensaje}\n\nCliente: ${data.cliente.nombre}\nVidas reiniciadas a: ${data.cliente.vidas}`);
                this.cargarClientes();
                
                // Si estamos en la pestaña de búsqueda, actualizar
                if (document.getElementById('buscar').classList.contains('active')) {
                    const celularInput = document.getElementById('celularBuscar').value;
                    if (celularInput) {
                        this.buscarCliente();
                    }
                }
            } else {
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión con el servidor');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sistema = new SistemaClientes();
});