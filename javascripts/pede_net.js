
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
    var _MODULO = "comunidad"
    var _taxones = []
    var _default_region = 1

    // actualizar este arreglo si cambian los ids de las secciones
    var _SCROLL_SECTIONS = ["section0","hist_comunidad","tbl_comunidad","tbl_container"];
    var _SCROLL_INDEX = 0;

    
    var _tipo_modulo = MOD_COMUNIDAD;
    
    

    var _map_module_net,
            _variable_module_net,
            _language_module_net,
            _res_display_module_net,
            _utils_module;

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

        _utils_module = utils_module();
        _utils_module.startUtilsModule();

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


        $(function () {

            var year = parseInt(new Date().getFullYear());
            // obtnego el proximo numero divisible entre 10. 2016 -> 2020; 2017 -> 2020; 2021 -> 2030
            year = Math.round(year / 10) * 10;

            $("#sliderFecha").slider({
                range: true,
                min: 1500,
                max: year,
                step: 10,
                values: [1500, year],
                change: function (event, ui) {

//                    _VERBOSE ? console.log(ui.values) : _VERBOSE;

                    var value = ui.values[1];
                    if (value == year) {
                        value = _iTrans.prop('val_actual');
                    }

                    $("#labelFecha").text(_iTrans.prop('labelFecha', ui.values[0], value));

                    _regenMessage();


                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_rango_fecha', ui.values[0], value), "info");

                    if (ui.values[0] !== 1500 || ui.values[1] !== year) {
                        $("#chkFecha").prop('checked', false);
                        $("#lb_sfecha").text(_iTrans.prop('lb_no'));
                    } else {
                        $("#chkFecha").prop('checked', true);
                        $("#lb_sfecha").text(_iTrans.prop('lb_si'));
                    }



                }
            });

        });


        $("#chkFosil").click(function (event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#labelFosil").text("Si");

                // _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_act'), "info");

            } else {

                $("#labelFosil").text("No");

                // _regenMessage();

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_des'), "info");

            }

        });


        // checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
        $("#chkFecha").click(function (event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#sliderFecha").slider("enable");
                $("#lb_sfecha").text(_iTrans.prop('lb_si'));

                // _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha'), "info");

            } else {

                $("#lb_sfecha").text(_iTrans.prop('lb_no'));

                // _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha_des'), "info");

            }

        });

        $("#generaRed").click(function (e) {

            _VERBOSE ? console.log("generaRed") : _VERBOSE;
            _VERBOSE ? console.log(_componente_fuente.getVarSelArray()) : _VERBOSE;
            _VERBOSE ? console.log(_componente_sumidero.getVarSelArray()) : _VERBOSE;
            
            loadingsNet(1);
            
            var min_occ = parseInt($("#occ_number").val());

            _res_display_module_net.cleanLegendGroups();

            var s_filters = _res_display_module_net.getFilters(_componente_fuente.getVarSelArray(), TIPO_FUENTE);
            var t_filters = _res_display_module_net.getFilters(_componente_sumidero.getVarSelArray(), TIPO_SUMIDERO);
            // var footprint_region = parseInt($("#footprint_region_select").val());
            var footprint_region = _default_region;
            

            var grid_res_val = $("#grid_resolution").val();
            console.log("grid_resolution: " + grid_res_val);


            var fossil = $("#chkFosil").is(':checked');
            var rango_fechas = $("#sliderFecha").slider("values");

            console.log(rango_fechas)

            if (rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")) {
                rango_fechas = undefined;
            }

            var chkFecha = $("#chkFecha").is(':checked');

            console.log("fossil: " + fossil)
            console.log(rango_fechas)
            console.log("chkFecha: " + chkFecha)



            _res_display_module_net.createLinkNodes(s_filters, t_filters, min_occ, grid_res_val, footprint_region, rango_fechas, chkFecha, fossil);

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
            var data_link = {};

            data_link.tipo = "comunidad"

            var subgroups_source = _componente_fuente.getVarSelArray();
            
            var subgroups_target = _componente_sumidero.getVarSelArray();

            data_link.sfilters = subgroups_source;

            data_link.tfilters = subgroups_target;

            data_link.min_occ = parseInt($("#occ_number").val());

            data_link.grid_res = $("#grid_resolution").val();

            data_link.footprint_region = _default_region // parseInt($("#footprint_region_select").val());

            data_link.num_sfilters = subgroups_source.length;

            data_link.num_tfilters = subgroups_target.length;


            // $.each(subgroups_source, function (index, item) {

            //     var str_item = JSON.stringify(item);

            //     if (index === 0) {
            //         data_link += "tfilters_s[" + index + "]=" + str_item;
            //     } else {
            //         data_link += "&tfilters_s[" + index + "]=" + str_item;
            //     }

            // });

            // data_link += "&";

            // $.each(subgroups_target, function (index, item) {

            //     var str_item = JSON.stringify(item);

            //     if (index == 0) {
            //         data_link += "tfilters_t[" + index + "]=" + str_item;
            //     } else {
            //         data_link += "&tfilters_t[" + index + "]=" + str_item;
            //     }

            // });

            // console.log(data_link);
            // console.log(_url_api);
            // console.log(_url_comunidad);

            _utils_module.getLinkToken(data_link, _MODULO, _url_api, _url_comunidad)

            // _getLinkToken(data_link);

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



        _SCROLL_INDEX = 0;

        $("#specie_next").click(function () {

            if(_SCROLL_INDEX >= _SCROLL_SECTIONS.length-1)
                return;

            _SCROLL_INDEX = _SCROLL_INDEX + 1;

            // console.log(_SCROLL_SECTIONS[_SCROLL_INDEX]) 
            
            $('html, body').animate({
                scrollTop: $("#"+_SCROLL_SECTIONS[_SCROLL_INDEX]).offset().top - 40
            }, 1000);

            

        });


        $("#specie_before").click(function () {

            if(_SCROLL_INDEX == 0)
                return;

            _SCROLL_INDEX = _SCROLL_INDEX - 1;

            // console.log(_SCROLL_SECTIONS[_SCROLL_INDEX]) 
            
            $('html, body').animate({
                scrollTop: $("#"+_SCROLL_SECTIONS[_SCROLL_INDEX]).offset().top - 40
            }, 1000);

            

        });



        // document.getElementById("tbl_hist_comunidad").style.display = "none";
        // document.getElementById("map_panel").style.display = "none";
        // document.getElementById("hist_map_comunidad").style.display = "none";
        // document.getElementById("graph_map_comunidad").style.display = "none";

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
    // function _getLinkToken(data_link) {

    //     console.log("_getLinkToken");

    //     $.ajax({
    //         url: _url_api + "/niche/especie",
    //         type: 'post',
    //         data: {
    //             qtype: 'getToken',
    //             confparams: data_link,
    //             tipo: 'comunidad'
    //         },
    //         dataType: "json",
    //         success: function (resp) {

    //             var cadena_ini = _url_comunidad + '#link/?';
    //             var tokenlink = resp.data[0].token;

    //             console.log("token: " + tokenlink);

    //             $("#modalRegenera").modal();
    //             $("#lb_enlace").val(cadena_ini + "token=" + tokenlink);

    //         },
    //         error: function (jqXHR, textStatus, errorThrown) {
    //             _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

    //         }
    //     });

    // }

    function loadingsNet(a) {
      
      if (a == 1) {
        $('#charts').loading({ stoppable: true });
        $('#graph').loading({ stoppable: true });
        $('#map').loading({ stoppable: true });
        $('#tbl_container').loading({ stoppable: true });
      }
      else if (a == 0) {
        $('#charts').loading('stop');
        $('#graph').loading('stop');
        $('#map').loading('stop');
        $('#tbl_container').loading('stop');
      }
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
        console.log("token: " + token);


        $.ajax({
            url: _url_api + "/niche/especie/getValuesFromToken",
            type: 'post',
            data: {
                token: token,
                tipo: 'comunidad'
            },
            dataType: "json",
            success: function (resp) {

                console.log(resp);

                var all_data = resp.data[0].parametros;
                _json_config = _parseURL("?" + all_data);

                var minOcc = _json_config.chkOcc ? parseInt(_json_config.chkOcc) : 5;

                var gridRes = _json_config.gridRes ? parseInt(_json_config.gridRes) : 16;

                var region = _json_config.region ? parseInt(_json_config.region) : 1;

                var num_sfilters = parseInt(_json_config.num_sfilters);
                
                var num_tfilters = parseInt(_json_config.num_filters);
                
                var sfilters = [];

                var filters = [];

                for (i = 0; i < num_sfilters; i++) {
                    var item = _json_config["sfilters[" + i + "]"];
                    sfilters.push(JSON.parse(_json_config["sfilters[" + i + "]"]));
                }

                for (i = 0; i < num_tfilters; i++) {
                    var item = _json_config["tfilters[" + i + "]"];
                    filters.push(JSON.parse(_json_config["tfilters[" + i + "]"]));
                }

                _procesaValoresEnlace(sfilters, filters, minOcc, region, gridRes);

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
    function _procesaValoresEnlace(subgroups_s, subgroups_t, nimOcc, region, resolution) {

        _VERBOSE ? console.log("_procesaValoresEnlace") : _VERBOSE;

        var type_time_s = 0;
        var type_time_t = 0;
        var num_items = 0;

        $("#occ_number").val(nimOcc);

        $('#grid_resolution option[value=' + resolution + ']').attr('selected', 'selected');

        $('#footprint_region_select option[value=' + region + ']').attr('selected', 'selected');


        _componente_fuente.setVarSelArray(subgroups_s);
        _componente_sumidero.setVarSelArray(subgroups_t);

        var groups_s = subgroups_s.slice();
        var groups_t = subgroups_t.slice();

        _componente_fuente.addUIItem(groups_s);
        _componente_sumidero.addUIItem(groups_t);

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
        loadingsNet: loadingsNet,
        setUrlFront: setUrlFront,
        setUrlApi: setUrlApi,
        setUrlComunidad: setUrlComunidad
    };


})();


$(document).ready(function () {

    console.log(config.url_front)
    console.log(config.url_api)
    console.log(config.url_nicho)
    console.log(config.url_comunidad)

    module_net.setUrlFront(config.url_front);
    module_net.setUrlApi(config.url_api);
    module_net.setUrlComunidad(config.url_comunidad);
    module_net.startModule(config.verbose);

});
