
/**
 * Éste módulo es el encargado de la gestión de los componentes de nicho ecológico.
 *
 * @namespace module_nicho
 */
var module_nicho = (function() {

    var _TEST = false, _tipo_modulo;
    var _VERBOSE = true;

    var _map_module_nicho,
            _variable_module_nicho,
            _res_display_module_nicho,
            _region_module_nicho,
            _table_module,
            _histogram_module_nicho,
            _language_module_nicho,
            _module_toast;

    var _componente_fuente;

    var _url_front, _url_api, _url_nicho;

    var _url_geoserver = "http://geoportal.conabio.gob.mx:80/geoserver/cnb/wms?",
            _workspace = "cnb";

    var _iTrans;


    /**
     * Enlaza la funcionalidad de los componentes visuales de las secciones de nicho ecológico.
     *
     * @function _initializeComponents
     * @private
     * @memberof! module_nicho
     */
    function _initializeComponents() {

        _VERBOSE ? console.log("_initializeComponents") : _VERBOSE;

        $("#lb_do_apriori").text(_iTrans.prop('lb_no'));
        $("#lb_mapa_prob").text(_iTrans.prop('lb_no'));



        $(function() {

            var year = parseInt(new Date().getFullYear());
            // obtnego el proximo numero divisible entre 10. 2016 -> 2020; 2017 -> 2020; 2021 -> 2030
            year = Math.round(year / 10) * 10;

            $("#sliderFecha").slider({
                range: true,
                min: 1500,
                max: year,
                step: 10,
                values: [1500, year],
                change: function(event, ui) {

                    _VERBOSE ? console.log(ui.values) : _VERBOSE;

                    var value = ui.values[1];
                    if (value == year) {
                        value = _iTrans.prop('val_actual');
                    }

                    $("#labelFecha").text(_iTrans.prop('labelFecha', ui.values[0], value));

                    if ($("#reload_map").hasClass("btn-primary") && _map_module_nicho.get_specieTarget()) {

                        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
                        $("#reload_map").addClass('btn-success').removeClass('btn-primary');

                    }

                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_rango_fecha', ui.values[0], value), "info");
                    
                    if(ui.values[0]!==1500 || ui.values[1]!==year){
                        $("#chkFecha").prop('checked', false);
                        $("#lb_sfecha").text(_iTrans.prop('lb_no'));
                    }
                    else{
                        $("#chkFecha").prop('checked', true);
                        $("#lb_sfecha").text(_iTrans.prop('lb_si'));
                    }
                    
                    

                }
            });

        });


        function forceNumeric() {
            var $input = $(this);
            $input.val($input.val().replace(/[^\d]+/g, ''));
        }


        $('body').on('propertychange input', 'input[type="number"]', forceNumeric);


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkValidation").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#labelValidation").text("Si");

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_act'), "info");

            } else {

                $("#labelValidation").text("No");
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_des'), "info");

            }

        });


        // checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
        $("#chkMinOcc").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#occ_number").prop("disabled", false);

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_act'), "info");

            }
            else {

                $("#occ_number").prop("disabled", true);

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_des'), "info");

            }

        });


        $("#chkFosil").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#labelFosil").text("Si");

                if ($("#reload_map").hasClass("btn-primary") && _map_module_nicho.get_specieTarget()) {

                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
                    $("#reload_map").addClass('btn-success').removeClass('btn-primary');

                }
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_act'), "info");

            } else {

                $("#labelFosil").text("No");

                if ($("#reload_map").hasClass("btn-primary") && _map_module_nicho.get_specieTarget()) {

                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
                    $("#reload_map").addClass('btn-success').removeClass('btn-primary');

                }

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_des'), "info");

            }

        });


        // checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
        $("#chkFecha").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#sliderFecha").slider("enable");
                $("#lb_sfecha").text(_iTrans.prop('lb_si'));

                if ($("#reload_map").hasClass("btn-primary") && _map_module_nicho.get_specieTarget()) {

                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");

                    $("#reload_map").addClass('btn-success').removeClass('btn-primary');

                }

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha'), "info");

            } else {

                $("#lb_sfecha").text(_iTrans.prop('lb_no'));

                if ($("#reload_map").hasClass("btn-primary") && _map_module_nicho.get_specieTarget()) {

                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");

                    $("#reload_map").addClass('btn-success').removeClass('btn-primary');

                }

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha_des'), "info");

            }

        });


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkApriori").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#lb_do_apriori").text(_iTrans.prop('lb_si'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_apriori_act'), "info");

            } else {
                $("#lb_do_apriori").text(_iTrans.prop('lb_no'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_apriori_desc'), "info");
            }

        });


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkMapaProb").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#lb_mapa_prob").text(_iTrans.prop('lb_si'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_mapprob_act'), "info");

            } else {
                $("#lb_mapa_prob").text(_iTrans.prop('lb_no'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_mapprob_des'), "info");
            }

        });


        // deshabilita controles temporales
        $("#chkFecha").prop('disabled', false);


        $("#sliderFecha").slider({
            disabled: false
        });


        $("#nicho_link").click(function() {
            window.location.replace(_url_front + "/comunidad_v0.1.html");
        });

        $("#btn_tutorial").click(function() {
            window.open(_url_front + "/docs/tutorial.pdf");
        });

        $("#btn_steps").click(function() {
            $('.sliderPop').show();
            $('.ct-sliderPop-container').addClass('open');
            $('.sliderPop').addClass('flexslider');
            $('.sliderPop .ct-sliderPop-container').addClass('slides');

            $('.sliderPop').flexslider({
                selector: '.ct-sliderPop-container > .ct-sliderPop',
                slideshow: false,
                controlNav: false,
                controlsContainer: '.ct-sliderPop-container'
            });
        });


        $('.ct-sliderPop-close').on('click', function() {
            $('.sliderPop').hide();
            $('.ct-sliderPop-container').removeClass('open');
            $('.sliderPop').removeClass('flexslider');
            $('.sliderPop .ct-sliderPop-container').removeClass('slides');
        });





        $("#nom_sp").autocomplete({
            source: function(request, response) {

                var grid_res_val = $("#grid_resolution").val();
//                console.log("grid_resolution: " + grid_res_val);

                $.ajax({
                    url: _url_api + "/niche/especie",
                    dataType: "json",
                    type: "post",
                    data: {
                        qtype: 'getEntList',
                        limit: true,
                        searchStr: request.term,
                        source: 1, // source para saber si viene de objetivo o el target
                        grid_res: grid_res_val
                    },
                    success: function(resp) {

                        response($.map(resp.data, function(item) {

                            return{
                                label: item.especievalidabusqueda + " (occ: " + item.occ + ")",
                                id: item.spid,
                                reino: item.reinovalido,
                                phylum: item.phylumdivisionvalido,
                                clase: item.clasevalida,
                                orden: item.ordenvalido,
                                familia: item.familiavalida,
                                genero: item.generovalido,
                                especie: item.especievalidabusqueda,
                                occ: item.occ
                            };
                        })
                                );
                    }
                });

            },
            minLength: 2,
            change: function(event, ui) {
                if (!ui.item) {
                    $("#nom_sp").val("");
                }
            },
            select: function(event, ui) {
                var specie_target = {
                    "reino": ui.item.reino,
                    "phylum": ui.item.phylum,
                    "clase": ui.item.clase,
                    "orden": ui.item.orden,
                    "familia": ui.item.familia,
                    "genero": ui.item.genero,
                    "especie": ui.item.especie,
                    "spid": ui.item.id,
                    "label": ui.item.especie
                };

                _VERBOSE ? console.log(specie_target) : _VERBOSE;

                _map_module_nicho.set_specieTarget(specie_target);

                _map_module_nicho.busca_especie();

                _module_toast.showToast_CenterCenter(_iTrans.prop('lb_occ_cargado'), "info");

            }

        });


        $("#reload_map").click(function() {

            _VERBOSE ? console.log("reload_map") : _VERBOSE;

            if (_map_module_nicho.get_specieTarget()) {

                var rango_fechas = $("#sliderFecha").slider("values");

                if (rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")) {
                    rango_fechas = undefined;
                }


                var chkFecha = $("#chkFecha").is(':checked') ? true : false;

                var chkFosil = $("#chkFosil").is(':checked') ? true : false;

                $('.nav-tabs a[href="#tab_resumen"]').tab('show');

                _map_module_nicho.busca_especie_filtros(rango_fechas, chkFecha, chkFosil);

                $("#reload_map").addClass('btn-primary').removeClass('btn-success');

            }
            else {

                _module_toast.showToast_CenterCenter(_iTrans.prop('lb_sin_especie'), "warning");

            }

        });


        $("#show_gen").click(function(e) {

            _VERBOSE ? console.log("show_gen") : _VERBOSE;

            var data_link = "";

            var sp_data = JSON.stringify(_map_module_nicho.get_specieTarget());

            var subgroups = _componente_fuente.getVarSelArray();

            data_link += "sp_data=" + sp_data + "&";

            var val_process = $("#chkValidation").is(":checked");
            if (val_process) {
                data_link += "chkVal=" + val_process + "&";
            }

            var mapa_prob = $("#chkMapaProb").is(":checked");
            if (mapa_prob) {
                data_link += "chkPrb=" + mapa_prob + "&";
            }

            var fossils = $("#chkFosil").is(":checked");
            if (fossils) {
                data_link += "chkFosil=" + fossils + "&";
            }

            var apriori = $("#chkApriori").is(':checked');
            if (apriori) {
                data_link += "chkApr=" + apriori + "&";
            }

            var chkFecha = $("#chkFecha").is(':checked');

            if (chkFecha) {
                data_link += "chkFec=" + chkFecha + "&";
            }

            var rango_fechas = $("#sliderFecha").slider("values");

            if (rango_fechas[0] != $("#sliderFecha").slider("option", "min") || rango_fechas[1] != $("#sliderFecha").slider("option", "max")) {
                data_link += "minFec=" + rango_fechas[0] + "&maxFec=" + rango_fechas[1];
            }

            var min_occ = $("#chkMinOcc").is(':checked');

            if (min_occ) {
                data_link += "chkOcc=" + parseInt($("#occ_number").val()) + "&";
            }
            
//            console.log($("#grid_resolution").val());
            data_link += "gridRes=" + parseInt($("#grid_resolution").val()) + "&";
            
            
            

            data_link += "num_filters=" + subgroups.length + "&";

            $.each(subgroups, function(index, item) {

                var str_item = JSON.stringify(item);

                if (index == 0) {
                    data_link += "tfilters[" + index + "]=" + str_item;
                }
                else {
                    data_link += "&tfilters[" + index + "]=" + str_item;
                }

            });

            _getLinkToken(data_link);

        });


        $("#accept_link").click(function() {

            $("#modalRegenera").modal("hide");

        });


        $('#modalRegenera').on('shown.bs.modal', function(e) {

            $('#modalRegenera input[type="text"]')[0].select();

        });

//        _confLiveTutorial();
        _genLinkURL();

    }

    




    /**
     * Realiza el envio de los parámetros seleccionados de un análisis de nicho para generar un token de recuperación.
     *
     * @function _getLinkToken
     * @private
     * @memberof! module_nicho
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
                tipo: 'nicho'
            },
            dataType: "json",
            success: function(resp) {

                var cadena_ini = _url_nicho + '#link/?';
                var tokenlink = resp.data[0].token;

                console.log("token: " + tokenlink);

                $("#modalRegenera").modal();
                $("#lb_enlace").val(cadena_ini + "token=" + tokenlink);

            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });

    }


    /**
     * Consulta los parámetros utilizados en el análisis del token contenido en la URL y despliega la configuración en la UI.
     *
     * @function _getValuesFromToken
     * @private
     * @memberof! module_nicho
     * 
     * @param {String} token - token relacionado a un conjunto de paramétros utilizados en un análisis de nicho.
     * 
     */
    function _getValuesFromToken(token) {

        console.log("_getValuesFromToken");
        console.log("token: " + token);


        $.ajax({
            url: _url_api + "/niche/especie",
            type: 'post',
            data: {
                qtype: 'getValuesFromToken',
                token: token,
                tipo: 'nicho'
            },
            dataType: "json",
            success: function(resp) {
                
                console.log(resp);

                var all_data = resp.data[0].parametros;
                _json_config = _parseURL("?" + all_data);

                var sp_data = JSON.parse(_json_config.sp_data);

                var chkVal = _json_config.chkVal ? _json_config.chkVal === "true" : false;

                var chkPrb = _json_config.chkPrb ? _json_config.chkPrb === "true" : false;

                var chkFosil = _json_config.chkFosil ? _json_config.chkFosil === "true" : false;

                var chkApr = _json_config.chkApr ? _json_config.chkApr === "true" : false;

                var chkFec = _json_config.chkFec ? _json_config.chkFec === "true" : false;

                var chkOcc = _json_config.chkOcc ? parseInt(_json_config.chkOcc) : undefined;

                var minFec = _json_config.minFec ? parseInt(_json_config.minFec) : undefined;

                var maxFec = _json_config.maxFec ? parseInt(_json_config.maxFec) : undefined;
                
                var gridRes = _json_config.gridRes ? parseInt(_json_config.gridRes) : 16;
//                console.log("gridRes: " + gridRes);

                var rango_fechas = minFec != undefined && maxFec != undefined ? [minFec, maxFec] : undefined;

                var num_filters = parseInt(_json_config.num_filters);


                var filters = [];
                for (i = 0; i < num_filters; i++) {

                    item = _json_config["tfilters[" + i + "]"];

                    filters.push(JSON.parse(_json_config["tfilters[" + i + "]"]));
                }

                _procesaValoresEnlace(sp_data, filters, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas, chkFosil, gridRes);
                $("#show_gen").css('visibility', 'hidden');



            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });


    }


    /**
     * Parsea una URL a un JSON.
     *
     * @function _parseURL
     * @private
     * @memberof! module_nicho
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
     * @memberof! module_nicho
     * 
     */
    function _genLinkURL() {

        _VERBOSE ? console.log("_genLinkURL") : _VERBOSE;

        if (_json_config == undefined) {
            return;
        }

        var token = _json_config.token;
        _getValuesFromToken(token);

    }



    //    No utilizado
    function getQuerystring2(path, key, default_) {

        _VERBOSE ? console.log("getQuerystring2") : _VERBOSE;

        if (default_ == null) {
            default_ = "";
        }

        var search = unescape(path);

        if (search == "") {
            return default_;
        }

        search = search.substr(1);
        var params = search.split("&");

        for (var i = 0; i < params.length; i++) {

            var pairs = params[i].split("=");
            if (pairs[0] == key) {
                return pairs[1];
            }

        }

        return default_;
    }



    /**
     * Asigna los valores obtenidos de la URL y configura los componentes visuales para regenerar los resultados.
     *
     * @function _procesaValoresEnlace
     * @private
     * @memberof! module_nicho
     * 
     * @param {json} sp_data - JSON con la información de la especie objetivo
     * @param {json} subgroups - JSON  con el grupo de variables seleccionado
     * @param {boleano} chkVal - Bandera si esta activado el proceso de validación
     * @param {boleano} chkPrb - Bandera si esta activado el mapa de probabilidad
     * @param {boleano} chkApr - Bandera si esta activado el cálculo con a priori
     * @param {boleano} chkFec - Bandera si esta activado el cálculo con registros sin fecha
     * @param {integer} chkOcc - Número mínimo de ocurrencias en nj para ser considerado en los cálculos
     * @param {array} rango_fechas - Rango de fecha para realizar los cálculos
     * @param {integer} gridRes - Resolución de la malla para ser considerado en los cálculos
     */
    function _procesaValoresEnlace(sp_data, subgroups, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas, chkFosil, gridRes) {

        _VERBOSE ? console.log("_procesaValoresEnlace") : _VERBOSE;

        var spid = sp_data.spid;
        var discardedPoints = d3.map([]); // considerar arregle de puntos descartadas
        var computed_discarded_cells = d3.map([]); // considerar arregle de celdas descartadas
        var allowedPoints = d3.map([]); // considerar arregle de puntos permitidos
        var idreg = ["Estados"]; // Módulo por desarrollar
        var type_time = 0;
        var num_items = 0;

        $("#nom_sp").val(sp_data.label);

        _map_module_nicho.set_specieTarget(sp_data);

        if (chkFec) {
            $("#chkFecha").prop('checked', true);
            $("#lb_sfecha").text(_iTrans.prop('lb_si'));
        }
        else {
            $("#chkFecha").prop('checked', false);
            $("#lb_sfecha").text(_iTrans.prop('lb_no'));
        }

        if (chkVal) {

            $("#chkValidation").prop('checked', true);
            $("#labelValidation").text(_iTrans.prop('lb_si'));

        }
        else {

            $("#chkValidation").prop('checked', false);
            $("#labelValidation").text(_iTrans.prop('lb_no'));


        }

        if (chkPrb) {
            $("#chkMapaProb").prop('checked', true);
            $("#lb_mapa_prob").text(_iTrans.prop('lb_si'));
        }
        else {
            $("#chkMapaProb").prop('checked', false);
            $("#lb_mapa_prob").text(_iTrans.prop('lb_no'));
        }


        if (chkFosil) {
            $("#chkFosil").prop('checked', true);
            $("#labelFosil").text(_iTrans.prop('lb_si'));
        }
        else {
            $("#chkFosil").prop('checked', false);
            $("#labelFosil").text(_iTrans.prop('lb_no'));
        }

        if (chkApr) {
            $("#chkApriori").prop('checked', true);
            $("#lb_do_apriori").text(_iTrans.prop('lb_si'));
        }
        else {
            $("#chkApriori").prop('checked', false);
            $("#lb_do_apriori").text(_iTrans.prop('lb_no'));
        }

        if (chkOcc) {
            $("#chkMinOcc").prop('checked', true);
            $("#occ_number").prop("disabled", false);
            $("#occ_number").val(chkOcc);

        }
        else {
            $("#chkMinOcc").prop('checked', false);
            $("#occ_number").prop("disabled", true);
            $("#occ_number").val(chkOcc);
        }

        if (rango_fechas != undefined) {

            $("#sliderFecha").slider('values', 0, rango_fechas[0]);
            $("#sliderFecha").slider('values', 1, rango_fechas[1]);

        }
        
        $('#grid_resolution option[value='+gridRes+']').attr('selected','selected');

        if (chkFec != undefined || rango_fechas != undefined) {

            _map_module_nicho.busca_especie_filtros(rango_fechas, chkFec);
        }
        else {
            _map_module_nicho.busca_especie();
        }
        
        
        

        _res_display_module_nicho.set_spid(spid);
        _res_display_module_nicho.set_idReg(idreg);

        _componente_fuente.setVarSelArray(subgroups);

        var groups = subgroups.slice();
        _componente_fuente.addUIItem(groups);

        _res_display_module_nicho.set_subGroups(subgroups);
        _res_display_module_nicho.set_typeBioclim(type_time);


        if (subgroups.length > 0) {
            // asegura que si el grupo de variables seleccionado tiene mas de un grupo taxonomico agregue el total
            subgroups.forEach(function(grupo) {
                if (grupo.value.length > 1) {
                    grupo.value.forEach(function(item) {
                        num_items++;
                    });
                }
            });
            // asegura que si existe mas de un grupo de variables, se calcule el total  de todos los grupos
            if (subgroups.length > 1) {
                num_items++;
            }
        }
        else {
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "error");
            return;
        }

        _res_display_module_nicho.set_discardedPoints(discardedPoints);
        _res_display_module_nicho.set_discardedCellFilter(computed_discarded_cells);
        _res_display_module_nicho.set_allowedCells(allowedPoints);

        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_link'), "info");

    }


    // se ejecutan los modulos necesarios para iniciar el proceso de obteción de epsilon y score y visualización de tablas, histogramas y mapa
    $("#get_esc_ep").click(function() {

        _VERBOSE ? console.log("get_esc_ep") : _VERBOSE;
        var num_items = 0, spid, idreg, subgroups;

        $("#show_gen").css('visibility', 'visible');
        $("#tuto_res").css('visibility', 'visible');

        // Configuración de TEST no actualizada. No se puede utilizat hasta el momento. 23-05-2016
        if (_TEST) {
            // 58390 - panthera onca, 46920 - Lynx rufus
            _spid = 49405;
            idreg = ["Estados"];
            subgroups = [{value: ["Orden >> Artiodactyla", "Orden >> Carnivora"], type: 0, groupid: 1},
                {value: [{label: "Bioclim >> Temperatura media anual", level: 1, value: "bio01"}], type: 1, groupid: 1}
                // {label:"Bioclim >> Rango medio diurno", level:1, value:"bio02"}], type:1, groupid:1}, 
                // {value:[{label:"Bioclim >> Forma Isométrica", level:1, value:"bio03"}], type:1, groupid:2}
            ];
            num_items = 5;

        }
        else {

            if (_map_module_nicho.get_specieTarget()) {
                spid = _map_module_nicho.get_specieTarget().spid;
                _res_display_module_nicho.set_spid(spid);
                _VERBOSE ? console.log(spid) : _VERBOSE;
            }
            else {

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_especie'), "error");

                return;
            }

            // agregar validación para estados
            idreg = _region_module_nicho.getRegionSelected();

            _res_display_module_nicho.set_idReg(idreg);

            subgroups = _componente_fuente.getVarSelArray();

            type_time = _componente_fuente.getTimeBioclim();

            _res_display_module_nicho.set_subGroups(subgroups);

            _res_display_module_nicho.set_typeBioclim(type_time);


            if (subgroups.length > 0) {

                // asegura que si el grupo de variables seleccionado tiene mas de un grupo taxonomico agregue el total
                subgroups.forEach(function(grupo) {

                    if (grupo.value.length > 1) {
                        grupo.value.forEach(function(item) {
                            num_items++;
                        });
                    }

                });

                // asegura que si existe mas de un grupo de variables, se calcule el total  de todos los grupos
                if (subgroups.length > 1) {
                    num_items++;
                }

            }
            else {
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "error");

                return;
            }

        }

        if (idreg[0] == "Estados" || idreg[0] == "Ecoregiones") {

            _res_display_module_nicho.set_discardedPoints(_map_module_nicho.get_discardedPoints());
            _res_display_module_nicho.set_discardedCellFilter(_map_module_nicho.get_discardedCellFilter());
            _res_display_module_nicho.set_allowedCells(_map_module_nicho.get_allowedCells());


            var val_process = $("#chkValidation").is(':checked');
            var min_occ = $("#chkMinOcc").is(':checked');
            var mapa_prob = $("#chkMapaProb").is(':checked');
            var grid_res = $("#grid_resolution").val();

            console.log("grid_res: " + grid_res);

            var fossil = $("#chkFosil").is(':checked');
            var rango_fechas = $("#sliderFecha").slider("values");

            if (rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")) {
                rango_fechas = undefined;
            }

            var chkFecha = $("#chkFecha").is(':checked');

//            slider_value = val_process ? $("#sliderValidation").slider("value") : 0;
            var slider_value = val_process ? true : false;


            // Falta agregar la condición makesense. 
            // Cuando se realiza una consulta por region seleccioanda se verica que la especie objetivo se encuentre dentro de esta area
            _res_display_module_nicho.refreshData(num_items, val_process, slider_value, min_occ, mapa_prob, rango_fechas, chkFecha, fossil, grid_res);

        }


    });


    /**
     * Inicializa las variables globales del modulo nicho e inicializa el modulo de internacionalización.
     *
     * @function startModule
     * @public
     * @memberof! module_nicho
     * 
     * @param {string} tipo_modulo - Identificador del módulo 0 para nicho y 1 para comunidad
     * @param {string} verbose - Bandera para desplegar modo verbose
     */
    function startModule(tipo_modulo, verbose) {

        _VERBOSE = verbose;

        _VERBOSE ? console.log("startModule") : _VERBOSE;
        _tipo_modulo = tipo_modulo;

        // Se cargan los archivos de idiomas y depsues son cargados los modulos subsecuentes
        _language_module_nicho = language_module(_VERBOSE);
        _language_module_nicho.startLanguageModule(this, _tipo_modulo);

    }


    /**
     * Método llamado después de que el módulo de internacionalización es configurado correctamente. Se inicializa el controlador y los módulos de mapa, tabla, histograma, región y variable.
     *
     * @function loadModules
     * @public
     * @memberof! module_nicho
     * 
     */
    function loadModules() {

        _VERBOSE ? console.log("loadModules") : _VERBOSE;

        _module_toast = toast_module(_VERBOSE);
        _module_toast.startToast();

        _histogram_module_nicho = histogram_module(_VERBOSE);
        _histogram_module_nicho.startHistogramModule();

        _iTrans = _language_module_nicho.getI18();

        _map_module_nicho = map_module(_url_geoserver, _workspace, _VERBOSE, _url_api);
        _map_module_nicho.startMap(_language_module_nicho, _tipo_modulo, _histogram_module_nicho);

        // un id es enviado para diferenciar el componente del grupo de variables en caso de que sea mas de uno (caso comunidad)
        _variable_module_nicho = variable_module(_VERBOSE, _url_api);
        _variable_module_nicho.startVar(0, _language_module_nicho, _tipo_modulo);

        var ids_comp_variables = ['fuente'];
        _componente_fuente = _variable_module_nicho.createSelectorComponent("variables", ids_comp_variables[0], "lb_panel_variables");


        _table_module = table_module(_VERBOSE);
        _table_module.startTableModule();


        _res_display_module_nicho = res_display_module(_VERBOSE, _url_api);
        // enlazando los modulos que tienen interacción en los procesos
        _res_display_module_nicho.startResDisplay(_map_module_nicho, _histogram_module_nicho, _table_module, _language_module_nicho, ids_comp_variables);

        _map_module_nicho.setDisplayModule(_res_display_module_nicho);


        // se envia url con direccion a servidor zacatuche
        _region_module_nicho = region_module(_url_api, _VERBOSE);
        _region_module_nicho.startRegion(_map_module_nicho, _language_module_nicho);

        _language_module_nicho.addModuleForLanguage(_res_display_module_nicho, _histogram_module_nicho, _map_module_nicho, _variable_module_nicho);

        _initializeComponents();

    }


    /**
     * Método setter para la variable que almacena la URL del servidor.
     *
     * @function setUrlApi
     * @public
     * @memberof! module_nicho
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
     * @memberof! module_nicho
     * 
     * @param {string} url_front - URL del cliente
     */
    function setUrlFront(url_front) {
        _url_front = url_front
    }

    /**
     * Método setter para la variable que almacena la URL de nicho ecológico.
     *
     * @function setUrlNicho
     * @public
     * @memberof! module_nicho
     * 
     * @param {string} url_nicho - URL del cliente en nicho ecológico
     */
    function setUrlNicho(url_nicho) {
        _url_nicho = url_nicho
    }

    // retorna solamente un objeto con los miembros que son públicos.
    return {
        startModule: startModule,
        loadModules: loadModules,
        setUrlApi: setUrlApi,
        setUrlFront: setUrlFront,
        setUrlNicho: setUrlNicho
    };


})();


