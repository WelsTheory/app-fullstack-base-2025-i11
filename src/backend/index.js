//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;

var express = require('express');

var app     = express();
var utils   = require('./mysql-connector');

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================

app.get('/devices', (req, res) => {
    utils.query("SELECT * FROM Devices", (error, results) => {
        if (error) {
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

app.get('/devices/:id', (req, res) => {
    const deviceId = req.params.id;
    utils.query(
        "SELECT * FROM Devices WHERE id = ?",[deviceId],(error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    error: "Database query failed"
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Device not found"
                });
            }
            
            res.status(200).json({
                success: true,
                data: results[0]  // Devuelve solo el primer resultado (debería ser único por ID)
            });
        }
    );
});




app.post('/devices/delete/', async (req, res) => {
    const deviceId = parseInt(req.body.id); // asegúrate de que sea número

    if (!deviceId) {
        return res.status(400).json({
            success: false,
            message: "Falta el ID del dispositivo"
        });
    }

    try {
        await utils.query("DELETE FROM Devices WHERE id = ?", [deviceId]);
        res.status(200).json({
            success: true,
            message: "Dispositivo eliminado correctamente",
            deletedId: deviceId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar el dispositivo",
            error: error.message
        });
    }
});

// Agregar nuevo dispositivo usando utils.query
app.post('/devices/add/', (req, res) => {
    const sql = "INSERT INTO Devices (name, description,state,type) VALUES (?, ?,?,?)";
    const params = [
        req.body.name,
        req.body.description,
        req.body.state,
        req.body.type
    ];

    utils.query(sql, params, (error, insertResult) => {
        if (error) {
            console.error('Error al insertar:', error);
            return res.status(500).json({
                success: false,
                message: "Error al agregar el dispositivo",
                error: error.message
            });
        }

        // ✅ OK: insertId lo devuelve MySQL automáticamente
        res.status(200).json({
            success: true,
            message: "Dispositivo agregado correctamente",
            insertedId: insertResult.insertId
        });
    });
});

app.get('/algo',function(req,res,next){

    console.log("llego una peticion a algo")
    res.status(409).send({nombre:"Matias",apellido:"Ramos",dni:2131});
});
app.get('/algoInfo/:nombre',function(req,res,next){
    
    
    res.status(200).send({saludo:"Hola "+req.params.nombre});
});

app.post('/algoInfoBody/',function(req,res,next){
    console.log(req.body);
    if(req.body.nombre != undefined){
        res.status(200).send({saludo:"Hola "+req.body.nombre});
    }else{
        res.status(409).send({error:"Falta el nombre"});
    }
});

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================
