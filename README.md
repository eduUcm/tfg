# tfg - Madrid Turismo

## Descripción

TFG sobre desarrollo web con Node.js centrado en un portal web que permite a los usuarios crear visitas centradas
en los diferentes sitios (museos, templos, edificios, jardines, etc) de la ciudad de Madrid. 

Toda la información es obtenida en tiempo real a través de conexiones con distintas APIS, como [OPENDATA MADRID](https://datos.madrid.es/portal/site/egob/menuitem.9e1e2f6404558187cf35cf3584f1a5a0/?vgnextoid=374512b9ace9f310VgnVCM100000171f5a0aRCRD&vgnextchannel=374512b9ace9f310VgnVCM100000171f5a0aRCRD&vgnextfmt=default)
de modo que la información añadida manualmente a la BBDD es inexistente.

## Guía de instalación de la aplicación web

A continuación se enumeran los distintos pasos que se han de seguir para la correcta instalación de la aplicación en local:

### 1 - Prerrequisitos

Estas son las aplicaciones/utilidades que necesita:

 - **Node.js** - [v8.12.0 o superior] - La aplicación ha sido desarrollada íntegramente en la versión 8.12.0 de node, no obstante debería 
                                      ser compatible con cualquier versión superior. Puedes encontrar el enlace en la [página principal de Node](https://nodejs.org/dist/latest-v8.x/).
 - **phpMyAdmin** - [4.8.4]
 - **MariaDB** - [10.1.37]
 - **Apache** - [2.4.2]
 - **Navegador Web** - [cualquier versión de Chrome o Firefox compatible con las últimas versiones de Jquery y Bootstrap.]
 
 [**Nota:** Para la gestión de los servidores de MySQL y Apache recomendamos el uso de [XAMPP](https://www.apachefriends.org/es/index.html), el cual ha sido utilizado durante el desarrllo.]
 
 ### 1 - Instalación
 
 Una vez se cumplan los prerrequisitos anteriores podemos empezar con la guía de instalación:
 
  - **Paso 1:** Descargar el código del proyecto, que se encuentra en esta misma página. 
  
  - **Paso 2:** Abrir la consola de comandos de Node (Node.js command prompt) la cual se creará automáticamente en: 
                
                C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Node.js
                
       También puede accederse a ella mediante el buscador de windows indicando la palabra: node, como muestra
       la imagen a continuación:
   
              ![alt text](https://gyazo.com/983fa0756b5c67245b6dcac2355a2271)
              
       Alternativamente si tienes problemas encontrando el acceso directo, o no se te ha creado, puedes acerlo manualmente:
       
            - Ejecuta el símbolo del sistema (cmd).
            - Introduce los siguientes comandos:
                -cd C:\Program Files\nodejs
                -nodevars.bat
            -Esa misma consola ya estará prepara para funcionar con Node.
            
  - **Paso 3:** Localizar el proyecto en la consola de comandos que hemos abierto en el paso 2.   
  
  - **Paso 4:** Ejecutar el scrip de instalación de dependencias:  
  
                npm run pre-install
                
  - **Paso 5:** Ejecutar el scrip de inicio:  
  
                npm run start
 
       Nota: Para el correcto funcionamiento del servidor se utiliza nodemon, el cual se instalará en el paso 4.
            
