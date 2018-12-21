"use strict";

$(document).ready(function() {
    cargarVisitas();
    ocultarElementos();
    $("#botonFiltrar").on("click", mostrarFiltro);
    filtro();
    filtroBusqueda();
});



function ocultarElementos(){
    $("#filtro").hide();
}

function mostrarFiltro(){
    $("#filtro").show();
}

function filtro(){
    if (checkboxMuseo.checked){
        $('.Museo').hide();
    } else {
        $('.Museo').show();
    }
    
    if (checkboxTemplo.checked){
        $('.TemploC').hide();
    } else {
        $('.TemploC').show();
    }

    if (checkboxMonumento.checked){
        $('.edificioM').hide();
    } else {
        $('.edificioM').show();
    }
}

function filtroBusqueda(){
    $("#myInput").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#myList li").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
  });
}

function botonOjo(id){
    $.ajax({
        type: "POST",
        url:  "/obtenerInfoMonumentoId",
        data: { id : id },

        success: function (data, textStatus, jqXHR) {

            var miModal = "modalMonu"+id;

            $('#miModal').modal()
        },
        error: function(data, textStatus, jqXHR) {
            alert("fallo");
        }
    });
}


function cargarVisitas(){
    $.ajax({
        type: "GET",
        url:  "/listarSitios",

        success: function (data, textStatus, jqXHR) {
            data.forEach(function (n) {

                //Li con cada monumento
                var museo = "<li id='monu"+ n.id_monumento +"' class='list-group-item "+ n.tipo +"'>" +
                                "<div class='row'>"+
                                    "<div class='col-md-10'>"+
                                        "<h5>"+ n.nombre +"</h5>"+
                                        "<p class='card-text'><small class='text-muted'>valoración: "+n.puntuacion+" ("+n.votos+" votos)</small></p>"+
                                    "</div>"+
                                    "<div class='col-md-2'>"+
                                        "<button id="+n.id_monumento+" type='button' class='btn' data-toggle='modal' data-target='#modalMonu"+n.id_monumento+"'"+
                                        "onclick='botonOjo(this.id)'>"+
                                        "<img src='/images/eye.png' width='25' height='25'></img></button>"+
                                    "</div>" +
                                "</div>"+    
                            "</li>";

                //Modal asociado a cada Li de cada monumento
                var infoMonumento = "<div id='modalMonu"+n.id_monumento+"' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>"+
                                        "<div class='modal-dialog modal-lg'>"+
                                            "<div class='modal-content'>"+
                                                "<div class='modal-header'>"+
                                                    "<h4>"+n.nombre+"</h4>"+
                                                    "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>"+
                                                        "<span aria-hidden='true'>&times;</span>"+
                                                    "</button>"+
                                                "</div>"+
                                                "<div class='modal-body'>"+
                                                    "<p>Descripcion: "+n.descripcion+"</p>"+
                                                    "<p>Localizacion: "+n.calle+"</p>"+
                                                    "<hr><div class='row col-md-12'>"+
                                                        "<div class='col-md-3'>"+
                                                            "<h5>Valora este sitio:</h5>"+
                                                        "</div>"+
                                                    "<div class='input-group mb-3 col-md-5'>"+
                                                        "<div class='input-group-prepend'>"+ 
                                                            "<label class='input-group-text' for='inputGroupSelect01'><img src='/images/thumbs-up.jpg' width='25' height='24'></img></label>"+
                                                        "</div>"+
                                                        "<select class='custom-select' id='inputGroupSelect"+n.id_monumento+"'>"+
                                                            "<option selected>Elige una opción</option>"+
                                                            "<option value='1'>★ - Muy malo.</option>"+
                                                            "<option value='2'>★★ - Bastante malo.</option>"+
                                                            "<option value='3'>★★★ - Aceptable</option>"+
                                                            "<option value='4'>★★★★ - Bastante bueno</option>"+
                                                            "<option value='5'>★★★★★ - Impresionante</option>"+
                                                        "</select>"+
                                                    "</div>"+
                                                    "<div class='col-md-4'>"+
                                                        "<button id="+n.id_monumento+" class='btn sp1' onclick='botonValoracion(this.id)'>Enviar valoracion</button>"+
                                                    "</div>"+
                                                "</div>"+
                                            "</div>"+
                                        "</div>"+
                                    "</div>";

                $('#myList').append(museo);
                $('#myList').append(infoMonumento);
            });

            

        },
        error: function(data, textStatus, jqXHR) {
            var errorMuseo = "<li class='list-group-item'>" +
                                "<div class='row'>"+
                                    "<div class='col-md-10'>"+
                                        "<h5>No se encontraron monumentos en el servidor</h5>"+
                                    "</div>"+
                                "</div>"+    
                            "</li>";
            $('#myList').append(errorMuseo);
        }
    });
}

function botonValoracion(id){
    var elem = 'inputGroupSelect' + id;
    var e = document.getElementById(elem);
    var voto = e.options[e.selectedIndex].value;


    $.ajax({
        type: "POST",
        url:  "/votarSitio",
        data: { id : id , voto : voto},

        success: function (data, textStatus, jqXHR) {
            $("#mensajes").prepend("<p class='text-success mensj'>Voto contabilizado correctamente!</p>"); 
            $('.modal').modal('hide');   
        },
        error: function(data, textStatus, jqXHR) {
            $("#mensajes").prepend("<p class='text-danger mensj'>No puedes votar otra vez!</p>");
            $('.modal').modal('hide');
        }
    });
    setTimeout(function(){
        $('.mensj').remove();
    }, 5000);
}