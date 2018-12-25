"use strict";

//Código para la gestión de la Base de datos
class ConexionBD {
	constructor(pool) {
        this.pool = pool;
    }

    comprobarLogin(email, password, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM tfg.usuarios WHERE email=? AND pass=? AND activo = 1", [email, password], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            console.log(result);
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    insertarUsuario(usuario, callback) {
        if (usuario.correo !== '' && usuario.pass !== '') {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    callback(err);
                }
                connection.query("INSERT INTO usuarios(nick, nombre, pass, email, apellidos, rol) VALUES (?, ?, ?, ?, ?, ?)", 
                [usuario.nick, usuario.nombre, usuario.pass, usuario.correo,  usuario.apellidos, usuario.rol], (err) => {
                    if (err) {
                        connection.release();
                        callback(err);
                    } else {
                        connection.release();
                        callback(null);
                    }
                });
            });
        } else {
            callback(null);
        }
    }

    buscarUsuario(cadena, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            }
            connection.query("SELECT * FROM usuarios WHERE email like ?", 
            ['%' + cadena + '%'], (err, result) => {
                if (err) {
                    connection.release();
                    callback(err);
                } else {
                    connection.release();
                    callback(null, result);
                }
            });
        });
    }

    listarUsuarios(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            }
            connection.query("SELECT id_usuario, nick, nombre, apellidos, email, rol, activo FROM usuarios", 
            [], (err, result) => {
                if (err) {
                    connection.release();
                    callback(err);
                } else {
                    connection.release();
                    callback(null, result);
                }
            });
        });
    }

    buscarVisita(cadena, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            }
            connection.query("SELECT * FROM visitas2 WHERE titulo like ? OR descripcion like ? GROUP BY id_visita LIMIT 5", 
            ['%' + cadena + '%', '%' + cadena + '%'], (err, result) => {
                if (err) {
                    connection.release();
                    callback(err);
                } else {
                    if(result.length === 0) {
                        callback(null);
                    } else {
                        callback(null, result);
                    } 
                }
            });
        });
    }

    buscarTituloVisita(titulo, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM tfg.visitas2 WHERE titulo=?", [titulo], (err, result) => {
                    if (err) {
                        connection.release();
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    buscarUsuarioEmail(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM usuarios WHERE email=?", [email], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    insertarVisita(data, museo, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("INSERT INTO visitas2(id_visita, id_autor, id_monumento, titulo, recomendada, dia_visita, fechaCreacion, num_visitas, num_descargas, tag1, tag2, tag3, descripcion) VALUES (?,?,?,?,?,?,?,0,0,?,?,?,?)",
                [data.id_visita, data.id_autor, museo, data.titulo, data.recomendada, data.diaVisita, data.fechaCreacion, data.tag1, data.tag2, data.tag3, data.breveDesc], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    recomendarVisita(datos, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("INSERT INTO visitas_recomendadas(id_visita, id_autor, id_usuarioDestino, texto) VALUES (?,?,?,?)",
                [datos.id_visita, datos.id_autor, datos.id_usuario, datos.texto], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    obtenerIDvalidoVisita(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT MAX(id_visita)+1 AS idvalido FROM visitas2", (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    listarVisitas(id_autor, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM visitas2 WHERE id_autor=? GROUP BY id_visita ORDER BY fechaCreacion DESC",
                [id_autor], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    listarVisitasRecomendadas(id_usuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM visitas2 WHERE id_visita IN (SELECT id_visita FROM visitas_recomendadas WHERE id_usuarioDestino=?) GROUP BY id_visita",
                [id_usuario], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    listarVisitasPuntuacion(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM visitas2 GROUP BY id_visita ORDER BY puntuacion DESC LIMIT 10", (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    eliminarVisita(id_visita, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("DELETE FROM visitas2 WHERE id_visita=?",
                [id_visita], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    eliminarVisitaRecomendada(datos, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("DELETE FROM visitas_recomendadas WHERE id_visita=? AND id_usuarioDestino=?",
                [datos.id_visita, datos.id_usuario], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    /*
        CONSULTAS PARA INSERTAR LA INFORMACION VIA API
    */
    comprobarSitio(nombre, tipo, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT id_monumento FROM monumentos WHERE nombre=? AND tipo=?", [nombre, tipo], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    insertarSitio(sitio, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("INSERT INTO monumentos(tipo, nombre, url, codigoPostal, calle, latitud, longitud, descripcion, horario) VALUES (?,?,?,?,?,?,?,?, ?)",
                [sitio.tipo ,sitio.nombre, sitio.url, sitio.postal, sitio.calle, sitio.lat, sitio.long, sitio.descripcion, sitio.horario], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    obtenerInfoMonumentoId(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM monumentos WHERE id_monumento=?",
                [id], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    listarSitios(tipo, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM monumentos WHERE tipo=? ORDER BY puntuacion DESC, votos DESC",
                [tipo], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    obtenerVotos(id_sitio, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT puntuacion, votos FROM monumentos WHERE id_monumento=?",
                [id_sitio], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    obtenerVotosVisita(id_visita, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT puntuacion, votos FROM visitas2 WHERE id_visita=? LIMIT 1",
                [id_visita], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    insertarVoto(datosVoto, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("UPDATE monumentos SET puntuacion=?, votos=? WHERE id_monumento=?",
                [datosVoto.media, datosVoto.votos, datosVoto.id_sitio], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    insertarVotoVisita(datosVoto, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("UPDATE visitas2 SET puntuacion=?, votos=? WHERE id_visita=?",
                [datosVoto.media, datosVoto.votos, datosVoto.id_visita], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    listarSitiosAll(tipo, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM monumentos ORDER BY puntuacion DESC, votos DESC",
                [tipo], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    buscarInfoSitioID(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM monumentos WHERE id_monumento IN (SELECT id_monumento FROM `visitas2` WHERE id_visita=?)",
                [id], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    buscarSitio(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM monumentos WHERE id_monumento=?",
                [id], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    listarComentariosVisita(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                //connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM comentarios WHERE id_visita=?",
                [id], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    insertarComentario(datosComentario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("INSERT INTO comentarios(id_visita, texto, nick_autor, fecha) VALUES (?,?,?,?)",
                [datosComentario.id, datosComentario.texto, datosComentario.user, datosComentario.fecha], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            callback(null);
                        } else {
                            callback(null, result);
                        } 
                    }
                });
            }
        });
    }

    eliminarComentario(id_comentario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("DELETE FROM comentarios WHERE id_comentario=?", [id_comentario], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {                        
                        callback(null, result);
                    }
                });
            }
        });
    }

    eliminarUsuario(id_usuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("UPDATE usuarios SET activo = 0 WHERE id_usuario = ?", [id_usuario], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {                        
                        callback(null, result);
                    }
                });
            }
        });
    }

    activarUsuario(id_usuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("UPDATE usuarios SET activo = 1 WHERE id_usuario = ?", [id_usuario], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {                        
                        callback(null, result);
                    }
                });
            }
        });
    }

}

module.exports = {
    ConexionBD: ConexionBD
}