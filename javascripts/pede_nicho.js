
/**
 * Éste módulo es el encargado de la gestión de los componentes de nicho ecológico.
 *
 * @namespace module_nicho
 */
var module_nicho = (function () {

    var _TEST = false;
    var MOD_NICHO = 0;
    var _VERBOSE = true;
    var _REGION_SELECTED;
    var _REGION_TEXT_SELECTED;

    // actualizar este arreglo si cambian los ids de las secciones
    var _SCROLL_SECTIONS = ["section0","section1","map","myScrollableBlockEpsilonDecil","histcontainer_row"];
    var _SCROLL_INDEX = 0;


    var _tipo_modulo = MOD_NICHO;

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
    
    const _ACGetEntList = new AbortController();
    const signal = _ACGetEntList.signal;
    
    var _getEntListInProcess = false;

    var groupSpSelection = [];

    var map_taxon = new Map()
    map_taxon.set("reino", "kingdom");
    map_taxon.set("kingdom", "kingdom");
    map_taxon.set("phylum", "phylum");
    map_taxon.set("clase", "class");
    map_taxon.set("class", "class");
    map_taxon.set("orden", "order");
    map_taxon.set("order", "order");
    map_taxon.set("familia", "family");
    map_taxon.set("family", "family");
    map_taxon.set("genero", "genus");
    map_taxon.set("género", "genus");
    map_taxon.set("genus", "genus");
    map_taxon.set("especie", "species");
    map_taxon.set("species", "species");

    var _taxones = [];

    var _datafile_loaded = [];



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


        function forceNumeric() {
            var $input = $(this);
            $input.val($input.val().replace(/[^\d]+/g, ''));
        }


        $('body').on('propertychange input', 'input[type="number"]', forceNumeric);


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkValidation").click(function (event) {

            console.log("cambia validacion");

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
        $("#chkMinOcc").click(function (event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#occ_number").prop("disabled", false);

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_act'), "info");

            } else {

                $("#occ_number").prop("disabled", true);

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_des'), "info");

            }

        });


        $("#chkFosil").click(function (event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#labelFosil").text("Si");

                _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_act'), "info");

            } else {

                $("#labelFosil").text("No");

                _regenMessage();

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_des'), "info");

            }

        });


        // checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
        $("#chkFecha").click(function (event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#sliderFecha").slider("enable");
                $("#lb_sfecha").text(_iTrans.prop('lb_si'));

                _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha'), "info");

            } else {

                $("#lb_sfecha").text(_iTrans.prop('lb_no'));

                _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha_des'), "info");

            }

        });


        $("#footprint_region_select").change(function (e) {

            console.log("Cambiando a " + parseInt($("#footprint_region_select").val()));

            _REGION_SELECTED = parseInt($("#footprint_region_select").val());
            _REGION_TEXT_SELECTED = $("#footprint_region_select option:selected").text();
            _map_module_nicho.changeRegionView(_REGION_SELECTED);

            _regenMessage();

        });


        $("#grid_resolution").change(function (e) {

            _VERBOSE ? console.log("Cambia grid resolución") : _VERBOSE;
            // No es necesario regenerar resultados
            _regenMessage();

        });


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkApriori").click(function (event) {

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
        $("#chkMapaProb").click(function (event) {

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


        $("#nicho_link").click(function () {
            window.location.replace(_url_front + "/comunidad_v0.1.html");
        });

        $("#btn_tutorial").click(function () {
            window.open(_url_front + "/docs/tutorial.pdf");
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



        // $("#btn_steps").click(function () {
        //     $('.sliderPop').show();
        //     $('.ct-sliderPop-container').addClass('open');
        //     $('.sliderPop').addClass('flexslider');
        //     $('.sliderPop .ct-sliderPop-container').addClass('slides');

        //     $('.sliderPop').flexslider({
        //         selector: '.ct-sliderPop-container > .ct-sliderPop',
        //         slideshow: false,
        //         controlNav: false,
        //         controlsContainer: '.ct-sliderPop-container'
        //     });
        // });

        // $("#specie_next").click(function () {
        //     $('html, body').animate({
        //         scrollTop: $("#section1").offset().top - 40
        //     }, 2000);

        //     _cleanTutorialButtons();
        // });

        // $("#params_next").click(function () {
        //     $('html, body').animate({
        //         scrollTop: $("#map").offset().top - 40
        //     }, 2000);

        //     $("#params_next").hide("slow");
        // });

        // $("#map_next").click(function () {
        //     $('html, body').animate({
        //         scrollTop: $("#myScrollableBlockEpsilonDecil").offset().top - 40
        //     }, 2000);

        //     $("#map_next").hide("slow");
        // });

        // $("#hist_next").click(function () {
        //     $('html, body').animate({
        //         scrollTop: $("#histcontainer_row").offset().top - 40
        //     }, 2000);

        //     $("#hist_next").hide("slow");
        // });


        $('.ct-sliderPop-close').on('click', function () {
            $('.sliderPop').hide();
            $('.ct-sliderPop-container').removeClass('open');
            $('.sliderPop').removeClass('flexslider');
            $('.sliderPop .ct-sliderPop-container').removeClass('slides');
        });


        $("#reload_map").click(function () {

            _VERBOSE ? console.log("reload_map") : _VERBOSE;

            var region = _REGION_SELECTED;

            var groupDatasetTotal = _componente_target.getGroupDatasetTotal()

            console.log(groupDatasetTotal)

            if(groupDatasetTotal.length == 0){
                console.log("No species selected");
                _module_toast.showToast_BottomCenter(_iTrans.prop('msg_noespecies_selected'), "warning");
                return;
            }

            _taxones = [];

            $.each(groupDatasetTotal, function(index_i, grupo){

                console.log(grupo);

                $.each(grupo.elements, function(index_j, sp_grupo){

                    
                    var array_sp = sp_grupo.label.split(">>");

                    var temp_item = {};

                    temp_item["taxon_rank"] = map_taxon.get(array_sp[0].trim().toLowerCase());
                    temp_item["value"] = array_sp[1].trim();
                    temp_item["title"] = grupo.title;
                    temp_item["nivel"] = parseInt(sp_grupo.level); //0:root, 1:reino, etc...
                    _taxones.push(temp_item);
                })

            })

            console.log(_taxones);

            var val_process = $("#chkValidation").is(':checked');
            var grid_res = $("#grid_resolution").val();
            var footprint_region = parseInt($("#footprint_region_select").val());

            // _map_module_nicho.loadD3GridMX(val_process, grid_res, footprint_region, _taxones);

            _map_module_nicho.busca_especie_grupo(_taxones, footprint_region, val_process, grid_res);

        });


        $("#show_gen").click(function (e) {

            _VERBOSE ? console.log("show_gen") : _VERBOSE;

            var subgroups = _componente_fuente.getVarSelArray();
            var subgroups_target = _componente_target.getVarSelArray();

            var data_link = {};

            data_link.tipo = "nicho"
            
            // data_link.taxones = _taxones;
            data_link.sfilters = subgroups_target;

            data_link.val_process = $("#chkValidation").is(":checked");
            data_link.idtabla = data_link.val_process === true ? _res_display_module_nicho.getValidationTable() : "no_table";
            data_link.mapa_prob = $("#chkMapaProb").is(":checked");
            data_link.fossil = $("#chkFosil").is(":checked");
            data_link.apriori = $("#chkApriori").is(':checked');
            data_link.sfecha = $("#chkFecha").is(':checked');

            var rango_fechas = $("#sliderFecha").slider("values");
            if (rango_fechas[0] !== $("#sliderFecha").slider("option", "min") || rango_fechas[1] !== $("#sliderFecha").slider("option", "max")) {
                data_link.lim_inf = rango_fechas[0];
                data_link.lim_sup = rango_fechas[1];
            } else {
                data_link.lim_inf = undefined;
                data_link.lim_sup = undefined;
            }

            data_link.min_occ = $("#chkMinOcc").is(':checked') === true ? parseInt($("#occ_number").val()) : 0;
            data_link.grid_res = parseInt($("#grid_resolution").val());
            data_link.footprint_region = parseInt($("#footprint_region_select").val());

            data_link.discardedFilterids = _map_module_nicho.get_discardedPoints().values().map(function (value) {
                return value.feature.properties.gridid
            });
            // console.log(data_link.discardedFilterids);

            data_link.tfilters = subgroups;

            console.log(data_link);
            _getLinkToken(data_link);

        });


        $("#accept_link").click(function () {

            $("#modalRegenera").modal("hide");
            document.execCommand("copy");
            console.log('se copia url con toker');
        });



        $('#modalRegenera').on('shown.bs.modal', function (e) {

            $('#modalRegenera input[type="text"]')[0].select();

        });


        var _exist_tblload = false;

        $('#csv_load').change(function(e){

            console.log("selecciona archivo");

            console.log("_exist_tblload: " + _exist_tblload)
            
            if(_exist_tblload){
                console.log("clean table")
                // $('#tbl_spload').dataTable().fnDestroy();    
                $('#wrapper').empty();
            }


            var reader = new FileReader();
            reader.readAsArrayBuffer(e.target.files[0]);
            
            reader.onload = function(e) {

                console.log("carga archivo")
                _exist_tblload = true;

                var data = new Uint8Array(reader.result);
                var wb = XLSX.read(data,{type:'array'});
                var htmlstr = XLSX.write(wb,{sheet:"especies", type:'binary',bookType:'html'});

                console.log(htmlstr)

                $('#wrapper')[0].innerHTML += htmlstr;
                // console.log($("#wrapper table"));

                var raw_table = $("#wrapper table");
                console.log(raw_table);
                raw_table.attr("id","tbl_spload");
                raw_table.prop("id","tbl_spload")                    

                // $('#tbl_spload').DataTable({
                //     language: {
                //         "sEmptyTable": _iTrans.prop('sEmptyTable'), 
                //         "info": _iTrans.prop('info'),
                //         "search": _iTrans.prop('search') + " ",
                //         "zeroRecords": _iTrans.prop('zeroRecords'),
                //         "infoEmpty": _iTrans.prop('infoEmpty'),
                //         "infoFiltered": _iTrans.prop('infoFiltered')
                //     }
                // });

                
            }
        });


        $("#muestra_puntos").click(function () {

            _VERBOSE ? console.log("muestra_puntos") : _VERBOSE;

            $("#modalloaddata").modal("hide");

            _datafile_loaded = [];

            $("#tbl_spload tbody tr").each(function(i) {

                if(i == 0) return true; // primer registro son titulos en el excel
                
                var x = $(this);
                var cells = x.find('td');

                var temp = {}
                $(cells).each(function(index, td) {

                    var cell_val = $(this).text();
                    console.log(cell_val);

                    switch (index) {
                        case 0:
                            temp.id = cell_val
                            break;
                        case 1:
                            temp.anio = cell_val
                            break;
                        case 2:
                            temp.fosil = cell_val
                            break;
                        case 3:
                            temp.latitud = cell_val
                            break;
                        case 4:
                            temp.longitud = cell_val
                            break;
                        default:
                            break;
                    }
                }); 

                _datafile_loaded.push(temp);

            });

            console.log(_datafile_loaded);

            // TODO: 
            // - Generación de histograma fechas
            // - Conexión con verbo de meustra de puntos
            $("#get_esc_dataloaded").css('visibility', 'visible');

            var val_process = $("#chkValidation").is(':checked');
            var grid_res = $("#grid_resolution").val();
            var footprint_region = parseInt($("#footprint_region_select").val());
            var loadeddata = true;

            // se ejecuta función para cargar las mallas
            _map_module_nicho.busca_especie_grupo([], footprint_region, val_process, grid_res, loadeddata);


        });

//        _confLiveTutorial();
        _genLinkURL();

    }


    function _regenMessage() {

        if ($("#reload_map").hasClass("btn-primary") && _map_module_nicho.get_specieTarget()) {

            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
            $("#reload_map").addClass('btn-success').removeClass('btn-primary');
            // _cleanTutorialButtons();

        }

    }

    function _cleanTutorialButtons() {

        // $("#specie_next").hide("slow");
        // $("#params_next").hide("slow");
        // $("#map_next").hide("slow");
        // $("#hist_next").hide("slow");

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
        console.log(data_link)

        $.ajax({
            url: _url_api + "/niche/especie/getToken",
            type: 'post',
            data: data_link,
            dataType: "json",
            success: function (resp) {

                var cadena_ini = _url_nicho + '#link/?';
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
            url: _url_api + "/niche/especie/getValuesFromToken",
            type: 'post',
            data: {
                token: token,
                tipo: 'nicho'
            },
            dataType: "json",
            success: function (resp) {

                console.log(resp);


                if(resp.data.length === 0){
                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_link'), "error");
                    return
                }

                var all_data = resp.data[0].parametros;
                _json_config = _parseURL("?" + all_data);

                // var sp_data = JSON.parse(_json_config.sp_data);

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

                var region = _json_config.region ? parseInt(_json_config.region) : 1;

                var rango_fechas = minFec != undefined && maxFec != undefined ? [minFec, maxFec] : undefined;

                // recover deleted items
                var num_dpoints = parseInt(_json_config.num_dpoints);
                var map_dPoints = d3.map([]);
                for (i = 0; i < num_dpoints; i++) {
                    var item = JSON.parse(_json_config["deleteditem[" + i + "]"]);
                    map_dPoints.set(item.feature.properties.gridid, item);
                }
                console.log(map_dPoints.values());

                var num_sfilters = parseInt(_json_config.num_sfilters);
                var sfilters = [];
                for (i = 0; i < num_sfilters; i++) {
                    var item = _json_config["sfilters[" + i + "]"];
                    sfilters.push(JSON.parse(_json_config["sfilters[" + i + "]"]));
                }


                var num_filters = parseInt(_json_config.num_filters);
                var filters = [];
                for (i = 0; i < num_filters; i++) {
                    var item = _json_config["tfilters[" + i + "]"];
                    filters.push(JSON.parse(_json_config["tfilters[" + i + "]"]));
                }

                _procesaValoresEnlace(sfilters, filters, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas, chkFosil, gridRes, region, map_dPoints);
                $("#show_gen").css('visibility', 'hidden');



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
     * @memberof! module_nicho
     * 
     * @param {string} url - URL en formato cadena para ser parseado.
     * 
     */
    function _parseURL(url) {
//        console.log(url);

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
    function _procesaValoresEnlace(subgroups_target, subgroups, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas, chkFosil, gridRes, region, map_dPoints) {

        _VERBOSE ? console.log("_procesaValoresEnlace") : _VERBOSE;

        console.log("Region : " + region);
        var idreg = ["Estados"]; // Módulo por desarrollar
        
        if (chkFec) {
            $("#chkFecha").prop('checked', true);
            $("#lb_sfecha").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkFecha").prop('checked', false);
            $("#lb_sfecha").text(_iTrans.prop('lb_no'));
        }

        if (chkVal) {
            $("#chkValidation").prop('checked', true);
            $("#labelValidation").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkValidation").prop('checked', false);
            $("#labelValidation").text(_iTrans.prop('lb_no'));
        }

        if (chkPrb) {
            $("#chkMapaProb").prop('checked', true);
            $("#lb_mapa_prob").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkMapaProb").prop('checked', false);
            $("#lb_mapa_prob").text(_iTrans.prop('lb_no'));
        }


        if (chkFosil) {
            $("#chkFosil").prop('checked', true);
            $("#labelFosil").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkFosil").prop('checked', false);
            $("#labelFosil").text(_iTrans.prop('lb_no'));
        }

        if (chkApr) {
            $("#chkApriori").prop('checked', true);
            $("#lb_do_apriori").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkApriori").prop('checked', false);
            $("#lb_do_apriori").text(_iTrans.prop('lb_no'));
        }

        if (chkOcc) {
            $("#chkMinOcc").prop('checked', true);
            $("#occ_number").prop("disabled", false);
            $("#occ_number").val(chkOcc);

        } else {
            $("#chkMinOcc").prop('checked', false);
            $("#occ_number").prop("disabled", true);
            $("#occ_number").val(chkOcc);
        }

        if (rango_fechas !== undefined) {
            $("#sliderFecha").slider('values', 0, rango_fechas[0]);
            $("#sliderFecha").slider('values', 1, rango_fechas[1]);
        }

        $('#grid_resolution option[value=' + gridRes + ']').attr('selected', 'selected');

        $('#footprint_region_select option[value=' + region + ']').attr('selected', 'selected');

        console.log(subgroups_target)
        console.log(subgroups)

        _componente_target.setVarSelArray(subgroups_target);

        _taxones = [];

        $.each(subgroups_target, function(index_i, grupo){

            console.log(grupo);

            $.each(grupo.value, function(index_j, sp_grupo){

                var array_sp = sp_grupo.label.split(">>");

                var temp_item = {};

                temp_item["taxon_rank"] = map_taxon.get(array_sp[0].trim().toLowerCase());
                temp_item["value"] = array_sp[1].trim();
                temp_item["title"] = grupo.title;
                temp_item["nivel"] = parseInt(sp_grupo.level); //0:root, 1:reino, etc...
                _taxones.push(temp_item);

            })

        })

        console.log(_taxones)

        _map_module_nicho.loadD3GridMX(chkVal, gridRes, region, _taxones);        

        _componente_fuente.addUIItem(subgroups.slice());
        
        _res_display_module_nicho.set_idReg(idreg);
  
        _componente_fuente.setVarSelArray(subgroups);
        
        _componente_target.addUIItem(subgroups_target.slice());

        _res_display_module_nicho.set_subGroups(subgroups);


        if (subgroups.length == 0) {
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "warning");
        } 
        else {
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_link'), "info");
        }
        

    }


    $("#get_esc_dataloaded").click(function () {

        _VERBOSE ? console.log("get_esc_dataloaded") : _VERBOSE;

        var loadeddata = true;
        startNicheAnalisis(loadeddata);

    })


    // se ejecutan los modulos necesarios para iniciar el proceso de obteción de epsilon y score y visualización de tablas, histogramas y mapa
    $("#get_esc_ep").click(function () {

        _VERBOSE ? console.log("get_esc_ep") : _VERBOSE;
        startNicheAnalisis();


    });

    function startNicheAnalisis(loadeddata = false){


        var num_items = 0, spid, idreg, subgroups, sp_target;

        // $("#specie_next").css('visibility', 'hidden');

        $("#show_gen").css('visibility', 'visible');
        $("#btn_tuto_steps_result").css('visibility', 'visible');

        // _cleanTutorialButtons();

        
        if (_taxones.length === 0 && loadeddata == false) {
            // no se ha seleccionado especie objetivo
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_especie'), "error");
            return;
        } 

        // spid = _map_module_nicho.get_specieTarget().spid;
        
        // _VERBOSE ? console.log(spid) : _VERBOSE;

        // agregar validación para estados
        idreg = _region_module_nicho.getRegionSelected();

        _res_display_module_nicho.set_idReg(idreg);



        subgroups = _componente_fuente.getVarSelArray();

        // sp_target_group = _componente_target.getTaxones();

        // console.log(sp_target_group)

        _res_display_module_nicho.set_taxones(_taxones);
        


        var type_time = _componente_fuente.getTimeBioclim();

        _res_display_module_nicho.set_subGroups(subgroups);

        _res_display_module_nicho.set_typeBioclim(type_time);


        if (subgroups.length > 0) {

            // // asegura que si el grupo de variables seleccionado tiene mas de un grupo taxonomico agregue el total
            // subgroups.forEach(function (grupo) {

            //     if (grupo.value.length > 1) {
            //         grupo.value.forEach(function (item) {
            //             num_items++;
            //         });
            //     }

            // });

            // // asegura que si existe mas de un grupo de variables, se calcule el total  de todos los grupos
            // if (subgroups.length > 1) {
            //     num_items++;
            // }

        } else {

            $("#show_gen").css('visibility', 'hidden');
            $("#btn_tuto_steps_result").css('visibility', 'hidden');
            $("#tuto_res").css('visibility', 'hidden');
            // $("#params_next").css('visibility', 'hidden');

            // _cleanTutorialButtons();

            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "error");
            return;
        }



        if (idreg[0] === "Estados" || idreg[0] === "Ecoregiones") {


            console.log(_map_module_nicho.get_discardedPoints());

            _res_display_module_nicho.set_discardedPoints(_map_module_nicho.get_discardedPoints());
            _res_display_module_nicho.set_discardedCellFilter(_map_module_nicho.get_discardedCellFilter());
            _res_display_module_nicho.set_allowedCells(_map_module_nicho.get_allowedCells());


            var val_process = $("#chkValidation").is(':checked');
            var min_occ = $("#chkMinOcc").is(':checked');
            var mapa_prob = $("#chkMapaProb").is(':checked');
            var grid_res = $("#grid_resolution").val();
            var footprint_region = parseInt($("#footprint_region_select").val());

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
            _res_display_module_nicho.refreshData(num_items, val_process, slider_value, min_occ, mapa_prob, rango_fechas, chkFecha, fossil, grid_res, footprint_region, loadeddata, _datafile_loaded);

        }



    }


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
    function startModule(verbose) {

        _VERBOSE = verbose;
        _VERBOSE ? console.log("startModule") : _VERBOSE;


        _VERBOSE ? console.log("before language_module NICHO") : _VERBOSE;
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


        _iTrans = _language_module_nicho.getI18();

        _histogram_module_nicho = histogram_module(_VERBOSE);
        _histogram_module_nicho.setLanguageModule(_language_module_nicho);
        _histogram_module_nicho.startHistogramModule();
        

        _map_module_nicho = map_module(_url_geoserver, _workspace, _VERBOSE, _url_api);
        _map_module_nicho.startMap(_language_module_nicho, _tipo_modulo, _histogram_module_nicho);

        _table_module = table_module(_VERBOSE);
        _table_module.startTableModule();


        _language_module_nicho.setTableModule(_table_module)


        _res_display_module_nicho = res_display_module(_VERBOSE, _url_api);

        _map_module_nicho.setDisplayModule(_res_display_module_nicho);

        _histogram_module_nicho.setDisplayModule(_res_display_module_nicho);



        // un id es enviado para diferenciar el componente del grupo de variables en caso de que sea mas de uno (caso comunidad)
        _variable_module_nicho = variable_module(_VERBOSE, _url_api);
        _variable_module_nicho.startVar(0, _language_module_nicho, _tipo_modulo, _map_module_nicho);


        var ids_comp_variables = ['fuente', 'target'];
        _componente_fuente = _variable_module_nicho.createSelectorComponent("variables", ids_comp_variables[0], "lb_panel_variables");

        _componente_target = _variable_module_nicho.createSelectorComponent("var_target", ids_comp_variables[1], "", false, true, true, 4);

        // enlazando los modulos que tienen interacción en los procesos
        _res_display_module_nicho.startResDisplay(_map_module_nicho, _histogram_module_nicho, _table_module, _language_module_nicho, ids_comp_variables);




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
        _url_nicho = url_nicho;
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


$(document).ready(function () {

    console.log(config.url_front)
    console.log(config.url_api)
    console.log(config.url_nicho)
    console.log(config.url_comunidad)

    // localStorage.setItem("url_front", config.url_front);
    // localStorage.setItem("url_api", config.url_api);
    // localStorage.setItem("url_nicho", config.url_nicho);
    // localStorage.setItem("url_comunidad", config.url_comunidad);
    // localStorage.setItem("verbose", _VERBOSE);

    module_nicho.setUrlFront(config.url_front);
    module_nicho.setUrlApi(config.url_api);
    module_nicho.setUrlNicho(config.url_nicho);
    module_nicho.startModule(config.verbose);

});



