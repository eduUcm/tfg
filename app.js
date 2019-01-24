"use strict";

/* 
    NODE MODULES
*/

    var express = require('express');
    var request = require('request');
    var createError = require('http-errors');
    var expressSession = require("express-session");
    var expressMysqlSession = require("express-mysql-session");
    var mysql = require("mysql");
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var logger = require('morgan');
    var async = require('async');
    var wdk = require('wikidata-sdk');
    const passport = require("passport");
    const passportHTTP = require("passport-http");

    // Modulos propios:
        //archivo de configuración
        var config = require("./config");
        //Modulos de conexiones con la BBDD
        var conexion = require("./conexionBD");

/*
    VARIABLES
*/

var app = express();

var router = express.Router();

var MySQLStore = expressMysqlSession(expressSession);

var sessionStore = new MySQLStore({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

var middlewareSession = expressSession({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    cookie:{secure: false, expires: new Date(Date.now() + 900000), maxAge:900000},
    store: sessionStore
});

let nCon = new conexion.ConexionBD(pool);

var ficherosEstaticos = path.join(__dirname, "public");

/*
    CONFIGURACIÓN
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(ficherosEstaticos));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(middlewareSession);

/*
    ****************************************************************
    **************************** CODIGO ****************************
    ****************************************************************
*/

/*
    CONTROL DE ACCESOS:

    **************************** LOGIN ****************************

    Manejadores de ruta del módulo de acceso
*/

app.get("/login", function(request, response) {
    if(typeof request.session.logueado == 'undefined'){
        response.status(200);
        response.render("login");
    } else{
        response.status(200);
        response.render("index");
    }
});

/*
    Comprueba si un usuario está en la BBDD y si sus datos de acceso son correctos.
    También asocia entonces los datos del usuario a su sesión.
*/
app.post("/login", function(request, response) {
    if(typeof request.session.logueado == 'undefined'){
        let email = nCon.comprobarLogin(request.body.email, request.body.password, (err, existe) => {
            if (err) {
                console.error(err);
            } else if (!existe) {
                response.render("login", { errorMsg : "Email y/o contraseña no válidos", email: request.body.email, password: request.body.password});
                response.end();
            } else {
                // Atributo de sesión para saber en todo momento qué usuario está logeado y sus privilegios
                if(existe[0].rol == "user"){    
                    request.session.logueado = request.body.email;
                    request.session.userData = existe[0];
                    request.session.rol = "user";
                    response.redirect("/index");
                    response.status(200);
                } else if (existe[0].rol == "admin"){
                    request.session.logueado = request.body.email;
                    request.session.userData = existe[0];
                    request.session.rol = "admin";
                    response.redirect("/index");
                    response.status(200);
                } else{
                    response.render("login", { errorMsg : "Ha ocurrido un error inesperado.", email: request.body.email, password: request.body.password});
                    response.end();
                }
            }
        });
    } else{
        response.status(200);
        response.render("index");
    }
});

/*
    Elimina la sesión actual del usuario logeado.
*/
app.get("/logout", function(request, response){
    response.status(200);
    delete request.session.logueado;
    response.render("index");
    response.end();
});

/*
    **************************** REGISTRO ****************************

    Manejadores de ruta de registro
*/
app.get("/registro", function(request, response) {
    if(typeof request.session.logueado == 'undefined'){
        response.status(200);
        response.render("registro");
    } else{
        response.status(200);
        response.render("index");
    }
});

/*
    Inserta un nuevo usuario en la BBDD. Los datos se reciben a través
    de una petición ajax.
*/
app.post("/registro", function(request, response) {
    if(typeof request.session.logueado == 'undefined'){
        var msg =  "Nombre de usuario ya existente!";
        var datosRegistro = {
            nick: request.body.nick,
            correo: request.body.email,
            pass: request.body.password,
            rol: "user",
            nombre: request.body.nombre,
            apellidos: request.body.apellidos,
        };

        nCon.insertarUsuario(datosRegistro, function(err, result){
            if (err) { 
                console.error(err);
            }
        });

        response.render("login");
        response.end();
    } else{
        response.status(200);
        response.render("index");
    }
});

/*
    RUTAS PRINCIPALES:

	**************************** INDEX ****************************

    Manejadores de ruta del módulo Index
*/
app.get("/", function(request, response) {
    response.status(200);
    response.render("index");
});

app.get("/index", function(request, response) {
    request.session.votado = false;
	response.status(200);
    response.render("index");
});

/*
    Busca una visita en la BBDD a partir de un texto dado por el cliente.
    El texto se envía en la variable texto.
*/
app.post("/buscarVisita", function(request, response) {
        var texto = request.body.texto;

        nCon.buscarVisita(texto, function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
});

/*
    Lista las 10 visitas mejor valoradas de la BBDD.
*/
app.get("/visitasMejorValoradas", function(request, response) {
    nCon.listarVisitasPuntuacion(function(err, result){
        if (result) { 
            response.status(200);
            response.json(result);
            response.end();
        } else {
            response.status(404);
            response.end();
        }
    });
});

/*
    Lista los comentarios asociados a una id de visita concreta.
    La visita sobre la que se requieren los comentarios se envía en la variable id.
*/
app.post("/obtenerComentariosVisita", function(request, response) {
    var id = request.body.id;

    nCon.listarComentariosVisita(id, function(err, result){
        if (result) { 
            response.json(result);
        } else{
            response.status(404);
        }
    });
});

/*
    Obtiene la información contenida el la BBDD para la id de un sitio concreto.
    El sitio sobre el que se requiere la información se envía en la variable id.
*/
app.post("/obtenerInfoVisita", function(request, response) {
    var id = request.body.id;
    
    nCon.aumentarNumVisitas(id, function(err, result){
        nCon.buscarInfoSitioID(id, function(err, result){
            if (result) { 
                response.json(result);
            } else{
                response.status(404);
            }
        });
    });
});

/*
    Inserta un comentario en la BBDD asociado a la visita especificada.
    La visita sobre la que se inserta el comentario se envía en la variable id.
    El texto del comentario se envía en la variable id.
    La fecha en la que se escribió el comentario se envía en la variable fecha.
*/
app.post("/insertarComentario", function(request, response) {
    var dataComentario={
        texto : request.body.texto,
        id : request.body.id,
        fecha : request.body.fecha,
        user: "",
    };

    /*
        Si el usuario está logeado se inserta su nick, si no está logeado se 
        inserta en su lugar el string "invitado".
    */
    if(typeof request.session.logueado != 'undefined'){
        dataComentario.user = request.session.userData.nick;
    } else{
        dataComentario.user = "invitado";
    }

    nCon.insertarComentario(dataComentario, function(err, result){
        if (result) { 
            response.json(result);
            response.status(200);
        } else{
            response.status(404);
        }
    });
});

/*
    Comprueba el rol de un usuario y lo devuelve al cliente. 
*/
app.get("/comprobarUsuario", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "user"){
        response.json(request.session.userData);
        response.status(200);
        response.end();
    } else if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        response.json(request.session.userData);
        response.status(200);
        response.end();
    } else{
        response.status(404);
        response.end();
    }
});

