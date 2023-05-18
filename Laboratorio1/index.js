const express = require('express');
const { Pool } = require('pg');
const expressWs = require('express-ws');

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'socket',
  password: '123456',
  port: 5432,
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

// Ruta para manejar la solicitud HTTP POST
app.post('/messages', (req, res) => {
  const { message, level } = req.body;

  // Para guardar la información en la base de datos PostgreSQL
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
