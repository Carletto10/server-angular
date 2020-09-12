var express = require('express');
var app = express();

var mdAutenticacion = require('../middleware/autenticacion')

var Hospital = require('../models/hospital')

////////////////////////////////////////////
//      OBTENER HOSPITAL
///////////////////////////////////////////

app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(3)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    resp.status(200).json({
                        ok: true,
                        mensaje: 'Get de hospitales',
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
});

////////////////////////////////////////////
//      GUARDAR HOSPITAL
///////////////////////////////////////////

app.post('/', mdAutenticacion.verificaToken, mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
            });
        }
        resp.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario

        });
    });


});

//////////////////////////////////////////////////////
//// ACTUALIZAR UN NUEVO HOSPITAL
//////////////////////////////////////////////////////

app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Hospital',
                errors: err
            });
        }
        if (!hospital) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con el Id especificado' }
            });
        }

        hospital.nombre = body.nombre;
        //        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            resp.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        })
    });
});

//////////////////////////////////////////////////////
//// BORRAR HOSPITAL
//////////////////////////////////////////////////////


app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        resp.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

////////////////////////////////////////////
//      OBTENER HOSPITAL POR ID 
///////////////////////////////////////////

app.get('/:id', (req, resp) => {

    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id' + id + 'no existe',
                    errors: { message: 'No existe un hospital con el Id especificado' }
                });
            }
            resp.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});


module.exports = app;