/*
    Permite votar una visita y calcula en base al nuevo voto el resultado de 
    la media actual e inserta el nuevo valor en la BBDD. 
    Para ello necesita el método auxiliar calcularMedia(datos).
*/
app.post("/votarVisita", function(request, response) {
    var datos ={};

    //request.session.votado = true;
    datos.id_visita = request.body.id;
    datos.votoNuevo = request.body.voto;
    nCon.obtenerVotosVisita(datos.id_visita, function(err, result){
        if (result) { 
            datos.votos = result[0].votos + 1;
            datos.puntuacionActual = result[0].puntuacion;
            calcularMedia(datos, function(err, data){
                nCon.insertarVotoVisita(data, function(err, result){
                    if (result) { 
                        response.status(200);
                        response.redirect('sitios');
                        response.end();
                    }
                });
            });
        }
    });
});

/*
    **************************** MIS VISITAS ****************************

    Manejadores de ruta del módulo mis visitas
*/

app.get("/misVisitas", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "user"){
        response.status(200);
        response.render("misVisitas");
    } else{
        response.status(200);
        response.render("error_1");
    }
});

/*
    Crea una visita asociada al usuario logeado en ese momento.
    Los datos de la visita se envía a través de una petición ajax.
*/
app.post("/crearVisita", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var date = new Date();
        var current_hour = date.getHours();

        var museos = request.body.museos;
        var datosVisita = {
            titulo: request.body.tituloVisita,
            id_visita:0,
            tag1: request.body.tag1,
            tag2: request.body.tag2,
            tag3: request.body.tag3,
            breveDesc : request.body.desc,
            recomendada: "no",
            diaVisita: date, 
            fechaCreacion: date, 
            id_autor: request.session.userData.id_usuario
        };

        //Primero consultamos que el nombre de la visita a crear no exista ya:
        nCon.buscarTituloVisita(datosVisita.titulo, function(err, result){
            if (!result) { 
                nCon.obtenerIDvalidoVisita(function(err, result){
                    //Para cada museo, hacemos un insert a la BBDD:

                    if(result[0].idvalido != undefined)
                        datosVisita.id_visita = result[0].idvalido;

                    museos.forEach(function(museo){
                        nCon.insertarVisita(datosVisita, museo, function(err, result){
                            if(err){
                                console.log(err);
                            }
                        });
                    });
                });
                response.redirect("misVisitas");
            } else {
                response.redirect("misVisitas");
                response.end();
            }
        });
    } else{
        response.status(200);
        response.render("index");
    }
});

