"use strict";

$(document).ready(function() {
    cargarVisitas();
    $("#botonBuscar").on("click", buscarVisita);  
});

function buscarVisita(){
    var texto = document.getElementById("buscarClave").value;

    var userData = cargarUsuario();

     document.getElementById("ContenidoVisitasBuscadas").innerHTML = "";

    if(texto != ""){
        $.ajax({
            type: "POST",
            url:  "/buscarVisita",
            data: { texto : texto},

            success: function (data, textStatus, jqXHR) {
                data.forEach(function (n) {
                    //CABECERA
                    //Li con cada monumento
                    var visita = "<li id='visita"+ n.id_visita +"' class='list-group-item'>" +
                                    "<div class='row'>"+
                                        "<div class='col-md-10'>"+
                                            "<h5 class='tituloVisita'>"+ n.titulo +"</h5>"+
                                            "<p class='card-text'><small class='text-muted'>valoración: "+n.puntuacion+" ("+n.votos+" votos)</small></p>"+
                                        "</div>"+
                                        "<div class='col-md-2 justify-content-end d-flex'>"+
                                            "<button id="+n.id_visita+" type='button' class='btn' data-toggle='modal' data-target='#modalVisi"+n.id_visita+"'"+
                                            "onclick='botonOjo(this.id)'>"+
                                            "<img src='/images/eye.png' onload=this.style.display='block'' width='25' height='25'></img></button>"+
                                        "</div>" +
                                    "</div>"+    
                                "</li>";

                    //Modal asociado a cada Li de cada monumento
                    var infoVisita = "<div id='modalVisi"+n.id_visita+"' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>"+
                                            "<div class='modal-dialog modal-lg'>"+
                                                "<div class='modal-content'>"+
                                                    "<div class='modal-header'>"+
                                                        "<h4 class='tsp1'>"+n.titulo+"</h4>"+
                                                        "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>"+
                                                            "<span aria-hidden='true'>&times;</span>"+
                                                        "</button>"+
                                                    "</div>"+
                                                    "<div class='modal-body'>"+
                                                        "<div id='contenidoVisita"+n.id_visita+"'></div>"+
                                                        "<hr><div class='row col-md-12'>"+
                                                            "<div class='col-md-3'>"+
                                                                "<h5 class='tituloVisita'>Valora este sitio:</h5>"+
                                                            "</div>"+
                                                        "<div class='input-group mb-3 col-md-5'>"+
                                                            "<div class='input-group-prepend'>"+ 
                                                                "<label class='input-group-text' for='inputGroupSelect01'><img src='/images/thumbs-up.jpg' width='25' height='24'></img></label>"+
                                                            "</div>"+
                                                            "<select class='custom-select' id='inputGroupSelect"+n.id_visita+"'>"+
                                                                "<option selected>Elige una opción</option>"+
                                                                "<option value='1'>★ - Muy malo.</option>"+
                                                                "<option value='2'>★★ - Bastante malo.</option>"+
                                                                "<option value='3'>★★★ - Aceptable</option>"+
                                                                "<option value='4'>★★★★ - Bastante bueno</option>"+
                                                                "<option value='5'>★★★★★ - Impresionante</option>"+
                                                            "</select>"+
                                                        "</div>"+
                                                        "<div class='col-md-4'>"+
                                                            "<button id="+n.id_visita+" class='btn sp1' onclick='botonValoracion(this.id)'>Enviar valoracion</button>"+
                                                        "</div>"+
                                                        "<div class='mensj' id='mensajesComentario'>"+
                                                        "</div>"+
                                                        "<div class='col-md-12'>"+
                                                            "<div id='comentarios"+n.id_visita+"'>"+
                                                                "<hr><h5 class='tituloVisita'>Comentarios:</h5>"+
                                                            "</div>"+
                                                            "<hr> <form id='enviarComentario"+n.id_visita+"'>"+
                                                                "<div class='form-group'>"+
                                                                    "<label for='areaTexto'>Comenta esta visita</label>"+
                                                                    "<textarea class='form-control' id='areaTexto"+n.id_visita+"' rows='3'></textarea>"+                                                            
                                                                "</div>"+
                                                                "<div class='row col-md-12'>"+
                                                                    "<div class='col-md-6'>"+
                                                                        "<button id="+n.id_visita+" type='button' class='btn btn-primary sp1' onclick='botonComentario(this.id)'>Enviar comentario</button>"+ 
                                                                    "</div>"+   
                                                                    "<div id='comentarioVis"+n.id_visita+"' class='col-md-6'>"+
                                                                        "<p></p>"+
                                                                    "</div>"+  
                                                                "</div>"+  
                                                            "</form>"+
                                                        "</div>"+
                                                    "</div>"+
                                                "</div>"+
                                            "</div>"+
                                        "</div>";

                            var id_visita = n.id_visita;
                            var usuarioComentario = "#comentarioVis"+n.id_visita;

                            if(userData != null){  
                                var nombreUser = "<span id='nickAutorComentVisita"+id_visita+"'>"+userData.nick+"</span>";
                                $(usuarioComentario).append(nombreUser);
                            } else{
                                var usuarioNoReg = "<input type='email' class='form-control' aria-describedby='emailHelp' placeholder='Introduce un email'>";
                                $(usuarioComentario).append(usuarioNoReg);
                            }
                            

                            $.ajax({
                                type: "POST",
                                url:  "/obtenerComentariosVisita",
                                data: { id : id_visita },

                                success: function (data, textStatus, jqXHR) {

                                    data.forEach(function(k){
                                        var miComentario = "#comentarios"+id_visita;

                                        var comentario = "<div class='card comentario'>"+
                                                            "<div class='card-body'>"+
                                                                "<div class='row col-12'>"+
                                                                    "<div class='col-6'>"+
                                                                        "<h5>"+k.nick_autor+"</h5>"+
                                                                    "</div>"+
                                                                    "<div class='col-6'>"+
                                                                        "<p class='text-right font-weight-light'>"+k.fecha+"</p>"+
                                                                    "</div>"+
                                                                "</div>"+
                                                                "<hr>"+
                                                                "<p><em>"+k.texto+"</em></p>"+
                                                            "</div>"+
                                                        "</div>";

                                        $(miComentario).append(comentario);
                                    });

                                },
                                error: function(data, textStatus, jqXHR) {
                                    //alert("fallo 2");
                                }
                            });


                    $('#ContenidoVisitasBuscadas').append(visita);
                    $('#ContenidoVisitasBuscadas').append(infoVisita);
                });
            },
            error: function(data, textStatus, jqXHR) {
                $("#ContenidoVisitasBuscadas").prepend("<p class='text-danger mensj'>No se encontró ninguna visita que coincida con los criterios</p>"); 
            }
        });
    }

    setTimeout(function(){
        $('.mensj').remove();
    }, 5000);
}

