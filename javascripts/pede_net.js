
/**
 * Éste módulo es el encargado de la gestión de los componentes de comunidad ecológica.
 *
 * @namespace module_net
 */
var module_net = (function() {


    var _AMBIENTE = 1,
            _TEST = false;
    var _VERBOSE = true;

    var _map_module_net,
            _variable_module_net,
            _language_module_net,
            _res_display_module_net;

    var _url_front, _url_api, _url_comunidad;

    var _url_geoserver = "http://geoportal.conabio.gob.mx:80/geoserver/cnb/wms?",
            _workspace = "cnb";

    var _toastr = toastr;
    var _iTrans;
    var _tipo_modulo;

    var _componente_fuente;
    var _componente_sumidero;

    var TIPO_FUENTE = 0,
            TIPO_SUMIDERO = 1;




    /**
     * Enlaza la funcionalidad de los componentes visuales de las secciones de comunidad ecológica.
     *
     * @function _initializeComponents
     * @private
     * @memberof! module_net
     */
    function _initializeComponents() {

        _VERBOSE ? console.log("_initializeComponents") : _VERBOSE;

        _toastr.options = {
            "debug": false,
            "onclick": null,
            "fadeIn": 300,
            "fadeOut": 1000,
            "timeOut": 2000,
            "extendedTimeOut": 2000,
            "positionClass": "toast-bottom-center",
            "preventDuplicates": true,
            "progressBar": true
        };

        $("#generaRed").click(function(e) {

            _VERBOSE ? console.log("generaRed") : _VERBOSE;
            _VERBOSE ? console.log(_componente_fuente.getVarSelArray()) : _VERBOSE;
            _VERBOSE ? console.log(_componente_sumidero.getVarSelArray()) : _VERBOSE;

            tipo_fuente = 0;

            var min_occ = parseInt($("#occ_number").val());

            _res_display_module_net.cleanLegendGroups();

            s_filters = _res_display_module_net.getFilters(_componente_fuente.getVarSelArray(), TIPO_FUENTE);
            t_filters = _res_display_module_net.getFilters(_componente_sumidero.getVarSelArray(), TIPO_SUMIDERO);

            _res_display_module_net.createLinkNodes(s_filters, t_filters, min_occ);

        });

        $("#net_link").click(function() {
            window.location.replace(_url_front + "/geoportal_v0.1.html");
        });

        document.getElementById("tbl_hist_comunidad").style.display = "none";

        document.getElementById("map_panel").style.display = "none";

        // document.getElementById("graph_map_comunidad").style.display = "none";

        document.getElementById("hist_map_comunidad").style.display = "none";

    }

    /**
     * Inicializa las variables globales del modulo comunidad e inicializa el modulo de internacionalización.
     *
     * @function startModule
     * @public
     * @memberof! module_net
     * 
     * @param {string} tipo_modulo - Identificador del módulo 0 para nicho y 1 para comunidad
     * @param {string} verbose - Bandera para desplegar modo verbose
     */
    function startModule(tipo_modulo, verbose) {

        _VERBOSE ? console.log("startModule") : _VERBOSE;

        _VERBOSE = verbose;

        _tipo_modulo = tipo_modulo;

        // Se cargan los archivos de idiomas y depsues son cargados los modulos subsecuentes
        _language_module_net = language_module(_VERBOSE);

        _language_module_net.startLanguageModule(this, _tipo_modulo);

    }


    /**
     * Método llamado después de que el módulo de internacionalización es configurado correctamente. Se inicializa el controlador y el módulo de variable.
     *
     * @function loadModules
     * @public
     * @memberof! module_net
     */
    function loadModules() {

        _VERBOSE ? console.log("loadModules") : _VERBOSE;

        _iTrans = _language_module_net.getI18();

        _map_module_net = map_module(_url_geoserver, _workspace, _VERBOSE, _url_api);

        // un id es enviado para diferenciar el componente del grupo de variables en caso de que sea mas de uno (caso comunidad)
        _variable_module_net = variable_module(_VERBOSE, _url_api);
        _variable_module_net.startVar(0, _language_module_net, _tipo_modulo);

        // creación dinámica de selector de variables
        var ids_comp_variables = ['fuente', 'sumidero'];
        _componente_fuente = _variable_module_net.createSelectorComponent("div_seleccion_variables_fuente", ids_comp_variables[0], "lb_fuente");
        _componente_sumidero = _variable_module_net.createSelectorComponent("div_seleccion_variables_sumidero", ids_comp_variables[1], "lb_sumidero");

        _res_display_module_net = res_display_net_module(_VERBOSE, _url_api);
        _res_display_module_net.startResNetDisplay(_variable_module_net, _language_module_net, _map_module_net, ids_comp_variables, _tipo_modulo, _TEST);


        _language_module_net.addModuleForLanguage(_res_display_module_net, null, _map_module_net, _variable_module_net);


        _initializeComponents();

    }



    /**
     * Método setter para la variable que almacena la URL del servidor.
     *
     * @function setUrlApi
     * @public
     * @memberof! module_net
     * 
     * @param {string} url_api - URL del servidor
     */
    function setUrlApi(url_api) {
        _url_api = url_api
    }

    /**
     * Método setter para la variable que almacena la URL del cliente.
     *
     * @function setUrlFront
     * @public
     * @memberof! module_net
     * 
     * @param {string} url_front - URL del cliente
     */
    function setUrlFront(url_front) {
        _url_front = url_front
    }

    /**
     * Método setter para la variable que almacena la URL de comunidad ecológica.
     *
     * @function setUrlComunidad
     * @public
     * @memberof! module_net
     * 
     * @param {string} url_comunidad - URL del cliente en comunidad ecológica
     */
    function setUrlComunidad(url_comunidad) {
        _url_comunidad = url_comunidad
    }


    // retorna solamente un objeto con los miembros que son públicos.
    return {
        startModule: startModule,
        loadModules: loadModules,
        setUrlFront: setUrlFront,
        setUrlApi: setUrlApi,
        setUrlComunidad: setUrlComunidad
    };


})();


$(document).ready(function() {

    // verbose por default es true
    var verbose = true;

    // 0 local, 1 producción
    var ambiente = 0;
    // 0 nicho, 1 comunidad
    var modulo = 1;

    if ($.cookie("url_front")) {

        module_net.setUrlFront($.cookie("url_front"))
        module_net.setUrlApi($.cookie("url_api"))
        module_net.setUrlComunidad($.cookie("url_comunidad"));

    }
    else {
        if (ambiente === 0) {
            module_net.setUrlFront("http://localhost/species-front");
            module_net.setUrlApi("http://species.conabio.gob.mx");
            module_net.setUrlComunidad("http://localhost/species-front/comunidad_v0.1.html");
        }
        else {
            module_net.setUrlFront("http://species.conabio.gob.mx/dev/");
            module_net.setUrlApi("http://species.conabio.gob.mx/api-dev/")
            module_net.setUrlComunidad("http://species.conabio.gob.mx/dev/comunidad_v0.1.html");
            ;
        }
    }


    module_net.startModule(modulo, verbose);

});