/*
    Lista todas las visitas del usuario logeado en ese momento.
*/
app.get("/listarVisitas", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var id_usuario = request.session.userData.id_usuario;

        nCon.listarVisitas(id_usuario, function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
    }
});

app.get("/listarVisitasRecomendadas", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var id_usuario = request.session.userData.id_usuario;
        var visitas = [];
        var i;

        //Buscamos las visitas que tiene recomendadas ese usuario
        nCon.listarVisitasRecomendadas(id_usuario, function(err, result){
            if(result){
                response.status(200);
                response.json(result);
                response.end();
            } else{
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    }
});


/*
    Recomienda una visita a un usuario especificado.
*/
app.post("/recomendarVisita", function(request, response){
    if(typeof request.session.logueado != 'undefined'){
        var datos ={
            id_usuario : request.body.id_usuario,
            id_visita : request.body.id_visita,
            id_autor : request.session.userData.id_usuario,
            texto : request.body.texto
        };

        nCon.recomendarVisita(datos, function(err, result){
            if (result) { 
                response.status(200);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });


    } else{
        response.status(404);
        response.end();
    } 
});

/*
    Elimina una visita de la lista de recomendadas
*/
app.get("/eliminarVisitaRecomendada", function(request, response){
    if(typeof request.session.logueado != 'undefined'){
        var datos ={
            id_visita : request.query.id,
            id_usuario : request.session.userData.id_usuario
        };

        nCon.eliminarVisitaRecomendada(datos, function(err, result){
            if (result) { 
                response.status(200);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });


    } else{
        response.status(404);
        response.end();
    } 
});

/*
    Busca un usuario en base a su email.
*/
app.post("/buscarUsuarioEmail", function(request, response){
    if(typeof request.session.logueado != 'undefined'){
        var email = request.body.email;

        nCon.buscarUsuarioEmail(email, function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    } 
});

/*
    Elimina una visita concreta del usuario logeado.
*/
app.get("/eliminarVisita", function(request, response){
    if(typeof request.session.logueado != 'undefined'){
        var id_visita = request.query.id;

        nCon.eliminarVisita(id_visita, function(err, result){
            if (result) { 
                response.status(200);
                response.redirect('misVisitas');
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    } 
});

/*
    Lista los Museos de la BBDD
*/
app.get("/listarMuseos", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var tipo = "Museo";
        nCon.listarSitios(tipo, function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    }
});

/*
    Lista los Templos de la BBDD
*/
app.get("/listarTemplos", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var tipo = "TemploC";
        nCon.listarSitios(tipo, function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    }
});

/*
    Lista los Edificios Monumentales de la BBDD
*/
app.get("/listarEdificioM", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var tipo = "edificioM";
        nCon.listarSitios(tipo, function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    }
});

/*
    Lista la información asociada a un sitio concreto en base a su id.
*/
app.get("/cargarItems", function(request, response) {
    var calls = [];

    if(typeof request.session.logueado != 'undefined'){
        var id_lugar = request.query.id_lugar;

        nCon.buscarSitio(id_lugar, function(err, result){
            if (result) { 
                response.status(202);
                response.json(result);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    }
});

/*
    Elimina el monumento especificado de la visita concreta
*/
app.post("/eliminarSitioVisita", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var id_visita = request.body.id_visita;
        var id_monumento = request.body.id_monumento;

        nCon.comprobarEliminarSitioVisita(id_visita, function(err, result){
            if(result[0].TOTAL > 1){
                nCon.eliminarSitioVisita(id_visita, id_monumento, function(err, result){
                    if (result) { 
                        response.status(202);
                        response.end();
                    }
                });
            } else{  
                response.status(400);
                response.end();
            }

        });       

    } else{
        response.status(404);
        response.end();
    }
});

/*
    Añade el sitio especificado a la visita, si es posible
*/
app.post("/nuevoSitioVisita", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var datosNuevoSitio = {
            id_visita : request.body.id_visita,
            id_monumento : request.body.id_monumento,
            id_autor : request.session.userData.id_usuario
        };


        nCon.otenerDatosSitioVisita(datosNuevoSitio.id_visita, function(err, result){
            nCon.añadirSitioVisita(datosNuevoSitio, result, function(err, result){
                if (result) { 
                    response.status(202);
                    response.end();
                } else{
                    console.log(err);
                    response.status(400);
                    response.end();
                }
            });
            
        });         

    } else{
        response.status(404);
        response.end();
    }
});


/*
    **************************** ADMINISTRACIÓN ****************************

    Manejadores de ruta del módulo administración
*/
app.get("/administracion", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        response.status(200);
        response.render("administracion");
        response.end();
    } else{
        response.status(200);
        response.render("error_1");
        response.end();
    }
});

/*
    Busca a un usuario concreto en la BBDD a partir de un nombre especificado
*/
app.post("/buscarUsuario", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        var cadena = request.body.cadena;

        nCon.buscarUsuario(cadena, function(err, result){
            if (result.length > 0) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(200);
        response.render("error_1");
        response.end();
    }
});

/*
    Lista a todos los usuarios del sistema
*/
app.get("/listarUsuarios", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        nCon.listarUsuarios(function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(200);
        response.render("error_1");
        response.end();
    }
});

