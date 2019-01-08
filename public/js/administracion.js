"use strict";

$(document).ready(function() {
	$("#botonBuscar").on("click", botonBuscar);

	$("#textoBuscar").keyup(function(event) {
	    if (event.keyCode === 13) {
	        $("#botonBuscar").click();
	    }
	});

	$("#botonListar").on("click", botonListar);
	$("#tablaUsuarios").hide();
	$("#tablaUsuarios tbody").html("");

	mostrarEstadisticas();
});


function botonBuscar() {
    var cadena;

    $('.alert').remove();

    cadena = $("#textoBuscar").val();

    if(cadena.length != ''){
	    $.ajax({
	        type: "POST",
	        url:  "/buscarUsuario",
			data: { cadena },

	        success: function (data, textStatus, jqXHR) {
	        	$("#tablaUsuarios").show();
	        	$("#tablaUsuarios tbody").html("");
	        	$("#tablaUsuarios thead").html("");
	        	$("#tablaUsuarios tr").remove(); 

	        	var head = "<tr><th> Nick </th><th> Nombre </th> <th> Apellidos </th><th> Email </th></tr>";
	        	$('#tablaUsuarios thead').append(head); 
	            data.forEach(function (n) {
	            	
	                var nuevaTupla = $("<tr id="+ n.id_usuario +"><td>" + n.nick + "</td><td>" + n.nombre + "</td><td>" + n.apellidos + "</td><td>" + n.email + "</td>");
	                $('#tablaUsuarios tbody').append(nuevaTupla); 
	                $(nuevaTupla).on("click", verInfoUsuario);
	            });        	
	        },
	        error: function(data, textStatus, jqXHR) {
	        	$("#tablaUsuarios tbody").html("");
	        	$("#tablaUsuarios thead").html("");
	        	$('#buscador').after('<p class="alert alert-danger alertmsj">Ningun usuario encontrado</p>');
	        }

	    });
	}else{
		alert("Introduce una cadena valida");
	}
}

function botonListar(){
   	$.ajax({
	    type: "GET",
	    url:  "/listarUsuarios",

	    success: function (data, textStatus, jqXHR) {
	    	$("#tablaUsuarios").show();
	    	$("#tablaUsuarios tbody").html("");
	    	$("#tablaUsuarios thead").html("");
	    	$("#tablaUsuarios tr").remove(); 

	    	var head = "<tr><th> Nick </th><th> Nombre </th> <th> Apellidos </th><th> Email </th><th> Activo </th></tr>";
	        $('#tablaUsuarios thead').append(head); 
	    	
	        data.forEach(function (n) {
	        	if(n.activo == 1){
	            	var nuevaTupla = $("<tr id="+ n.id_usuario +"><td>" + n.nick + "</td><td>" + n.nombre + "</td><td>" + n.apellidos + "</td><td>" + n.email + "</td><td>SI</td></tr>");
	           	} else{
	           		var nuevaTupla = $("<tr class='table-warning' id="+ n.id_usuario +"><td>" + n.nick + "</td><td>" + n.nombre + "</td><td>" + n.apellidos + "</td><td>" + n.email + "</td><td>NO</td></tr>");
	           	}
	            $('#tablaUsuarios tbody').append(nuevaTupla); 
				$(nuevaTupla).on("click", verInfoUsuario);
	        });        	
	    },
	    error: function(data, textStatus, jqXHR) {
	    	$("#tablaUsuarios").hide();
	    }

	});
}