function cargarVisitas(){

    var userData = cargarUsuario();

    $.ajax({
        type: "GET",
        url:  "/visitasMejorValoradas",

        success: function (data, textStatus, jqXHR) {       
            data.forEach(function (n) {
                //CABECERA
                //Li con cada monumento
                var visita = "<li id='visita"+ n.id_visita +"' class='list-group-item'>" +
                                "<div class='row'>"+
                                    "<div class='col-md-10'>"+
                                        "<h5 class='tituloVisita'>"+ n.titulo +"</h5>"+
                                        "<p class='card-text'><small class='text-muted'>valoración: "+n.puntuacion+" ("+n.votos+" votos)</small></p>"+
                                    "</div>"+
                                    "<div class='col-md-2 justify-content-end d-flex'>"+
                                        "<button id="+n.id_visita+" type='button' class='btn' data-toggle='modal' data-target='#modalVisi"+n.id_visita+"'"+
                                        "onclick='botonOjo(this.id)'>"+
                                        "<img src='/images/eye.png' width='25' height='25'></img></button>"+
                                    "</div>" +
                                "</div>"+    
                            "</li>";

                //Modal asociado a cada Li de cada monumento
                var infoVisita = "<div id='modalVisi"+n.id_visita+"' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>"+
                                        "<div class='modal-dialog modal-lg'>"+
                                            "<div class='modal-content'>"+
                                                "<div class='modal-header'>"+
                                                    "<h4 class='tsp1'>"+n.titulo+"</h4>"+
                                                    "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>"+
                                                        "<span aria-hidden='true'>&times;</span>"+
                                                    "</button>"+
                                                "</div>"+
                                                "<div class='modal-body'>"+
                                                    "<div id='contenidoVisita"+n.id_visita+"'></div>"+
                                                    "<hr><div class='row col-md-12'>"+
                                                        "<div class='col-md-3'>"+
                                                            "<h5 class='tituloVisita'>Valora este sitio:</h5>"+
                                                        "</div>"+
                                                    "<div class='input-group mb-3 col-md-5'>"+
                                                        "<div class='input-group-prepend'>"+ 
                                                            "<label class='input-group-text' for='inputGroupSelect01'><img src='/images/thumbs-up.jpg' width='25' height='24'></img></label>"+
                                                        "</div>"+
                                                        "<select class='custom-select' id='inputGroupSelect"+n.id_visita+"'>"+
                                                            "<option selected>Elige una opción</option>"+
                                                            "<option value='1'>★ - Muy malo.</option>"+
                                                            "<option value='2'>★★ - Bastante malo.</option>"+
                                                            "<option value='3'>★★★ - Aceptable</option>"+
                                                            "<option value='4'>★★★★ - Bastante bueno</option>"+
                                                            "<option value='5'>★★★★★ - Impresionante</option>"+
                                                        "</select>"+
                                                    "</div>"+
                                                    "<div class='col-md-4'>"+
                                                        "<button id="+n.id_visita+" class='btn sp1' onclick='botonValoracion(this.id)'>Enviar valoracion</button>"+
                                                    "</div>"+
                                                    "<div class='mensj' id='mensajesComentario'>"+
                                                    "</div>"+
                                                    "<div class='col-md-12'>"+
                                                        "<div id='comentarios"+n.id_visita+"'>"+
                                                            "<hr><h5 class='tituloVisita'>Comentarios:</h5>"+
                                                        "</div>"+
                                                        "<hr> <form id='enviarComentario"+n.id_visita+"'>"+
                                                            "<div class='form-group'>"+
                                                                "<label for='areaTexto'>Comenta esta visita</label>"+
                                                                "<textarea class='form-control' id='areaTexto"+n.id_visita+"' rows='3'></textarea>"+                                                            
                                                            "</div>"+
                                                            "<div class='row col-md-12'>"+
                                                                "<div class='col-md-6'>"+
                                                                    "<button id="+n.id_visita+" type='button' class='btn btn-primary sp1' onclick='botonComentario(this.id)'>Enviar comentario</button>"+ 
                                                                "</div>"+   
                                                                "<div id='comentarioVis"+n.id_visita+"' class='col-md-6'>"+
                                                                    "<p></p>"+
                                                                "</div>"+  
                                                            "</div>"+  
                                                        "</form>"+
                                                    "</div>"+
                                                "</div>"+
                                            "</div>"+
                                        "</div>"+
                                    "</div>";

                        var id_visita = n.id_visita;
                        var usuarioComentario = "#comentarioVis"+n.id_visita;

                        if(userData != null){  
                            var nombreUser = "<span id='nickAutorComentVisita"+id_visita+"'>"+userData.nick+"</span>";
                            $(usuarioComentario).append(nombreUser);
                        } else{
                            var usuarioNoReg = "<input type='email' class='form-control' aria-describedby='emailHelp' placeholder='Introduce un email'>";
                            $(usuarioComentario).append(usuarioNoReg);
                        }
                        

                        $.ajax({
                            type: "POST",
                            url:  "/obtenerComentariosVisita",
                            data: { id : id_visita },

                            success: function (data, textStatus, jqXHR) {

                                data.forEach(function(k){
                                    var miComentario = "#comentarios"+id_visita;

                                    var comentario = "<div class='card comentario'>"+
                                                        "<div class='card-body'>"+
                                                            "<div class='row col-12'>"+
                                                                "<div class='col-6'>"+
                                                                    "<h5>"+k.nick_autor+"</h5>"+
                                                                "</div>"+
                                                                "<div class='col-6'>"+
                                                                    "<p class='text-right font-weight-light'>"+k.fecha+"</p>"+
                                                                "</div>"+
                                                            "</div>"+
                                                            "<hr>"+
                                                            "<p><em>"+k.texto+"</em></p>"+
                                                        "</div>"+
                                                    "</div>";

                                    $(miComentario).append(comentario);
                                });

                            },
                            error: function(data, textStatus, jqXHR) {
                                //alert("fallo 2");
                            }
                        });


                $('#ContenidoVisitas').append(visita);
                $('#ContenidoVisitas').append(infoVisita);
            });

        },
        error: function(data, textStatus, jqXHR) {
        }

    });
}

