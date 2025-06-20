/**
 * Configura el servidor Express:
 * - Define el puerto.
 * - Importa Express y utilidades para la base de datos.
 * - Inicializa la aplicación.
 * - Configura el middleware para parsear JSON en las peticiones entrantes.
 */

var PORT    = 3000;

var express = require('express');

var app     = express();

var utils   = require('./mysql-connector');

app.use(express.json()); 

app.use(express.static('/home/node/app/static/'));

/**
 * GET /devices
 * Obtiene la lista de todos los modulos almacenados en la base de datos.
 */
app.get('/devices', (req, res) => 
{
    utils.query("SELECT * FROM Devices", (error, results) => 
        {
        if (error) 
        {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: "Database query failed"
            });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
});

/**
 * GET /devices/:id
 * Obtiene la información de un único módulo identificado por su ID.
 */
app.get('/devices/:id', (req, res) => 
{
    const deviceId = req.params.id;
    utils.query(
        "SELECT * FROM Devices WHERE id = ?",[deviceId],(error, results) => 
        {
            if (error) 
            {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    error: "Database query failed"
                });
            }
            if (results.length === 0) 
            {
                return res.status(404).json({
                    success: false,
                    error: "Device not found"
                });
            }
            res.status(200).json({
                success: true,
                data: results[0]
            });
        }
    );
});

/**
 * POST /devices/changestate
 * Cambia el estado (on/off) de un módulo específico usando su ID.
 */
app.post('/devices/changestate', async (req, res) => 
{
    const { id, state } = req.body;
    if (!id || typeof state !== 'boolean') 
    {
        return res.status(400).json({
            success: false,
            message: "Se requieren 'id' y 'state' (booleano)."
        });
    }
    try {
        await utils.query(
            "UPDATE Devices SET state = ? WHERE id = ?",
            [state ? 1 : 0, id]
        );
        res.status(200).json({
            success: true,
            message: `Estado del dispositivo con id=${id} actualizado a state=${state}.`
        });

    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar el estado del dispositivo.",
            error: error.message
        });
    }
});

/**
 * POST /devices/delete/
 * Elimina un módulo de la base de datos usando su ID.
 */
app.post('/devices/delete/', async (req, res) => 
{
    const deviceId = parseInt(req.body.id);
    if (!deviceId) 
    {
        return res.status(400).json({
            success: false,
            message: "Falta el ID del dispositivo"
        });
    }
    try 
    {
        await utils.query("DELETE FROM Devices WHERE id = ?", [deviceId]);
        res.status(200).json({
            success: true,
            message: "Dispositivo eliminado correctamente",
            deletedId: deviceId
        });
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar el dispositivo",
            error: error.message
        });
    }
});

/**
 * POST /devices/add/
 * Agrega un nuevo módulo a la base de datos con nombre, descripción, estado y tipo.
 */
app.post('/devices/add/', (req, res) => 
{
    const sql = "INSERT INTO Devices (name, description,state,type) VALUES (?, ?,?,?)";
    const params = [
        req.body.name,
        req.body.description,
        req.body.state,
        req.body.type
    ];

    utils.query(sql, params, (error, insertResult) => 
    {
        if (error) {
            console.error('Error al insertar:', error);
            return res.status(500).json({
                success: false,
                message: "Error al agregar el dispositivo",
                error: error.message
            });
        }
        res.status(200).json({
            success: true,
            message: "Dispositivo agregado correctamente",
            insertedId: insertResult.insertId
        });
    });
});

/**
 * POST /devices/edit/
 * Edita los datos de un módulo existente: nombre, descripción y tipo.
 */
app.post('/devices/edit/', async (req, res) => 
{
    const { id, name, description,type } = req.body;
    if (!id || !name || !description) {
        return res.status(400).json({
            success: false,
            message: "Faltan campos obligatorios: id, name, description o type."
        });
    }
    try 
    {
        const result = await utils.query(
            "UPDATE Devices SET name = ?, description = ?, type = ? WHERE id = ?",
            [name, description,type, id]
        );
        if (result.affectedRows === 0) 
        {
            return res.status(404).json({
                success: false,
                message: `Dispositivo con id ${id} no encontrado o sin cambios.`
            });
        }
        res.status(200).json({
            success: true,
            message: `Dispositivo con id ${id} editado correctamente.`,
            updatedId: id
        });

    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al editar el dispositivo",
            error: error.message
        });
    }
});

/**
 * POST /devices/all
 * Cambia el estado (on/off) de todos los módulos en la base de datos al mismo valor.
 */
app.post('/devices/all', async (req, res) => 
{
    const newState = req.body.state;
    if (typeof newState !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: "El campo 'state' debe ser booleano (true o false)."
        });
    }
    try 
    {
        await utils.query(
            "UPDATE Devices SET state = ?", [newState ? 1 : 0]
        );
        res.status(200).json({
            success: true,
            message: `Todos los dispositivos se actualizaron a state=${newState}.`
        });
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar el estado de todos los dispositivos.",
            error: error.message
        });
    }
});

/**
 * app.listen
 * Inicia el servidor Express en el puerto especificado y muestra un mensaje de confirmación en la consola.
 */
app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});