function verInfoUsuario(){
	//Limpiamos modal:
	$("#contenidoVisitas").html("");
	$("#contenidoHeader").html("");
	$("#contenidoFooter").html("");

	//obtenemos variables de usuario
	var nick = this.cells[0].textContent;
	var nombre = this.cells[1].textContent;
	var apellidos = this.cells[2].textContent;
	var email = this.cells[3].textContent;
	var activo = this.cells[4].textContent;

	//Creamos header
	var modalHead = '<h5 class="modal-title tsp1">Usuario: '+nick+'</h5>';
						
	$('#contenidoHeader').append(modalHead); 
	
	//Creamos cuerpo
   	$.ajax({
	    type: "GET",
	    url:  "/listarVisitasUsuario",
	    data: { id : this.id},

	    success: function (data, textStatus, jqXHR) {
	    	data.forEach(function(n){
                //CABECERA
                //Li con cada monumento
                var visita = "<li id='visita"+ n.id_visita +"' class='list-group-item'>" +
                                "<div class='row'>"+
                                    "<div class='col-md-10'>"+
                                        "<h5 class='tituloVisita'>"+ n.titulo +"</h5>"+
                                        "<p class='card-text'><small class='text-muted'>valoración: "+n.puntuacion+" ("+n.votos+" votos)</small></p>"+
                                    "</div>"+
                                    "<div class='col-md-2 justify-content-end d-flex'>"+
                                        "<button id="+n.id_visita+" type='button' class='btn' onclick='eliminarVisita(this.id)'>"+
                                        "<img src='/images/trash.png' width='25' height='25'></img></button>"+
                                    "</div>" +
                                "</div>"+    
                            "</li>";

                $('#contenidoVisitas').append(visita);
	    	});
	    },
	    error: function(data, textStatus, jqXHR) {
	    	var modalContenido = "El usuario no tiene visitas asociadas";
	    	$('#contenidoVisitas').append(modalContenido); 
	    }
	});

   	console.log(activo);
   	//Creamos footer
   	if( activo == "SI"){
	   	var modalFooter = 	'<div class="row col-12">'+
	   							'<div class="col-3">'+
									'<button id='+this.id+' onclick="botonEliminarUsuario(this.id)"" type="button" class="btn btn-secondary sp1">Eliminar Usuario</button>'+
								'</div>'+
								'<div class="col-9 justify-content-end d-flex">'+
									'<button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>'+
								'</div>'+
							'</div>';
	} else if ( activo == 'NO') {
	   	var modalFooter = 	'<div class="row col-12">'+
							'<div class="col-3">'+
							'<button id='+this.id+' onclick="botonActivarUsuario(this.id)"" type="button" class="btn btn-secondary sp1">Reactivar Usuario</button>'+
						'</div>'+
						'<div class="col-9 justify-content-end d-flex">'+
							'<button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>'+
						'</div>'+
					'</div>';
	}

	$('.modal-footer').append(modalFooter); 

	mostrarModal();	
}

function eliminarVisita(id){

	alert(id);
}

function botonEliminarUsuario(id){
	bootbox.confirm("¿Estás seguro?", function(result){ 
		if(result == true){
		    $.ajax({
		        type: "POST",
		        url:  "/eliminarUsuario",
		        data: { id : id },

		        success: function (data, textStatus, jqXHR) {
		        	location.reload();
		        },
		        error: function(data, textStatus, jqXHR) {
		        	alert("Ha ocurrido un error inesperado al intentar eliminar al usuario.");
		        }

		    }); 
		}
	});
}

function botonActivarUsuario(id){
	bootbox.confirm("¿Estás seguro?", function(result){ 
		if(result == true){
		    $.ajax({
		        type: "POST",
		        url:  "/activarUsuario",
		        data: { id : id },

		        success: function (data, textStatus, jqXHR) {
		        	location.reload();
		        },
		        error: function(data, textStatus, jqXHR) {
		        	alert("Ha ocurrido un error inesperado al intentar reactivar al usuario.");
		        }

		    }); 
		}
	});
}

function verInfoSitio(obj){
    var sitio = "#sitio" + obj.id;

    $(sitio).toggle();
}

function mostrarModal(){
	$('#modalInfoUsuario').modal();
}

function mostrarEstadisticas(){
	var usuariosTotales, visitasTotales, sistiosTotales;
	var sitioMasPopular, visitaMasPopular;
	var visitasTotalesPopular = "(";

	$.ajax({
	        type: "GET",
	        url:  "/obtenerDatosEstadisticas",

	        success: function (data, textStatus, jqXHR) {  
	        	usuariosTotales = data[0];
	        	visitasTotales = data[1];
	        	sistiosTotales = data[2];
	        	sitioMasPopular = data[3];
	        	visitaMasPopular = data[4].titulo;
	        	visitasTotalesPopular += data[4].total;
	        	visitasTotalesPopular += " visitas)";


	        	$('#usuariosRegistrados').append(usuariosTotales); 
				$('#visitasCreadas').append(visitasTotales);
				$('#sitiosDisponibles').append(sistiosTotales);
				$('#sitioPopular').append(sitioMasPopular);
				$('#visitaPopular').append(visitaMasPopular);
				$('#estVisitas').append(visitasTotalesPopular);
				
	        },
	        error: function(data, textStatus, jqXHR) {

	        }

	});

}
