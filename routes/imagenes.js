var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

//rutas

app.get('/:tipo/:img', (req, resp, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    console.log(pathImagen);
    if (fs.existsSync(pathImagen)) {
        resp.sendFile(pathImagen);
    } else {
        var pathNoImg = path.resolve(__dirname, `../uploads/no-img.jpg`);
        resp.sendFile(pathNoImg);
    }
});

module.exports = app;