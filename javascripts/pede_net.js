
/**
 * Éste módulo es el encargado de la gestión de los componentes de comunidad ecológica.
 *
 * @namespace module_net
 */
var module_net = (function () {


    var _AMBIENTE = 1;
    var _TEST = false;
    var _VERBOSE = true;
    var MOD_COMUNIDAD = 1;
    var _REGION_SELECTED;
    var _REGION_TEXT_SELECTED;
    
    var _tipo_modulo = MOD_COMUNIDAD;
    
    

    var _map_module_net,
            _variable_module_net,
            _language_module_net,
            _res_display_module_net;

    var _url_front, _url_api, _url_comunidad;

    var _url_geoserver = "http://geoportal.conabio.gob.mx:80/geoserver/cnb/wms?",
            _workspace = "cnb";

    var _toastr = toastr;
    var _iTrans;

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

        $("#generaRed").click(function (e) {

            _VERBOSE ? console.log("generaRed") : _VERBOSE;
            _VERBOSE ? console.log(_componente_fuente.getVarSelArray()) : _VERBOSE;
            _VERBOSE ? console.log(_componente_sumidero.getVarSelArray()) : _VERBOSE;

            var min_occ = parseInt($("#occ_number").val());

            _res_display_module_net.cleanLegendGroups();

            var s_filters = _res_display_module_net.getFilters(_componente_fuente.getVarSelArray(), TIPO_FUENTE);
            var t_filters = _res_display_module_net.getFilters(_componente_sumidero.getVarSelArray(), TIPO_SUMIDERO);
            var footprint_region = parseInt($("#footprint_region_select").val());

            var grid_res_val = $("#grid_resolution").val();
            console.log("grid_resolution: " + grid_res_val);

            _res_display_module_net.createLinkNodes(s_filters, t_filters, min_occ, grid_res_val, footprint_region);

            $("#show_gen").css('visibility', 'visible');

        });

        $("#net_link").click(function () {
            window.location.replace(_url_front + "/geoportal_v0.1.html");
        });

        $("#btn_tutorial").click(function () {
            window.open(_url_front + "/docs/tutorial.pdf");
        });



        $("#show_gen").click(function () {

            _VERBOSE ? console.log("show_gen") : _VERBOSE;

//            var cadena_ini = _url_comunidad + '#link/?';
            var data_link = "";

            var subgroups_source = _componente_fuente.getVarSelArray();
            var subgroups_target = _componente_sumidero.getVarSelArray();

            data_link += "minOcc=" + parseInt($("#occ_number").val()) + "&";

            data_link += "num_filters_source=" + subgroups_source.length + "&";

            data_link += "num_filters_target=" + subgroups_target.length + "&";


            $.each(subgroups_source, function (index, item) {

                var str_item = JSON.stringify(item);

                if (index === 0) {
                    data_link += "tfilters_s[" + index + "]=" + str_item;
                } else {
                    data_link += "&tfilters_s[" + index + "]=" + str_item;
                }

            });

            data_link += "&";

            $.each(subgroups_target, function (index, item) {

                var str_item = JSON.stringify(item);

                if (index == 0) {
                    data_link += "tfilters_t[" + index + "]=" + str_item;
                } else {
                    data_link += "&tfilters_t[" + index + "]=" + str_item;
                }

            });

            _getLinkToken(data_link);

//            $("#modalRegenera").modal();
//            $("#lb_enlace").val(cadena_ini);

        });

        $("#lb_enlace").click(function () {
            console.log("lb_enlace");
            $(this).select();
        })

        $("#accept_link").click(function () {

            $("#modalRegenera").modal("hide");

        });
        
        $("#footprint_region_select").change(function (e) {

            _REGION_SELECTED = parseInt($("#footprint_region_select").val());
            _REGION_TEXT_SELECTED = $("#footprint_region_select option:selected").text();

        });

        document.getElementById("tbl_hist_comunidad").style.display = "none";

        document.getElementById("map_panel").style.display = "none";

        // document.getElementById("graph_map_comunidad").style.display = "none";

        document.getElementById("hist_map_comunidad").style.display = "none";

        _genLinkURL();
//        _loadCountrySelect();

    }
    
    
    
    function _loadCountrySelect() {

        console.log("_loadCountrySelect");

        $.ajax({
            url: _url_api + "/niche/especie/getAvailableCountriesFootprint",
            type: 'post',
            dataType: "json",
            success: function (resp) {

                var data = resp.data;
                console.log(data);

                $.each(data, function (i, item) {

                    if (i === 0) {
                        $('#footprint_region_select').append('<option selected="selected" value="' + item.footprint_region + '">' + item.country + '</option>');
                    } else {
                        $('#footprint_region_select').append($('<option>', {
                            value: item.footprint_region,
                            text: item.country
                        }));
                    }

                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });
    }



    /**
     * Realiza el envio de los parámetros seleccionados de un análisis de nicho para generar un token de recuperación.
     *
     * @function _getLinkToken
     * @private
     * @memberof! module_net
     * 
     * @param {String} data_link - Cadena que contiene los parametros selecicoandos por el usuario en el análisis.
     * 
     */
    function _getLinkToken(data_link) {

        console.log("_getLinkToken");

        $.ajax({
            url: _url_api + "/niche/especie",
            type: 'post',
            data: {
                qtype: 'getToken',
                confparams: data_link,
                tipo: 'comunidad'
            },
            dataType: "json",
            success: function (resp) {

                var cadena_ini = _url_comunidad + '#link/?';
                var tokenlink = resp.data[0].token;

                console.log("token: " + tokenlink);

                $("#modalRegenera").modal();
                $("#lb_enlace").val(cadena_ini + "token=" + tokenlink);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });

    }




    /**
     * Parsea una URL a un JSON.
     *
     * @function _parseURL
     * @private
     * @memberof! module_net
     * 
     * @param {string} url - URL en formato cadena para ser parseado.
     * 
     */
    function _parseURL(url) {
        console.log(url);

        var regex = /[?&]([^=#]+)=([^&#]*)/g, url = url, params = {}, match;
        while (match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        return params;
    }




    /**
     * Procesa la URL insertada en el explorador para iniciar el proceso de parseo y obtención de parámetros.
     *
     * @function _genLinkURL
     * @private
     * @memberof! module_net
     * 
     */
    function _genLinkURL() {

        _VERBOSE ? console.log("_genLinkURL") : _VERBOSE;

        if (_json_config == undefined) {
            return;
        }

//        console.log(_json_config.token);
        var token = _json_config.token;
        _getValuesFromToken(token);

    }


    /**
     * Consulta los parámetros utilizados en el análisis del token contenido en la URL y despliega la configuración en la UI.
     *
     * @function _getValuesFromToken
     * @private
     * @memberof! module_net
     * 
     * @param {String} token - token relacionado a un conjunto de paramétros utilizados en un análisis de nicho.
     * 
     */
    function _getValuesFromToken(token) {

        console.log("_getValuesFromToken");


        $.ajax({
            url: _url_api + "/niche/especie",
            type: 'post',
            data: {
                qtype: 'getValuesFromToken',
                token: token,
                tipo: 'comunidad'
            },
            dataType: "json",
            success: function (resp) {

                var all_data = resp.data[0].parametros;
                _json_config = _parseURL("?" + all_data);

                console.log(_json_config);

                if (_json_config == undefined) {
                    return;
                }

                var minOcc = _json_config.minOcc ? parseInt(_json_config.minOcc) : 0;

                var num_filters_source = parseInt(_json_config.num_filters_source);
                var num_filters_target = parseInt(_json_config.num_filters_target);

                var filters_source = [];
                var filters_target = [];

                for (i = 0; i < num_filters_source; i++) {

                    filters_source.push(JSON.parse(_json_config["tfilters_s[" + i + "]"]));

                }

                for (i = 0; i < num_filters_target; i++) {

                    filters_target.push(JSON.parse(_json_config["tfilters_t[" + i + "]"]));

                }

                _procesaValoresEnlace(filters_source, filters_target, minOcc);

                $("#show_gen").css('visibility', 'hidden');



            },
            error: function (jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });


    }



    /**
     * Asigna los valores obtenidos de la URL y configura los componentes visuales para regenerar los resultados.
     *
     * @function _procesaValoresEnlace
     * @private
     * @memberof! module_net
     * 
     * @param {json} subgroups - JSON  con el grupo de variables seleccionado
     * @param {integer} chkOcc - Número mínimo de ocurrencias en nj para ser considerado en los cálculos
     */
    function _procesaValoresEnlace(subgroups_s, subgroups_t, nimOcc) {

        _VERBOSE ? console.log("_procesaValoresEnlace") : _VERBOSE;

        var type_time_s = 0;
        var type_time_t = 0;
        var num_items = 0;

        $("#occ_number").val(nimOcc);

        _componente_fuente.setVarSelArray(subgroups_s);
        _componente_sumidero.setVarSelArray(subgroups_t);

        var groups_s = subgroups_s.slice();
        var groups_t = subgroups_t.slice();

        _componente_fuente.addUIItem(groups_s);
        _componente_sumidero.addUIItem(groups_t);

//        _res_display_module_net.set_subGroups(subgroups_s);
//        _res_display_module_net.set_typeBioclim(type_time_s);
//        
//        _res_display_module_net.set_subGroups(subgroups_s);
//        _res_display_module_net.set_typeBioclim(type_time_s);


//        if (subgroups.length > 0) {
//            // asegura que si el grupo de variables seleccionado tiene mas de un grupo taxonomico agregue el total
//            subgroups.forEach(function(grupo) {
//                if (grupo.value.length > 1) {
//                    grupo.value.forEach(function(item) {
//                        num_items++;
//                    });
//                }
//            });
//            // asegura que si existe mas de un grupo de variables, se calcule el total  de todos los grupos
//            if (subgroups.length > 1) {
//                num_items++;
//            }
//        }
//        else {
//            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "error");
//            return;
//        }

//        _module_toast.showToast_BottomCenter("Generando resultados a partir de link", "info");

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
    function startModule(verbose) {

        _VERBOSE ? console.log("startModule") : _VERBOSE;
        _VERBOSE = verbose;

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

        _map_module_net.setDisplayModule(_res_display_module_net);


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


$(document).ready(function () {
    
    if (localStorage.getItem("url_front")) {
        
        var verbose = localStorage.getItem("verbose");
        module_net.setUrlFront(localStorage.getItem("url_front"));
        module_net.setUrlApi(localStorage.getItem("url_api"));
        module_net.setUrlComunidad(localStorage.getItem("url_comunidad"));
        module_net.startModule(verbose);

    } else {
        
        // en caso de no tener los datos necesarios en el local storage se redirecciona a index
        var url = window.location.href;        
        var url_array = url.split("/");
        var new_url = "";
        
        for (var i=0; i<url_array.length-1; i++) {
            new_url += url_array[i] + "/";
        }
        new_url += "index.html";
        window.location.replace(new_url);

    }

    

});
