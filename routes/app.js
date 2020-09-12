var express = require('express');

var app = express();

//rutas

app.get('/', (req, resp, next) => {

    resp.status(400).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

module.exports = app;