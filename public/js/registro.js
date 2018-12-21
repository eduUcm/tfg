"use strict";

$(document).ready(function() {

	//REGISTRO
	$('#miFormulario input').on('keyup blur', function () { // fires on every keyup & blur
        if ($('#miFormulario').valid()) {                   // checks form for validity
            $('button.btn').prop('disabled', false);        // enables button
        } else {
            $('button.btn').prop('disabled', 'disabled');   // disables button
        }
    });
	
	$('#miFormulario').validate({
		rules:{
			email:{
				required: true,
				email: true
			},
			nick:{
				required: true,
			},
			nombre:{
				required: true,
			},
			password:{
				required: true,
				minlength: 6
			},
			confirm_password:{
				required: true,
				equalTo: '#password'
			}
		},
		messages:{
			email: "Introduce una dirección de correo válida",
			nick: "Introduce un nick",
			nombre: "Introduce un nombre",
			password:{
				required: "Introduce una contraseña",
				minlength: "La contraseña debe tener como mínimo 6 caracteres"
			},
			confirm_password:{
				required: "Introduce la misma contraseña",
				equalTo: "Las contraseñas no coinciden"
			}
		}
	});

	//document.getElementById("crearUsuario").disabled = true; 


});
