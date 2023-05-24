const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { subscribeAndEmitEvent } = require('../models/model');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();

app.use(express.json());

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

app.post('/users', (req, res) => {
  const { user, pass, name } = req.body;

  if (!user || !pass || !name) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }

  subscribeAndEmitEvent({ username: user, pass, name });

  res.status(200).json({ message: 'Usuario registrado correctamente' });
});

module.exports = { app, pool };