/*
    Lista todas las visitas del usuario seleccionado por el administrador.
*/
app.get("/listarVisitasUsuario", function(request, response) {
    if(typeof request.session.logueado != 'undefined'){
        var id_usuario = request.query.id;

        nCon.listarVisitas(id_usuario, function(err, result){
            if (result) { 
                response.status(200);
                response.json(result);
                response.end();
            } else {
                response.status(406);
                response.end();
            }
        });
    } else{
        response.status(404);
        response.end();
    }
});

/*
    Elimina el comentario seleccionado, solo si tiene permisos de administrador.
*/
app.post("/eliminarComentario", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        var id_comentario = request.body.id;

        nCon.eliminarComentario(id_comentario, function(err, result){
            if (result) { 
                response.status(200);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
    }
});

/*
    Elimina el usuario seleccionado, el borrado del usuario es un borrado lógico por lo que seguirá
    siendo visible para el administrador, y sus visitas y comentarios seguirán activos, pero dicho
    usuario no tendrá ya acceso al sistema.
*/
app.post("/eliminarUsuario", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        var id_usuario = request.body.id;

        nCon.eliminarUsuario(id_usuario, function(err, result){
            if (result) { 
                response.status(200);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
    }
});

/*
    Activa de nuevo a un usuario en el sistema.
*/
app.post("/activarUsuario", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        var id_usuario = request.body.id;

        nCon.activarUsuario(id_usuario, function(err, result){
            if (result) { 
                response.status(200);
                response.end();
            } else {
                response.status(404);
                response.end();
            }
        });
    } else{
        response.status(404);
    }
});

