var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

//rutas
// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, resp, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // TIPOS DE COLECCION
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        resp.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }
    if (!req.files) {
        resp.status(400).json({
            ok: false,
            mensaje: 'No selecciono archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //OBTENER NOMBRE DEL ARCHIVO

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // SOLA ESTAS EXTENSIONES ACEPTAMOS

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        resp.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(',') }
        });
    }

    //NOMBRE DEL ARCHIVO PERSONALIZADO

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //MOVER EL ARCHIVO DEL TEMPORAL A UN 

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            resp.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: { message: err }
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, resp);

        /* else {
                resp.status(200).json({
                    ok: true,
                    mensaje: 'Peticion realizada correctamente',
                    extensionArchivo: extensionArchivo
                });
                
        }*/
    });
});

function subirPorTipo(tipo, id, nombreArchivo, resp) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (err) {
                resp.status(400).json({
                    ok: false,
                    error: err
                });
            }
            // console.log('PATH VIEJO: \x1b[32m%s\x1b[0m', pathViejo);
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) console.log(err);

                });
                // console.log('PATH VIEJO BORRADO: \x1b[32m%s\x1b[0m', pathViejo);

            }
            //console.log('CREATING NEW FILENAME');

            usuario.img = nombreArchivo;
            usuario.save((err1, usuarioActualizado) => {
                resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    usuario: usuarioActualizado
                });

            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            var pathViejo = './uploads/medicos/' + medico.img;
            if (err) {
                resp.status(400).json({
                    ok: false,
                    error: err
                });
            }

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) console.log(err);

                });
            }
            medico.img = nombreArchivo;
            medico.save((err1, medicoActualizado) => {
                resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizada',
                    medico: medicoActualizado
                });

            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                resp.status(400).json({
                    ok: false,
                    error: err
                });
            }

            if (!hospital) {
                return resp.status(400).json({
                    ok: false,
                    error: 'Hospital no encontrado con el id indicado'
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) console.log(err);

                });
            }
            hospital.img = nombreArchivo;
            hospital.save((err1, hospitalActualizado) => {
                resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital Actualizada',
                    hospital: hospitalActualizado
                });

            });
        });
    }

}

module.exports = app;