function botonOjo(id){
    $.ajax({
        type: "POST",
        url:  "/obtenerInfoVisita",
        data: { id : id },

        success: function (data, textStatus, jqXHR) {

            var miModal = "modalMonu"+id;
            var miDiv = "#contenidoVisita"+id;

            $(miDiv).html("");

            data.forEach(function(n){

                var sitio = "<li class='list-group-item'>"+
                                "<div class='row  justify-content-end col-md-12'>"+
                                    "<div class='col-md-10'>"+
                                        "<h6 class='tituloVisita'>"+n.nombre+"</h6>"+
                                        "<button id='"+n.id_monumento+"' type='button' class='btn sp1' data-toggle='tooltip' data-placement='top' title='Ver mapa' onclick='generarMapa(this, this.id,"+n.latitud+", "+n.longitud+")'>"+
                                        "<img onload=this.style.display='block' src='/images/map3.png' width='25' height='25'></img></button>"+
                                        "<button id='"+n.id_monumento+"' type='button' class='btn sp1' data-toggle='tooltip' data-placement='top' title='Ver informacion' style='margin-left:6px;' onclick='verInfoSitio(this)'>"+
                                        "<img onload=this.style.display='block' src='/images/eye3.png' width='25' height='25' ></img></button>"+
                                    "</div>"+
                                    "<div class='col-md-2'>dsadsa"+

                                    "</div>"+
                                "</div>"+
                                "<div class='infoSitio border rounded bsp1' id='sitio"+n.id_monumento+"' style='margin-top:6px;'>"+
                                    "<div class='contenidoDesc'>"+
                                        "<p class='font-weight-bold'>Descripcion: </p> <p>"+ n.descripcion +"</p>"+
                                        "<p class='font-weight-bold'>Horario: </p>"+ n.horario +"</p>"+
                                        "<p class='font-weight-bold'>Calle: </p>"+ n.calle +"</p>"+
                                        "<p>Puedes encontrar más información en  <a target='_blank' href='"+n.url+"'> la web del ayuntamiento de Madrid </a>.</p>"+
                                    "</div>"+
                                "</div>"+
                                "<div class='mapCont' id='mapCont"+n.id_monumento+"' style='width:400px; height:300px; display: none;'>"+
                                    "<div class='map' id='map"+n.id_monumento+"'></div>"+
                                "</div>"+
                            "</li>";

                //generarMapa();

                $(miDiv).append(sitio);
            });

            $('#miModal').modal();
            $(".infoSitio").hide();
        },
        error: function(data, textStatus, jqXHR) {
            alert("fallo");
        }
    });
}