/*
    Permite obtener datos sobre estadisticas generales del sitio
*/

app.get("/obtenerDatosEstadisticas", function(request, response) {
    if(typeof request.session.logueado != 'undefined' && request.session.userData.rol == "admin"){
        async.series([
            //Obtenemos usuarios, posicion 1 del array
            function(callback){
                nCon.obtenerTotalUsuarios(function(err, result){
                    if (err) { 
                        reject(err);
                    } else {
                         callback(null, result[0].total);
                    }
                });
            },
            //Obtenemos visitas, posicion 2 del array
            function(callback){
                nCon.obtenerTotalVisitas(function(err, result){
                    if (err) { 
                        reject(err);
                    } else {
                        callback(null, result[0].total);
                    }
                });
                
            },
            //Obtenemos monumentos, posicion 3 del array
            function(callback){
                nCon.obtenerTotalSitios(function(err, result){
                    if (err) { 
                        reject(err);
                    } else {
                        callback(null, result[0].total);
                    }
                });
            },
            //Obtenemos el sitio más pòpular, basandonos en el que más veces es incluido en visitas, posicion 3 del array
            function(callback){
                nCon.obtenerSitioPopular(function(err, result){
                    if (err) { 
                        reject(err);
                    } else {
                        callback(null, result[0].nombre);
                    }
                });
            },
           //Obtenemos la visita más popular, basandonos en la que más veces se ha visitado, posicion 4 del array
            function(callback){
                nCon.obtenerVisitaMasPopular(function(err, result){
                    if (err) { 
                        reject(err);
                    } else {
                        callback(null, result[0]);
                    }
                });
            },
        ],
        function(err, results){
            response.status(200);
            response.json(results);
            response.end();
        });

    } else{
        response.status(404);
    }
});

/*
    **************************** SITIOS ****************************

    Manejadores de ruta del módulo sitios
*/
app.get("/sitios", function(request, response) {
    response.status(200);
    response.render("sitios");
});

/*
    Lista todos los sitios de la BBDD
*/
app.get("/listarSitios", function(request, response) {
    var tipo = "edificioM";
    nCon.listarSitiosAll(tipo, function(err, result){
        if (result) { 
            response.status(200);
            response.json(result);
            response.end();
        } else {
            response.status(404);
            response.end();
        }
    });
});

/*
    Obtiene la info de un sitio específico en base a su id
*/
app.post("/obtenerInfoMonumentoId", function(request, response) {
    var id = request.body.id;

    nCon.obtenerInfoMonumentoId(id, function(err, result){
        if (result) { 
            response.status(200);
            response.json(result);
            response.end();
        } else {
            response.status(404);
            response.end();
        }
    });
});

/*
    Permite votar un sitio y calcula en base al nuevo voto el resultado de 
    la media actual e inserta el nuevo valor en la BBDD. 
    Para ello necesita el método auxiliar calcularMedia(datos).
*/
app.post("/votarSitio", function(request, response) {
    var datos ={};

    //request.session.votado = true;
    datos.id_sitio = request.body.id;
    datos.votoNuevo = request.body.voto;
    nCon.obtenerVotos(datos.id_sitio, function(err, result){
        if (result) { 
            datos.votos = result[0].votos + 1;
            datos.puntuacionActual = result[0].puntuacion;

            calcularMedia(datos, function(err, data){
                nCon.insertarVoto(data, function(err, result){
                    if (result) { 
                        response.status(200);
                        response.redirect('sitios');
                        response.end();
                    }
                });
            });
        }
    });
});


/*
    **************************** MÉTODOS AUXILIARES ****************************
*/

/*
    Método auxiliar para calcular la media. Necesita recibir un objeto con:
        - La puntuación del voto introducido por el usuario (votoNuevo)
        - La puntuación actual del elemento (puntuacionActual)
        - Los votos totales del elemento (votos)
*/
const calcularMedia = function (datos, callback) {
    datos.media = datos.puntuacionActual + ((datos.votoNuevo - datos.puntuacionActual) / datos.votos);
    callback(null, datos);
}


