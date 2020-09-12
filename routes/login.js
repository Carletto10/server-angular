var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');


/////////// GOOGLE /////////////
var CLIENT_ID = require('../config/config').CLIENT_ID;

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

///////////////////////////////////////////////////////////////////////////////////
// AUTENTICACION DE GOOGLE
///////////////////////////////////////////////////////////////////////////////////
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //   const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: payload.name,
        nombre: payload.name,
    }


}

app.post('/google', async(req, resp) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return resp.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBd) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }
        if (usuarioBd) {
            if (usuarioBd.google === false) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal',
                });
            } else {
                var token = jwt.sign({ usuario: usuarioBd }, SEED, { expiresIn: 14400 }); //4 HORAS

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioBd,
                    token: token,
                    id: usuarioBd._id,
                    menu: obtenerMenu(usuario.role)
                });
            }
        } else {
            //EL usuario no existe, hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBd) => {
                var token = jwt.sign({ usuario: usuarioBd }, SEED, { expiresIn: 14400 }); //4 HORAS

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioBd,
                    token: token,
                    id: usuarioBd._id
                });
            });
        }
    });

    /* return resp.status(200).json({
         ok: true,
         mensaje: 'OK',
         googleUser: googleUser
     });*/
});



///////////////////////////////////////////////////////////////////////////////////
// AUTENTICACION NORMAL
///////////////////////////////////////////////////////////////////////////////////
app.post('/', (req, resp) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }
        if (!usuarioBD) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }
        //CREAR UN TOKEN

        usuarioBD.password = '=)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4 HORAS

        resp.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
            menu: obtenerMenu(usuarioBD.role)

        });
    });

});

function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJS', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //    { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}


module.exports = app;