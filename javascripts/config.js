$(document).ready(function () {
    
    //****** AMBIENTES DE DESARROLLO */
    //
    // 0: LOCAL, 
    // 1: PRODUCCION
    // 2: DESARROLLO
    // 3: CANDIDATE
    // 4: INTEGRACIÓN
    //
    //********************************
    
    var ambiente = 4;
    var _VERBOSE = true;
    
    var modulo = 2; // modulo index
    var url_front;
    var url_api;
    var url_nicho;
    var url_comunidad;

    // se guardan cookies para enviarlas a comunidad y nicho
    if (localStorage.getItem("url_front")) {
                
        url_front = localStorage.getItem("url_front");
        url_api = localStorage.getItem("url_api");
        url_nicho = localStorage.getItem("url_nicho");
        url_comunidad = localStorage.getItem("url_comunidad");

    } else {

        if (ambiente === 0) {

            url_front = "http://localhost/species-front";
            url_api = "http://localhost:8080";

        } else if (ambiente === 1) {

            url_front = "http://species.conabio.gob.mx";
            url_api = "http://species.conabio.gob.mx/api";

        } else if (ambiente === 2) {

            url_front = "http://species.conabio.gob.mx/dev";
            url_api = "http://species.conabio.gob.mx/api-dev";

        }
        // la version candidate tiene el front de dev y trabaja con el middleware de produccion
        else if (ambiente === 3) {

            url_front = "http://species.conabio.gob.mx/candidate";
            url_api = "http://species.conabio.gob.mx/api-rc";

        }
        // la version integracion tiene el front de dev y trabaja con el middleware de la base stable de manati
        else if (ambiente === 4) {

            url_front = "http://species.conabio.gob.mx/integracion";
            url_api = "http://species.conabio.gob.mx/api-db-integracion";

        } else {

            url_front = "http://localhost/species-front";
            url_api = "http://localhost:8080";

        }

        url_nicho = url_front + "/geoportal_v0.1.html";
        url_comunidad = url_front + "/comunidad_v0.1.html";
        
        localStorage.clear();
        localStorage.url_front = url_front;
        localStorage.url_api = url_api;
        localStorage.url_nicho = url_nicho;
        localStorage.url_comunidad = url_comunidad;
        localStorage.ambiente = ambiente;
        localStorage.verbose = _VERBOSE;
        
    }
    
    _VERBOSE ? console.log("url_front: " + url_front) : _VERBOSE;
    _VERBOSE ? console.log("url_api: " + url_api) : _VERBOSE;
    _VERBOSE ? console.log("url_nicho: " + url_nicho) : _VERBOSE;
    _VERBOSE ? console.log("url_comunidad: " + url_comunidad) : _VERBOSE;
    _VERBOSE ? console.log("modulo: " + modulo) : _VERBOSE;
    _VERBOSE ? console.log("verbose: " + _VERBOSE) : _VERBOSE;

    module_index.startModule(modulo);

});