function generarMapa(obj, id, latitud, longitud){

    //mostramos el contenido del mapa:
    var cont2 = "#mapCont"+id;
    $(cont2).toggle();

    var boton = document.getElementById(id);


    //mostramos el boton de ocultar el mapa:
    //llamamos a la API mapbox para que nos devuelva el mapa con las coordenadas correspondientes:
    var cont = "map"+id;
    mapboxgl.accessToken = 'pk.eyJ1IjoiaWt1IiwiYSI6ImNqcGwxcjgwMTA4dDQzeHMxeDNpa3VweTkifQ.rrmmbiwC7oMHj_jxvxz2HA';
    var map = new mapboxgl.Map({
        container: cont, // container id
        style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
        center: [longitud, latitud], // starting position [lng, lat]
        zoom: 16 // starting zoom
    });
}

function verInfoSitio(obj){
    var sitio = "#sitio" + obj.id;

    $(sitio).toggle();
}

function botonComentario(id){
    var variable = "areaTexto"+id;
    var d = new Date();
    var texto = document.getElementById(variable).value;
    var dia = d.getDay();
    var mes = d.getMonth();
    var año = d.getUTCFullYear();
    var horas = d.getHours();
    var minutos = d.getMinutes();

    var fecha = dia + "/" + mes + "/" + año + " - " + horas + ":" + minutos; 

    $.ajax({
        type: "POST",
        url:  "/insertarComentario",
        data: { id : id, texto : texto, fecha : fecha},

        success: function (data, textStatus, jqXHR) {
            location.reload();
        },
        error: function(data, textStatus, jqXHR) {
            alert("fallo al insertar comentario");
        }
    });
}

function cargarUsuario(){

    var userData = {};

    $.ajax({
        type: "GET",
        url:  "/comprobarUsuario",

        success: function (data, textStatus, jqXHR) {
            userData.nick = data.nick;
            userData.email = data.email;
            userData.rol = data.rol;
        },
        error: function(data, textStatus, jqXHR) {
            userData = null;
        }
    });

    return userData;
}

function botonValoracion(id){
    var elem = 'inputGroupSelect'+id;
    var e = document.getElementById(elem);
    var voto = e.options[e.selectedIndex].value;
    
    if (voto.length < 2){
        $.ajax({
            type: "POST",
            url:  "/votarVisita",
            data: { id : id , voto : voto},

            success: function (data, textStatus, jqXHR) {
                $("#mensajesComentario").prepend("<p class='text-success mensj'>Voto contabilizado correctamente!</p>"); 
            },
            error: function(data, textStatus, jqXHR) {
                $("#mensajesComentario").prepend("<p class='text-danger mensj'>No puedes votar otra vez!</p>");
            }
        });
    } else{
        $("#mensajesComentario").prepend("<p class='text-danger mensj'>Voto no correcto</p>");
    }

    setTimeout(function(){
        $('.mensj').remove();
    }, 5000);
}