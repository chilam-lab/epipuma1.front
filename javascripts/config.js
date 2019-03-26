$(document).ready(function () {
    // Current SPECIES FrontEnd URL
   var url_front = "http://species.conabio.gob.mx/dbdev";
    // var url_front = "http://localhost/species-front";
    
    // SNIB Middleware URL
   var url_api = "http://species.conabio.gob.mx/api-db-dev";
    // var url_api = "http://localhost:8080";

    
    var ambiente = 5;
    var _VERBOSE = true;
    var modulo = 2; // modulo index

    var url_nicho;
    var url_comunidad;
    url_nicho = url_front + "/geoportal_v0.1.html";
    url_comunidad = url_front + "/comunidad_v0.1.html";

    // _VERBOSE ? console.log("url_front: " + url_front) : _VERBOSE;
    // _VERBOSE ? console.log("url_api: " + url_api) : _VERBOSE;
    // _VERBOSE ? console.log("url_nicho: " + url_nicho) : _VERBOSE;
    // _VERBOSE ? console.log("url_comunidad: " + url_comunidad) : _VERBOSE;
    // _VERBOSE ? console.log("modulo: " + modulo) : _VERBOSE;
    // _VERBOSE ? console.log("verbose: " + _VERBOSE) : _VERBOSE;

    // localStorage.clear();
    localStorage.setItem("url_front", url_front);
    localStorage.setItem("url_api", url_api);
    localStorage.setItem("url_nicho", url_nicho);
    localStorage.setItem("url_comunidad", url_comunidad);
    localStorage.setItem("ambiente", ambiente);
    localStorage.setItem("verbose", _VERBOSE);

    module_index.startModule(modulo);
});
