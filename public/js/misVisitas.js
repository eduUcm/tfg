"use strict";

var lugares = [];
var visita;

$(document).ready(function() {
	lugares = [];
    $( window ).on( "load", function() {
        cargarMisVisitas();
        cargarSitios();
        cargarRecomendaciones();
        restringirFechas();

        document.getElementById("botonCrear").disabled = false; 

        $("#botonCrear").on("click", validarVisita);
        $("#anadirLugar").on("click", mostrarBotonAnadir);

        $("#mostrarTemplos").on("click", mostrarListaTemplos);
        $("#mostrarMuseos").on("click", mostrarListaMuseos);
        $("#mostrarMonumentos").on("click", mostrarListaMonumentos);

        $("#ocultarTemplos").on("click", ocultarListaTemplos);
        $("#ocultarMuseos").on("click", ocultarListaMuseos);
        $("#ocultarMonumentos").on("click", ocultarListaMonumentos);

        /*
        $("#listarMuseos").on("click", botonListarMuseos);
        $("#ocultarMuseos").on("click", botonOcultarMuseos);
        $("#listarTemplos").on("click", botonListarTemplos);
        $("#ocultarTemplos").on("click", botonOcultarTemplos);
        $("#listarEdificioM").on("click", botonListarEdificioM);
        $("#ocultarEdificioM").on("click", botonOcultarEdificioM);
        */

        $('.nuevoLugarCancelar').click(function(){
            $("#nuevaVisita").show();
        });
    });
});

function restringirFechas(){
	var date = new Date();
	var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    $('#datepicker').datepicker({
        uiLibrary: 'bootstrap4',
        dateFormat: 'yyyy-mm-dd',
        minDate: today
    });
}

