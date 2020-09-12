var express = require('express');
var app = express();

var mdAutenticacion = require('../middleware/autenticacion')

var Medico = require('../models/medico')

////////////////////////////////////////////
//      OBTENER MEDICO
///////////////////////////////////////////

app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(3)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    resp.status(200).json({
                        ok: true,
                        mensaje: 'Get de medicos',
                        medicos: medicos,
                        total: conteo
                    });
                });
            });
});

////////////////////////////////////////////
//      GUARDAR MEDICO
///////////////////////////////////////////

app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error cargando medico',
                errors: err
            });
        }
        resp.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario

        });
    });


});

//////////////////////////////////////////////////////
//// ACTUALIZAR UN NUEVO MEDICO
//////////////////////////////////////////////////////

app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Medico',
                errors: err
            });
        }
        if (!medico) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'El Medico con el id' + id + 'no existe',
                errors: { message: 'No existe un medico con el Id especificado' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.Usuario = body.Usuario;
        medico.Hospital = body.Hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            resp.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        })
    });
});


//////////////////////////////////////////////////////
//// OBTENER MEDICO BY ID
//////////////////////////////////////////////////////

app.get('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Medico',
                    errors: err
                });
            }
            if (!medico) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'El Medico con el id' + id + 'no existe',
                    errors: { message: 'No existe un medico con el Id especificado' }
                });
            }
            resp.status(200).json({
                ok: true,
                medico: medico
            });
        });
});

//////////////////////////////////////////////////////
//// BORRAR MEDICO
//////////////////////////////////////////////////////

app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        resp.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;