"use strict";

$(document).ready(function() {

  $(".botonRegistrado").hide();

  usuarioAutenticado();

});

function usuarioAutenticado(){
    //LOGGED
    $.ajax({
        type: "GET",
        url: "/comprobarUsuario",  

        success: function (data, textStatus, jqXHR) {
            document.getElementById("nickUsuario").innerHTML = data.nick;
            document.getElementById("nombreUsuario").innerHTML = data.nombre;
            document.getElementById("correoUsuario").innerHTML = data.email;
            if(data.rol == "user"){
                $("#botonLoginNav").hide();
                $("#botonVisitasNav").show();
                $("#botonUnlogNav").show();
            } else if (data.rol == "admin"){
                $("#botonLoginNav").hide();
                $("#botonAdmin").show();
                $("#botonUnlogNav").show();
            }
        },

        error: function(data, textStatus, jqXHR) {
            $("#botonLoginNav").show();
            $("#botonUnlogNav").hide();
            $("#botonVisitasNav").hide();
        }
    });
}