function cargarMisVisitas(){
    $.ajax({
        type: "GET",
        url:  "/listarVisitas",

        success: function (data, textStatus, jqXHR) {
            data.forEach(function (n) {
                //Convertimos la fecha a un formato más adecuado
                var f = new Date(n.dia_visita);
                var fecha = f.toLocaleDateString();

                //CABECERA
                //Li con cada monumento
                var visita = "<li id='visita"+ n.id_visita +"' class='list-group-item'>" +
                                "<div class='row'>"+
                                    "<div class='col-md-6'>"+
                                        "<h5 class='tituloVisita'>"+ n.titulo +"</h5>"+
                                        "<p class='card-text'><small class='text-muted'>valoración: "+n.puntuacion+" ("+n.votos+" votos)</small></p>"+
                                    "</div>"+
                                    "<div class='col-md-3'>"+
                                        "<small class='text-muted'>"+fecha+"</small>"+
                                    "</div>"+
                                    "<div class='col-md-3 justify-content-end d-flex'>"+
                                        "<button id="+n.id_visita+" type='button' class='btn' data-toggle='modal' data-target='#modalVisi"+n.id_visita+"'"+
                                        	"onclick='botonOjo(this.id)'>"+
                                        	"<img class='fa' src='/images/eye.png' width='25' height='25'></img></button>"+
                                        "<button id="+n.id_visita+" type='button' data-toggle='tooltip' data-placement='top' title='Eliminar' class='btn' style='margin-left:2px;'"+
                                        	"onclick='eliminar(this)'>"+
                                        	"<img class='fa' src='/images/trash.png' width='25' height='25'></img></button>"+
                                        "<button id="+n.id_visita+" type='button' data-toggle='tooltip' data-placement='top' title='Recomendar' class='btn' style='margin-left:2px;'"+
                                        	"onclick='recomendar(this)'>"+
                                        	"<img class='fa' src='/images/share.png' width='25' height='25'></img></button>"+
                                    "</div>" +
                                "</div>"+    
                            "</li>";

                //Modal asociado a cada Li de cada monumento
                var infoVisita = "<div id='modalVisi"+n.id_visita+"' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>"+
                                        "<div class='modal-dialog modal-lg' role='document'>"+
                                            "<div class='modal-content'>"+
                                                "<div class='modal-header'>"+
                                                    "<h4 class='tsp1'>"+n.titulo+"</h4>"+
                                                    "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>"+
                                                        "<span aria-hidden='true'>&times;</span>"+
                                                    "</button>"+
                                                "</div>"+
                                                "<div class='modal-body'>"+
                                                	"<div class='col-md-12'>"+
                                                		"<h5 class='tituloVisita'>Descripción:</h5>"+
                                                            "<button id="+n.id_visita+" type='button' class='btn sp6'"+
                                                                "onclick='botonModificarDescripcion("+n.id_visita+")'>"+
                                                                "<img src='/images/modify.ico' width='15' height='15' style='vertical-align: iddle'></img></button>"+
                                                		"<p>"+n.descripcion+"</p>"+
                                                	"</div>"+
                                                    "<div id='contenidoVisita"+n.id_visita+"'></div>"+
                                                    "<div class='comentarios col-md-12'>"+
                                                        "<div id='comentarios"+n.id_visita+"'>"+
                                                        "</div>"+
                                                    "</div>"+
                                                "</div>"+
                                                "<div class='modal-footer'>"+
                                                    "<button type='button' class='btn sp1' data-toggle='modal' data-target='#modalNuevoMonumento' onclick='modificarAddLugar("+n.id_visita+")'>+Añadir un nuevo lugar</button>"+
                                                    "<button type='button' class='btn btn-secondary' data-dismiss='modal'>Cerrar</button>"+
                                                "</div>"+
                                            "</div>"+
                                        "</div>"+
                                    "</div>";

                $.ajax({
                    type: "POST",
                    url:  "/obtenerComentariosVisita",
                    data: { id : n.id_visita },

                    success: function (data, textStatus, jqXHR) {
                        var miComentario = "#comentarios"+n.id_visita;
                        
                        data.forEach(function(k){
                            var comentario = "<hr><h5 class='tituloVisita'>Comentarios:</h5><div class='card comentario'>"+
                                                "<div class='card-body'>"+
                                                    "<div class='row col-12'>"+
                                                        "<div class='col-6'>"+
                                                            "<h5>"+k.nick_autor+"</h5>"+
                                                        "</div>"+
                                                        "<div class='col-6'>"+
                                                            "<p class='text-right font-weight-light'>"+k.fecha+"</p>"+
                                                        "</div>"+
                                                    "</div>"+
                                                    "</hr>"+
                                                    "<p><em>"+k.texto+"</em></p>"+
                                                    "</div>"+
                                                "</div>"+
                                            "</div>";

                            $(miComentario).append(comentario);
                        });

                    },
                    error: function(data, textStatus, jqXHR) {
                       
                    }
                });

                $('#contenidoMisVisitas').append(visita);
                $('#contenidoMisVisitas').append(infoVisita);
            });
        },
        error: function(data, textStatus, jqXHR) {
            console.log("sin visitas");
        }
    });
}

