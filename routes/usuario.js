var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
//var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middleware/autenticacion')
var app = express();



var Usuario = require('../models/usuario')

//rutas

////////////////////////////////////////////
//      OBTENER USUARIO
///////////////////////////////////////////

app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(3)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {

                    resp.status(200).json({
                        ok: true,
                        mensaje: 'Get de usuarios',
                        usuarios: usuarios,
                        total: conteo
                    });
                });

            });


});



//////////////////////////////////////////////////////
//// MIDDLEWARE  - Verificar Token
//////////////////////////////////////////////////////
/*
app.use('/', (req, resp, next) => {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return resp.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        next();
    });

});
*/
//////////////////////////////////////////////////////
//// CREAR UN NUEVO USUARIO
//////////////////////////////////////////////////////

app.post('/', (req, resp) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),

        img: body.img,
        role: body.role

    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {

            console.log(err);

            return resp.status(400).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }
        resp.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario

        });
    });


});

//////////////////////////////////////////////////////
//// ACTUALIZAR UN NUEVO USUARIO
//////////////////////////////////////////////////////

app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }
        if (!usuario) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con el Id especificado' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuarios',
                    errors: err
                });
            }
            resp.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        })
    });
});


//////////////////////////////////////////////////////
//// ACTUALIZAR UN NUEVO USUARIO
//////////////////////////////////////////////////////

app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuarios',
                errors: err
            });
        }
        resp.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;