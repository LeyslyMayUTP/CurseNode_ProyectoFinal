const express = require('express');
const { Pool } = require('pg');
const expressWs = require('express-ws');
require('dotenv').config();


// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Cree una instancia de la aplicación Express
const app = express();
const { app: appWithWebSocket, getWss } = expressWs(app);

// Middleware para procesar el cuerpo de la solicitud en formato JSON
app.use(express.json());

// Cree una ruta para recibir los mensajes WebSocket
appWithWebSocket.ws('/ws', (ws, req) => {
  ws.on('message', (data) => {
    try {
      const { message, level } = JSON.parse(data);

      // Para guardar la información en la base de datos PostgreSQL
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

module.exports = {
  pool,
  app,
  getWss
};
