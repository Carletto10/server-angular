// REQUIRES

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
const cors = require('cors');

    // INICIALIZAR VARIABLES

var app = express();



const port = process.env.PORT || 4002;
//CORS

/*
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE, OPTIONS")
    next();
});
*/

//HABILITAR CORS
app.use(cors());

// BODY PARSER
// parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



// importar  rutas

var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login')
var usuarioRoutes = require('./routes/usuario')
var hospitalRoutes = require('./routes/hospital')
var medicoRoutes = require('./routes/medico')
var busquedaRoutes = require('./routes/busqueda')
var uploadRoutes = require('./routes/upload')
var imagenesRoutes = require('./routes/imagenes');


//conexion a la bd 

//mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, res) => {
mongoose.connection.openUri('mongodb+srv://admin:Carletto10@cluster0.qmty7.mongodb.net/hospitalDB', (error, res) => {    
    if (error) throw error;
    console.log('BD : \x1b[32m%s\x1b[0m', 'online');

});

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

//ESCUCHAR PETICIONES

/*
app.listen(3002, () => {
    console.log('Express server puerto 3002: \x1b[32m%s\x1b[0m', 'online');
});
*/

app.listen(port, '0.0.0.0' ,  () => {
    console.log(`EL SERVIDOR ESTA ESCUCHANDO POR EL PUERTO ${port}`);
});