/*
    **************************** API OPENDATA MADRID ****************************

    LLamadas a la API de datos abiertos del portal del ayuntamiento de madrid
*/

request('https://api.unsplash.com/', { json: true }, (err, res, body) => {

    if (err) { return console.log(err); }

});


// ************************* MUSEOS *************************
request('https://datos.madrid.es/egob/catalogo/201132-0-museos.json', { json: true }, (err, res, body) => {

    if (err) { return console.log(err); }

    console.log("comprobando museos...");
    body['@graph'].forEach(function(n){
        var museo = {
            tipo: 'Museo',
            nombre: n.title,
            url: n.relation,
            postal: n.address['postal-code'],
            calle: n.address['street-address'],
            descripcion: n.organization['organization-desc'],
            horario: n.organization.schedule,
            lat:0,
            long:0
        };

        if(n.location !== undefined){
            museo.lat = n.location.latitude;
            museo.long = n.location.longitude;
        } else {
            museo.lat = 0;
            museo.long = 0;
        }

        nCon.comprobarSitio(museo.nombre, museo.tipo, function(err, result){
            if(result){
                nCon.actualizaSitio(result[0].id_monumento, museo, function(err, result){
                    if(err){
                        console.log(err);
                    }
                });
            } else{
                nCon.insertarSitio(museo, function(err, result){
                    if(err){
                        console.log(err);
                    }
                });
            }
        });

    });
});

// ************************* TEMPLOS CATOLICOS *************************
request('https://datos.madrid.es/egob/catalogo/209426-0-templos-catolicas.json', { json: true }, (err, res, body) => {

    if (err) { return console.log(err); }
    
    console.log("comprobando templos...");
    body['@graph'].forEach(function(n){
        
    
        var temploC = {
            tipo: 'TemploC',
            nombre: n.title,
            url: n.relation,
            postal: n.address['postal-code'],
            calle: n.address['street-address'],
            descripcion: n.organization['organization-desc'],
            horario: n.organization.schedule,
            lat:0,
            long:0
        };

        if(n.location !== undefined){
            temploC.lat = n.location.latitude;
            temploC.long = n.location.longitude;
        } else {
            temploC.lat = 0;
            temploC.long = 0;
        }

        nCon.comprobarSitio(temploC.nombre, temploC.tipo, function(err, result){
            if(result){
                nCon.actualizaSitio(result[0].id_monumento, temploC, function(err, result){
                    if(err){
                        console.log(err);
                    }
                });
            } else{
                nCon.insertarSitio(temploC, function(err, result){
                    if(err){
                        //console.log(err);
                    }
                });
            }
        });

    });
});

// ************************* EDIFICIOS MONUMENTALES *************************
request('https://datos.madrid.es/egob/catalogo/208844-0-monumentos-edificios.json', { json: true }, (err, res, body) => {

    if (err) { return console.log(err); }
    
    console.log("comprobando edificios monumentales...");
    body['@graph'].forEach(function(n){
    
        var edificioM = {
            tipo: 'edificioM',
            nombre: n.title,
            url: n.relation,
            postal: n.address['postal-code'],
            calle: n.address['street-address'],
            descripcion: n.organization['organization-desc'],
            horario: n.organization.schedule,
            lat:0,
            long:0
        };

        if(n.location !== undefined){
            edificioM.lat = n.location.latitude;
            edificioM.long = n.location.longitude;
        } else {
            edificioM.lat = 0;
            edificioM.long = 0;
        }

        nCon.comprobarSitio(edificioM.nombre, edificioM.tipo, function(err, result){
            if(result){
                nCon.actualizaSitio(result[0].id_monumento, edificioM, function(err, result){
                    if(err){
                        console.log(err);
                    }
                });
            } else{
                nCon.insertarSitio(edificioM, function(err, result){
                    if(err){
                        //console.log(err);
                    }
                });
            }
        });
    
    });
});

module.exports = app;

app.listen(3000, function() {
	console.log("Servidor arrancado en el puerto 3000");
});