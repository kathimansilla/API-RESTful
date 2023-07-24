// Servidor Express

// Para probar los ficheros estáticos del fronend, entrar en <http://localhost:4500/>
// Para probar el API, entrar en <http://localhost:4500/api/items>

// Imports

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Arracar el servidor

const server = express();

// Configuración del servidor

server.use(cors());
server.use(express.json({ limit: '25mb' }));

// Conexion a la base de datos

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS, // <-- Pon aquí tu contraseña o en el fichero /.env en la carpeta raíz
    database: process.env.DB_NAME || 'recetas_db',
  });

  connection.connect();

  return connection;
}

// Poner a escuchar el servidor

const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});

// Endpoints CRUD

//GET obtener todas las recetas

server.get('/recetas', async (req, res) => {
  try {
    const select = 'SELECT * FROM recetas';
    const conn = await getConnection();
    const [result] = await conn.query(select);
    conn.end();
    res.json({
      info: {
        count: result.length,
      },
      results: result,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido el siguiente error: ${error.message}`,
    });
  }
});

//GET obtener una receta por su id
server.get('/recetas/:id', async (req, res) => {
  const idReceta = req.params.id;
  try {
    const select = 'SELECT * FROM recetas WHERE id = ?';
    const conn = await getConnection();
    const [result] = await conn.query(select, idReceta);
    conn.end();
    res.json({
      results: result,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido el siguiente error: ${error.message}`,
    });
  }
});

// POST crear una nueva receta
server.post('/recetas', async (req, res) => {
  const { nombre, ingredientes, instrucciones } = req.body;
  try {
    if (!nombre || !ingredientes || !instrucciones) {
      if (
        !nombre &&
        ingredientes &&
        instrucciones
      ) {
        return res.json({
          success: false,
          message: 'Ha olvidado introducir el nombre de su receta',
        });
      } else if (
        !ingredientes &&
        nombre &&
        instrucciones
      ) {
        return res.json({
          success: false,
          message: 'Ha olvidado introducir los ingredientes de su receta',
        });
      } else if (
        !instrucciones &&
        nombre &&
        ingredientes
      ) {
        return res.json({
          success: false,
          message: 'Ha olvidado introducir las instrucciones de su receta',
        });
      } else {
        return res.json({
          success: false,
          message:
            '¡Ha olvidado introducir varias partes de su receta! Compruebe: nombre, ingredientes e instrucciones',
        });
      }
    }
    const insert =
      'INSERT INTO recetas (nombre, ingredientes, instrucciones) VALUES (?, ?, ?)';
    const conn = await getConnection();
    const [result] = await conn.query(insert, [
      nombre,
      ingredientes,
      instrucciones,
    ]);
    conn.end();
    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido el siguiente error: ${error.message}`,
    });
  }
});

// PUT actualizar una receta existente
server.put('/recetas/:id', async (req, res) => {
  const idReceta = req.params.id;
  const { nombre, ingredientes, instrucciones } = req.body;
  try {
    if (!nombre || !ingredientes || !instrucciones) {
      if (
        !nombre &&
        ingredientes &&
        instrucciones
      ) {
        return res.json({
          success: false,
          message: 'Ha olvidado introducir el nuevo nombre de su receta',
        });
      } else if (
        !ingredientes &&
        nombre &&
        instrucciones
      ) {
        return res.json({
          success: false,
          message: 'Ha olvidado introducir los nuevos ingredientes de su receta',
        });
      } else if (
        !instrucciones &&
        nombre &&
        ingredientes
      ) {
        return res.json({
          success: false,
          message: 'Ha olvidado introducir las nuevas instrucciones de su receta',
        });
      } else {
        return res.json({
          success: false,
          message:
            '¡Ha olvidado introducir varias partes de su receta! Compruebe: nombre, ingredientes e instrucciones',
        });
      }
    }
    const update =
      'UPDATE recetas SET nombre = ?, ingredientes = ?, instrucciones = ? WHERE id = ?';
    const conn = await getConnection();
    const [result] = await conn.query(update, [
      nombre,
      ingredientes,
      instrucciones,
      idReceta,
    ]);
    conn.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido el siguiente error: ${error.message}`,
    });
  }
});

// DELETE eliminar una receta
server.delete('/recetas/:id', async (req, res) => {
  const idReceta = req.params.id;
  try {
    const deleteSql = 'DELETE FROM recetas WHERE id = ?';
    const conn = await getConnection();
    const [result] = await conn.query(deleteSql, idReceta);
    conn.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido el siguiente error: ${error.message}`,
    });
  }
});
