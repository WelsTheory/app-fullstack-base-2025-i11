var PORT    = 3000;

var express = require('express');

var app     = express();
var utils   = require('./mysql-connector');

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================
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

app.post('/devices/edit/', async (req, res) => 
{
    const { id, name, description } = req.body;
    if (!id || !name || !description) {
        return res.status(400).json({
            success: false,
            message: "Faltan campos obligatorios: id, name o description."
        });
    }
    try 
    {
        const result = await utils.query(
            "UPDATE Devices SET name = ?, description = ? WHERE id = ?",
            [name, description, id]
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

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});
