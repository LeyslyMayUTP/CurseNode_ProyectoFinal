const express = require('express');
const { Pool } = require('pg');
const expressWs = require('express-ws');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
const { app: appWithWebSocket, getWss } = expressWs(app);

app.use(express.json());

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

const server = app.listen(3000, () => {
  console.log('Servidor HTTP iniciado en el puerto 3000');
});

const wss = getWss();

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  ws.on('message', (data) => {
    console.log('Mensaje recibido:', data);
  });
  ws.send('¡Bienvenido al servidor WebSocket!');
});


// Para suscribirse y emitir un evento al WebSocket
const subscribeAndEmitEvent = async (user) => {
    try {
      // Generar el token
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Guardar información del usuario en la base de datos
      await pool.query(
        'INSERT INTO users (username, token, name) VALUES ($1, $2, $3)',
        [user.username, token, user.name]
      );
  
      // Emitir evento al WebSocket
      const wssClients = wss.clients;
      wssClients.forEach((client) => {
        client.send(JSON.stringify({ message: 'Nuevo usuario registrado', level: 'info' }));
      });
    } catch (error) {
      console.error('Error al guardar la información del usuario:', error);
    }
  };  
  
  app.post('/users', (req, res) => {
    const { user, pass, name } = req.body;
  
    if (!user || !pass || !name) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }
  
    subscribeAndEmitEvent({ username: user, pass, name });
  
    res.status(200).json({ message: 'Usuario registrado correctamente' });
  });
  