$(document).ready(function() {

    // verbose por default es true
    var verbose = true;

    // 0 local, 1 producción, 2 desarrollo, 3 candidate
    var ambiente = 3;

    // 0 nicho, 1 comunidad, 2 index
    var modulo = 0;

    if (Cookies.get("url_front")) {

        module_nicho.setUrlFront(Cookies.get("url_front"));
        module_nicho.setUrlApi(Cookies.get("url_api"));
        module_nicho.setUrlNicho(Cookies.get("url_nicho"));

    }
    else {

        if (ambiente === 0) {
            module_nicho.setUrlFront("http://localhost/species-front");
            module_nicho.setUrlApi("http://localhost:8080");
            module_nicho.setUrlNicho("http://localhost/species-front/geoportal_v0.1.html");
        }
        else if (ambiente === 1) {

            module_nicho.setUrlFront("http://species.conabio.gob.mx");
            module_nicho.setUrlApi("http://species.conabio.gob.mx/api");
            module_nicho.setUrlNicho("http://species.conabio.gob.mx/geoportal_v0.1.html");

        }
        else if (ambiente === 2) {

            module_nicho.setUrlFront("http://species.conabio.gob.mx/dev");
            module_nicho.setUrlApi("http://species.conabio.gob.mx/api-dev");
            module_nicho.setUrlNicho("http://species.conabio.gob.mx/dev/geoportal_v0.1.html");

        }
        // la version candidate tiene el front de dev y trabaja con el middleware de produccion
        else {

            module_nicho.setUrlFront("http://species.conabio.gob.mx/candidate");
            module_nicho.setUrlApi("http://species.conabio.gob.mx/api-rc");
            module_nicho.setUrlNicho("http://species.conabio.gob.mx/candidate/geoportal_v0.1.html");

        }

    }

    module_nicho.startModule(modulo, verbose);

});



