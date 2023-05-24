const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const logInsertedUser = (username, token, name) => {
  console.log('Usuario insertado en la base de datos:');
  console.log('Username:', username);
  console.log('Token:', token);
  console.log('Name:', name);
};

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
    const { getWss } = require('../socket');
    const wss = getWss();
    const wssClients = wss.clients;
    wssClients.forEach((client) => {
      client.send(JSON.stringify({ message: 'Nuevo usuario registrado', level: 'info' }));
    });

    logInsertedUser(user.username, token, user.name);
  } catch (error) {
    console.error('Error al guardar la información del usuario:', error);
  }
};

module.exports = { pool, subscribeAndEmitEvent };