function cargarRecomendaciones(){
    $.ajax({
        type: "GET",
        url:  "/listarVisitasRecomendadas",

        success: function (data, textStatus, jqXHR) {
            data.forEach(function (n) {
                //Convertimos la fecha a un formato más adecuado
                var f = new Date(n.dia_visita);
                var fecha = f.toLocaleDateString();

                //CABECERA
                //Li con cada monumento
                var visita = "<li id='visita"+ n.id_visita +"' class='list-group-item'>" +
                                "<div class='row'>"+
                                    "<div class='col-md-6'>"+
                                        "<h5 class='tituloVisita'>"+ n.titulo +"</h5>"+
                                        "<p class='card-text'><small class='text-muted'>valoración: "+n.puntuacion+" ("+n.votos+" votos)</small></p>"+
                                    "</div>"+
                                    "<div class='col-md-3'>"+
                                        "<small class='text-muted'>"+fecha+"</small>"+
                                    "</div>"+
                                    "<div class='col-md-3 justify-content-end d-flex'>"+
                                        "<button id="+n.id_visita+" type='button' class='btn' data-toggle='modal' data-target='#modalVisi"+n.id_visita+"'"+
                                            "onclick='botonOjoRecomend(this.id)'>"+
                                            "<img class='fa' src='/images/eye.png' width='25' height='25'></img></button>"+
                                        "<button id="+n.id_visita+" type='button' data-toggle='tooltip' data-placement='top' title='Eliminar' class='btn' style='margin-left:2px;'"+
                                            "onclick='eliminarRecomendada(this)'>"+
                                            "<img class='fa' src='/images/trash.png' width='25' height='25'></img></button>"+
                                    "</div>" +
                                "</div>"+    
                            "</li>";

                //Modal asociado a cada Li de cada monumento
                var infoVisita = "<div id='modalVisi"+n.id_visita+"' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>"+
                                        "<div class='modal-dialog modal-lg' role='document'>"+
                                            "<div class='modal-content'>"+
                                                "<div class='modal-header'>"+
                                                    "<h4 class='tsp1'>"+n.titulo+"</h4>"+
                                                    "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>"+
                                                        "<span aria-hidden='true'>&times;</span>"+
                                                    "</button>"+
                                                "</div>"+
                                                "<div class='modal-body'>"+
                                                    "<div class='col-md-12'>"+
                                                        "<h5 class='tituloVisita'>Descripción:</h5>"+
                                                        "<p>"+n.descripcion+"</p>"+
                                                    "</div>"+
                                                    "<div id='contenidoVisita"+n.id_visita+"'></div>"+
                                                    "<div class='comentarios col-md-12'>"+
                                                        "<div id='comentarios"+n.id_visita+"'>"+
                                                        "</div>"+
                                                    "</div>"+
                                                "</div>"+
                                                "<div class='modal-footer'>"+
                                                    "<button type='button' class='btn btn-secondary' data-dismiss='modal'>Cerrar</button>"+
                                                "</div>"+
                                            "</div>"+
                                        "</div>"+
                                    "</div>";

                $.ajax({
                    type: "POST",
                    url:  "/obtenerComentariosVisita",
                    data: { id : n.id_visita },

                    success: function (data, textStatus, jqXHR) {
                        var miComentario = "#comentarios"+n.id_visita;
                        
                        data.forEach(function(k){
                            var comentario = "<hr><h5 class='tituloVisita'>Comentarios:</h5><div class='card comentario'>"+
                                                "<div class='card-body'>"+
                                                    "<div class='row col-12'>"+
                                                        "<div class='col-6'>"+
                                                            "<h5>"+k.nick_autor+"</h5>"+
                                                        "</div>"+
                                                        "<div class='col-6'>"+
                                                            "<p class='text-right font-weight-light'>"+k.fecha+"</p>"+
                                                        "</div>"+
                                                    "</div>"+
                                                    "</hr>"+
                                                    "<p><em>"+k.texto+"</em></p>"+
                                                    "</div>"+
                                                "</div>"+
                                            "</div>";

                            $(miComentario).append(comentario);
                        });

                    },
                    error: function(data, textStatus, jqXHR) {
                       
                    }
                });

                $('#contenidoRecomendaciones').append(visita);
                $('#contenidoRecomendaciones').append(infoVisita);
            });
        },
        error: function(data, textStatus, jqXHR) {
            console.log("error");
        }

    });
}

function recomendar(obj){
	$('#exampleModal3').modal('toggle');

	var id_visita = obj.id;
	var botonRec = document.getElementById("botonRecomendar");
	
	botonRec.onclick = function buscarusuarioId(){
		$('.alert').remove();
		var email = document.getElementById("emailRecomendar").value;
		var texto = document.getElementById("textoRecomendar").value;

		//Buscamos el email en el servidor
		$.ajax({
	        type: "POST",
	        url:  "/buscarUsuarioEmail",
	        data: { email : email },

	        success: function (data, textStatus, jqXHR) {
	        	//Si hemos encontrado el email, le recomendamos la visita

	        	var id_usuario = data[0].id_usuario;

	        	$.ajax({
			        type: "POST",
			        url:  "/recomendarVisita",
			        data: { id_visita : id_visita, id_usuario : id_usuario, texto : texto },

			        success: function (data, textStatus, jqXHR) {
			        	location.reload();
			        },
			        error: function(data, textStatus, jqXHR) {
			        	location.reload();
			        }
		    	});
	        },
	        error: function(data, textStatus, jqXHR) {
	        	$('#emailRecomendar').after('<p class="alert alert-danger">Usuario no encontrado.</p>');
	        }
    	});
	};
}

