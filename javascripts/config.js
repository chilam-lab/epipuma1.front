$(document).ready(function() {
    // verbose por default es true
    var verbose = true;

    // 0 local, 1 producción, 2 desarrollo, 3 candidate
    var ambiente = 2;

    // 0 nicho, 1 comunidad, 2 index
    var modulo = 2;

    var url_front;
    var url_api;

    if (ambiente === 0) {
        url_front = "http://localhost/species-front";
        url_api = "http://localhost:8080";
    }
    else {

        if (ambiente === 0) {

            url_front = "http://localhost/species-front";
            url_api = "http://localhost:8080";

        }
        else if (ambiente === 1) {

            url_front = "http://species.conabio.gob.mx";
            url_api = "http://species.conabio.gob.mx/api";

        }
        else if (ambiente === 2) {

            url_front = "http://species.conabio.gob.mx/dev";
            url_api = "http://species.conabio.gob.mx/api-dev";

        }
        // la version candidate tiene el front de dev y trabaja con el middleware de produccion
        else {

            url_front = "http://species.conabio.gob.mx/candidate";
            url_api = "http://species.conabio.gob.mx/api-rc";
        }
    }

    module_index.startModule(url_front, url_api, modulo, verbose);
});
