const { pool, app, getWss } = require('./socket');
const express = require('express');
require('dotenv').config();

// Obtener el servidor WebSocket
const wss = getWss();

// Escuchar conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');

  // Manejar mensajes del cliente WebSocket
  ws.on('message', (data) => {
    console.log('Mensaje recibido:', data);
  });

  // Enviar un mensaje de bienvenida al cliente WebSocket
  ws.send('¡Bienvenido al servidor WebSocket!');
});

// Cree una instancia de la aplicación Express
app.use(express.json());

// Ruta para manejar la solicitud HTTP POST
app.post('/messages', (req, res) => {
  const { message, level } = req.body;
  pool.query(
    'INSERT INTO messages (message, level) VALUES ($1, $2)',
    [message, level],
    (error, results) => {
      if (error) {
        console.error('Error al insertar en la base de datos:', error);
        res.status(500).json({ error: 'Error al guardar el mensaje en la base de datos' });
      } else {
        console.log('Mensaje insertado en la base de datos correctamente');
        res.status(200).json({ message: 'Mensaje guardado correctamente' });
      }
    }
  );
});

// Iniciar el servidor Express
const server = app.listen(3000, () => {
  console.log('Servidor HTTP iniciado en el puerto 3000');
});