function eliminar(obj){

	var id = obj.id;

	bootbox.confirm("¿Estás seguro?, esta acción no se puede deshacer", function(result){ 
		if(result == true){
		    $.ajax({
		        type: "GET",
		        url:  "/eliminarVisita",
		        data: { id : id },

		        success: function (data, textStatus, jqXHR) {
		        	location.reload();
		        },
		        error: function(data, textStatus, jqXHR) {
		        	alert("Ha ocurrido un error inesperado al intentar borrar tu visita.");
		        }

		    }); 
		}
	});
}

function eliminarRecomendada(obj){
    console.log(obj.id);
    var id = obj.id;

    bootbox.confirm("¿Estás seguro?, esta acción no se puede deshacer", function(result){ 
        if(result == true){
            $.ajax({
                type: "GET",
                url:  "/eliminarVisitaRecomendada",
                data: { id : id },

                success: function (data, textStatus, jqXHR) {
                    location.reload();
                },
                error: function(data, textStatus, jqXHR) {
                    alert("Ha ocurrido un error inesperado al intentar borrar tu visita.");
                }

            }); 
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
                                        "<button id='"+n.id_monumento+"' type='button' data-toggle='tooltip' data-placement='top' title='Ver mapa del sitio' class='btn sp1' onclick='generarMapa(this, this.id,"+n.latitud+", "+n.longitud+")'>"+
                                            "<img onload=this.style.display='block' src='/images/map3.png' width='25' height='25'></img></button>"+
                                        "<button id='"+n.id_monumento+"' type='button' data-toggle='tooltip' data-placement='top' title='Ver descripción del sitio' class='btn sp1' style='margin-left:6px;' onclick='verInfoSitio(this)'>"+
                                            "<img onload=this.style.display='block' src='/images/eye3.png' width='25' height='25' ></img></button>"+       
                                    "</div>"+
                                    "<div class='col-md-2'>"+
                                        "<button type='button' data-toggle='tooltip' data-placement='top' title='Eliminar' class='btn' style='margin-left:2px;'"+
                                            "onclick='eliminarSitioVisita("+id+","+n.id_monumento+")'>"+
                                            "<img src='/images/trash.png' width='25' height='25'></img></button>"+
                                    "</div>"+
                                "<div class='infoSitio border rounded bsp1' id='sitio"+n.id_monumento+"' style='margin-top:6px;'>"+
                                    "<div class='contenidoDesc'>"+
                                        "<p class='font-weight-bold'>Descripcion: </p> <p>"+ n.descripcion +"</p>"+
                                        "<p class='font-weight-bold'>Horario: </p>"+ n.horario +"</p>"+
                                        "<p class='font-weight-bold'>Calle: </p>"+ n.calle +"</p>"+
                                        "<p>Puedes encontrar más información en  <a target='_blank' href='"+n.url+"'> la web del ayuntamiento de Madrid </a>.</p>"+
                                    "</div>"+
                                "</div>"+
                                "</div>"+
                                "<div class='mapCont' id='mapCont"+n.id_monumento+"' style='width:400px; height:300px; display: none;'>"+
                                    "<div class='map' id='map"+n.id_monumento+"'></div>"+
                                "</div>"+
                            "</li>";

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

function botonOjoRecomend(id){
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
                                        "<button id='"+n.id_monumento+"' type='button' data-toggle='tooltip' data-placement='top' title='Ver mapa del sitio' class='btn sp1' onclick='generarMapa(this, this.id,"+n.latitud+", "+n.longitud+")'>"+
                                            "<img onload=this.style.display='block' src='/images/map3.png' width='25' height='25'></img></button>"+
                                        "<button id='"+n.id_monumento+"' type='button' data-toggle='tooltip' data-placement='top' title='Ver descripción del sitio' class='btn sp1' style='margin-left:6px;' onclick='verInfoSitio(this)'>"+
                                            "<img onload=this.style.display='block' src='/images/eye3.png' width='25' height='25' ></img></button>"+       
                                    "</div>"+
                                    "<div class='col-md-2'>"+
                                    "</div>"+
                                "<div class='infoSitio border rounded bsp1' id='sitio"+n.id_monumento+"' style='margin-top:6px;'>"+
                                    "<div class='contenidoDesc'>"+
                                        "<p class='font-weight-bold'>Descripcion: </p> <p>"+ n.descripcion +"</p>"+
                                        "<p class='font-weight-bold'>Horario: </p>"+ n.horario +"</p>"+
                                        "<p class='font-weight-bold'>Calle: </p>"+ n.calle +"</p>"+
                                        "<p>Puedes encontrar más información en  <a target='_blank' href='"+n.url+"'> la web del ayuntamiento de Madrid </a>.</p>"+
                                    "</div>"+
                                "</div>"+
                                "</div>"+
                                "<div class='mapCont' id='mapCont"+n.id_monumento+"' style='width:400px; height:300px; display: none;'>"+
                                    "<div class='map' id='map"+n.id_monumento+"'></div>"+
                                "</div>"+
                            "</li>";

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

function eliminarSitioVisita(id_visita,id_monumento){
    $.ajax({
        type: "POST",
        url:  "/eliminarSitioVisita",
        data: { id_visita: id_visita, id_monumento : id_monumento},

        success: function (data, textStatus, jqXHR) {       
            location.reload();
        },
        error: function(data, textStatus, jqXHR) {
            alert("No se puede eliminar el último lugar de una visita");
        }
    });
}

function botonModificarDescripcion(id_visita){
    alert(id_visita);
}

function verInfoSitio(obj){
    var sitio = "#sitio" + obj.id;

    $(sitio).toggle();
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

function botonAddItem(id){

	$("#nuevaVisita").show();
    $('.alert').remove();

    if(!lugares.includes(id)){
        if(lugares.length < 10){
            lugares.push(id);
            cargarItems(id);
        } else{
            $('#accordion2').after('<p class="alert alert-danger">No se pueden añadir más de 10 sitios.</p>');
        }
    } else{
        $('#accordion2').after('<p class="alert alert-danger">Ya has añadido ese elemento.</p>');
    }
}

function modificarAddLugar(id_visita){
    $(".addLugar").hide();
    $(".modAddLugar").show();

    visita = id_visita;
}

function botonAddModItem(id_monumento){
    var monumento = id_monumento;

    $.ajax({
        type: "POST",
        url:  "/nuevoSitioVisita",
        data: { id_visita: visita, id_monumento : monumento},

        success: function (data, textStatus, jqXHR) {       
            location.reload();
        },
        error: function(data, textStatus, jqXHR) {
            alert("Error al añadir el monumento a la visita");
        }
    });
}

function cargarItems(id_lugar){

    $('#accordion2').html("");

    lugares.forEach(function(k){
    	$.ajax({
            type: "GET",
            url:  "/cargarItems",
            data: { id_lugar : k },

            success: function (data, textStatus, jqXHR) {    	
            	var sitio = $("<div id="+ data[0].id_monumento +" class='card card-museos listaMuseos'>"+
            					"<div class='card-header'>"+
            					   "<h5>"+ data[0].nombre +"<h5>" +
            					"<button id="+ data[0].id_monumento +" onclick='deleteItem(this);' type='button' class='btn btn-success float-right'>- Quitar</button>"+
            					"</div></div>"
     						 );
            	$('#accordion2').append(sitio);
            },
            error: function(data, textStatus, jqXHR) {
                $('#tituloVisita').after('<p class="alert alert-danger">Error al intentar cargar uno o más elementos.</p>');
            }

        });
    });
}

function deleteItem(obj) {
    var id = obj.id;

    $(obj).parent().parent().parent().remove();

    lugares = lugares.filter(e => e != id);
}

function validarVisita(){

	var titulo = document.getElementsByName("tituloVisita")[0].value;
	var descripcion = document.getElementsByName("breveDesc")[0].value;
	var validar = true;

	$('.alert').remove();

	//Validaciones del título:
	if(titulo == ""){
		$('#tituloVisita').after('<p class="alert alert-danger">Debes introducir un título válido.</p>');
		validar = false;
	} else if (titulo.length > 40){
		$('#tituloVisita').after('<p class="alert alert-danger">El título es demasiado largo.</p>');
		validar = false;
	};

	//Validaciones de lugares:
	if (lugares.length < 1){
		$('#accordion2').after('<p class="alert alert-danger">Debes introducir al menos un lugar a visitar.</p>');
		validar = false;
	} else if (lugares.length > 9){
		$('#accordion2').after('<p class="alert alert-danger">Has introducido demasiados lugares.</p>');
		validar = false;
	}

	//Validaciones de descripcion
	if (descripcion.length < 20){
		$('#breveDesc').after('<p class="alert alert-danger">Introduce una descripción.</p>');
		validar = false;
	}

	if(!validar){
		$('#botonCrear').after('<p class="alert alert-danger">No has rellenado alguno de los campos clave</p>');
	} else{
		crearVisita();
	}
}

function crearVisita(){
	var museos = [];

	$('.listaMuseos').each(function () {          
        museos.push($(this).attr('id'));
    });
	var tituloVisita = document.getElementsByName("tituloVisita")[0].value;
	var tag1 = document.getElementsByName("tag1")[0].value;
	var tag2 = document.getElementsByName("tag2")[0].value;
	var tag3 = document.getElementsByName("tag3")[0].value;
	var desc = document.getElementsByName("breveDesc")[0].value;

	$.ajax({
        type: "POST",
        url:  "/crearVisita",
        data: { 
        	museos : museos, 
        	tituloVisita : tituloVisita, 
        	tag1 : tag1, 
        	tag2 : tag2, 
        	tag3 : tag3, 
        	desc : desc 
        },

        success: function (data, textStatus, jqXHR) {    
        	window.location.reload()	
        },
        error: function(data, textStatus, jqXHR) {
        }

    });
}

function cargarSitios(){

    $.ajax({
        type: "GET",
        url:  "/listarMuseos",

        success: function (data, textStatus, jqXHR) {       
            data.forEach(function (n) {

                var museo2 = $("<div id="+ n.id_monumento +" class='card card-museos'>" +
                             "<div class='card-header' id='heading"+n.id_monumento+"'>" +
                             "<h5 class='mb-0'>" + 
                                 "<button class='btn btn-link collapsed' data-toggle='collapse' data-target='#collapse"+n.id_monumento+"' aria-expanded='false'"+
                                 "aria-controls='collapseTwo'>" + n.nombre + "</button>" +
                                 "<button id='addLugar' type='button' data-dismiss='modal' onclick='botonAddItem("+n.id_monumento+");' class='addLugar btn btn-success float-right'>+ Añadir</button>" +
                                 "<button id='modAddLugar' type='button' data-dismiss='modal' onclick='botonAddModItem("+n.id_monumento+");' class='modAddLugar btn btn-primary float-right'>+ Añadir</button>" +
                             "</h5>" +
                             "</div>" +
                             "<div id='collapse"+n.id_monumento+"' class='collapse' aria-labelledby='heading"+n.id_monumento+"' data-parent='#accordion'>" +
                             "<div class='card-body'>"  +
                                "<p>Dirección: " + n.calle + "</p>" +
                                "<p>Mas info en: <a target='_blank' href='"+n.url+"'> OpenDataMadrid </a></p>" +
                                "<a class='btn btn-primary sp1' data-toggle='collapse' href='#collapseDesc" + n.id_monumento + "' role='button' aria-expanded='false' aria-controls='collapseExample'>ver descripcion</a>" +
                                "<div class='collapse' id='collapseDesc"+ n.id_monumento +"'>" +
                                    "<div class='card card-body'><em>" + n.descripcion + "</em></div></div>" +
                             "</div></div></div></div>"
                             );

                $('#listadoMuseos').append(museo2);
            });
            //Ocultamos los botones de añadir por defecto.
            $(".addLugar").hide();
            $(".modAddLugar").hide();

        },
        error: function(data, textStatus, jqXHR) {
        }

    });

    $.ajax({
        type: "GET",
        url:  "/listarTemplos",

        success: function (data, textStatus, jqXHR) {       
            data.forEach(function (n) {

                var templo = $("<div id="+ n.id_monumento +" class='card card-templos'>" +
                             "<div class='card-header' id='heading"+n.id_monumento+"'>" +
                             "<h5 class='mb-0'>" + 
                                 "<button class='btn btn-link collapsed' data-toggle='collapse' data-target='#collapse"+n.id_monumento+"' aria-expanded='false'"+
                                 "aria-controls='collapseTwo'>" + n.nombre + "</button>" +
                                 "<button id='addLugar' type='button' data-dismiss='modal' onclick='botonAddItem("+n.id_monumento+");' class='addLugar btn btn-success float-right'>+ Añadir</button>" +
                                 "<button id='modAddLugar' type='button' data-dismiss='modal' onclick='modificarAddLugar("+n.id_monumento+");' class='modAddLugar btn btn-primary float-right'>+ Añadir</button>" +
                             "</h5>" +
                             "</div>" +
                             "<div id='collapse"+n.id_monumento+"' class='collapse' aria-labelledby='heading"+n.id_monumento+"' data-parent='#accordion'>" +
                             "<div class='card-body'>"  +
                                "<p>Dirección: " + n.calle + "</p>" +
                                "<p>Mas info en: <a target='_blank' href='"+n.url+"'> OpenDataMadrid </a></p>" +
                                "<a class='btn btn-primary sp1' data-toggle='collapse' href='#collapseDesc" + n.id_monumento + "' role='button' aria-expanded='false' aria-controls='collapseExample'>ver descripcion</a>" +
                                "<div class='collapse' id='collapseDesc"+ n.id_monumento +"'>" +
                                    "<div class='card card-body'><em>" + n.descripcion + "</em></div></div>" +
                             "</div></div></div></div>"
                             );

                $('#listadoIglesias').append(templo);
            });
            //Ocultamos los botones de añadir por defecto.
            $(".addLugar").hide();
            $(".modAddLugar").hide();

        },
        error: function(data, textStatus, jqXHR) {
        }

    });

    $.ajax({
        type: "GET",
        url:  "/listarEdificioM",

        success: function (data, textStatus, jqXHR) {       
            data.forEach(function (n) {

                var EdificioM = $("<div id="+ n.id_monumento +" class='card card-EdificioM'>" +
                             "<div class='card-header' id='heading"+n.id_monumento+"'>" +
                             "<h5 class='mb-0'>" + 
                                 "<button class='btn btn-link collapsed' data-toggle='collapse' data-target='#collapse"+n.id_monumento+"' aria-expanded='false'"+
                                 "aria-controls='collapseTwo'>" + n.nombre + "</button>" +
                                 "<button id='addLugar' type='button' data-dismiss='modal' onclick='botonAddItem("+n.id_monumento+");' class='addLugar btn btn-success float-right'>+ Añadir</button>" +
                                 "<button id='modAddLugar' type='button' data-dismiss='modal' onclick='modificarAddLugar("+n.id_monumento+");' class='modAddLugar btn btn-primary float-right'>+ Añadir</button>" +
                             "</h5>" +
                             "</div>" +
                             "<div id='collapse"+n.id_monumento+"' class='collapse' aria-labelledby='heading"+n.id_monumento+"' data-parent='#accordion'>" +
                             "<div class='card-body'>"  +
                                "<p>Dirección: " + n.calle + "</p>" +
                                "<p>Mas info en: <a target='_blank' href='"+n.url+"'> OpenDataMadrid </a></p>" +
                                "<a class='btn btn-primary sp1' data-toggle='collapse' href='#collapseDesc" + n.id_monumento + "' role='button' aria-expanded='false' aria-controls='collapseExample'>ver descripcion</a>" +
                                "<div class='collapse' id='collapseDesc"+ n.id_monumento +"'>" +
                                    "<div class='card card-body'><em>" + n.descripcion + "</em></div></div>" +
                             "</div></div></div></div>"
                             );

                $('#listadoMonumentos').append(EdificioM);
            });
            //Ocultamos los botones de añadir por defecto.
            $(".addLugar").hide();
            $(".modAddLugar").hide();

        },
        error: function(data, textStatus, jqXHR) {
        }

    });

    //Ocultamos los siitos por defecto.
    ocultarSitios();
}

function ocultarSitios(){
    $("#listadoMuseos").hide();
    $("#listadoIglesias").hide();
    $("#listadoMonumentos").hide();
}

function mostrarListaTemplos(){
    $("#listadoIglesias").show();
}

function mostrarListaMuseos(){
    $("#listadoMuseos").show();
}

function mostrarListaMonumentos(){
    $("#listadoMonumentos").show();
}

function ocultarListaTemplos(){
    $("#listadoIglesias").hide();
}

function ocultarListaMuseos(){
    $("#listadoMuseos").hide();
}

function ocultarListaMonumentos(){
    $("#listadoMonumentos").hide();
}

function mostrarBotonAnadir(){
    $(".addLugar").show();
    $(".modAddLugar").hide();
}
