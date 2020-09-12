var express = require('express');

var app = express();

var Hospital = require('../models/hospital')
var Medico = require('../models/medico')
var Usuario = require('../models/usuario')

////////////////////////////////////////////////////
//      BUSQUEDA    POR COLECCION
/////////////////////////////////////////////////////

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;

    console.log('BUSQUEDA: \x1b[32m%s\x1b[0m', busqueda);

    var tabla = req.params.tabla;

    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son usuario ,medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válida' }
            });
            break;
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });



});



////////////////////////////////////////////////////
//      BUSQUEDA GENERAL
/////////////////////////////////////////////////////


app.get('/todo/:busqueda', (req, resp, next) => {


    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    console.log(busqueda);

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        resp.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

    /*
    buscarHospitales(busqueda, regex)
        .then(hospitales => {
            resp.status(400).json({
                ok: true,
                hospitales: hospitales
            });
        })
        */
});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al obtener hospitales');
                } else {
                    resolve(hospitales);
                }

            });
    });
}


function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al obtener hospitales');
                } else {
                    resolve(medicos);
                }

            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find()
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al obtener hospitales');
                } else {
                    resolve(usuarios);
                }
            });
    });
}


module.exports = app;