const express = require('express');
const { app: appWithWebSocket, getWss } = require('./socket');
const { app, pool } = require('./controller/router');
require('dotenv').config();

appWithWebSocket.ws('/ws', (ws, req) => {
  ws.on('message', (data) => {
    try {
      const { message, level } = JSON.parse(data);

      pool.query(
        'INSERT INTO messages (message, level) VALUES ($1, $2)',
        [message, level],
        (error, results) => {
          if (error) {
            console.error('Error al insertar en la base de datos:', error);
          } else {
            console.log('Mensaje insertado en la base de datos correctamente');
          }
        }
      );
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
    }
  });
});

const server = app.listen(3006, () => {
  console.log('Servidor HTTP iniciado en el puerto 3006');
});

const wss = getWss();

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  ws.on('message', (data) => {
    console.log('Mensaje recibido:', data);
  });
  ws.send('¡Bienvenido al servidor WebSocket!');
});
