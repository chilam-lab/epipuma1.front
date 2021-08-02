/**
 * Controlador de los módulos utilizados en nicho ecológico.
 *
 * @namespace res_display_module
 */
var res_display_module = (function(verbose, url_zacatuche) {

    var _url_zacatuche = url_zacatuche;

    var _VERBOSE = verbose;

    var _TYPE_BIO = 0;

    var _idtemptable = "";

    var _RUN_ON_SERVER = true;

    var _first_analysis = true;

    var _show_greenCells = false;
    var _return_map = false;

    var _val_process_temp = false;
    var _val_process = false;

    var _subgroups, _spid, _idreg, _type_time, _taxones;

    var _validation_module_all,
        _map_module_nicho,
        _language_module_nicho,
        _module_toast,
        _utils_module;

    var _REQUESTS_MADE = [];
    var _REQUESTS_NUMBER = 0;
    var _REQUESTS_DONE = [];
    var _TREE_GENERATED = {};
    var _RESULTS_TODISPLAY = [];


    var _allowedPoints = d3.map([]),
        _discardedPoints = d3.map([]);
    var _discardedPointsFilter = d3.map([]),
        _computed_discarded_cells = d3.map([]),
        _computed_occ_cells = d3.map([]);

    var _cell_set = d3.map([]);
    var _dataChartValSet = [];

    var _REQUESTS, _ITER_REQUESTS,
        _ITER = 0,
        _NUM_ITERATIONS = 5;

    var _min_occ_process, _mapa_prob, _fossil, _grid_res, _footprint_region;

    var _rangofechas, _chkfecha;

    var _first_time_map = true;

    var _NUM_DECILES = 10;

    var _countsdata,
        _cdata,
        _sdata,
        _tdata,
        _ddata,
        _decil_data,
        _total_data_decil,
        _decil_group_data;


    var _default_decil = 10

    // var _toastr = toastr;

    var _fathers = [],
        _sons = [],
        _totals = [];

    var _reino_campos = {
        "reino": "reinovalido",
        "kingdom": "reinovalido",
        "phylum": "phylumdivisionvalido",
        "clase": "clasevalida",
        "class": "clasevalida",
        "orden": "ordenvalido",
        "order": "ordenvalido",
        "familia": "familiavalida",
        "family": "familiavalida",
        "genero": "generovalido",
        "género": "generovalido",
        "genus": "generovalido",
        "especie": "especievalidabusqueda",
        "species": "especievalidabusqueda"
    };

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

    var group_level_biotic = "species";
    var group_level_abiotic = "bid";


    var map_abio = new Map()
    map_abio.set(1, "type");
    map_abio.set(2, "layer");
    map_abio.set(3, "bid");

    var _tbl_decil = false;
    var _tbl_eps = false;

    var _histogram_module_nicho,
        _table_module_eps;

    var _ID_STYLE_GENERATED;

    var _gridids_collection = [],
        _total_set_length = 0,
        _training_set_size = 0,
        _test_set_size = 0;

    var _slider_value, _sp_gridids;

    var _nameMap = d3.map([]);

    var _iTrans;

    var _hist_eps_freq, _hist_score_freq, _hist_score_celda;

    var _ids_componentes_var;


    // ids de los labels desplegados, necesarios para cambio de idioma
    var _id_eps = "chartdiv_epsilon";
    var _id_charteps = {
        id: _id_eps,
        legend: "lb_" + _id_eps,
        xaxis: "xaxis_" + _id_eps,
        yaxis: "yaxis_" + _id_eps
    }

    var _id_scr = "chartdiv_score";
    var _id_chartscr = {
        id: _id_scr,
        legend: "lb_" + _id_scr,
        xaxis: "xaxis_" + _id_scr,
        yaxis: "yaxis_" + _id_scr
    }

    var _id_scr_celda = "chartdiv_score_celda";
    var _id_chartscr_celda = {
        id: _id_scr_celda,
        legend: "lb_" + _id_scr_celda,
        xaxis: "xaxis_" + _id_scr_celda,
        yaxis: "yaxis_" + _id_scr_celda
    }

    var _id_scr_decil = "chartdiv_score_decil";
    var _id_chartscr_decil = {
        id: _id_scr_decil,
        legend: "lb_" + _id_scr_decil,
        xaxis: "xaxis_" + _id_scr_decil,
        yaxis: "yaxis_" + _id_scr_decil,
        recall: "recall_" + _id_scr_decil,
        vp_avg: "vp_" + _id_scr_decil,
        fn_avg: "fn_" + _id_scr_decil
    }


    var _requestReturned = 2;

    var _current_data_score_cell;


    var _decil_values_tbl = [];
    var _decil_data_requests = [];
    var _currentNameView = "";
    var _currentDecil = [];

    function getValidationTable() {
        return _idtemptable;
    }



    /**
     * Método getter de la configuración para generar el histograma de score por celda en el análisis de nicho ecológico.
     *
     * @function get_cData
     * @public
     * @memberof! res_display_module
     *
     */
    function get_cData() {
        return _cdata;
    }


    /**
     * Método setter del id de región seleccionado.
     *
     * @function get_cData
     * @public
     * @memberof! res_display_module
     *
     * @param {integer} idreg - Identificador de la región seleccionada para el análisis de nicho ecológico.
     */
    function set_idReg(idreg) {
        _idreg = idreg;
    }

    /**
     * Método setter del id de la especie objetivo seleccionada para el análisis de nicho ecológico
     *
     * @function set_spid
     * @public
     * @memberof! res_display_module
     *
     * @param {integer} spid - Identificador de la especie objetivo para el análisis de nicho ecológico
     */
    function set_spid(spid) {
        _spid = spid;
    }

    /**
     * Método setter del id de la especie objetivo seleccionada para el análisis de nicho ecológico
     *
     * @function set_spid
     * @public
     * @memberof! res_display_module
     *
     * @param {integer} spid - Identificador de la especie objetivo para el análisis de nicho ecológico
     */
    function set_taxones(taxones) {
        _taxones = taxones;
    }

    /**
     * Método setter de los grupos de variables seleccionados para el análisis de nicho ecológico.
     *
     * @function set_subGroups
     * @public
     * @memberof! res_display_module
     *
     * @param {array} subgroups - Array de los grupos seleccionados para el análisis de nicho ecológico
     */
    function set_subGroups(subgroups) {
        _subgroups = subgroups;
    }

    /**
     * Método setter para considerar las variables climáticas futuras en el análisis de nicho ecológico.
     *
     * @function set_typeBioclim
     * @public
     * @memberof! res_display_module
     *
     * @param {boolean} type_time - Bandera para considerar las variables climáticas futuras en el análisis de nicho ecológico
     */
    function set_typeBioclim(type_time) {
        _type_time = type_time;
    }

    /**
     * Método setter de las ocurrencias de la especie consideradas por proceso de validación en el análisis de nicho ecológico.
     *
     * @function set_allowedPoints
     * @public
     * @memberof! res_display_module
     *
     * @param {array} allowedPoints - Ocurrencias de la especie considerada en el análisis de nicho ecológico
     */
    function set_allowedPoints(allowedPoints) {
        _allowedPoints = allowedPoints;
    }

    /**
     * Método setter de las ocurrencias de la especie descartadas por proceso de validación en el análisis de nicho ecológico.
     *
     * @function set_discardedPoints
     * @public
     * @memberof! res_display_module
     *
     * @param {array} discardedPoints - Ocurrencias de la especie descartadas en el análisis de nicho ecológico
     */
    function set_discardedPoints(discardedPoints) {
        _discardedPoints = discardedPoints;
    }

    /**
     * Método setter de las ocurrencias de la especie descartadas por filtros en el análisis de nicho ecológico.
     *
     * @function set_discardedPointsFilter
     * @public
     * @memberof! res_display_module
     *
     * @param {array} discardedPointsFilter - Ocurrencias de la especie descartadas por filtros en el análisis de nicho ecológico
     */
    function set_discardedPointsFilter(discardedPointsFilter) {
        _discardedPointsFilter = discardedPointsFilter;
    }


    /**
     * Método setter de las celdas descartadas por filtros en el análisis de nicho ecológico.
     *
     * @function set_discardedCellFilter
     * @public
     * @memberof! res_display_module
     *
     * @param {array} computed_discarded_cells - Celdas descartadas por filtros en el análisis de nicho ecológico
     */
    function set_discardedCellFilter(computed_discarded_cells) {
        _computed_discarded_cells = computed_discarded_cells;
    }

    /**
     * Método setter de las celdas consideradas por proceso de validación en el análisis de nicho ecológico.
     *
     * @function set_allowedCells
     * @public
     * @memberof! res_display_module
     *
     * @param {array} computed_occ_cells - Celdas consideradas por proceso de validación en el análisis de nicho ecológico
     */
    function set_allowedCells(computed_occ_cells) {
        _computed_occ_cells = computed_occ_cells;
    }

    /**
     * Método setter del módulo mapa.
     *
     * @function setMapModule
     * @public
     * @memberof! res_display_module
     *
     * @param {object} map_module - Módulo mapa
     */
    function setMapModule(map_module) {
        _map_module_nicho = map_module;
    }

    /**
     * Método setter del módulo histograma.
     *
     * @function setHistogramModule
     * @public
     * @memberof! res_display_module
     *
     * @param {object} histogram_module - Módulo histograma
     */
    function setHistogramModule(histogram_module) {
        _histogram_module_nicho = histogram_module;
    }

    /**
     * Método setter del módulo table.
     *
     * @function setTableModule
     * @public
     * @memberof! res_display_module
     *
     * @param {object} tableModule - Módulo table
     */
    function setTableModule(tableModule) {
        _table_module_eps = tableModule;
    }


    /**
     * Éste método enlaza las variables globales de los módulos inicializados de lenguaje, mapa, histograma, tabla y validación.
     *
     * @function _initilizeElementsForDisplay
     * @private
     * @memberof! res_display_module
     *
     * @param {object} map_module - Módulo mapa
     * @param {object} histogram_module - Módulo histograma
     * @param {object} table_module - Módulo tabla
     * @param {object} language_module - Módulo internacionalización
     * @param {array} ids_comp_variables - Array que contiene los identificadores de los componentes para seleccionar variables
     */
    function _initilizeElementsForDisplay(map_module, histogram_module, table_module, language_module, ids_comp_variables) {


        _VERBOSE ? console.log("_initilizeElementsForDisplay") : _VERBOSE;

        _module_toast = toast_module();
        _module_toast.startToast();

        _utils_module = utils_module();
        _utils_module.startUtilsModule();

        _ids_componentes_var = ids_comp_variables;

        _language_module_nicho = language_module;
        _iTrans = _language_module_nicho.getI18();

        _map_module_nicho = map_module;
        _histogram_module_nicho = histogram_module;
        _table_module_eps = table_module;

        _table_module_eps.setLanguageModule(_language_module_nicho);
        _histogram_module_nicho.setTableModule(_table_module_eps);
        _histogram_module_nicho.setLanguageModule(_language_module_nicho);
        _histogram_module_nicho.setToastModule(_module_toast);


        // si otro proceso de validación es necesario para otro modulo este debe ser instanciado en pede_nicho
        _validation_module_all = validation_module(_VERBOSE);
        _validation_module_all.startValidationModule();
        _validation_module_all.set_histogram_module(_histogram_module_nicho);


        $('ul.dropdown-menu li a.map_type').click(function(e) {

            _VERBOSE ? console.log("change map") : _VERBOSE;

            var language_selected = e.target.getAttribute("value");
            var language_label_selected = e.target.getAttribute("label");

            _VERBOSE ? console.log("value: " + language_selected) : _VERBOSE;
            _VERBOSE ? console.log("label: " + language_label_selected) : _VERBOSE;

            $("#btn_map_type").attr("value", language_selected);
            // $("#btn_map_type").text($.i18n.prop('lb_map') + " ");
            $("#btn_map_type").text(language_label_selected + " ");
            $("#btn_map_type").append('<span class="caret"></span>');

            _configureStyleMap();

            if (_return_map) {
                _map_module_nicho.set_colorCellsDecilMap();
            }

            e.preventDefault();
        });

        $('#return_map').click(function() {
            _configureStyleMap();
            _return_map = false;
            document.getElementById("return_map").style.display = "none";
        });

        $("#send_email_csv").click(function(e) {

            // _VERBOSE ? console.log($("#email_address")) : _VERBOSE;
            _VERBOSE ? console.log($("#email_address")[0].validity["valid"]) : _VERBOSE;

            if ($("#email_address")[0].validity["valid"]) {

                email = $("#email_address").val();

                _tdata["download"] = true;
                _tdata["mail"] = email;

                $.ajax({
                    url: _url_zacatuche,
                    type: 'post',
                    data: _tdata,
                    success: function(d) {

                        _VERBOSE ? console.log(d) : _VERBOSE;
                        $('#modalMail').modal('hide');

                        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_correo_enviado'), "success");

                    },
                    error: function(jqXHR, textStatus, errorThrown) {

                        _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
                        $('#modalMail').modal('hide');

                        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_correo_error'), "error");

                    }
                });


            } else {
                alert("Correo invalido")
            }

        });


        $("#map_download").click(function(e) {

            _VERBOSE ? console.log("map_download") : _VERBOSE;

            var grid = _map_module_nicho.getGridMap2Export();

            //            this.href = window.URL.createObjectURL(new Blob([JSON.stringify(grid)], {type: 'application/json'}));
            this.href = (window.URL ? URL : webkitURL).createObjectURL(new Blob([JSON.stringify(grid)], { type: 'application/json' }));

            //            this.href = "data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(grid));

            $("#modalMailShape").modal("hide");

        });

        $("#sp_download").click(function(e) {

            _VERBOSE ? console.log("sp_download") : _VERBOSE;

            var sp_occ = _map_module_nicho.getSP2Export();

            this.href = window.URL.createObjectURL(new Blob([JSON.stringify(sp_occ)], { type: 'application/json' }));
            //            this.href = "data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(sp_occ));

            $("#modalMailShape").modal("hide");

        });




        // $('#btn_demo').on('click', function () {

        //     _VERBOSE ? console.log("btn_demo") : _VERBOSE;

        //     console.log("click")



        // })

    }

    /**
     * Éste método inicia el proceso de un análisis de nicho ecológico. Además ejecuta el proceso de validación si esta activado.
     *
     * @function refreshData
     * @public
     * @memberof! res_display_module
     *
     * @param {integer} num_items - Número de grupos de variables seleccionado
     * @param {boolean} val_process - Bandera que indica si será ejecutado el proceso de validación
     * @param {integer} slider_value - Porcentaje que será utilzado para el conjunto de prueba en el proceso de validación
     * @param {boolean} min_occ_process - Bandera que indica si será tomado en cuenta un número mínimo de celdas en nj
     * @param {boolean} mapa_prob - Bandera que indica si será desplegado el mapa de probabildiad
     * @param {array} rango_fechas - Array que contiene el limite inferior y superior del rango de fechas para realizar un análisis de nicho ecológico
     * @param {boolean} chkFecha - Bandera que indica si serán tomados en cuenta los registros sin fecha para realizar un análisis de nicho ecológico
     * @param {boolean} chkFosil - Bandera que indica si serán tomados en cuenta los registros fósiles para realizar un análisis de nicho ecológico
     * @param {interger} grid_res - Valor con el cual se realizan los calculos para la resolución de la malla
     */
    function refreshData(num_items, val_process, slider_value, min_occ_process, mapa_prob, rango_fechas, chkFecha, chkFosil, grid_res, footprint_region, val_process_temp) {

        _VERBOSE ? console.log("refreshData") : _VERBOSE;

        _slider_value = slider_value;

        _dataChartValSet = [];
        _min_occ_process = min_occ_process;
        _mapa_prob = mapa_prob;
        _fossil = chkFosil;
        _grid_res = grid_res;
        _footprint_region = footprint_region;
        _val_process_temp = val_process_temp;
        _val_process = val_process;


        _rangofechas = rango_fechas;
        _chkfecha = chkFecha;

        var discardedGridids = [];




        _REQUESTS = num_items + _subgroups.length;
        _ITER_REQUESTS = _REQUESTS;
        //        _VERBOSE ? console.log("Peticiones al servidor: " + _REQUESTS) : _VERBOSE;

        //        document.getElementById("tbl_hist").style.display = "inline";
        _cleanPanel();
        _first_analysis = true;
        _show_greenCells = false;
        _return_map = false;

        // Elimina tabla de validación en caso de existir
        if (_idtemptable !== "") {
            _VERBOSE ? console.log("elimina tabla: " + _idtemptable) : _VERBOSE;
            _deleteValidationTables();
        }

        // Se realiza la carga de la malla antes de iniciar el análisis de nicho
        // _map_module_nicho.loadD3GridMX(val_process, grid_res, _footprint_region);
        callDisplayProcess(_val_process, _val_process_temp)


    }



    /**
     * Éste método inicia ejecuta el proceso de un análisis de nicho ecológico.
     *
     * @function callDisplayProcess
     * @public
     * @memberof! res_display_module
     *
     */
    function callDisplayProcess(val_process, val_process_temp = false) {

        _VERBOSE ? console.log("callDisplayProcess NICHO") : _VERBOSE;

        despliegaLoadings();

        var taxon_values = [];

        _taxones.forEach(function(taxon, index) {

            console.log(taxon)

            var temp = {};
            temp["taxon_rank"] = map_taxon.get(taxon.taxon_rank.toLowerCase());
            temp["value"] = taxon.value;
            taxon_values.push(temp);

        })

        _VERBOSE ? console.log(taxon_values) : _VERBOSE;
        _VERBOSE ? console.log("_val_process_temp: " + _val_process_temp) : _VERBOSE;
        _VERBOSE ? console.log("_val_process: " + _val_process) : _VERBOSE;

        if (_val_process_temp) {

            _VERBOSE ? console.log("VALIDACIÓN TEMPORAL: ON") : _VERBOSE;

            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_inicio_validacion'), "warning");

            _confDataRequest(taxon_values, _idreg, val_process);
            _panelGeneration("");

        } else if (_val_process) {

            _VERBOSE ? console.log("VALIDACIÓN ESPACIAL: ON") : _VERBOSE;

            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_inicio_validacion'), "warning");
            _initializeValidationTables(val_process, taxon_values);

        } else {

            _VERBOSE ? console.log("VALIDACIÓN: OFF") : _VERBOSE;


            // _confDataRequest(_spid, _idreg, val_process);
            _confDataRequest(taxon_values, _idreg, val_process);
            _panelGeneration("");
            //            _generateCounts(_countsdata);

        }
    }




    /**
     * Éste método ejecuta el Store Procedure que genera la tabla temporal donde se realizará el proceso de validación.
     *
     * @function _initializeValidationTables
     * @public
     * @memberof! res_display_module
     *
     * @param {String} idtemptable - Nombre de la tabla temporal que debe ser eliminada
     *
     */
    function _initializeValidationTables(val_process, taxones) {

        _VERBOSE ? console.log("_initializeValidationTables") : _VERBOSE;

        _VERBOSE ? console.log("grid_res: " + _grid_res) : _VERBOSE;


        $.ajax({
            url: _url_zacatuche + "/niche/especie/getGroupValidationTables",
            type: 'post',
            data: {
                // spid: _spid,
                target_taxons: taxones,
                iter: _NUM_ITERATIONS,
                grid_res: _grid_res,
                footprint_region: _footprint_region
            },
            dataType: "json",
            success: function(resp) {

                console.log(resp)

                _idtemptable = resp.data[0].tblname;
                _VERBOSE ? console.log("Creación tabla: " + _idtemptable) : _VERBOSE;

                // _confDataRequest(_spid, _idreg, val_process, _idtemptable);
                _confDataRequest(taxones, _idreg, val_process, _idtemptable);
                _panelGeneration(_idtemptable);
                // _generateCounts(_countsdata);

            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });


    }


    /**
     * Éste método ejecuta el Store Procedure que elimina la tabla temporal donde se realizo el proceso de validación.
     *
     * @function _deleteValidationTables
     * @public
     * @memberof! res_display_module
     *
     */
    function _deleteValidationTables() {

        _VERBOSE ? console.log("_deleteValidationTables") : _VERBOSE;

        $.ajax({
            url: _url_zacatuche + "/niche/especie/deleteValidationTables",
            type: 'post',
            data: {
                idtable: _idtemptable
            },
            dataType: "json",
            success: function(resp) {

                console.log("delete");
                console.log(resp);
                _requestReturned = 1;
                _idtemptable = "";

            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("textStatus: " + textStatus) : _VERBOSE;
                _VERBOSE ? console.log("errorThrown: " + errorThrown) : _VERBOSE;

            }
        });

    }


    /**
     * Éste método lleva el conteo de las peticiones realizadas al servidor para eliminar la tabla temporal cuando sean ejecutadas en su totalidad.
     *
     * @function _countRequest
     * @public
     * @memberof! res_display_module
     *
     * @param {String} idtemptable - Nombre de la tabla temporal que debe ser eliminada
     *
     */
    function _countRequest(idtemptable) {

        _VERBOSE ? console.log("_countRequest") : _VERBOSE;

        _requestReturned = _requestReturned - 1;
        if (_requestReturned === 0) {
            //            _deleteValidationTables(idtemptable);
        }

    }



    /**
     * Éste método limpia los componentes visuales antes de realiza run análisis de nicho ecológico.
     *
     * @function _cleanPanel
     * @private
     * @memberof! res_display_module
     *
     */
    function _cleanPanel() {

        _VERBOSE ? console.log("_cleanPanel") : _VERBOSE;

        _table_module_eps.clearEspList();
        _table_module_eps.clearDecilList();

        try {
            $("#" + _id_charteps.id).empty();
            $("#" + _id_chartscr.id).empty();
        } catch (e) {
            _VERBOSE ? console.log("primera vez") : _VERBOSE;
        }


        try {
            $("#" + _id_chartscr_celda.id).empty();
        } catch (e) {
            _VERBOSE ? console.log("primera vez") : _VERBOSE;
        }



        _map_module_nicho.clearMap();


        try {
            $("#" + _id_chartscr_decil.id).empty();
        } catch (e) {
            _VERBOSE ? console.log(e) : _VERBOSE;
            _VERBOSE ? console.log("primera vez") : _VERBOSE;
        }


    }

    /**
     * Éste método configura los parámetros que son enviados a las diferentes peticiones al servidor cuando se desea ejecutar un análisis de nicho ecológico.
     *
     * @function _confDataRequest
     * @private
     * @memberof! res_display_module
     *
     * @param {integer} num_items - Número de grupos de variables seleccionado
     * @param {boolean} val_process - Bandera que indica si será ejecutado el proceso de validación
     */
    function _confDataRequest(taxones, idreg, val_process, tabla = "") {

        _VERBOSE ? console.log("_confDataRequest") : _VERBOSE;


        var idtabla = tabla || "";
        // var idtabla = tabla || "no_table";
        var apriori = $("#chkApriori").is(':checked') ? true : false;
        var mapap = $("#chkMapaProb").is(':checked') ? true : false;
        //        _mapa_prob ? "mapa_prob" : undefined;

        var fossil = $("#chkFosil").is(':checked') ? true : false;
        var min_occ = _min_occ_process ? parseInt($("#occ_number").val()) : 1;


        var lin_inf = _rangofechas ? _rangofechas[0] : undefined;
        var lin_sup = _rangofechas ? _rangofechas[1] : undefined;
        var sin_fecha = $("#chkFecha").is(':checked') ? true : false;

        let todayDate = new Date();
        let todayDateToNextThirtyDays = String(todayDate.getFullYear() + "-" + (Number((todayDate.getMonth() + 1)) < 10 ? "0" + (todayDate.getMonth() + 1) : (todayDate.getMonth() + 1)) + "-" + (Number(todayDate.getDate()) < 10 ? "0" + todayDate.getDate() : todayDate.getDate()));

        var lim_inf_valtemp = undefined;
        var lim_inf_valtemp = undefined;
        var train_month = "";
        let parsedTrainingStartTothirtyDays = "";
        let parsedYesterdayDateToThirtyDays = "";

        function returnTheEndMonthDayByTheNumberOfMonth(numberOfTheMonth) {
            var endMonthDay = "";
            switch (numberOfTheMonth) {
                case "01":
                    endMonthDay = "31";
                    break;
                case "02":
                    endMonthDay = "28";
                    break;
                case "03":
                    endMonthDay = "31";
                    break;
                case "05":
                    endMonthDay = "31";
                    break;
                case "07":
                    endMonthDay = "31";
                    break;
                case "08":
                    endMonthDay = "31";
                    break;
                case "10":
                    endMonthDay = "31";
                    break;
                case "12":
                    endMonthDay = "31";
                    break;

                default:
                    endMonthDay = "30";

                    break;
            }
            return endMonthDay;

        }


        if (_val_process_temp) {
            console.log("test")
            console.log("Limites para validacion tamporal");

            var selectedDate = $("#date_timepicker_start_val").val();
            if (selectedDate == todayDateToNextThirtyDays) {
                console.log(todayDateToNextThirtyDays)
                var todayDatePlusThirtyDays = new Date(todayDate.setDate(todayDate.getDate() + 30))
                let parsedTodayDatePlusThirtyDays = String(todayDatePlusThirtyDays.getFullYear() + "-" + (Number((todayDatePlusThirtyDays.getMonth() + 1)) < 10 ? "0" + (todayDatePlusThirtyDays.getMonth() + 1) : (todayDatePlusThirtyDays.getMonth() + 1)) + "-" + (Number(todayDatePlusThirtyDays.getDate()) < 10 ? "0" + todayDatePlusThirtyDays.getDate() : todayDatePlusThirtyDays.getDate()));
                var lim_inf_valtemp = todayDateToNextThirtyDays;
                var lim_sup_valtemp = parsedTodayDatePlusThirtyDays;

            } else {
                console.log(todayDateToNextThirtyDays)
                var liminf_splited = selectedDate.split("-");
                var month = liminf_splited[1]
                var endMonthDay = returnTheEndMonthDayByTheNumberOfMonth(month);

                lim_inf_valtemp = liminf_splited[0] + "-" + liminf_splited[1] + "-01";
                lim_sup_valtemp = liminf_splited[0] + "-" + liminf_splited[1] + "-" + endMonthDay;
            }
        } else {
            var selectedDate = $("#date_timepicker_start").val()


            if (selectedDate == todayDateToNextThirtyDays) {
                var todayDatePlusThirtyDays = new Date(todayDate.setDate(todayDate.getDate() + 30))
                let parsedTodayDatePlusThirtyDays = String(todayDatePlusThirtyDays.getFullYear() + "-" + (Number((todayDatePlusThirtyDays.getMonth() + 1)) < 10 ? "0" + (todayDatePlusThirtyDays.getMonth() + 1) : (todayDatePlusThirtyDays.getMonth() + 1)) + "-" + (Number(todayDatePlusThirtyDays.getDate()) < 10 ? "0" + todayDatePlusThirtyDays.getDate() : todayDatePlusThirtyDays.getDate()));
                var lim_inf_valtemp = todayDateToNextThirtyDays;
                var lim_sup_valtemp = parsedTodayDatePlusThirtyDays;
                var yesterdayDateToThirtyDays = new Date(todayDate.setDate(todayDate.getDate() - 31))
                var trainingStartTothirtyDays = new Date(todayDate.setDate(todayDate.getDate() - 30))
                parsedYesterdayDateToThirtyDays = String(yesterdayDateToThirtyDays.getFullYear() + "-" + (Number((yesterdayDateToThirtyDays.getMonth() + 1)) < 10 ? "0" + (yesterdayDateToThirtyDays.getMonth() + 1) : (yesterdayDateToThirtyDays.getMonth() + 1)) + "-" + (Number(yesterdayDateToThirtyDays.getDate()) < 10 ? "0" + yesterdayDateToThirtyDays.getDate() : yesterdayDateToThirtyDays.getDate()));
                parsedTrainingStartTothirtyDays = String(trainingStartTothirtyDays.getFullYear() + "-" + (Number((trainingStartTothirtyDays.getMonth() + 1)) < 10 ? "0" + (trainingStartTothirtyDays.getMonth() + 1) : (trainingStartTothirtyDays.getMonth() + 1)) + "-" + (Number(trainingStartTothirtyDays.getDate()) < 10 ? "0" + trainingStartTothirtyDays.getDate() : trainingStartTothirtyDays.getDate()));

            } else {

                var liminf_splited = selectedDate.split("-");
                var month = liminf_splited[1]
                var endMonthDay = returnTheEndMonthDayByTheNumberOfMonth(month);

                //var lim_inf_valtemp = liminf_splited[0] + "-" + liminf_splited[1] + "-01";
                //var lim_sup_valtemp = liminf_splited[0] + "-" + liminf_splited[1] + "-" + endMonthDay;
                train_month = liminf_splited[1] == 1 ? "12" : (liminf_splited[1] >= 10 ? +String(Number(liminf_splited[1]) - 1) : "0" + String(Number(liminf_splited[1]) - 1));
            }


            var lin_inf = train_month ? (liminf_splited[0] + "-" + liminf_splited[1] + "-01") : parsedTrainingStartTothirtyDays;
            var lin_sup = train_month ? (liminf_splited[0] + "-" + liminf_splited[1] + "-" + endMonthDay) : parsedYesterdayDateToThirtyDays;

        }


        var existsDiscardedFilter = false;
        if (lim_inf_valtemp !== undefined || lim_sup_valtemp !== undefined || !sin_fecha)
            existsDiscardedFilter = true;

        // _VERBOSE ? console.log("lin_inf: " + lin_inf) : _VERBOSE;

        // verbo: getFreqCelda // seleccion de celda
        var milliseconds = new Date().getTime();
        _cdata = {
            "target_taxons": taxones,
            "idtime": milliseconds,
            "apriori": apriori,
            "mapa_prob": mapap,
            "min_cells": min_occ,
            "fosil": fossil,
            "lim_inf_validation": lim_inf_valtemp,
            "lim_sup_validation": lim_sup_valtemp,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "date": sin_fecha,
            // "val_process": val_process,
            "idtabla": idtabla,
            // "grid_resolution": parseInt(_grid_res),
            "grid_resolution": _grid_res,
            "region": _footprint_region,
            "get_grid_species": false,
            "with_data_score_cell": true,
            "with_data_freq": true,
            "with_data_freq_cell": true,
            "with_data_score_decil": true,
            "excluded_cells": _map_module_nicho.getExcludedCells(),
            "target_name": "targetGroup",
            "iterations": val_process ? undefined : 1 // si es indefinido toma las iteraciones del servidor
        };

        // verbo: getScoreDecil
        milliseconds = new Date().getTime();


        _decil_data = {
            "target_taxons": taxones,
            "idtime": milliseconds,
            "apriori": apriori,
            "mapa_prob": mapap,
            "min_cells": min_occ,
            "fosil": fossil,
            "lim_inf_validation": lim_inf_valtemp,
            "lim_sup_validation": lim_sup_valtemp,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "date": sin_fecha,
            // "val_process": val_process,
            "idtabla": idtabla,
            // "grid_resolution": parseInt(_grid_res),
            "grid_resolution": _grid_res,
            "region": _footprint_region,
            "get_grid_species": false,
            "with_data_score_cell": true,
            "with_data_freq": true,
            "with_data_freq_cell": true,
            "with_data_score_decil": true,
            "excluded_cells": _map_module_nicho.getExcludedCells(),
            "target_name": "targetGroup",
            "iterations": val_process ? undefined : 1 // si es indefinido toma las iteraciones del servidor
        };

    }


    /**
     * Éste método configura las celdas del mapa que deben ser descartadas en los procesos de validación y eliminación de puntos para el análisis de nicho ecoógico. Además realiza las peticiones al servidor de forma seccionada para el cálculo de valores por decil.
     *
     * @function _panelGeneration
     * @private
     * @memberof! res_display_module
     *
     * @param {array} discardedGridids - Array con los ids de celda que son descartados cuando existe proceso de validación
     */
    function _panelGeneration(idtemptable = "") {

        _VERBOSE ? console.log("_panelGeneration") : _VERBOSE;
        idtemptable = idtemptable || "";

        var filters = [];
        _fathers = [];
        _sons = [];
        _totals = [];

        _REQUESTS_MADE = [];
        _REQUESTS_DONE = [];
        _REQUESTS_NUMBER = 0;
        _TREE_GENERATED = {};
        _RESULTS_TODISPLAY = [];

        var hasBios = false;
        var hasRaster = false;
        //        var active_time = undefined;

        //        if (_type_time === 1) {
        //            _VERBOSE ? console.log("2050 activado") : _VERBOSE;
        //            active_time = true;
        //        }


        var hasTotal = false;
        if (_subgroups.length > 1) {
            hasTotal = true;
        }

        _TREE_GENERATED.hasTotal = hasTotal;

        _VERBOSE ? console.log(_subgroups) : _VERBOSE;

        _subgroups.forEach(function(grupo, index) {

            if (!_TREE_GENERATED.groups) {
                _TREE_GENERATED.groups = [{ index: (index + 1), name: grupo.title }];
            } else {
                _TREE_GENERATED.groups.push({ index: (index + 1), name: grupo.title });
            }

            //            _VERBOSE ? console.log(_TREE_GENERATED) : _VERBOSE;

            //            var filterby_group = [];
            _VERBOSE ? console.log(grupo) : _VERBOSE;

            var hasChildren = false;
            if (grupo.value.length > 1) {
                hasChildren = true;
            }

            var temp_group = _TREE_GENERATED.groups[index];
            temp_group.hasChildren = hasChildren;
            temp_group.groupid = grupo.groupid;


            grupo.value.forEach(function(item) {

                // if item is type 1 is a json and if 0 is a string
                var itemGroup = item;
                var single_filter = {};
                var merge_vars = [];

                _VERBOSE ? console.log(itemGroup) : _VERBOSE;

                // bioticos
                if (parseInt(grupo.type) === _TYPE_BIO) {

                    console.log("bioticos");

                    var temp_item_field = itemGroup.label.toString().split(">>")[0].toLowerCase().trim();
                    var temp_item_value = itemGroup.label.toString().split(">>")[1].trim();

                    merge_vars.push({
                        'rank': map_taxon.get(temp_item_field),
                        'value': temp_item_value,
                        'type': parseInt(itemGroup.type),
                        'level': group_level_biotic
                    });

                }
                // raster: bioclim, topo, elevacion y pendiente
                else {

                    console.log("Abioticos");

                    // if the type is equal to 1 the item contains the parameter level
                    temp_item_value = itemGroup.label.split(">>")[1].trim();

                    merge_vars.push({
                        'rank': map_abio.get(parseInt(itemGroup.level)),
                        'value': parseInt(itemGroup.level) !== 1 ? itemGroup.value : itemGroup.type,
                        'type': parseInt(itemGroup.type),
                        'level': group_level_abiotic
                    });

                }

                hasBios = false;
                hasRaster = false;

                for (var i = 0; i < merge_vars.length; i++) {
                    if (merge_vars[0].type === _TYPE_BIO) {
                        hasBios = true;
                    } else {
                        hasRaster = true;
                    }
                }

                // console.log(merge_vars)

                single_filter["name"] = grupo.title.replace(/ /g, '')
                single_filter["biotic"] = hasBios ? true : false;
                single_filter["merge_vars"] = merge_vars;
                single_filter["group_item"] = grupo.groupid

                _decil_data.covariables = [];
                _decil_data.covariables.push(single_filter)


                // _VERBOSE ? console.log(single_filter) : _VERBOSE;
                // _VERBOSE ? console.log(_decil_data) : _VERBOSE;

                var data_request = jQuery.extend(true, {}, _decil_data);
                _REQUESTS_MADE.push(data_request);

                if (!temp_group.children) {
                    // temp_group.children = [single_filter[0]];
                    temp_group.children = [merge_vars[0]];
                } else {
                    // temp_group.children.push(single_filter[0]);
                    temp_group.children.push(merge_vars[0]);
                }


            });

            hasBios = false;
            hasRaster = false;

        });

        _REQUESTS_NUMBER = _REQUESTS_MADE.length;
        console.log("_REQUESTS_NUMBER: " + _REQUESTS_NUMBER);
        // console.log(_TREE_GENERATED);
        // console.log(_REQUESTS_MADE);

        // return;

        _REQUESTS_MADE.forEach(function(item, index) {

            // console.log(item);
            _createScore_Decil(item);

        });

    }



    /**
     * Éste método realiza la petición al servidor para obtener el cálculo de score por decil y generar el histograma de score decil en el análisis de nicho ecológico.
     *
     * @function _createScore_Decil
     * @private
     * @memberof! res_display_module
     *
     * @param {josn} decildata - Json con la configuración seleccionada por el usuario
     * @param {boolean} hasChildren - Bandera que indica si la configuración enviada es un conjunto de las variables seleccionadas o es una variable del grupo
     * @param {boolean} isTotal - Bandera que indica si la configuración enviada es el total de los conjuntos de las variables seleccionadas
     */
    function _createScore_Decil(decildata) {

        _VERBOSE ? console.log("_createScore_Decil") : _VERBOSE;

        $('#chartdiv_score_decil').loading({
            stoppable: true
        });

        var data_request = jQuery.extend(true, {}, decildata);

        console.log(data_request)
        data_request["decil_selected"] = [_default_decil]


        // decildata["with_data_freq"] = false;
        // decildata["with_data_score_cell"] = true;
        // decildata["with_data_freq_cell"] = false;
        // decildata["with_data_score_decil"] = false;

        var verbo = _val_process_temp ? "countsTaxonsGroupTimeValidation" : "countsTaxonsGroup"
        var modifiers_flag_verb = sessionStorage.getItem("modifiers_flag");
        var state_model = $("#pred_des_control")[0].checked;
        var train_month = "";
        let todayDate = new Date();
        let todayDateToNextThirtyDays = String(todayDate.getFullYear() + "-" + (Number((todayDate.getMonth() + 1)) < 10 ? "0" + (todayDate.getMonth() + 1) : (todayDate.getMonth() + 1)) + "-" + (Number(todayDate.getDate()) < 10 ? "0" + todayDate.getDate() : todayDate.getDate()));
        let parsedTrainingStartTothirtyDays = ""
        let parsedYesterdayDateToThirtyDays = ""

        function returnTheEndMonthDayByTheNumberOfMonth(numberOfTheMonth) {
            var endMonthDay = "";
            switch (numberOfTheMonth) {
                case "01":
                    endMonthDay = "31";
                    break;
                case "02":
                    endMonthDay = "28";
                    break;
                case "03":
                    endMonthDay = "31";
                    break;
                case "05":
                    endMonthDay = "31";
                    break;
                case "07":
                    endMonthDay = "31";
                    break;
                case "08":
                    endMonthDay = "31";
                    break;
                case "10":
                    endMonthDay = "31";
                    break;
                case "12":
                    endMonthDay = "31";
                    break;

                default:
                    endMonthDay = "30";

                    break;
            }
            return endMonthDay;

        }



        if (state_model) {

            var verbo = "countsTaxonsGroupTimeValidation";
            if ($("#pred_des_control")[0].checked) {
                var liminf_initial = $("#date_timepicker_start_val").val();

            } else {
                var liminf_initial = $("#date_timepicker_start").val();
            }

            if (liminf_initial == todayDateToNextThirtyDays) {
                var todayDatePlusThirtyDays = new Date(todayDate.setDate(todayDate.getDate() + 30))
                let parsedTodayDatePlusThirtyDays = String(todayDatePlusThirtyDays.getFullYear() + "-" + (Number((todayDatePlusThirtyDays.getMonth() + 1)) < 10 ? "0" + (todayDatePlusThirtyDays.getMonth() + 1) : (todayDatePlusThirtyDays.getMonth() + 1)) + "-" + (Number(todayDatePlusThirtyDays.getDate()) < 10 ? "0" + todayDatePlusThirtyDays.getDate() : todayDatePlusThirtyDays.getDate()));
                var liminf = todayDateToNextThirtyDays;
                var limsup = parsedTodayDatePlusThirtyDays;
                var yesterdayDateToThirtyDays = new Date(todayDate.setDate(todayDate.getDate() - 31))
                var trainingStartTothirtyDays = new Date(todayDate.setDate(todayDate.getDate() - 30))
                parsedYesterdayDateToThirtyDays = String(yesterdayDateToThirtyDays.getFullYear() + "-" + (Number((yesterdayDateToThirtyDays.getMonth() + 1)) < 10 ? "0" + (yesterdayDateToThirtyDays.getMonth() + 1) : (yesterdayDateToThirtyDays.getMonth() + 1)) + "-" + (Number(yesterdayDateToThirtyDays.getDate()) < 10 ? "0" + yesterdayDateToThirtyDays.getDate() : yesterdayDateToThirtyDays.getDate()));
                parsedTrainingStartTothirtyDays = String(trainingStartTothirtyDays.getFullYear() + "-" + (Number((trainingStartTothirtyDays.getMonth() + 1)) < 10 ? "0" + (trainingStartTothirtyDays.getMonth() + 1) : (trainingStartTothirtyDays.getMonth() + 1)) + "-" + (Number(trainingStartTothirtyDays.getDate()) < 10 ? "0" + trainingStartTothirtyDays.getDate() : trainingStartTothirtyDays.getDate()));

            } else {

                var liminf_splited = liminf_initial.split("-");
                var month = liminf_splited[1]
                var endMonthDay = returnTheEndMonthDayByTheNumberOfMonth(month);

                var liminf = liminf_splited[0] + "-" + liminf_splited[1] + "-01";
                var limsup = liminf_splited[0] + "-" + liminf_splited[1] + "-" + endMonthDay;
                train_month = liminf_splited[1] == 1 ? "12" : (liminf_splited[1] >= 10 ? +String(Number(liminf_splited[1]) - 1) : "0" + String(Number(liminf_splited[1]) - 1));
            }
            console.log("liminf: " + liminf);
            console.log("limsup: " + limsup);
            if ($("#chkValidationTemp").is(':checked')) {
                mydate = train_month ? ((train_month == "12"? Number(liminf_splited[0] - 1) :liminf_splited[0]) + "-" + train_month + "-01") : parsedTrainingStartTothirtyDays;
                mydate2 = train_month ? ((train_month == "12"? Number(liminf_splited[0] - 1) :liminf_splited[0]) + "-" + train_month + "-" + returnTheEndMonthDayByTheNumberOfMonth(train_month)) : parsedYesterdayDateToThirtyDays;
                console.log(data_request);

                var periodSelectedComplete = $("#date_timepicker_start_val").val();
                var periodDate= new Date(periodSelectedComplete);
                var twoMonthsPreviousPeriodDate =  new Date(periodDate.setMonth(periodDate.getMonth()-2))
                twoMonthsPreviousPeriodSelectedShortAux = twoMonthsPreviousPeriodDate.getFullYear() + "-" + (Number((twoMonthsPreviousPeriodDate.getMonth()+1)) < 10 ? "0" + (twoMonthsPreviousPeriodDate.getMonth()+1) : (twoMonthsPreviousPeriodDate.getMonth()+1))
                liminf = twoMonthsPreviousPeriodSelectedShortAux + "-01"
                limsup = twoMonthsPreviousPeriodSelectedShortAux + "-" + returnTheEndMonthDayByTheNumberOfMonth(liminf.split("-")[1])
                data_request["lim_inf"] = liminf;
                data_request["lim_sup"] = limsup;
                data_request["lim_inf_validation"] = mydate;
                data_request["lim_sup_validation"] = mydate2;
            } else {
                data_request["lim_inf"] = liminf;
                data_request["lim_sup"] = limsup;
            }
            let enfoque = sessionStorage.getItem("light_traffic");
            if (enfoque == "star") {
                enfoque = "none";
            }
            console.log(enfoque);
            data_request["traffic_light"] = enfoque;
            data_request["period_config"] = ['*', '*', '1'];
            console.log(data_request);


        }
        var url = _url_zacatuche + "/niche/" + verbo




        if (modifiers_flag_verb == "true") {
            var verbo = "generateTarget";
            var url = _url_zacatuche + "/niche/" + verbo;
            //var url = _url_zacatuche + "/dev/niche/" + verbo;
            //data_request['period_config'] = ["*", "*", "'1'"];
        }
        // cambiando peticiones ajax por promesas y fetch api
        fetch(url, {
                method: "POST",
                body: JSON.stringify(data_request),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(respuesta => {

                console.log(respuesta)

                if (!respuesta.ok) {
                    // TODO: mandar mensaje de error
                    _module_toast.showToast_BottomCenter("Error al ejecutar el análisis", "error");
                    $('#chartdiv_score_decil').loading('stop');
                    return
                }

                _REQUESTS_NUMBER = _REQUESTS_NUMBER - 1;

                // PROCESANDO PETICIONES INDIVIDUALES
                var data_response = jQuery.extend(true, [], respuesta.data);
                var validation_data = _val_process_temp ? respuesta.time_validation : respuesta.validation_data

                processSingleResponse(data_response, data_request, validation_data);

                _REQUESTS_DONE.push(respuesta);

                // todas las peticiones han sido realizadas
                if (_REQUESTS_NUMBER === 0) {

                    // confirma la desaparición del boton anterior de seguimiento
                    // $("#specie_next").css('visibility', 'hidden');

                    var total_eps_scr = [];
                    var total_score_cell = [];
                    var percentage_avg = [];
                    var decil_cells = [];
                    var time_validacion_decil = [];
                    var cell_summary = []


                    // CONCATENA LAS DIFERENTES PETICIONES SOLICITADAS AL SERVIDOR, EN CASO DE VALIDACION LOS VALORES POR PETICIÓN YA VIENEN PROMEDIADOS
                    _REQUESTS_DONE.forEach(function(item, index) {
                        total_eps_scr = total_eps_scr.concat(item.data)

                        total_score_cell = total_score_cell.concat(item.data_score_cell);
                        percentage_avg = percentage_avg.concat(item.percentage_avg);
                        decil_cells = decil_cells.concat(item.decil_cells);
                        time_validacion_decil = time_validacion_decil.concat(item.time_validation) // revisar si es necesario
                        cell_summary = cell_summary.concat(item.cell_summary);

                    });
                    console.log(total_eps_scr);
                    console.log(total_score_cell);
                    console.log(percentage_avg);
                    console.log(decil_cells);
                    console.log(time_validacion_decil);
                    console.log(cell_summary);

                    // PETICION EN SERVER, SUMATORIA EN CLIENTE - getGeoRel - Tabla General
                    _createTableEpSc(total_eps_scr);


                    // PROCESO EJECUTADO DEL LADO DEL CLIENTE - getFreqSpecie - Histogramas por especie
                    var data_freq = _utils_module.processDataForFreqSpecie(total_eps_scr);
                    _createHistEpScr_Especie(data_freq); // OK


                    // PROCESO EJECUTADO DEL LADO DEL SERVIDOR, SUMA EN CLIENTE - getScoreCell - Mapa
                    // Obtiene calculo de apriori, para restarlo en lso resultados para evitar dobles, triples, etc adiciones de apriori a los datos
                    var numr = _REQUESTS_MADE.length
                    var apriori = $("#chkApriori").is(':checked') ? true : false;
                    var val_apriori = 0

                    if (apriori) {
                        var val_apriori = parseFloat(Math.log(total_eps_scr[0].ni / (total_eps_scr[0].n - total_eps_scr[0].ni)))
                        console.log("val_apriori: " + val_apriori);
                        console.log("numr: " + numr);
                    }

                    _current_data_score_cell = _utils_module.reduceScoreCell(total_score_cell, val_apriori, numr);
                    _configureStyleMap();


                    // PROCESO EJECUTADO DEL LADO DEL CLIENTE - getFreqCell - Histograma por celda
                    var data_freq_cell = _utils_module.processDataForFreqCell(_current_data_score_cell);
                    _createHistScore_Celda(data_freq_cell);



                    console.log(_TREE_GENERATED);
                    // console.log(_TREE_GENERATED.groups);

                    var score_cell_byanalysis = [];
                    var names_byanalysis = [];
                    var decil_total_results = []

                    _TREE_GENERATED.groups.forEach(function(group) {

                        var score_cell_bygroup = [];
                        var names_bygroup = [];
                        var validation_data_bygroup = []

                        names_byanalysis.push(group.name);

                        group.children.forEach(function(child) {

                            console.log(child);

                            score_cell_bygroup = score_cell_bygroup.concat(child.response);
                            score_cell_byanalysis = score_cell_byanalysis.concat(child.response);
                            validation_data_bygroup = validation_data_bygroup.concat(child.validation_data);

                            names_bygroup.push(child.value);

                        });

                        console.log(score_cell_bygroup)
                        console.log(validation_data_bygroup)

                        var data_cell_bygroup = _utils_module.reduceScoreCell(score_cell_bygroup);

                        // obtiene el promedio de las variables de un grupo
                        var data_reduce_decilgroup = _utils_module.reduceDecilGroups(validation_data_bygroup);

                        // agrega resultado por grupo a arraeglo de grupos
                        decil_total_results = decil_total_results.concat(data_reduce_decilgroup)

                        var data_decil_bygroup = { data: _utils_module.processDataForScoreDecil(data_cell_bygroup), gpo_name: group.name, names: names_bygroup, deciles: data_reduce_decilgroup };

                        _RESULTS_TODISPLAY.push(data_decil_bygroup);

                    });



                    if (_TREE_GENERATED.hasTotal) {


                        //TODO: se tiene que realizar la petición del análisis completo y agregar
                        var total_request = { time: new Date().getTime() };

                        $.each(_TREE_GENERATED.groups, function(i, grupo) {
                            $.each(grupo.children, function(j, child) {

                                var temp_child = jQuery.extend(true, {}, child);
                                total_request = mergeRequest(total_request, temp_child);

                            });
                        });

                        _cdata = jQuery.extend(true, {}, total_request);

                        total_request.with_data_score_cell = true
                        total_request.with_data_score_decil = true
                        total_request.decil_selected = [_default_decil]

                        verbo = _val_process_temp ? "countsTaxonsGroupTimeValidation" : "countsTaxonsGroup"
                        var modifiers_flag_verb = sessionStorage.getItem("modifiers_flag");
                        if (modifiers_flag_verb == "true") {
                            verbo = "generateTarget";
                        }
                        if ($("#chkValidationTemp").is(':checked')) {

                            mydate = train_month ? ((train_month == "12"? Number(liminf_splited[0] - 1) :liminf_splited[0]) + "-" + train_month + "-01") : parsedTrainingStartTothirtyDays;
                            mydate2 = train_month ? ((train_month == "12"? Number(liminf_splited[0] - 1) :liminf_splited[0]) + "-" + train_month + "-" + returnTheEndMonthDayByTheNumberOfMonth(train_month)) : parsedYesterdayDateToThirtyDays;
                            total_request["lim_inf"] = mydate;
                            total_request["lim_sup"] = mydate2;
                            total_request["lim_inf_validation"] = liminf;
                            total_request["lim_sup_validation"] = limsup;
                        }
                        let enfoque2 = sessionStorage.getItem("light_traffic");
                        if (enfoque2 == "star") {
                            enfoque2 = "none";
                        }
                        let modifiers2 = JSON.parse(sessionStorage.getItem("modifiers"));
                        let texto = Object.values(modifiers2);
                        let texto2 = (texto[0])
                        console.log(texto2);
                        console.log(enfoque2);
                        total_request["traffic_light"] = enfoque2;
                        total_request["modifier"] = texto2;
                        total_request["period_config"] = ['*', '*', '1'];

                        console.log(total_request);



                        fetch(_url_zacatuche + "/niche/" + verbo, {
                        //fetch(_url_zacatuche + "/dev/niche/" + verbo, {
                                method: "POST",
                                body: JSON.stringify(total_request),
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            })
                            .then(resp => resp.json())
                            .then(resp => {

                                if (resp.ok) {

                                    _VERBOSE ? console.log("_TREE_GENERATED.hasTotal resp.ok") : _VERBOSE;

                                    var total_counts = resp.data;

                                    var validation_data = _val_process_temp ? resp.time_validation : resp.validation_data

                                    // var validation_data = resp.validation_data

                                    var data_score_cell = resp.data_score_cell

                                    var percentage_avg = resp.percentage_avg

                                    var decil_cells = resp.decil_cells

                                    // sobre escribe el resultado en caso de ser total
                                    cell_summary = resp.cell_summary


                                    // console.log("total_counts: " + total_counts.length)
                                    // console.log(decil_cells)
                                    // console.log(percentage_avg)
                                    console.log(validation_data)
                                    console.log(data_score_cell)
                                        // console.log(cell_summary)

                                    if (_val_process_temp) {
                                        $("#div_munlist").show();
                                        processTableMun(cell_summary);
                                    } else {
                                        $("#div_munlist").hide();
                                    }


                                    var data_decil_byanalysis = { data: _utils_module.processDataForScoreDecil(data_score_cell), gpo_name: "Total", names: names_byanalysis, deciles: validation_data };

                                    console.log(data_decil_byanalysis)

                                    _RESULTS_TODISPLAY.push(data_decil_byanalysis);

                                    console.log(_RESULTS_TODISPLAY)

                                    _histogram_module_nicho.createMultipleBarChart(_RESULTS_TODISPLAY, [], _id_chartscr_decil, d3.map([]));

                                    loadDecilDataTable([_default_decil], "Total", true, percentage_avg, decil_cells);

                                }


                                $('#chartdiv_score_decil').loading('stop');


                            })
                            .catch(err => {

                                console.error(err);

                                $('#chartdiv_score_decil').loading('stop');

                            });


                    } else {

                        console.log(_RESULTS_TODISPLAY)

                        if (_val_process_temp) {
                            $("#div_munlist").show();
                            processTableMun(cell_summary);
                        } else {
                            $("#div_munlist").hide();
                        }

                        _histogram_module_nicho.createMultipleBarChart(_RESULTS_TODISPLAY, [], _id_chartscr_decil, d3.map([]));

                        loadDecilDataTable([_default_decil], "Total", true, percentage_avg, decil_cells);

                        $('#chartdiv_score_decil').loading('stop');

                    }




                }

            })
            .catch(err => {
                console.error(err);
                $('#chartdiv_score_decil').loading('stop');
            });

    }


    function processTableMun(cell_summary) {

        console.log("processTableMun")

        var array_column = []
        var gridres_column = ""

        var gridids = cell_summary.map(function(d) {
            return parseInt(d.gridid);
        });

        var map_result = d3.map([]);
        cell_summary.forEach(function(item, index) {
            map_result.set(parseInt(item.gridid), item)
        })

        if (_grid_res === "mun") {
            array_column = ["NOM_MUN", "NOM_ENT"]
        } else {
            array_column = ["NOM_ENT"]
        }
        gridres_column = "gridid_" + _grid_res + "km"

        var data = {
            "grid_resolution": _grid_res,
            "columns": array_column,
            "gridids": gridids
        }

        console.log(gridids);
        console.log("_grid_res: " + _grid_res);
        console.log("gridres_column: " + gridres_column);
        console.log(map_result);
        console.log(data);

        fetch(_url_zacatuche + "/niche/especie/getColumnsGrid", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(resp => {

                // console.log(resp.data)
                var area_names = resp.data

                area_names.forEach(function(item, index) {

                    var gridid = parseInt(item[gridres_column])

                    // console.log(item["NOM_ENT"])

                    var item_res = map_result.get(gridid);
                    item_res.nom_state = (item["NOM_ENT"] === undefined) ? "N/A" : item["NOM_ENT"]
                    item_res.nom_mun = (item["NOM_MUN"] === undefined) ? "N/A" : item["NOM_MUN"]

                    item_res.b1_name = item_res.best_predictor_1[0]
                    item_res.b1_value = item_res.best_predictor_1[1]
                    item_res.b2_name = item_res.best_predictor_2[0]
                    item_res.b2_value = item_res.best_predictor_2[1]
                    item_res.b3_name = item_res.best_predictor_3[0]
                    item_res.b3_value = item_res.best_predictor_3[1]
                    item_res.b4_name = item_res.best_predictor_4[0]
                    item_res.b4_value = item_res.best_predictor_4[1]
                    item_res.b5_name = item_res.best_predictor_5[0]
                    item_res.b5_value = item_res.best_predictor_5[1]

                    item_res.w1_name = item_res.worst_predictor_1[0]
                    item_res.w1_value = item_res.worst_predictor_1[1]
                    item_res.w2_name = item_res.worst_predictor_2[0]
                    item_res.w2_value = item_res.worst_predictor_2[1]
                    item_res.w3_name = item_res.worst_predictor_3[0]
                    item_res.w3_value = item_res.worst_predictor_3[1]
                    item_res.w4_name = item_res.worst_predictor_4[0]
                    item_res.w4_value = item_res.worst_predictor_4[1]
                    item_res.w5_name = item_res.worst_predictor_5[0]
                    item_res.w5_value = item_res.worst_predictor_5[1]

                    item_res.train = item_res.training_period
                    item_res.validation = item_res.validation_period

                    item_res.first_period = item_res.first_period

                })

                var data_list = []

                map_result.values().forEach(function(item, index) {

                    var row_temp = []

                    row_temp.push(item.nom_state)
                    row_temp.push(item.nom_mun)
                    row_temp.push(parseFloat(item.score).toFixed(2))
                    row_temp.push(parseFloat(item.positive_score).toFixed(2))
                    row_temp.push(parseFloat(item.negative_score).toFixed(2))
                    row_temp.push(item.grupo_riesgo)

                    row_temp.push(item.b1_name)
                    row_temp.push(item.b1_value)
                    row_temp.push(item.b2_name)
                    row_temp.push(item.b2_value)
                    row_temp.push(item.b3_name)
                    row_temp.push(item.b3_value)
                    row_temp.push(item.b4_name)
                    row_temp.push(item.b4_value)
                    row_temp.push(item.b5_name)
                    row_temp.push(item.b5_value)

                    row_temp.push(item.w1_name)
                    row_temp.push(item.w1_value)
                    row_temp.push(item.w2_name)
                    row_temp.push(item.w2_value)
                    row_temp.push(item.w3_name)
                    row_temp.push(item.w3_value)
                    row_temp.push(item.w4_name)
                    row_temp.push(item.w4_value)
                    row_temp.push(item.w5_name)
                    row_temp.push(item.w5_value)

                    row_temp.push(item.train)
                    row_temp.push(item.validation)

                    row_temp.push(item.first_period)

                    data_list.push(row_temp)
                });

                console.log(data_list)
                _table_module_eps.createListMun(data_list);


            })
            .catch(err => {
                console.error(err);
                $('#chartdiv_score_decil').loading('stop');
            });




    }

    function processSingleResponse(data, data_request, validation_data = []) {

        _VERBOSE ? console.log("processSingleResponse") : _VERBOSE;

        _TREE_GENERATED.groups.forEach(function(group_item, index) {

            // console.log(group_item);
            // console.log(data_request);

            if (group_item.groupid === data_request.covariables[0].group_item) {

                group_item.children.forEach(function(child, index) {

                    if (child.value === data_request.covariables[0].merge_vars[0].value) {

                        var data_score_cell = _utils_module.processDataForScoreCell(data);
                        child.response = data_score_cell;
                        child.validation_data = validation_data

                        if (data_request.groupid !== undefined || data_request.covariables !== undefined) {
                            // var title_valor = _utils_module.processTitleGroup(data_request.groupid, data_request.covariables);
                            // child.title_valor = title_valor;

                            child.title_valor = JSON.stringify({
                                'title': 'Grupo Bio ' + data_request.groupid,
                                'type': 0,
                                'group_item': data_request.covariables[0].group_item,
                                'is_parent': true
                            });

                            child.request = data_request;
                        }

                    }

                });

            }

        });

    }



    // function loadDecilDataTable(decil = 10, name = "Total", first_loaded = true, counts = []) {
    function loadDecilDataTable(deciles, name, first_loaded, percentage_avg, decil_cells) {

        _VERBOSE ? console.log("loadDecilDataTable") : _VERBOSE;

        $('#div_example').loading({
            stoppable: true
        });

        $('#map').loading({
            stoppable: true
        });

        _decil_values_tbl = [];

        // console.log(counts)


        // console.log(_TREE_GENERATED);
        // console.log("tbl_request: " + tbl_request);
        // console.log("name: " + name);
        // console.log("decil: " + decil);
        // console.log("first_loaded: " + first_loaded);


        // obteniendo request total
        var total_request = { time: new Date().getTime() };

        if (name === "Total") {
            $.each(_TREE_GENERATED.groups, function(i, grupo) {
                $.each(grupo.children, function(j, child) {

                    var temp_child = jQuery.extend(true, {}, child);
                    total_request = mergeRequest(total_request, temp_child);

                });
            });
        }

        // console.log(total_request);
        // No comentar. Enlaza total del request para selección de celda
        _cdata = jQuery.extend(true, {}, total_request);

        //TODO: optimizar metodo:
        // esta mandando varias peticiones cada que se seleccioan una barra
        $.each(_TREE_GENERATED.groups, function(index, value) {

            var request = {};

            // console.log(value);
            // console.log("_currentNameView: " + _currentNameView);

            console.log("value.name: " + value.name);
            console.log("name: " + name);
            console.log(_currentNameView !== name);
            //            console.log(_currentDecil !== decil);



            console.log(_currentDecil);
            console.log(deciles);


            // if (first_loaded ||
            //         (value.name === name && (_currentNameView !== name || _currentDecil !== decil)) ||
            //         (name === "Total" && (_currentNameView !== name || _currentDecil !== decil))
            //         ) {


            // var difer_array = deciles.length === _currentDecil.length && deciles.sort().every(function(value, index) { return value === _currentDecil.sort()[index]}) === false
            var difer_array = (JSON.stringify(_currentDecil) === JSON.stringify(deciles)) === false;
            // var difer_array = _currentDecil.length === deciles.length && _currentDecil.sort().every(function(value, index) { return value === deciles.sort()[index]}) === false

            console.log("difer_array: " + difer_array)


            if (first_loaded ||
                (value.name === name && (_currentNameView !== name || difer_array)) ||
                (name === "Total" && (_currentNameView !== name || difer_array))
            ) {

                console.log("Actualiza tabla");
                // console.log("name: " + name);
                // console.log("deciles: " + deciles);

                _currentNameView = name;
                _currentDecil = deciles;

                if (name !== "Total") {
                    $.each(value.children, function(i, child) {
                        var temp_child = jQuery.extend(true, {}, child);
                        request = mergeRequest(request, temp_child);
                    });
                } else {
                    request = total_request;
                }


                request["decil_selected"] = deciles
                request["with_data_score_decil"] = true;

                console.log(request);


                if (first_loaded) {

                    // $("#map_next").css('visibility', 'visible');
                    // $("#map_next").show("slow");


                    // activeDecilOccurrences(decil_cells, decil)

                    createTableDecil(percentage_avg);

                    $('#div_example').loading('stop');
                    $('#map').loading('stop');
                } else {

                    fetch(_url_zacatuche + "/niche/countsTaxonsGroup", {
                            method: "POST",
                            body: JSON.stringify(request),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                        .then(resp => resp.json())
                        .then(resp => {

                            // $("#map_next").css('visibility', 'visible');
                            // $("#map_next").show("slow");

                            if (resp.ok) {

                                _VERBOSE ? console.log("loadDecilDataTable resp.ok") : _VERBOSE;

                                var percentage_avg = resp.percentage_avg;

                                var decil_cells = resp.decil_cells;

                                console.log(percentage_avg)

                                console.log(decil_cells)

                                activeDecilOccurrences(decil_cells, deciles)

                                createTableDecil(percentage_avg)

                            }

                            $('#div_example').loading('stop');


                        })
                        .catch(err => {
                            console.error(err);

                            $('#div_example').loading('stop');
                            $('#map').loading('stop');
                        });


                }

                return false;
            }

        });


    }

    function createTableDecil(counts) {

        _VERBOSE ? console.log("createTableDecil") : _VERBOSE;

        var decil_list = [];

        // console.log(counts)
        _table_module_eps.createDecilList(counts);


    }

    function mergeRequest(request = {}, child = []) {

        _VERBOSE ? console.log("mergeRequest") : _VERBOSE;
        console.log(request);
        console.log(child);



        // este conjunto de parámetros no importa que sean sobreescritos en cada iteración por que no cambian en la petición global
        request.grid_resolution = child.request.grid_resolution;
        request.region = child.request.region;
        request.min_cells = child.request.min_cells;
        request.idtabla = request.idtabla ? request.idtabla : child.request.idtabla;
        request.iterations = child.request.iterations;
        request.fosil = child.request.fosil;
        request.date = child.request.date;
        request.lim_inf = child.request.lim_inf;
        request.lim_sup = child.request.lim_sup;
        request.get_grid_species = child.request.get_grid_species;
        request.apriori = request.apriori ? request.apriori : child.request.apriori;
        request.mapa_prob = request.mapa_prob ? request.mapa_prob : child.request.mapa_prob;
        request.with_data_freq = false;
        request.with_data_score_cell = false;
        request.with_data_freq_cell = false;
        request.with_data_score_decil = false;
        // request.decil_selected = request.decil_selected ? request.decil_selected : child.request.decil_selected

        // se realiza un analisis del contenido y se concatena
        if (!request.excluded_cells)
            request.excluded_cells = child.request.excluded_cells;
        else
            request.excluded_cells = request.excluded_cells.concat(child.request.excluded_cells);


        if (!request.covariables)
            request.covariables = child.request.covariables;
        else {
            child.request.covariables.forEach(function(item, index) {

                var name_request = request.covariables.map(function(d) { return d.name; });

                if (name_request.indexOf(item.name) === -1) {
                    request.covariables.push(item);
                } else {
                    var index = name_request.indexOf(item.name)
                    var merge_vars = request.covariables[index].merge_vars;
                    merge_vars.push(item.merge_vars[0]);
                }
            })
        }

        if (!request.target_taxons)
            request.target_taxons = child.request.target_taxons;
        else {

            child.request.target_taxons.forEach(function(item, index) {

                var values_request = request.target_taxons.map(function(d) { return d.value; })
                var taxons_request = request.target_taxons.map(function(d) { return d.taxon_rank; })

                if (values_request.indexOf(item.value) === -1 && taxons_request.indexOf(item.taxon_rank) === -1) {
                    request.target_taxons.push(item)
                }
            })
        }



        // request.covariables.forEach(function(item,index){
        //     item.name = "Total"
        // })

        console.log(request.covariables)


        // request.val_process = request.val_process ? request.val_process : child.request.val_process;
        // request.level_req = child.request.level_req;


        return request;

    }



    function despliegaLoadings() {

        $('#treeAddedPanel').loading({
            stoppable: true
        });

        $('#hst_esp_eps').loading({
            stoppable: true
        });

        $('#hst_esp_scr').loading({
            stoppable: true
        });

        $('#hst_cld_scr').loading({
            stoppable: true
        });

        $('#map').loading({
            stoppable: true
        });

        $('#div_example').loading({
            stoppable: true
        });

    }


    /**
     * Éste método envía el conjunto de parámetros al módulo table para generar la tabla de resultados de épsilon y score en el análisis de nicho ecológico.
     *
     * @function _createTableEpSc
     * @private
     * @memberof! res_display_module
     *
     * @param {json} tdata - Json con la configuración seleccionada por el usuario
     * @param {String} idtemptable - Nombre de la tabla temporal creada cuando es proceso de validación
     *
     */
    function _createTableEpSc(data) {

        _VERBOSE ? console.log("_createTableEpSc") : _VERBOSE;
        _VERBOSE ? console.log(data) : _VERBOSE;

        var data_list = [];

        data.forEach(function(d) {
            var item_list = [];

            // las variables climáticas no cuentan con reino, phylum, clase, etc
            if (d.reinovalido === "" && d.phylumdivisionvalido === "" && d.especieepiteto === "") {
                // var arg_values = d.especievalidabusqueda.split(" ")

                console.log(d)

                var range = d.tag.split(":")
                var label = d.label.replace(/[^a-zA-Z0-9]/g, "").replace(/ /g, '')

                var min = (parseFloat(range[0]) * d.coeficiente).toFixed(3) + " " + d.unidad
                var max = (parseFloat(range[1]) * d.coeficiente).toFixed(3) + " " + d.unidad

                // var value = _iTrans.prop(label) + " (" + parseFloat(range[0]).toFixed(2) + " : " + parseFloat(range[1]).toFixed(2) + ") "


                if (d.tag.split(":").length > 1) {
                    var value = _iTrans.prop(label) + " (" + min + " : " + max + ") ";
                } else {
                    var value = _iTrans.prop(label) + ' (' + d.tag + ')';
                }


                item_list.push(value)

            } else {
                //item_list.push(d.generovalido + " " +d.especieepiteto + " " + d.nombreinfra)

                item_list.push(d.description + ' ' + d.especieepiteto)
            }

            // var namesp = d.reinovalido === "" ? d.type +" "+ d.layer :
            // item_list.push(namesp)
            item_list.push(d.nij)
            item_list.push(d.nj)
            item_list.push(d.ni)
            item_list.push(d.n)
            item_list.push(d.epsilon)
            item_list.push(d.score)
            item_list.push(d.reinovalido)
            item_list.push(d.phylumdivisionvalido)
            item_list.push(d.clasevalida)
            item_list.push(d.ordenvalido)
            item_list.push(d.familiavalida)

            data_list.push(item_list)
        });

        var json_arg = { data: data_list }

        _table_module_eps.createEspList(json_arg);
        _tbl_eps = true;

        $('#treeAddedPanel').loading('stop');

        // $("#hist_next").css('visibility', 'visible');
        // $("#hist_next").show("slow");


    }

    function activeDecilOccurrences(decil_cells, deciles) {

        _VERBOSE ? console.log("activeDecilOccurrences") : _VERBOSE;

        _map_module_nicho.updateDecilLayer(deciles)

        _map_module_nicho.setDecilCells(decil_cells);

        _map_module_nicho.colorizeDecileFeatures();

        $('#map').loading('stop');

    }


    /**
     * Éste método realiza la petición al servidor para obtener el valor de score por celda utilizado para la coloración de la malla a través del módulo mapa en el análisis de nicho ecológico.
     *
     * @function _configureStyleMap
     * @private
     * @memberof! res_display_module
     *
     * @param {json} data - JSON con los resultados de id de celda y valor de total score
     */
    function _configureStyleMap() {

        _VERBOSE ? console.log("_configureStyleMap") : _VERBOSE;


        _VERBOSE ? console.log(_current_data_score_cell) : _VERBOSE;
        if (_current_data_score_cell === undefined) {
            _VERBOSE ? console.log("No data to color the map") : _VERBOSE;
            return
        }

        // grid_map_color contiene colores y scores
        var grid_map_color
        var map_type = $("#btn_map_type").val()

        // if(map_type == "range"){
        //     grid_map_color = _map_module_nicho.createDecilColor(_current_data_score_cell, _mapa_prob);
        // }
        // else{
        // console.log(_current_data_score_cell)
        grid_map_color = _map_module_nicho.createRankColor(_current_data_score_cell, _mapa_prob, map_type);
        // }

        console.log(grid_map_color)

        _map_module_nicho.colorizeFeatures(grid_map_color);
        _map_module_nicho.colorizeTargetFeatures();
        //_map_module_nicho.colorizeFeaturesEpipuma();
        //_map_module_nicho.colorizeFeaturesEpipumaWhite();

        // $("#params_next").css('visibility', 'visible');
        // $("#params_next").show("slow");

        if (_first_analysis) {
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_inica_mapa'), "info");
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_carga_mapa'), "success");

            _first_analysis = false;
        }
        document.getElementById("dShape").style.display = "inline";

        $('#map').loading('stop');

    }



    /**
     * Éste método realiza la petición al servidor para obtener el valor de épsilon y score por especie y desplegar los histogramas de epsilon especie y score especie por medio del módulo de histograma en el análisis de nicho ecológico.
     *
     * @function _createHistEpScr_Especie
     * @private
     * @memberof! res_display_module
     *
     * @param {json} ddata - Json con la configuración seleccionada por el usuario
     */
    function _createHistEpScr_Especie(data) {

        _VERBOSE ? console.log("_createHistEpScr_Especie") : _VERBOSE;

        var data2_epsilon = [];
        var data2_score = [];
        var totcount_epsilon = 0;
        var totcount_score = 0;

        var item = data;

        for (var j = 0; j < item.length; j++) {
            totcount_epsilon = totcount_epsilon + parseInt(item[j].freq_epsilon);
            totcount_score = totcount_score + parseInt(item[j].freq_score);
        }

        for (var j = 0; j < item.length; j++) {

            var elemento_epsilon = {
                // bcenter : ((data[j].max_epsilon + data[j].min_epsilon) / 2).toFixed(2),
                bcenter: parseFloat((parseFloat(item[j].min_epsilon) + parseFloat(item[j].max_epsilon)) / 2).toFixed(2),
                frequency: parseFloat(parseInt(item[j].freq_epsilon) / totcount_epsilon).toFixed(2),
                title: item[j].min_epsilon + " : " + item[j].max_epsilon
            };

            var elemento_score = {
                // bcenter : ((data[j].max_score + data[j].min_score) / 2).toFixed(2),
                bcenter: parseFloat((parseFloat(item[j].min_score) + parseFloat(item[j].max_score)) / 2).toFixed(2),
                frequency: parseFloat(parseInt(item[j].freq_score) / totcount_score).toFixed(2),
                title: item[j].min_score + " : " + item[j].max_score
            };

            data2_epsilon.push(elemento_epsilon);
            data2_score.push(elemento_score);

        }

        _histogram_module_nicho.createBarChart(_id_charteps, data2_epsilon, _iTrans.prop('titulo_hist_eps'));
        _histogram_module_nicho.createBarChart(_id_chartscr, data2_score, _iTrans.prop('titulo_hist_score'));

        $('#hst_esp_eps').loading('stop');
        $('#hst_esp_scr').loading('stop');



    }


    /**
     * Éste método actualiza los labels del sistema cuando existe un cambio de lenguaje. Existen labels que no son regenerados ya que la información es obtenida por el servidor al momento de la carga.
     *
     * @function updateLabels
     * @public
     * @memberof! res_display_module
     *
     */
    function updateLabels() {

        _VERBOSE ? console.log("updateLabels") : _VERBOSE;

        _ids_componentes_var.forEach(function(item, index) {

            console.log(item)

            $("#btn_variable_" + item).text($.i18n.prop('btn_variable') + " ");
            $("#btn_variable_" + item).append('<span class="caret"></span>');

            $("#btn_variable_bioclim_" + item).text($.i18n.prop('btn_variable_bioclim') + " ");
            $("#btn_variable_bioclim_" + item).append('<span class="caret"></span>');

            $("#btn_topo_" + item).text($.i18n.prop('btn_topo') + " ");
            $("#btn_topo_" + item).append('<span class="caret"></span>');

            $("#a_taxon_" + item).text($.i18n.prop('a_taxon'));
            $("#a_clima_" + item).text($.i18n.prop('a_clima'));
            $("#a_topo_" + item).text($.i18n.prop('a_topo'));

            $("#btn_variable_bioclim_time_" + item).text($.i18n.prop('btn_variable_bioclim_time') + " ");
            $("#btn_variable_bioclim_time_" + item).append('<span class="caret"></span>');


            $("#a_item_reino_" + item).text($.i18n.prop('a_item_reino'));
            $("#a_item_phylum_" + item).text($.i18n.prop('a_item_phylum'));
            $("#a_item_clase_" + item).text($.i18n.prop('a_item_clase'));
            $("#a_item_orden_" + item).text($.i18n.prop('a_item_orden'));
            $("#a_item_familia_" + item).text($.i18n.prop('a_item_familia'));
            $("#a_item_genero_" + item).text($.i18n.prop('a_item_genero'));

            $("#lb_params_variables").text($.i18n.prop('lb_params_variables'));


            $("#MeanDiurnalRangeMeanofmonthlymaxtempmintemp").text($.i18n.prop("MeanDiurnalRangeMeanofmonthlymaxtempmintemp"));
            $("#IsothermalityBIO2BIO7100").text($.i18n.prop("IsothermalityBIO2BIO7100"));
            $("#TemperatureSeasonalitystandarddeviation100").text($.i18n.prop("TemperatureSeasonalitystandarddeviation100"));
            $("#MaxTemperatureofWarmestMonth").text($.i18n.prop("MaxTemperatureofWarmestMonth"));
            $("#MinTemperatureofColdestMonth").text($.i18n.prop("MinTemperatureofColdestMonth"));
            $("#TemperatureAnnualRangeBIO5BIO6").text($.i18n.prop("TemperatureAnnualRangeBIO5BIO6"));
            $("#MeanTemperatureofWettestQuarter").text($.i18n.prop("MeanTemperatureofWettestQuarter"));
            $("#MeanTemperatureofDriestQuarter").text($.i18n.prop("MeanTemperatureofDriestQuarter"));
            $("#MeanTemperatureofWarmestQuarter").text($.i18n.prop("MeanTemperatureofWarmestQuarter"));
            $("#MeanTemperatureofColdestQuarter").text($.i18n.prop("MeanTemperatureofColdestQuarter"));
            $("#AnnualPrecipitation").text($.i18n.prop("AnnualPrecipitation"));
            $("#PrecipitationofWettestMonth").text($.i18n.prop("PrecipitationofWettestMonth"));
            $("#PrecipitationofDriestMonth").text($.i18n.prop("PrecipitationofDriestMonth"));
            $("#PrecipitationSeasonalityCoefficientofVariation").text($.i18n.prop("PrecipitationSeasonalityCoefficientofVariation"));
            $("#PrecipitationofWettestQuarter").text($.i18n.prop("PrecipitationofWettestQuarter"));
            $("#PrecipitationofDriestQuarter").text($.i18n.prop("PrecipitationofDriestQuarter"));
            $("#PrecipitationofWarmestQuarter").text($.i18n.prop("PrecipitationofWarmestQuarter"));
            $("#PrecipitationofColdestQuarter").text($.i18n.prop("PrecipitationofColdestQuarter"));
            $("#AnnualPotentialEvapotranspirationmmyear").text($.i18n.prop("AnnualPotentialEvapotranspirationmmyear"));
            $("#ThornthwaiteAridityIndex").text($.i18n.prop("ThornthwaiteAridityIndex"));
            $("#MetricofRelativeAetnessandAridity").text($.i18n.prop("MetricofRelativeAetnessandAridity"));
            $("#AverageTempofWarmestMonthC").text($.i18n.prop("AverageTempofWarmestMonthC"));
            $("#EmbergersPluviothermicQuotient").text($.i18n.prop("EmbergersPluviothermicQuotient"));
            $("#SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan0CMultipliedbyNumberofDays").text($.i18n.prop("SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan0CMultipliedbyNumberofDays"));
            $("#SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan5CMultipliedbyNumberofDays").text($.i18n.prop("SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan5CMultipliedbyNumberofDays"));
            $("#MaxTempoftheColdestMonthC10").text($.i18n.prop("MaxTempoftheColdestMonthC10"));
            $("#MinTempoftheWarmestMonthC10").text($.i18n.prop("MinTempoftheWarmestMonthC10"));
            $("#CountoftheNumberofMonthswithMeanTempGreaterthan10Cmonths").text($.i18n.prop("CountoftheNumberofMonthswithMeanTempGreaterthan10Cmonths"));
            $("#MeanMonthlyPETofColdestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofColdestQuartermmmonth"));
            $("#MeanMonthlyPETofDriestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofDriestQuartermmmonth"));
            $("#MonthlyVariabilityinPotentialEvapotranspirationmmmonth").text($.i18n.prop("MonthlyVariabilityinPotentialEvapotranspirationmmmonth"));
            $("#MeanMonthlyPETofWarmestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofWarmestQuartermmmonth"));
            $("#MeanMonthlyPETofWettestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofWettestQuartermmmonth"));
            $("#CompensatedThermicityIndexC").text($.i18n.prop("CompensatedThermicityIndexC"));
            $("#TerrainRoughnessIndex").text($.i18n.prop("TerrainRoughnessIndex"));
            $("#SAGA-GISTopographicWetnessIndex").text($.i18n.prop("SAGA-GISTopographicWetnessIndex"));
            $("#MaximumSlopeinElevations").text($.i18n.prop("MaximumSlopeinElevations"));
            $("#Aspect").text($.i18n.prop("Aspect"));
            $("#CompoundTopographicIndexCTIlnFAtanslope").text($.i18n.prop("CompoundTopographicIndexCTIlnFAtanslope"));
            $("#FlowDirection").text($.i18n.prop("FlowDirection"));
            $("#FlowAccumulations").text($.i18n.prop("FlowAccumulations"));
            $("#DigitalelevationmodelGTOPO30").text($.i18n.prop("DigitalelevationmodelGTOPO30"));

            $("#num_records").text($.i18n.prop("num_records"));
            $("#score_celda").text($.i18n.prop("score_celda"));


            $("#hist_record").text($.i18n.prop('lb_reg_fecha') + ": ");

            $("#lb_des_modal_csv").text($.i18n.prop('lb_des_modal_csv'));
            $("#email_address").attr("placeholder", $.i18n.prop('email_address'));

        });


        // actualiza los titulos de los histogramas
        $("#" + _id_charteps.legend).text($.i18n.prop('titulo_hist_eps'));
        $("#" + _id_charteps.yaxis).text($.i18n.prop('lb_frecuencia'));

        $("#" + _id_chartscr.legend).text($.i18n.prop('titulo_hist_score'));
        $("#" + _id_chartscr.yaxis).text($.i18n.prop('lb_frecuencia'));

        $("#" + _id_chartscr_celda.legend).text($.i18n.prop('titulo_hist_score_celda'));
        $("#" + _id_chartscr_celda.yaxis).text($.i18n.prop('lb_frecuencia'));

        $("#" + _id_chartscr_decil.legend).text($.i18n.prop('titulo_hist_score_decil'));
        $("#" + _id_chartscr_decil.xaxis).text($.i18n.prop('lb_xaxis_decil'));
        $("#" + _id_chartscr_decil.yaxis).text($.i18n.prop('tip_tbl_score'));


        // $("#csv_request").attr("title", $.i18n.prop('lb_descarga_tbl'));
        $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));

        $("#btn_decil").prop("value", $.i18n.prop('btn_decil'));

        $("#btn_demo").text($.i18n.prop('caso_uso'));



    }


    /**
     * Éste método realiza la petición al servidor para obtener el valor de score por celda y desplegar el hitograma de score celda por medio del módulo histograma en el análisis de nicho ecológico.
     *
     * @function _createHistScore_Celda
     * @private
     * @memberof! res_display_module
     *
     * @param {json} cdata - Json con la configuración seleccionada por el usuario
     */
    function _createHistScore_Celda(data) {

        _VERBOSE ? console.log("_createHistScore_Celda") : _VERBOSE;


        var data2_score = [];
        var totcount_score = 0;
        var Fi = []

        for (j = 0; j < data.length; j++) {

            totcount_score = totcount_score + parseInt(data[j].freq);
            Fi[j] = totcount_score;

        }

        for (j = 0; j < data.length; j++) {

            var elemento_score = {
                bcenter: parseFloat((parseFloat(data[j].min) + parseFloat(data[j].max)) / 2).toFixed(2),
                frequency: parseFloat(parseInt(data[j].freq) / totcount_score).toFixed(2),
                title: data[j].min + " : " + data[j].max
            };

            data2_score.push(elemento_score);
        }

        _histogram_module_nicho.createBarChart(_id_chartscr_celda, data2_score, _iTrans.prop('titulo_hist_score_celda'));
        $('#hst_cld_scr').loading('stop');


    }

    /**
     * Éste método realiza la gestión de las respuestas a las peticiones hechas para calcular el score por celda de forma segmentada de los grupos de variables utilizados. Además genera una estructura de la información devuelta por el servidor para generar el histograma decil y tabla decil en el análisis de nicho ecológico.
     *
     * @function _createSetStructure
     * @private
     * @memberof! res_display_module
     *
     * @param {array} fathers - Array resultante de los grupos de variables seleccionados por el usuario.
     * @param {array} sons - Array resultante de las variables seleccionadas por el usuario.
     */
    function _createSetStructure(fathers, sons) {

        _VERBOSE ? console.log("_createSetStructure") : _VERBOSE;

        console.log(_fathers);
        console.log(_sons);


        // binding parents and sons
        fathers.forEach(function(father) {

            sons.forEach(function(son) {

                if (parseInt(father.item[0].title.type) === parseInt(son.item[0].title.type) && parseInt(father.item[0].title.group_item) === parseInt(son.item[0].title.group_item)) {

                    var son_index = 0;

                    father.item.forEach(function(decil_item) {

                        // if there's no decil data in son, coninue for the next one
                        if (!son.item[son_index])
                            return;
                        if (son.item[son_index].decil !== decil_item.decil)
                            return;

                        if (!(decil_item.vp.s)) {
                            decil_item.vp = { p: decil_item.vp, s: [son.item[son_index].vp] }
                        } else {
                            temp_s = decil_item.vp.s;
                            temp_s.push(son.item[son_index].vp);
                            decil_item.vp.s = temp_s;
                        }
                        if (!(decil_item.fn.s)) {
                            decil_item.fn = { p: decil_item.fn, s: [son.item[son_index].fn] }
                        } else {
                            temp_s = decil_item.fn.s;
                            temp_s.push(son.item[son_index].fn);
                            decil_item.fn.s = temp_s;
                        }
                        if (!(decil_item.recall.s)) {
                            decil_item.recall = { p: decil_item.recall, s: [son.item[son_index].recall] }
                        } else {
                            temp_s = decil_item.recall.s;
                            temp_s.push(son.item[son_index].recall);
                            decil_item.recall.s = temp_s;
                        }


                        if (!(decil_item.avg.s)) {
                            decil_item.avg = { p: decil_item.avg, s: [son.item[son_index].avg] }
                        } else {
                            temp_s = decil_item.avg.s;
                            temp_s.push(son.item[son_index].avg);
                            decil_item.avg.s = temp_s;
                        }


                        if (!(decil_item.l_sup.s)) {
                            decil_item.l_sup = { p: decil_item.l_sup, s: [son.item[son_index].l_sup] }
                        } else {
                            temp_s = decil_item.l_sup.s;
                            temp_s.push(son.item[son_index].l_sup);
                            decil_item.l_sup.s = temp_s;
                        }


                        if (!(decil_item.l_inf.s)) {
                            decil_item.l_inf = { p: decil_item.l_inf, s: [son.item[son_index].l_inf] }
                        } else {
                            temp_s = decil_item.l_inf.s;
                            temp_s.push(son.item[son_index].l_inf);
                            decil_item.l_inf.s = temp_s;
                        }


                        if (!(decil_item.title.title.s)) {
                            console.log("no existe s")
                            decil_item.title.title = { p: decil_item.title.title, s: [son.item[son_index].title.title] }
                        } else {
                            console.log("existe s")
                            temp_s = decil_item.title.title.s;
                            temp_s.push(son.item[son_index].title.title);
                            decil_item.title.title.s = temp_s;
                        }

                        son_index++;

                    });

                }

            })

        });

        //        _VERBOSE ? console.log(fathers) : _VERBOSE;
        //        _VERBOSE ? console.log(fathers[0].item.length) : _VERBOSE;

        // binding parents by decil

        // NOTA: puede darse el caso que vengan menos de 10 deciles debido a que la especie objetivo y el grupo de variables tengan menos de 10 intersecciones
        // NOTA: Los grupos que ocmpoenn a fathers peuden variar en el numeor de deciles, por tanto el data_cahrt puede variar en tamaño segun el row de fathers
        data_chart = [];

        // se asignan siempre 10 deciles y depsues se valida si existe
        for (j = _NUM_DECILES; j > 0; j--) {
            data_chart.push({ "decil": String(j) });
        }

        fathers.forEach(function(row, index) {

            // _VERBOSE ? console.log(item) : _VERBOSE;
            row.item.forEach(function(decil, index) {


                for (j = 0; j < _NUM_DECILES; j++) {
                    if (decil.decil == data_chart[j].decil) {
                        var item_chart = data_chart[j];
                        break;
                    }
                }


                if (!(item_chart.vp)) {
                    item_chart['vp'] = [decil.vp];
                } else {
                    temp = item_chart['vp'];
                    temp.push(decil.vp);
                    item_chart['vp'] = temp;
                }
                if (!(item_chart.fn)) {
                    item_chart['fn'] = [decil.fn];
                } else {
                    temp = item_chart['fn'];
                    temp.push(decil.fn);
                    item_chart['fn'] = temp;
                }
                if (!(item_chart.recall)) {
                    item_chart['recall'] = [decil.recall];
                } else {
                    temp = item_chart['recall'];
                    temp.push(decil.recall);
                    item_chart['recall'] = temp;
                }


                if (!(item_chart.values)) {
                    item_chart['values'] = [decil.avg];
                } else {
                    temp = item_chart['values'];
                    temp.push(decil.avg);
                    item_chart['values'] = temp;
                }


                if (!(item_chart.names)) {
                    item_chart['names'] = [decil.title.title];
                } else {
                    temp = item_chart['names'];
                    temp.push(decil.title.title);
                    item_chart['names'] = temp;
                }


                if (!(item_chart.decil)) {
                    item_chart['decil'] = decil.decil;
                }

                if (!(item_chart.lsup)) {
                    item_chart['lsup'] = [decil.l_sup];
                } else {
                    temp = item_chart['lsup'];
                    temp.push(decil.l_sup);
                    item_chart['lsup'] = temp;
                }

                if (!(item_chart.linf)) {
                    item_chart['linf'] = [decil.l_inf];
                } else {
                    temp = item_chart['linf'];
                    temp.push(decil.l_inf);
                    item_chart['linf'] = temp;
                }


            });

        });

        //        _VERBOSE ? console.log(data_chart) : _VERBOSE;

        return data_chart;

    }


    /**
     * Éste método agrega una variable extra a la estructura generada por el método _createSetStructure cuando es requerido un total.
     *
     * @function _addDataChartTotal
     * @private
     * @memberof! res_display_module
     *
     * @param {array} data_chart - Array resultante de los grupos de variables seleccionados por el usuario y con la estrucutra necesaria para ser desplegados en los componentes visuales.
     * @param {array} decil_total - Array resultante del total de los grupos de variables seleccionados por el usuario.
     */
    function _addDataChartTotal(data_chart, decil_total) {
        _VERBOSE ? console.log("addDataChartTotal") : _VERBOSE

        if (data_chart[0].names.length > 1) {

            _VERBOSE ? console.log("Add totals") : _VERBOSE;

            data_chart.forEach(function(decil_item, index) {

                _VERBOSE ? console.log("total") : _VERBOSE
                    //                decil_total[index].arraynames = decil_total[index].arraynames //_deleteRepetedElements(decil_total[index].arraynames);

                names = [];
                decil_item.names.forEach(function(names_item, index) {
                    names.push(names_item.p);
                });
                temp = decil_item['names'];
                temp.push({ p: "Total", s: names });
                decil_item['names'] = temp;


                //                gridids = [];
                //                decil_item.gridids.forEach(function(gridids_item, index) {
                //                    gridids.push(gridids_item.p);
                //                });
                //                temp = decil_item['gridids'];
                //                temp.push({p: decil_total[index].gridids, s: gridids});
                //                decil_item['gridids'] = temp;

                vp = [];
                decil_item.vp.forEach(function(values_item, index) {
                    vp.push(values_item.p);
                });
                temp = decil_item['vp'];
                temp.push({ p: decil_total[index].vp, s: vp });
                decil_item['vp'] = temp;

                fn = [];
                decil_item.fn.forEach(function(values_item, index) {
                    fn.push(values_item.p);
                });
                temp = decil_item['fn'];
                temp.push({ p: decil_total[index].fn, s: fn });
                decil_item['fn'] = temp;

                recall = [];
                decil_item.recall.forEach(function(values_item, index) {
                    recall.push(values_item.p);
                });
                temp = decil_item['recall'];
                temp.push({ p: decil_total[index].recall, s: recall });
                decil_item['recall'] = temp;



                values = [];
                decil_item.values.forEach(function(values_item, index) {
                    values.push(values_item.p);
                });
                temp = decil_item['values'];
                temp.push({ p: decil_total[index].avg, s: values });
                decil_item['values'] = temp;



                lsups = [];
                decil_item.lsup.forEach(function(lsup_item, index) {
                    lsups.push(lsup_item.p);
                });
                temp = decil_item['lsup'];
                temp.push({ p: decil_total[index].l_sup, s: lsups });
                decil_item['lsup'] = temp;

                linfs = [];
                decil_item.linf.forEach(function(linf_item, index) {
                    linfs.push(linf_item.p);
                });
                temp = decil_item['linf'];
                temp.push({ p: decil_total[index].l_inf, s: linfs });
                decil_item['linf'] = temp;


                //                species = [];
                //                decil_item.species.forEach(function (species_item, index) {
                ////                    console.log(species_item);
                //                    species.push(species_item.p);
                //                });
                //                temp = decil_item['species'];
                //                var json_arraynames = decil_total[index].arraynames[0].replace("{", "").replace("}", "").split(",");
                ////                console.log(json_arraynames);
                //                var p_item = json_arraynames.sort();
                ////                console.log(p_item);
                //
                //                temp.push({p: p_item, s: species});
                //                decil_item['species'] = temp;

            });

        }

        _VERBOSE ? console.log(data_chart) : _VERBOSE;
        return data_chart;

    }


    /**
     * DEPRECATED. Éste método elimina las especies repetidas devueltas por el servidor en los cálculos, así como contabilizar el porcentaje de ocurrencias de una especies por decil.
     *
     * @function _deleteRepetedElements
     * @private
     * @memberof! res_display_module
     *
     * @param {array} arraynames - Array con el nombre de las especies que componen cada decil de las variables y grupos de variables seleccionados
     */
    function _deleteRepetedElements(arraynames) {

        uniqueValues = d3.map([]);
        array_values = [];
        newTempStr = [];

        arraynames.forEach(function(d) {
            values = String(d).split(",");
            Array.prototype.push.apply(array_values, values);
        });

        array_values.forEach(function(d) {

            if (uniqueValues.has(d) != true) {
                uniqueValues.set(d, 1);
            } else {
                cont = uniqueValues.get(d);
                uniqueValues.set(d, cont + 1);
            }

        });


        uniqueValues.forEach(function(k, v) {

            arg = k.split("|");
            v_temp = parseInt(arg[arg.length - 1]);
            // console.log(v_temp);
            if (v_temp < v)
                v = v_temp;

            newTempStr.push(k + "|" + v);

        });

        return newTempStr.sort();

    }


    /**
     * Éste método realiza la petición al servidor cuando una celda es seleccionada por el usuario y obtiene el valor de score que se encuentran dentro de la celda en conjunto con el módulo mapa.
     *
     * @function showGetFeatureInfo
     * @public
     * @memberof! res_display_module
     *
     * @param {float} lat - Latitud del punto sleccionado por el usuario
     * @param {float} long - Longitud del punto sleccionado por el usuario
     */
    function showGetFeatureInfo(lat, long, taxones, region) {

        _VERBOSE ? console.log("showGetFeatureInfo") : _VERBOSE;

        $('#map').loading({
            stoppable: true
        });

        var singleCellData = {};

        $.each(_TREE_GENERATED.groups, function(i, grupo) {
            $.each(grupo.children, function(j, child) {

                var temp_child = jQuery.extend(true, {}, child);
                singleCellData = mergeRequest(singleCellData, temp_child);
            });
        });

        var milliseconds = new Date().getTime();
        singleCellData['latitud'] = lat;
        singleCellData['longitud'] = long;
        singleCellData['idtime'] = milliseconds;
        singleCellData['get_grid_species'] = true;

        singleCellData["with_data_freq"] = false;
        singleCellData["with_data_score_cell"] = false;
        singleCellData["with_data_freq_cell"] = false;
        singleCellData["with_data_score_decil"] = false;
        singleCellData["iterations"] = 1;
        singleCellData["region"] = region;


        var milliseconds = new Date().getTime();

        // var val_process_temp = $("#chkValidationTemp").is(':checked');
        console.log("_val_process_temp: " + _val_process_temp)

        var verbo = _val_process_temp ? "countsTaxonsGroupTimeValidation" : "countsTaxonsGroup"


        fetch(_url_zacatuche + "/niche/" + verbo, {
                method: "POST",
                body: JSON.stringify(singleCellData),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(respuesta => {

                if (respuesta.ok) {

                    var data = respuesta.data;
                    var info_cell = respuesta.info_cell

                    _VERBOSE ? console.log(data) : _VERBOSE;

                    var htmltable = _createTableFromData(data, info_cell);
                    if (htmltable === "")
                        return;
                    _map_module_nicho.showPopUp(htmltable, [lat, long]);

                    // tablas para seleccion de celda
                    _table_module_eps.createTblSp("tbl_sp_selected");
                    _table_module_eps.createTblSp("tbl_sp_selected_sp");
                    _table_module_eps.createTblSp("tbl_sp_selected_rt");

                }


                $('#map').loading('stop');


            })
            .catch(err => {
                $('#map').loading('stop');
                _VERBOSE ? console.log("error: " + err) : _VERBOSE;
            });

    }


    /**
     * Éste método realiza la petición al servidor cuando una celda es seleccionada por el usuario y obtiene el valor de score que se encuentran dentro de la celda en conjunto con el módulo mapa.
     *
     * @function showGetFeatureInfo
     * @public
     * @memberof! res_display_module
     *
     * @param {float} lat - Latitud del punto sleccionado por el usuario
     * @param {float} long - Longitud del punto sleccionado por el usuario
     */
    function showGetFeatureInfoOccCell(lat, long, _taxones, lin_inf, lin_sup, sin_fecha, con_fosil, grid_res, region, isdeletecell) {

        _VERBOSE ? console.log("showGetFeatureInfoOccCell") : _VERBOSE;

        $('#map2').loading({
            stoppable: true
        });

        console.log(_taxones)
        console.log("lin_inf: " + lin_inf)
        console.log("grid_res: " + grid_res)
        console.log("region: " + region)

        var milliseconds = new Date().getTime();

        var data_body_request = {
            target_taxons: _taxones,
            lininf: lin_inf,
            limsup: lin_sup,
            sfecha: sin_fecha,
            sfosil: con_fosil,
            grid_res: grid_res,
            res: grid_res,
            region: region,
            latitud: lat,
            longitud: long,
            idtime: milliseconds
        };

        // console.log(data_body_request)

        if (isdeletecell) {

            fetch(_url_zacatuche + "/niche/especie/getIDCellFromCoordinates", {
                    method: "POST",
                    body: JSON.stringify(data_body_request),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(resp => resp.json())
                .then(respuesta => {

                    if (respuesta.ok) {

                        var data = respuesta.data;

                        _VERBOSE ? console.log(data) : _VERBOSE;

                        if (data.length > 0) {

                            var item = data[0]
                            var gridid = item["gridid_" + grid_res + "km"]

                            // console.log("gridid: " + gridid)

                            _map_module_nicho.deleteCellFromOccGrid(gridid)

                        }

                    }

                    $('#map2').loading('stop');


                })
                .catch(err => {
                    $('#map2').loading('stop');
                    _VERBOSE ? console.log("error: " + err) : _VERBOSE;
                });


        } else {

            fetch(_url_zacatuche + "/niche/especie/getCellOcurrences", {
                    method: "POST",
                    body: JSON.stringify(data_body_request),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(resp => resp.json())
                .then(respuesta => {

                    if (respuesta.ok) {

                        var data = respuesta.data;

                        _VERBOSE ? console.log(data) : _VERBOSE;
                        let data_body_request_pop = { "grid_resolution": "mun", "columns": ["population"], "gridids": [] };


                        if (data.length > 0) {
                            fetch(_url_zacatuche + "/niche/especie/getColumnsGrid", {
                                    method: "POST",
                                    body: JSON.stringify(data_body_request_pop),
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                })
                                .then(resp => resp.json())
                                .then(respuesta => {

                                    if (respuesta.ok) {

                                        var data = respuesta.data;

                                        _VERBOSE ? console.log(data) : _VERBOSE;
                                        sessionStorage.setItem("modif_pop", JSON.stringify(data));


                                        if (data.length > 0) {

                                            // if (htmltable === "")
                                            //     return;
                                            // _map_module_nicho.showPopUp(htmltable, [lat, long], true)

                                        }

                                    }

                                    // $('#map2').loading('stop');


                                })
                                .catch(err => {
                                    // $('#map2').loading('stop');
                                    _VERBOSE ? console.log("error: " + err) : _VERBOSE;
                                });
                            setTimeout(function() {
                                var htmltable = _createOccTableFromData(data);
                                if (htmltable === "")
                                    return;
                                _map_module_nicho.showPopUp(htmltable, [lat, long], true);
                            }, 2000)



                        }

                    }

                    $('#map2').loading('stop');


                })
                .catch(err => {
                    $('#map2').loading('stop');
                    _VERBOSE ? console.log("error: " + err) : _VERBOSE;
                });


        }




    }


    function _createOccTableFromData(json_data) {
        try {
            var modifiers = JSON.parse(sessionStorage.getItem("modifiers"));

        } catch (error) {
            var modifiers = "sin_modifiers";
        }
        let mod = Object.keys(modifiers)
        var htmltable = "";
        var table_sp = "";
        let gridid = json_data[0].gridid;
        let species = json_data[0].species;
        let res_modif = JSON.parse(sessionStorage.getItem("res_modif"));
        let total_population = JSON.parse(sessionStorage.getItem("modif_pop"));
        let tar_var = JSON.parse(sessionStorage.getItem("selectedData"));
        let res_list = [];
        let pop_list = [];
        var periodSelectedShort
        var previousPeriodSelectedShort
        var enfoque = sessionStorage.getItem("light_traffic");
        if ($("#pred_des_control")[0].checked) {
          var periodSelectedComplete = $("#date_timepicker_start_val").val();
          var periodDate= new Date(periodSelectedComplete);
          var previousPeriodDate = new Date(periodDate.setMonth(periodDate.getMonth()-1))
          var twoMonthsPreviousPeriodDate =  new Date(periodDate.setMonth(periodDate.getMonth()-1))
          previousPeriodSelectedShortAux = previousPeriodDate.getFullYear() + "-" + (Number((previousPeriodDate.getMonth()+1)) < 10 ? "0" + (previousPeriodDate.getMonth()+1) : (previousPeriodDate.getMonth()+1))
          twoMonthsPreviousPeriodSelectedShortAux = twoMonthsPreviousPeriodDate.getFullYear() + "-" + (Number((twoMonthsPreviousPeriodDate.getMonth()+1)) < 10 ? "0" + (twoMonthsPreviousPeriodDate.getMonth()+1) : (twoMonthsPreviousPeriodDate.getMonth()+1))
          periodSelectedShort = previousPeriodSelectedShortAux
          previousPeriodSelectedShort = twoMonthsPreviousPeriodSelectedShortAux

        } else {
          var periodSelectedComplete = $("#date_timepicker_start").val();
          periodSelectedShort = periodSelectedComplete.match(/....-../)[0]
          var periodDate= new Date(periodSelectedComplete);
          var previousPeriodDate = new Date(periodDate.setMonth(periodDate.getMonth()-1))
          //let fullyearOfPreviousPeriod = (previousPeriodDate.getMonth() == "12" ? Number(previousPeriodDate.getFullYear() - 1) : previousPeriodDate.getFullYear())
          previousPeriodSelectedShort = previousPeriodDate.getFullYear() + "-" + (Number((previousPeriodDate.getMonth()+1)) < 10 ? "0" + (previousPeriodDate.getMonth()+1) : (previousPeriodDate.getMonth()+1))
        }

        for (let i = 0; i < total_population.length; i++) {
            total_population[i].gridid_munkm == gridid ? pop_list.push(total_population[i]) : ""
        };
        for (let i = 0; i < res_modif.length; i++) {
            res_modif[i].gridid == gridid ? res_list.push(res_modif[i]) : ""
        };
        if ((tar_var[0]["label"] == "COVID-19 FALLECIDO") && (mod[0] == "lethality") && (enfoque == "star")) {
          mod[0] = "lethality_star";
        };
        if ((tar_var[0]["label"] == "COVID-19 FALLECIDO") && (mod[0] == "incidence") && (enfoque == "star")) {
          mod[0] = "morthality_star";
        };
        if ((tar_var[0]["label"] == "COVID-19 FALLECIDO") && (mod[0] == "cases") && (enfoque == "star" )) {
          mod[0] = "fallecidos_star";
        };
        if ((tar_var[0]["label"] == "COVID-19 FALLECIDO") && (mod[0] == "incidence")) {
            mod[0] = "morthality";
        };
        if ((tar_var[0]["label"] == "COVID-19 FALLECIDO") && (mod[0] == "cases")) {
            mod[0] = "fallecidos";
        };
        if ((tar_var[0]["label"] == "COVID-19 CONFIRMADO") && (mod[0] == "cases") && (enfoque == "star")) {
          mod[0] = "cases_star";
        };
        if ((tar_var[0]["label"] == "COVID-19 CONFIRMADO") && (mod[0] == "incidence") && (enfoque == "star")) {
          mod[0] = "incidence_star";
        };
        if ((tar_var[0]["label"] == "COVID-19 CONFIRMADO") && (mod[0] == "prevalence") && (enfoque == "star")) {
          mod[0] = "prevalence_star";
        };

        switch (mod[0]) {
            case "cases":
                htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                    '<div class="panel-primary">' +
                    '<div class="panel-heading no-padding header-title-cell">' +
                    '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                    '</div>' +
                    '<table class="table table-striped">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Casos</th>' +
                    '<th>Población Total </th>' +
                    '<th>No. Casos en '+ previousPeriodSelectedShort +'</th>' +
                    '<th> Decil Casos en '+ previousPeriodSelectedShort +' </th>' +
                    '<th> No. Casos en '+periodSelectedShort+'</th>' +
                    '<th> Decil Casos en '+periodSelectedShort+'</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                break;
            case "cases_star":
                  htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                      '<div class="panel-primary">' +
                      '<div class="panel-heading no-padding header-title-cell">' +
                      '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                      '</div>' +
                      '<table class="table table-striped">' +
                      '<thead>' +
                      '<tr>' +
                      '<th>Casos</th>' +
                      '<th>Población Total </th>' +
                      '<th> No. Casos en '+periodSelectedShort+'</th>' +
                      '<th> Decil Casos en '+periodSelectedShort+'</th>' +
                      '</tr>' +
                      '</thead>' +
                      '<tbody>';
                  break;
            case "incidence":
                htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                    '<div class="panel-primary">' +
                    '<div class="panel-heading no-padding header-title-cell">' +
                    '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                    '</div>' +
                    '<table class="table table-striped">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Incidencia</th>' +
                    '<th>Población Total </th>' +
                    '<th> No. Incidencia en ' + previousPeriodSelectedShort + '</th>' +
                    '<th> Decil Incidencia en ' + previousPeriodSelectedShort + '</th>' +
                    '<th> No. Casos en '+periodSelectedShort+'</th>' +
                    '<th> No. Incidencia en ' + periodSelectedShort + '</th>' +
                    '<th> Decil Incidencia en ' + periodSelectedShort + '</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                break;
            case "incidence_star":
                  htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                      '<div class="panel-primary">' +
                      '<div class="panel-heading no-padding header-title-cell">' +
                      '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                      '</div>' +
                      '<table class="table table-striped">' +
                      '<thead>' +
                      '<tr>' +
                      '<th>Casos</th>' +
                      '<th>Población Total </th>' +
                      '<th> No. Casos </th>' +
                      '<th> No. Incidencia en '+periodSelectedShort+'</th>' +
                      '<th> Decil Incidencia en '+periodSelectedShort+'</th>' +
                      '</tr>' +
                      '</thead>' +
                      '<tbody>';
                  break;
            case "prevalence":
                htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                    '<div class="panel-primary">' +
                    '<div class="panel-heading no-padding header-title-cell">' +
                    '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                    '</div>' +
                    '<table class="table table-striped">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Prevalencia</th>' +
                    '<th>Población total </th>' +
                    '<th> No. Prevalencia en ' + previousPeriodSelectedShort + ' </th>' +
                    '<th> Decil Prevalencia en ' + previousPeriodSelectedShort + ' </th>' +
                    '<th> No. Casos en '+periodSelectedShort+'</th>' +
                    '<th> No. Prevalencia en ' + periodSelectedShort + ' </th>' +
                    '<th> Decil Prevalencia en ' + periodSelectedShort + ' </th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                break;
            case "prevalence_star":
                  htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                      '<div class="panel-primary">' +
                      '<div class="panel-heading no-padding header-title-cell">' +
                      '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                      '</div>' +
                      '<table class="table table-striped">' +
                      '<thead>' +
                      '<tr>' +
                      '<th>Prevalencia</th>' +
                      '<th>Población total </th>' +
                      '<th> No. Casos </th>' +
                      '<th> No. Prevalencia en ' + periodSelectedShort + ' </th>' +
                      '<th> Decil Prevalencia en ' + periodSelectedShort + ' </th>' +
                      '</tr>' +
                      '</thead>' +
                      '<tbody>';
                  break;
            case "lethality":
                htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                    '<div class="panel-primary">' +
                    '<div class="panel-heading no-padding header-title-cell">' +
                    '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                    '</div>' +
                    '<table class="table table-striped">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Letalidad</th>' +
                    '<th>Población Total </th>' +
                    '<th> Letalidad en ' + previousPeriodSelectedShort + ' </th>' +
                    '<th> Decil de Letalidad en ' + previousPeriodSelectedShort + ' </th>' +
                    '<th> No. Casos en '+periodSelectedShort+'</th>' +
                    '<th> Letalidad en ' + periodSelectedShort + ' </th>' +
                    '<th> Decil de Letalidad en ' + periodSelectedShort + ' </th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                break;
           case "lethality_star":
                  htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                      '<div class="panel-primary">' +
                      '<div class="panel-heading no-padding header-title-cell">' +
                      '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                      '</div>' +
                      '<table class="table table-striped">' +
                      '<thead>' +
                      '<tr>' +
                      '<th>Letalidad</th>' +
                      '<th>Población Total </th>' +
                      '<th> No. Casos </th>' +
                      '<th> Letalidad en ' + periodSelectedShort + ' </th>' +
                      '<th> Decil de Letalidad en ' + periodSelectedShort + ' </th>' +
                      '</tr>' +
                      '</thead>' +
                      '<tbody>';
                  break;
            case "morthality":
                htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                    '<div class="panel-primary">' +
                    '<div class="panel-heading no-padding header-title-cell">' +
                    '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                    '</div>' +
                    '<table class="table table-striped">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Mortalidad</th>' +
                    '<th>Población Total </th>' +
                    '<th> Mortalidad en ' + previousPeriodSelectedShort + ' </th>' +
                    '<th> Decil de Mortalidad en ' + previousPeriodSelectedShort + ' </th>' +
                    '<th> No. Casos en '+periodSelectedShort+'</th>' +
                    '<th> Mortalidad en ' + periodSelectedShort + ' </th>' +
                    '<th> Decil de Mortalidad en ' + periodSelectedShort + ' </th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                break;
            case "morthality_star":
                  htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                      '<div class="panel-primary">' +
                      '<div class="panel-heading no-padding header-title-cell">' +
                      '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                      '</div>' +
                      '<table class="table table-striped">' +
                      '<thead>' +
                      '<tr>' +
                      '<th>Mortalidad</th>' +
                      '<th>Población Total </th>' +
                      '<th> No. Casos </th>' +
                      '<th> Mortalidad en ' + periodSelectedShort + ' </th>' +
                      '<th> Decil de Mortalidad en ' + periodSelectedShort + ' </th>' +
                      '</tr>' +
                      '</thead>' +
                      '<tbody>';
                  break;
            case "fallecidos":
                htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                    '<div class="panel-primary">' +
                    '<div class="panel-heading no-padding header-title-cell">' +
                    '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                    '</div>' +
                    '<table class="table table-striped">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Fallecidos</th>' +
                    '<th>Población Total </th>' +
                    '<th>No. Fallecidos ' + previousPeriodSelectedShort + '</th>' +
                    '<th> Decil Fallecidos ' + previousPeriodSelectedShort + ' </th>' +
                    '<th> No. Fallecidos '+periodSelectedShort+'</th>' +
                    '<th> Decil Fallecidos '+periodSelectedShort+'</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                break;
            case "fallecidos_star":
                  htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                      '<div class="panel-primary">' +
                      '<div class="panel-heading no-padding header-title-cell">' +
                      '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                      '</div>' +
                      '<table class="table table-striped">' +
                      '<thead>' +
                      '<tr>' +
                      '<th>Fallecidos</th>' +
                      '<th> No. Casos </th>' +
                      '<th> No. Fallecidos '+periodSelectedShort+'</th>' +
                      '<th> Decil Fallecidos '+periodSelectedShort+'</th>' +
                      '</tr>' +
                      '</thead>' +
                      '<tbody>';
                  break;
            default:
                console.log("Entro en la parte del defailt")
                htmltable = '<div class="myScrollableBlockPopupCovid mywidth_covid">' +
                    '<div class="panel-primary">' +
                    '<div class="panel-heading no-padding header-title-cell">' +
                    '<h3 class="h3-title-cell">' + json_data[0].entidad + '</h3>' +
                    '</div>' +
                    '<table class="table table-striped">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>¿Tuvo Casos en el Periodo '+previousPeriodSelectedShort+'?</th>' +
                    '<th>No. Casos en '+periodSelectedShort+'</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
                break;
        }

        //TODO: falta nombre de especie en la petición
        console.log(json_data);
        console.log(res_list);

        const parse_only_three_decimals = (number) => {
            return parseFloat(number).toFixed(3)
        }


        switch (mod[0]) {
            case "cases":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + res_list[0]["fv"] + '</td>' +
                    '<td>' + res_list[0]["fb"] + '</td>' +
                    '<td>' + res_list[0]["tv"] + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "cases_star":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + res_list[0]["tv"] + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "incidence":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["fv"]) + '</td>' +
                    '<td>' + res_list[0]["fb"] + '</td>' +
                    '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "incidence_star":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                    '<td>' + res_list[0]["tv"] + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "prevalence":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["fv"]) + '</td>' +
                    '<td>' + res_list[0]["fb"] + '</td>' +
                    '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "prevalence_star":
                  htmltable += '<tr>' +
                      '<td>' + species + '</td>' +
                      '<td>' + pop_list[0]["population"] + '</td>' +
                      '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                      '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                      '<td>' + res_list[0]["tb"] + '</td>' +
                      '</tr>';
                  break;
            case "lethality":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["fv"]) + '</td>' +
                    '<td>' + res_list[0]["fb"] + '</td>' +
                    '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "lethality_star":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "morthality":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["fv"]) + '</td>' +
                    '<td>' + res_list[0]["fb"] + '</td>' +
                    '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "morthality_star":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + res_list[0]["cases_trainig"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "fallecidos":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["fv"]) + '</td>' +
                    '<td>' + res_list[0]["fb"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            case "fallecidos_star":
                htmltable += '<tr>' +
                    '<td>' + species + '</td>' +
                    '<td>' + pop_list[0]["population"] + '</td>' +
                    '<td>' + parse_only_three_decimals(res_list[0]["tv"]) + '</td>' +
                    '<td>' + res_list[0]["tb"] + '</td>' +
                    '</tr>';
                break;
            default:
              htmltable += '<tr>' +
                    '<td>' + (res_list[0]["fp"] == "1" ? "Si": "No")  + '</td>' +
                    '<td>' + res_list[0]["occ"] + '</td>' +
                    '</tr>';
                // json_data.forEach(function(item, index) {

                //     var gen = item.genero === "M" ? "Masculino" : "Femenino"
                //     htmltable += '<tr>' +
                //         '<td>' + item.species + '</td>' +
                //         '<td>' + item.edad + '</td>' +
                //         '<td>' + gen + '</td>' +
                //         '<td>' + item.fechacolecta + '</td>' +
                //         // '<td><a target="_blank" href="' + item.urlejemplar + '">Mas info</a></td>'+
                //         '</tr>';

                // })
                break;
        }




        htmltable += '</tbody>' +
            '</table>' +
            '</div>' +
            '</div>';

        // console.log(htmltable)

        return htmltable;

    }


    /**
     * Éste método genera un HTML para desplegar la tabla que contiene los resultados de la petición hecha por showGetFeatureInfo.
     *
     * @function _createTableFromData
     * @private
     * @memberof! res_display_module
     *
     * @param {json} json_data - Json con el valor resultante de la celda seleccionada
     */
    function _createTableFromData(json_data, info_cell) {

        _VERBOSE ? console.log("_createTableFromData") : _VERBOSE;

        console.log(info_cell)
        console.log(info_cell[0].nom_mun)

        var info_celda = info_cell[0].nom_ent
        info_celda += info_cell[0].nom_mun != undefined && info_cell[0].nom_mun != "" ? ", " + info_cell[0].nom_mun : ""

        console.log(info_celda)


        // descending order in json array by score
        console.log("_val_process_temp: " + _val_process_temp)

        if (_val_process_temp) {
            json_data.sort(function(a, b) {
                return parseFloat(b.score) - parseFloat(a.score);
            });
        } else {
            json_data.groups.sort(function(a, b) {
                return parseFloat(b.score) - parseFloat(a.score);
            });
        }

        _VERBOSE ? console.log(json_data) : _VERBOSE

        var htmltable = "<div class='myScrollableBlockPopup mywidth_covid'>";
        var table_sp = "";
        var table_rt = "";
        var title_total;
        var total_celda;


        if (_val_process_temp) {


            if (json_data.length == 0) {
                _VERBOSE ? console.log("No data") : _VERBOSE
            }


            table_sp += "<div class='panel-primary'>" +
                "<div class='panel-heading no-padding header-title-cell'><h3>" + _iTrans.prop('tip_tbl_titulo') + "</h3></div>" +
                "<table id='tbl_sp_selected'>" +
                "<thead><tr><th>Nombre</th><th>Score</th></tr></thead>" +
                "<tbody>";

            for (i = 0; i < json_data.length; i++) {

                if (json_data[i].icat === "") {

                    table_sp += "<tr><td>" + json_data[i].generovalido + " " + json_data[i].especieepiteto + "</td><td>" + parseFloat(json_data[i].score).toFixed(2) + "</td></tr>";

                } else {

                    var range = json_data[i].tag.split(":")
                    var label = json_data[i].label.replace(/[^a-zA-Z0-9]/g, "").replace(/ /g, '')

                    var min = (parseFloat(range[0]) * json_data[i].coeficiente).toFixed(3) + " " + json_data[i].unidad
                    var max = (parseFloat(range[1]) * json_data[i].coeficiente).toFixed(3) + " " + json_data[i].unidad

                    var value = _iTrans.prop(label) + " (" + min + " : " + max + ") "

                    table_sp += "<tr><td>" + value + "</td><td>" + parseFloat(json_data[i].score).toFixed(2) + "</td></tr>";

                }

            }

            table_sp += "</tbody></table></div>";

            // TODO: Enviar el total de la celda

            // title_total = $.i18n.prop('lb_pp_st');
            // total_celda = parseFloat(json_data.tscore).toFixed(2);

            htmltable += "<div class='panel-primary'>\
                                <div class='panel-heading no-padding header-title-cell'>\
                                    <h3 class='h3-title-cell'>" + info_celda + "</h3>\
                                </div></div>"
            htmltable += table_sp;
            htmltable += "</div>"; // cierra div myScrollableBlockPopup


        } else if (_val_process_temp == false) {


            if (json_data.hasbio === false && json_data.hasraster === false && json_data.apriori === undefined && json_data.mapa_prob === undefined) {
                _VERBOSE ? console.log("No data") : _VERBOSE
                $('#map').loading('stop');
                return "";
            }


            if (json_data.hasbio) {

                table_sp += "<div class='panel-primary'><div class='panel-heading no-padding header-title-cell'><h3>" + _iTrans.prop('tip_tbl_titulo') + "</h3></div><table id='tbl_sp_selected_sp' class=''>" +
                    "<thead><tr><th>" + _iTrans.prop('tip_tbl_esp') + "</th><th>" + _iTrans.prop('tip_tbl_score') + "</th></tr></thead>" +
                    +"<tbody>";

                for (i = 0; i < json_data.groups.length; i++) {

                    if (json_data.groups[i].tipo === "bio") {

                        table_sp += "<tr><td>" + json_data.groups[i].generovalido + " " + json_data.groups[i].especieepiteto + "</td><td>" + parseFloat(json_data.groups[i].score).toFixed(2) + "</td></tr>";

                    }

                }

                table_sp += "</tbody></table></div>";

            }


            if (json_data.hasraster) {

                table_rt += "<div class='panel-primary'><div class='panel-heading panel-head header-title-cell'><h3>" + _iTrans.prop('tip_tbl_titulo_clima') + "</h3></div><table id='tbl_sp_selected_rt' class='table table-striped'>" +
                    "<thead><tr><th>" + _iTrans.prop('tip_tbl_bioclim') + "</th><th>" + _iTrans.prop('tip_tbl_score') + "</th></tr></thead>" +
                    "<tbody>";

                for (var i = 0; i < json_data.groups.length; i++) {

                    if (json_data.groups[i].tipo === "raster") {

                        // var arg_values = json_data.groups[i].name.split(" ")
                        // var value_abio = arg_values.length === 1 ? _iTrans.prop("a_item_" + arg_values[0]) : _iTrans.prop("a_item_" + arg_values[0]) + " " + arg_values[1] + " : " + arg_values[2]
                        // table_rt += "<tr><td>" + value_abio + "</td><td>" + parseFloat(json_data.groups[i].score).toFixed(2) + "</td></tr>";

                        // TODO: corregir id por label

                        // var range = d.tag.split(":")
                        var range = json_data.groups[i].tag.split(":")
                        var label = json_data.groups[i].label.replace(/[^a-zA-Z0-9]/g, "").replace(/ /g, '')

                        var min = (parseFloat(range[0]) * json_data.groups[i].coeficiente).toFixed(3) + " " + json_data.groups[i].unidad
                        var max = (parseFloat(range[1]) * json_data.groups[i].coeficiente).toFixed(3) + " " + json_data.groups[i].unidad

                        // var value = _iTrans.prop(label) + " (" + parseFloat(range[0]).toFixed(2) + " : " + parseFloat(range[1]).toFixed(2) + ") "
                        var value = _iTrans.prop(label) + " (" + min + " : " + max + ") "

                        // var layer = _iTrans.prop("a_item_" + json_data.groups[i].layer) + " (" + parseFloat(range[0]).toFixed(2) + " : " + parseFloat(range[1]).toFixed(2) + ") "
                        table_rt += "<tr><td>" + value + "</td><td>" + parseFloat(json_data.groups[i].score).toFixed(2) + "</td></tr>";

                    }

                }

                table_rt += "</tbody></table></div>";
            }


            if (json_data.mapa_prob !== undefined) {

                console.log("mapa_prob");

                var title_total = $.i18n.prop('lb_pp_probpre');
                var prob = parseFloat(json_data.mapa_prob) === 100.00 ? 99.99 : parseFloat(json_data.mapa_prob);
                prob = parseFloat(prob) === 0.00 ? 0.01 : parseFloat(prob);
                // console.log(prob);
                var total_celda = parseFloat(prob).toFixed(2) + "%";

                htmltable += "<div class='panel-primary'>\n\
                                    <div class='panel-heading no-padding header-title-cell'>\n\
                                    <h3 class='h3-title-cell'>Total</h3>\n\
                                    </div>\n\
                                    <table class='table table-striped'>\n\
                                    <thead>\n\
                                        <tr>\n\
                                        <th>" + title_total + "</th>\n\
                                        <th>" + total_celda + "</th>\n\
                                        </tr>";

            } else if (json_data.apriori !== undefined) {

                console.log("Apriori");

                var title_score = $.i18n.prop('lb_pp_sp');
                var parcial_score = parseFloat(json_data.tscore).toFixed(2);

                var title_apriori = "Apriori";
                var total_apriori = parseFloat(json_data.apriori).toFixed(2);

                var title_total = $.i18n.prop('lb_pp_st');
                var total_celda = parseFloat(json_data.tscore + json_data.apriori).toFixed(2);


                htmltable += "<div class='panel-primary'>\n\
                                    <div class='panel-heading no-padding header-title-cell'>\n\
                                        <h3 class='h3-title-cell'>Total</h3>\n\
                                    </div>\n\
                                    <table class='table table-striped'>\n\
                                    <thead>";

                if (json_data.hasbio === false && json_data.hasraster === false) {
                    htmltable += "<tr>\n\
                                        <th>" + title_apriori + "</th>\n\
                                        <th>" + total_apriori + "</th>\n\
                                    </tr>";
                } else {
                    htmltable += "<tr>\n\
                                        <th>" + title_total + "</th>\n\
                                        <th>" + total_celda + "</th>\n\
                                    </tr>\n\
                                    <tr>\n\
                                        <th>" + title_score + "</th>\n\
                                        <th>" + parcial_score + "</th>\n\
                                    </tr>\n\
                                    <tr>\n\
                                        <th>" + title_apriori + "</th>\n\
                                        <th>" + total_apriori + "</th>\n\
                                    </tr>";
                }



            } else {

                title_total = $.i18n.prop('lb_pp_st');
                total_celda = parseFloat(json_data.tscore).toFixed(2);

                htmltable += "<div class='panel-primary'>\
                                    <div class='panel-heading no-padding header-title-cell'>\
                                        <h3 class='h3-title-cell'>" + info_celda + "</h3>\
                                    </div>\
                                    <table class='table table-striped'>\
                                        <thead>\
                                            <tr>\
                                                <th>" + title_total + "</th>\
                                                <th>" + total_celda + "</th>\
                                            </tr>";

            }


            // if (json_data.hasbio !== false || json_data.hasraster !== false) {
            //     htmltable +=
            //                 "<tr>\
            //                     <th>" + $.i18n.prop('lb_pp_rbio') + "</th>\
            //                     <th>" + json_data.bios + "</th>\
            //                 </tr>\
            //                 <tr>\
            //                     <th>" + $.i18n.prop('lb_pp_rabio') + "</th>\
            //                     <th>" + json_data.raster + "</th>\
            //                 </tr>\
            //                 <tr>\
            //                     <th>" + $.i18n.prop('lb_pp_pos') + "</th>\
            //                     <th>" + json_data.positives + "</th>\
            //                 </tr>\
            //                 <tr>\
            //                     <th>" + $.i18n.prop('lb_pp_neg') + "</th>\
            //                     <th>" + json_data.negatives + "</th>\
            //                 </tr>"
            // }

            htmltable += "</thead>\
                    <tbody>";

            htmltable += "</tbody></table></div>";

            htmltable += json_data.hasbio ? table_sp : "";
            htmltable += json_data.hasraster ? table_rt : "";

            htmltable += "</div>"; // cierra div myScrollableBlockPopup

        }


        return htmltable;

    }

    /**
     * Éste método llama a la función que inicializa las variables necesarias para el despliegue de los componentes visuales.
     *
     * @function startResDisplay
     * @public
     * @memberof! res_display_module
     *
     * @param {object} map_module - Módulo mapa para gestionar las funciones que son requeridas en el análisis de nicho ecológico
     * @param {object} histogram_module - Módulo histograma para gestionar las funciones que son requeridas en el análisis de nicho ecológico
     * @param {object} table_module - Módulo table para gestionar las funciones que son requeridas en el análisis de nicho ecológico
     * @param {object} language_module - Módulo de internacionalización para gestionar las funciones que sonr equeridas en el análisis de nicho ecológico
     * @param {array} ids_comp_variables - Array con los identificadores de los componentes visuales utilizados en la selección de variables
     */
    function startResDisplay(map_module, histogram_module, table_module, language_module, ids_comp_variables) {

        _VERBOSE ? console.log("startResDisplay") : _VERBOSE;

        _initilizeElementsForDisplay(map_module, histogram_module, table_module, language_module, ids_comp_variables);

    }

    // Añadir los miembros públicos
    return {
        startResDisplay: startResDisplay,
        refreshData: refreshData,
        set_idReg: set_idReg,
        set_spid: set_spid,
        set_subGroups: set_subGroups,
        set_typeBioclim: set_typeBioclim,
        set_allowedPoints: set_allowedPoints,
        set_discardedPoints: set_discardedPoints,
        set_discardedPointsFilter: set_discardedPointsFilter,
        set_discardedCellFilter: set_discardedCellFilter,
        set_allowedCells: set_allowedCells,
        setMapModule: setMapModule,
        showGetFeatureInfo: showGetFeatureInfo,
        showGetFeatureInfoOccCell: showGetFeatureInfoOccCell,
        get_cData: get_cData,
        getValidationTable: getValidationTable,
        updateLabels: updateLabels,
        callDisplayProcess: callDisplayProcess,
        setHistogramModule: setHistogramModule,
        loadDecilDataTable: loadDecilDataTable,
        set_taxones: set_taxones,
        // _configureStyleMap: _configureStyleMap
        activeDecilOccurrences: activeDecilOccurrences
    }


});
