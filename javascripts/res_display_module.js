
/**
 * Controlador de los módulos utilizados en nicho ecológico.
 *
 * @namespace res_display_module
 */
var res_display_module = (function(verbose, url_zacatuche) {

    var _url_zacatuche = url_zacatuche;

    var _VERBOSE = verbose;

    var _subgroups, _spid, _idreg, _type_time;

    var _validation_module_all,
            _map_module_nicho, _language_module_nicho, _module_toast;

    var _allowedPoints = d3.map([]),
            _discardedPoints = d3.map([]),
            _discardedPointsFilter = d3.map([]),
            _computed_discarded_cells = d3.map([]),
            _computed_occ_cells = d3.map([]);

    var _cell_set = d3.map([]);
    _discarded_cell_set = d3.map([]),
            // _discardedFilter_cell_set = d3.map([]),
            _dataChartValSet = [];

    var _REQUESTS, _ITER_REQUESTS,
            _ITER = 0, _NUM_ITERATIONS = 5;

    var _min_occ_process, _mapa_prob, _fossil, _grid_res;

    var _rangofechas, _chkfecha;

    var _first_time_map = true;

    var _NUM_DECILES = 10;

    var _cdata,
            _sdata,
            _tdata,
            _ddata,
            _decil_data,
            _total_data_decil,
            _decil_group_data;

    // var _toastr = toastr;

    var _fathers = [], _sons = [], _totals = [];

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

    var _tbl_decil = false;
    var _tbl_eps = false;

    var _histogram_module_nicho,
            _table_module_eps;

    var _ID_STYLE_GENERATED;

    var _gridids_collection = [], _total_set_length = 0,
            _training_set_size = 0, _test_set_size = 0;

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

        _ids_componentes_var = ids_comp_variables;

        _language_module_nicho = language_module;
        _iTrans = _language_module_nicho.getI18();

        _map_module_nicho = map_module;
        _histogram_module_nicho = histogram_module;
        _table_module_eps = table_module;

        _table_module_eps.setLanguageModule(_language_module_nicho);
        _histogram_module_nicho.setTableModule(_table_module_eps);
        _histogram_module_nicho.setLanguageModule(_language_module_nicho);


        // si otro proceso de validación es necesario para otro modulo este debe ser instanciado en pede_nicho
        _validation_module_all = validation_module(_VERBOSE);
        _validation_module_all.startValidationModule();
        _validation_module_all.set_histogram_module(_histogram_module_nicho);


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


            }
            else {
                alert("Correo invalido")
            }

        });

        
        $("#map_download").click(function(e) {

            _VERBOSE ? console.log("map_download") : _VERBOSE;

            var grid = _map_module_nicho.getGridMap2Export();
            
//            this.href = window.URL.createObjectURL(new Blob([JSON.stringify(grid)], {type: 'application/json'}));
            this.href = (window.URL ? URL : webkitURL).createObjectURL(new Blob([JSON.stringify(grid)], {type: 'application/json'}));
            
//            this.href = "data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(grid));
            
            $("#modalMailShape").modal("hide");

        });
        
        $("#sp_download").click(function(e) {

            _VERBOSE ? console.log("sp_download") : _VERBOSE;

            var sp_occ = _map_module_nicho.getSP2Export();
            
            this.href = window.URL.createObjectURL(new Blob([JSON.stringify(sp_occ)], {type: 'application/json'}));
//            this.href = "data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(sp_occ));
            
            $("#modalMailShape").modal("hide");

        });

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
    function refreshData(num_items, val_process, slider_value, min_occ_process, mapa_prob, rango_fechas, chkFecha, chkFosil, grid_res) {

        _VERBOSE ? console.log("refreshData") : _VERBOSE;

        _slider_value = slider_value;

        _discarded_cell_set = d3.map([]);

        _dataChartValSet = [];
        _min_occ_process = min_occ_process;
        _mapa_prob = mapa_prob;
        _fossil = chkFosil;
        _grid_res = grid_res;


        _rangofechas = rango_fechas;
        _chkfecha = chkFecha;

        var discardedGridids = [];


        // obteniendo solo las celdas de los puntos de las especies. NOTA: Estos se puede enviar desde el map_module
        _discardedPoints.values().forEach(function(item, index) {
//            console.log(item.feature.properties.gridid);
            _discarded_cell_set.set(item.feature.properties.gridid, item.feature.properties.gridid);
        });


//        _VERBOSE ? console.log(_discarded_cell_set.values().length) : _VERBOSE;
//        _VERBOSE ? console.log(_computed_discarded_cells.values().length) : _VERBOSE;

        _REQUESTS = num_items + _subgroups.length;
        _ITER_REQUESTS = _REQUESTS;

//        _VERBOSE ? console.log("Peticiones al servidor: " + _REQUESTS) : _VERBOSE;


//        document.getElementById("tbl_hist").style.display = "inline";
        _cleanPanel();


        // Elimina tabla de validación en caso de existir
        if (_idtemptable !== "") {
            _VERBOSE ? console.log("elimina tabla: " + _idtemptable) : _VERBOSE;
            _deleteValidationTables();
        }

        // Se realiza la carga de la malla antes de iniciar el análisis de nicho
        _map_module_nicho.loadD3GridMX(val_process, grid_res);


    }



    /**
     * Éste método inicia ejecuta el proceso de un análisis de nicho ecológico.
     *
     * @function callDisplayProcess
     * @public
     * @memberof! res_display_module
     * 
     */
    function callDisplayProcess(val_process) {

        console.log("callDisplayProcess NICHO");

        if (val_process) {

            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_inicio_validacion'), "warning");
            _initializeValidationTables(val_process);

        }
        else {

            _confDataRequest(_spid, _idreg, val_process);
            _panelGeneration();

            _createTableEpSc(_tdata);
            _createHistEpScr_Especie(_ddata);
            _createHistScore_Celda(_cdata);
            _configureStyleMap(_sdata);

        }
    }


    var _idtemptable = "";

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
    function _initializeValidationTables(val_process) {

        _VERBOSE ? console.log("_initializeValidationTables") : _VERBOSE;

        _VERBOSE ? console.log("grid_res: " + _grid_res) : _VERBOSE;

        $.ajax({
            url: _url_zacatuche + "/niche/especie",
            type: 'post',
            data: {
                qtype: 'getValidationTables',
                spid: _spid,
                iter: _NUM_ITERATIONS,
                grid_res: _grid_res
            },
            dataType: "json",
            success: function(resp) {

                _idtemptable = resp.data[0].tblname;
                _VERBOSE ? console.log("Creación tabla: " + _idtemptable) : _VERBOSE;

                _confDataRequest(_spid, _idreg, val_process, _idtemptable);
                _panelGeneration(_idtemptable);

                _createTableEpSc(_tdata, _idtemptable, val_process);
                _createHistEpScr_Especie(_ddata);
                _createHistScore_Celda(_cdata);
                _configureStyleMap(_sdata);


//              Servicio de prueba del store
// 
//                $.ajax({
//                    url: _url_zacatuche + "/niche/especie",
//                    type: 'post',
//                    data: {
//                        qtype: 'processValidationTables',
//                        idtable: idtemptable
//                    },
//                    dataType: "json",
//                    success: function(resp) {
//
//                        console.log("proceso");
//                        console.log(resp);
//
//                    },
//                    error: function(jqXHR, textStatus, errorThrown) {
//                        _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
//
//                    }
//                });

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
            url: _url_zacatuche + "/niche/especie",
            type: 'post',
            data: {
                qtype: 'deleteValidationTables',
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


        _table_module_eps.clearEspList();
        _table_module_eps.clearDecilList();




        try {
            $("#" + _id_charteps.id).empty();
            $("#" + _id_chartscr.id).empty();
        }
        catch (e) {
            _VERBOSE ? console.log("primera vez") : _VERBOSE;
        }


        try {
            $("#" + _id_chartscr_celda.id).empty();
        }
        catch (e) {
            _VERBOSE ? console.log("primera vez") : _VERBOSE;
        }


        _map_module_nicho.clearMap();


        try {
            $("#" + _id_chartscr_decil.id).empty();
        }
        catch (e) {
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
    function _confDataRequest(spid, idreg, val_process, tabla) {

        _VERBOSE ? console.log("_confDataRequest") : _VERBOSE;


        var idtabla = tabla || "no_table";
        var milliseconds = new Date().getTime();
        var apriori = $("#chkApriori").is(':checked') ? "apriori" : undefined;
        var mapap = _mapa_prob ? "mapa_prob" : undefined;

        var fossil = $("#chkFosil").is(':checked') ? true : false;
        var min_occ = _min_occ_process ? parseInt($("#occ_number").val()) : 1;
        //  var existeFiltro = (_discarded_cell_set.values().length > 0 || _computed_discarded_cells.values().length > 0) ? 1 : undefined;


        var lin_inf = _rangofechas ? _rangofechas[0] : undefined;
        var lin_sup = _rangofechas ? _rangofechas[1] : undefined;
        var sin_fecha = $("#chkFecha").is(':checked') ? true : false;

        var existsDiscardedFilter = false;
        if (lin_inf !== undefined || lin_sup !== undefined || !sin_fecha)
            existsDiscardedFilter = true;

        // _VERBOSE ? console.log("lin_inf: " + lin_inf) : _VERBOSE;
        // _VERBOSE ? console.log("lin_sup: " + lin_sup) : _VERBOSE;
        // _VERBOSE ? console.log("sin_fecha: " + lin_sup) : _VERBOSE;
        // _VERBOSE ? console.log("apriori: " + apriori) : _VERBOSE;
        // _VERBOSE ? console.log("min_occ: " + min_occ) : _VERBOSE;
        // _VERBOSE ? console.log("existeFiltro: " + existeFiltro) : _VERBOSE;
//        _VERBOSE ? console.log("grid_res: " + grid_res) : _VERBOSE;

        // verbo: getFreq
        _ddata = {
            "id": spid,
            "idtime": milliseconds,
            "apriori": apriori,
            "min_occ": min_occ,
            "fossil": fossil,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "sfecha": sin_fecha,
            "val_process": val_process,
            "idtabla": idtabla,
            "grid_res": _grid_res
        };

        // verbo: getFreqCelda
        _cdata = {
            "id": spid,
            "idtime": milliseconds,
            "apriori": apriori,
            "min_occ": min_occ,
            "fossil": fossil,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "sfecha": sin_fecha,
            "val_process": val_process,
            "idtabla": idtabla,
            "grid_res": _grid_res,
            "mapa_prob": mapap // necesario para verbo: getGridSpecies
        };

        // verbo: getScoreDecil
        _decil_data = {
            "id": spid,
            "idtime": milliseconds,
            "apriori": apriori,
            "min_occ": min_occ,
            "fossil": fossil,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "sfecha": sin_fecha,
            "val_process": val_process,
            "idtabla": idtabla,
            "grid_res": _grid_res
            

        };

        // verbo: getScoreDecil
        _decil_group_data = {
            "id": spid,
            "idtime": milliseconds,
            "apriori": apriori,
            "min_occ": min_occ,
            "fossil": fossil,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "sfecha": sin_fecha,
            "val_process": val_process,
            "idtabla": idtabla,
            "grid_res": _grid_res
        };

        // verbo: getScoreDecil
        _total_data_decil = {
            "id": spid,
            "idtime": milliseconds,
            "apriori": apriori,
            "min_occ": min_occ,
            "fossil": fossil,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "sfecha": sin_fecha,
            "val_process": val_process,
            "idtabla": idtabla,
            "grid_res": _grid_res
        };

        // verbo: getCellScore
        _sdata = {
            "id": spid,
            "idtime": milliseconds,
            "apriori": apriori,
            "min_occ": min_occ,
            "fossil": fossil,
            "mapa_prob": mapap,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "sfecha": sin_fecha,
            "val_process": val_process,
            "idtabla": idtabla,
            "grid_res": _grid_res
        };

        // verbo: getGeoRel
        _tdata = {
            "id": spid,
            "idtime": milliseconds,
            "apriori": apriori,
            "min_occ": min_occ,
            "fossil": fossil,
            "lim_inf": lin_inf,
            "lim_sup": lin_sup,
            "sfecha": sin_fecha,
            "val_process": val_process,
            "idtabla": idtabla,
            "grid_res": _grid_res
        };


        _VERBOSE ? console.log(_discarded_cell_set.values().length) : _VERBOSE;
        _tdata['discardedFilterids'] = _discarded_cell_set.values();
        _sdata['discardedFilterids'] = _discarded_cell_set.values();
        _ddata['discardedFilterids'] = _discarded_cell_set.values();
        _cdata['discardedFilterids'] = _discarded_cell_set.values();
        _total_data_decil['discardedFilterids'] = _discarded_cell_set.values();
        _decil_group_data['discardedFilterids'] = _discarded_cell_set.values();
        _decil_data['discardedFilterids'] = _discarded_cell_set.values();


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
    function _panelGeneration(idtemptable) {

        _VERBOSE ? console.log("_panelGeneration") : _VERBOSE;
        idtemptable = idtemptable || "";

        filters = [];
        _fathers = [];
        _sons = [];
        _totals = [];

        var hasBios = false;
        var hasRaster = false;
        var active_time = undefined;

        if (_type_time == 1) {
            _VERBOSE ? console.log("2050 activado") : _VERBOSE;
            active_time = true;
        }


        var hasTotal = false;
        if (_subgroups.length > 1) {
            hasTotal = true;
        }

        _subgroups.forEach(function(grupo) {

            filterby_group = [];
            _VERBOSE ? console.log(grupo) : _VERBOSE;

            var hasChildren = false;
            if (grupo.value.length > 1) {
                hasChildren = true;
            }


            grupo.value.forEach(function(item) {

                // if item is type 1 is a json and if 0 is a string
                itemGroup = item;
                single_filter = [];
                _VERBOSE ? console.log(itemGroup) : _VERBOSE;

                // bioticos
                if (grupo.type == 0) {

                    temp_item_field = itemGroup.label.toString().split(">>")[0].toLowerCase().trim();
                    temp_item_value = itemGroup.label.toString().split(">>")[1].trim();
                    temp_field = "";

                    filters.push({
                        'field': _reino_campos[temp_item_field],
                        'value': temp_item_value,
                        'type': itemGroup.type
                                // 'level' : parseInt(itemGroup.level)
                    });

                    filterby_group.push({
                        'field': _reino_campos[temp_item_field],
                        'value': temp_item_value,
                        'type': itemGroup.type,
                        'group_item': grupo.groupid
                                // 'level' : parseInt(itemGroup.level)
                    });

                    single_filter.push({
                        'field': _reino_campos[temp_item_field],
                        'value': temp_item_value,
                        'type': itemGroup.type,
                        'group_item': grupo.groupid
                                // 'level' : parseInt(itemGroup.level)
                    });

                }
                // raster: bioclim, topo, elevacion y pendiente
                else {
                    // if the type is equal to 1 the item contains the parameter level
                    temp_item_value = itemGroup.label.split(">>")[1].trim();
                    // _VERBOSE ? console.log(temp_item_value) : _VERBOSE;

                    filters.push({
                        'value': itemGroup.value,
                        'type': itemGroup.type,
                        'level': parseInt(itemGroup.level),
                        'label': temp_item_value
                    });

                    filterby_group.push({
                        'value': itemGroup.value,
                        'type': itemGroup.type,
                        'level': parseInt(itemGroup.level),
                        'group_item': grupo.groupid,
                        'label': temp_item_value
                    });

                    single_filter.push({
                        'value': itemGroup.value,
                        'type': itemGroup.type,
                        'level': parseInt(itemGroup.level),
                        'group_item': grupo.groupid,
                        'label': temp_item_value
                    });

                }

                hasBios = false;
                hasRaster = false;

                for (var i = 0; i < single_filter.length; i++) {
                    if (single_filter[i].type == 4) {
                        hasBios = true;
                    }
                    else {
                        hasRaster = true;
                    }
                }
                _decil_data['hasBios'] = hasBios;
                _decil_data['hasRaster'] = hasRaster;

                _decil_data['tfilters'] = single_filter;
                _decil_data['tdelta'] = active_time;

                // elimina una segunda petición cuando el grupo de variables solo contiene un elemento
                if (hasChildren) {
                    _createScore_Decil(_decil_data, false, false);
                }


            });

            hasBios = false;
            hasRaster = false;

            for (var i = 0; i < filterby_group.length; i++) {
                if (filterby_group[i].type == 4) {
                    hasBios = true;
                }
                else {
                    hasRaster = true;
                }
            }
            _decil_group_data['hasBios'] = hasBios;
            _decil_group_data['hasRaster'] = hasRaster;


            _decil_group_data['tfilters'] = filterby_group;
            _decil_group_data['groupid'] = grupo.groupid;
            _decil_group_data['tdelta'] = active_time;

            _VERBOSE ? console.log(_decil_group_data) : _VERBOSE;

            _createScore_Decil(_decil_group_data, hasChildren, false);

        });

        if (filters.length != 0) {
            _tdata['tfilters'] = filters;
            _sdata['tfilters'] = filters;
            _ddata['tfilters'] = filters;
            _cdata['tfilters'] = filters;
            _total_data_decil['tfilters'] = filters;
        }

        hasBios = false;
        hasRaster = false;

        for (var i = 0; i < filters.length; i++) {
            if (filters[i].type == 4) {
                hasBios = true;
            }
            else {
                hasRaster = true;
            }
        }

        _tdata["hasBios"] = hasBios;
        _tdata["hasRaster"] = hasRaster;

        _sdata['hasBios'] = hasBios;
        _sdata['hasRaster'] = hasRaster;

        _cdata['hasBios'] = hasBios;
        _cdata['hasRaster'] = hasRaster;

        _ddata['hasBios'] = hasBios;
        _ddata['hasRaster'] = hasRaster;

        _total_data_decil['hasBios'] = hasBios;
        _total_data_decil['hasRaster'] = hasRaster;

        _tdata['tdelta'] = active_time;
        _sdata['tdelta'] = active_time;
        _ddata['tdelta'] = active_time;
        _cdata['tdelta'] = active_time;
        _total_data_decil['tdelta'] = active_time;


        if (hasTotal) {
            _createScore_Decil(_total_data_decil, false, hasTotal);
        }

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
    function _createScore_Decil(decildata, hasChildren, isTotal) {

        _VERBOSE ? console.log("_createScore_Decil") : _VERBOSE;

        $('#chartdiv_score_decil').loading({
            stoppable: true
        });

        $('#div_example').loading({
            stoppable: true
        });



        $.ajax({
            type: "post",
            url: _url_zacatuche + "/niche/getScoreDecil",
            data: decildata,
            dataType: "json",
            success: function(resp, status) {

                console.log(resp.data);

                data = resp.data;

                _tbl_decil = true;

                _ITER_REQUESTS = _ITER_REQUESTS - 1;

                if (data[0].title.is_parent) {
                    console.log("caso 1");

                    if (hasChildren) {
                        console.log("caso 1A");
                        _fathers.push({item: data});
                    }
                    else {
                        // si el padre no tiene hijos, se debe agregar una copia del padre como hijo para que se genere la estructura correctamente
                        console.log("caso 1B");
                        _fathers.push({item: data});
                        _sons.push({item: data});
                    }

                }
                else {
                    console.log("caso 2");
                    _sons.push({item: data});

                }

                if (isTotal) {
                    console.log("caso 3");
                    _totals.push({item: data});
                }



                if (_ITER_REQUESTS === 0) {

                    console.log(_fathers);
                    console.log(_sons);


                    _ITER_REQUESTS = _REQUESTS;

                    data_chart = _createSetStructure(_fathers, _sons);

                    // añade totales cuando es mas de un grupo sea biotico  o abiotico.
                    if (_totals.length > 0) {
                        _VERBOSE ? console.log("Se agregan totales") : _VERBOSE;

                        // ya no contiene valores del segundo grupo de variables...
                        data_chart = _addDataChartTotal(data_chart, _totals[0].item);
                    }

                    _VERBOSE ? console.log(data_chart) : _VERBOSE;


                    $('#chartdiv_score_decil').loading('stop');
                    $('#div_example').loading('stop');
                    $("#hist_next").css('visibility', 'visible');



                    _histogram_module_nicho.createMultipleBarChart(data_chart, [], _id_chartscr_decil, d3.map([]));

                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_resultados_display'), "success");

                }





            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error createScore_Decil: " + textStatus) : _VERBOSE;
                _VERBOSE ? console.log("error createScore_Decil: " + errorThrown) : _VERBOSE;

                $('#chartdiv_score_decil').loading('stop');
                $('#div_example').loading('stop');
                $("#hist_next").css('visibility', 'hidden');


                mensaje = "";
                mensaje = $("#chkValidation").is(':checked') ? _iTrans.prop('lb_error_proceso_val') : _iTrans.prop('lb_error_histograma');

                _module_toast.showToast_BottomCenter(mensaje, "error");

                _ITER = 0;
                _gridids_collection = [];
                _total_set_length = 0;
                _training_set_size = 0;
                _test_set_size = 0;
            }

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
    function _createTableEpSc(tdata) {

        _VERBOSE ? console.log("_createTableEpSc") : _VERBOSE;
        _VERBOSE ? console.log(tdata) : _VERBOSE;


        $('#treeAddedPanel').loading({
            stoppable: true
        });


        $.ajax({
            url: _url_zacatuche + "/niche/getGeoRel",
            type: 'post',
            dataType: "json",
            data: tdata,
            success: function(json_file) {

//                console.log(json_file);
                $('#treeAddedPanel').loading('stop');

                var data_list = [];

                json_file.data.forEach(function(d) {
                    item_list = [];
                    // item_list.push(d.generovalido)
                    item_list.push(d.especievalidabusqueda)
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

                var json_arg = {data: data_list}

                console.log(json_arg);

                _table_module_eps.createEspList(json_arg);

                _tbl_eps = true;



            },
            error: function(jqXHR, textStatus, errorThrown) {

                console.log(errorThrown);
                console.log(jqXHR);

                $('#treeAddedPanel').loading('stop');

                _VERBOSE ? console.log("error _createTableEpSc: " + textStatus) : _VERBOSE;
                _VERBOSE ? console.log("error jqXHR: " + jqXHR) : _VERBOSE;
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_tblsp'), "error");

            }

        });



    }


    /**
     * Éste método realiza la petición al servidor para obtener el valor de score por celda utilizado para la coloración de la malla a través del módulo mapa en el análisis de nicho ecológico.
     *
     * @function _configureStyleMap
     * @private
     * @memberof! res_display_module
     * 
     * @param {json} sdata - Json con la configuración seleccionada por el usuario
     */
    function _configureStyleMap(sdata) {

        _VERBOSE ? console.log("_configureStyleMap") : _VERBOSE;

        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_inica_mapa'), "info");

        $('#map').loading({
            stoppable: true
        });


        $.ajax({
            url: _url_zacatuche + "/niche/getCellScore",
            type: 'post',
            data: sdata,
            success: function(json_file) {

                $('#map').loading('stop');
                $("#map_next").css('visibility', 'visible');

                var json = json_file.data;
                
//                console.log(json);
                
                // grid_map_color contiene colores y scores
                var grid_map_color = _map_module_nicho.createDecilColor(json, _mapa_prob);
                
//                console.log(grid_map_color);

                _map_module_nicho.colorizeFeatures(grid_map_color);


                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_carga_mapa'), "success");
                document.getElementById("dShape").style.display = "inline";


            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error configureStyleMap: " + textStatus) : _VERBOSE;
                $("#map_next").css('visibility', 'hidden');

                $('#map').loading('stop');

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_mapa'), "error");
                document.getElementById("dShape").style.display = "none";

            }


        });

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
    function _createHistEpScr_Especie(ddata) {

        _VERBOSE ? console.log("_createHistEpScr_Especie") : _VERBOSE;

        $('#hst_esp_eps').loading({
            stoppable: true
        });
        $('#hst_esp_scr').loading({
            stoppable: true
        });

        $.ajax({
            url: _url_zacatuche + "/niche/getFreq",
            type: "post",
            data: ddata,
            dataType: "json",
            success: function(res, status) {

                var data = res.data;
                $('#hst_esp_eps').loading('stop');
                $('#hst_esp_scr').loading('stop');

                var data2_epsilon = [];
                var data2_score = [];
                var totcount_epsilon = 0;
                var totcount_score = 0;

                item = data;

                for (j = 0; j < item.length; j++) {
                    totcount_epsilon = totcount_epsilon + parseInt(item[j].freq_epsilon);
                    totcount_score = totcount_score + parseInt(item[j].freq_score);
                }

                for (j = 0; j < item.length; j++) {

                    elemento_epsilon = {
                        // bcenter : ((data[j].max_epsilon + data[j].min_epsilon) / 2).toFixed(2),
                        bcenter: parseFloat((parseFloat(item[j].min_epsilon) + parseFloat(item[j].max_epsilon)) / 2).toFixed(2),
                        frequency: parseFloat(parseInt(item[j].freq_epsilon) / totcount_epsilon).toFixed(2),
                        title: item[j].min_epsilon + " : " + item[j].max_epsilon
                    };

                    elemento_score = {
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

            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
                $('#hst_esp_eps').loading('stop');
                $('#hst_esp_scr').loading('stop');
            }


        });

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


            $("#a_item_bio00_" + item).text($.i18n.prop('a_item_bio00'));
            $("#a_item_bio01_" + item).text($.i18n.prop('a_item_bio01'));
            $("#a_item_bio02_" + item).text($.i18n.prop('a_item_bio02'));
            $("#a_item_bio03_" + item).text($.i18n.prop('a_item_bio03'));
            $("#a_item_bio04_" + item).text($.i18n.prop('a_item_bio04'));
            $("#a_item_bio05_" + item).text($.i18n.prop('a_item_bio05'));
            $("#a_item_bio06_" + item).text($.i18n.prop('a_item_bio06'));
            $("#a_item_bio07_" + item).text($.i18n.prop('a_item_bio07'));
            $("#a_item_bio08_" + item).text($.i18n.prop('a_item_bio08'));
            $("#a_item_bio09_" + item).text($.i18n.prop('a_item_bio09'));
            $("#a_item_bio10_" + item).text($.i18n.prop('a_item_bio10'));
            $("#a_item_bio11_" + item).text($.i18n.prop('a_item_bio11'));
            $("#a_item_bio12_" + item).text($.i18n.prop('a_item_bio12'));
            $("#a_item_bio13_" + item).text($.i18n.prop('a_item_bio13'));
            $("#a_item_bio14_" + item).text($.i18n.prop('a_item_bio14'));
            $("#a_item_bio15_" + item).text($.i18n.prop('a_item_bio15'));
            $("#a_item_bio16_" + item).text($.i18n.prop('a_item_bio16'));
            $("#a_item_bio17_" + item).text($.i18n.prop('a_item_bio17'));
            $("#a_item_bio18_" + item).text($.i18n.prop('a_item_bio18'));
            $("#a_item_bio19_" + item).text($.i18n.prop('a_item_bio19'));


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


        // actualiza los titulos de las tablas
        $('#example tr:eq(0) th:eq(0)').text($.i18n.prop('lb_decil'));
        $('#example tr:eq(0) th:eq(1)').text($.i18n.prop('lb_especie_tbl'));
        $('#example tr:eq(0) th:eq(2)').text($.i18n.prop('lb_epsilon'));
        $('#example tr:eq(0) th:eq(3)').text($.i18n.prop('tip_tbl_score'));
        $('#example tr:eq(0) th:eq(4)').text($.i18n.prop('lb_procentaje_occ'));


        $('#tdisplay tr:eq(0) th:eq(0)').text($.i18n.prop('lb_genero_tbl'));
        $('#tdisplay tr:eq(0) th:eq(1)').text($.i18n.prop('lb_especie_tbl'));
        // $('#tdisplay tr:eq(0) th:eq(2)').text($.i18n.prop('lb_raster'));
        // $('#tdisplay tr:eq(0) th:eq(3)').text($.i18n.prop('lb_rango'));
        $('#tdisplay tr:eq(0) th:eq(2)').text($.i18n.prop('lb_nij'));
        $('#tdisplay tr:eq(0) th:eq(3)').text($.i18n.prop('lb_nj'));
        $('#tdisplay tr:eq(0) th:eq(4)').text($.i18n.prop('lb_ni'));
        $('#tdisplay tr:eq(0) th:eq(5)').text($.i18n.prop('lb_n'));
        $('#tdisplay tr:eq(0) th:eq(6)').text($.i18n.prop('lb_epsilon'));
        $('#tdisplay tr:eq(0) th:eq(7)').text($.i18n.prop('tip_tbl_score'));
        $('#tdisplay tr:eq(0) th:eq(8)').text($.i18n.prop('a_item_reino'));
        $('#tdisplay tr:eq(0) th:eq(0)').text($.i18n.prop('a_item_phylum'));
        $('#tdisplay tr:eq(0) th:eq(10)').text($.i18n.prop('a_item_clase'));
        $('#tdisplay tr:eq(0) th:eq(11)').text($.i18n.prop('a_item_orden'));
        $('#tdisplay tr:eq(0) th:eq(12)').text($.i18n.prop('a_item_familia'));

        // $("#csv_request").attr("title", $.i18n.prop('lb_descarga_tbl'));
        $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));



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
    function _createHistScore_Celda(cdata) {

        _VERBOSE ? console.log("_createHistScore_Celda") : _VERBOSE;

        $('#hst_cld_scr').loading({
            stoppable: true
        });

        $.ajax({
            type: "post",
            url: _url_zacatuche + "/niche/getFreqCelda",
            data: cdata,
            dataType: "json",
            success: function(resp, status) {

                var data = resp.data;
                $('#hst_cld_scr').loading('stop');

                var data2_score = [];
                var totcount_score = 0;
                var Fi = []

                for (j = 0; j < data.length; j++) {

                    totcount_score = totcount_score + parseInt(data[j].freq);
                    Fi[j] = totcount_score;

                }

                for (j = 0; j < data.length; j++) {

                    elemento_score = {
                        bcenter: parseFloat((parseFloat(data[j].min) + parseFloat(data[j].max)) / 2).toFixed(2),
                        frequency: parseFloat(parseInt(data[j].freq) / totcount_score).toFixed(2),
                        title: data[j].min + " : " + data[j].max
                    };

                    data2_score.push(elemento_score);
                }

                _histogram_module_nicho.createBarChart(_id_chartscr_celda, data2_score, _iTrans.prop('titulo_hist_score_celda'));




            }

        });

    }


    /**
     * Éste método realiza la segmentación aleatoria del conjunto de celdas para realizar el proceso de validación. Cuando todas las iteraciones han sido realizadas los resultados son enviados al módulo de validación.	
     *
     * @function _iterateValidationProcess
     * @private
     * @memberof! res_display_module
     * 
     */
//    function _iterateValidationProcess() {
//
//        _VERBOSE ? console.log("_iterateValidationProcess") : _VERBOSE;
//
//        if (_ITER < _NUM_ITERATIONS) {
//
//            // consulta para obteer los griids de la malla
//            if (_gridids_collection.length == 0) {
//
//                _VERBOSE ? console.log("Primer petición") : _VERBOSE;
//
//
//
//                $.ajax({
//                    url: _url_zacatuche + "/niche/especie",
//                    type: 'post',
//                    data: {
//                        qtype: 'getGridids'
//                    },
//                    dataType: "json",
//                    success: function(resp) {
//
//                        d = resp.data;
//
//
//                        var grid_sp = [];
//                        var min_occids = [];
//                        var discardedGridids = [];
//
//                        _gridids_collection = d.map(function(d) {
//                            return d.gridid
//                        });
//
//                        // Para combinar el filtro de tiempo y de validacion, primero se aplica el filtro de tiempo y se obtiene conjunto de prueba y entrenamiento
//                        // La última iteracion es utilizada para calcular el resto de los elemntos visuales, se tiene que validar desde un inicio
//                        var lin_inf = _rangofechas ? _rangofechas[0] : undefined;
//                        var lin_sup = _rangofechas ? _rangofechas[1] : undefined;
//
//                        // TODO: REESTRUCTURACIÓN DE LÓGICA DE VALIDACIÓN
//                        // PROCESO ACTUAL:
//                        // 1. SE OBTIENEN LOS GRIDS DE LA MALLA
//                        // 2. SE SACAN PORCENTAJES SELCCIONADOS PARA ENTRENAMEINTO Y PRUEBAS
//                        // 3. SE OBITNEN LAS CELDAS DESCARTADAS BASADO EN EL PORCENTAJE DE PRUEBAS
//                        // 4. SE ENVIA EL ARRAY AL SERVIDOR DE LAS CELDAS QUE SERAN DESCARTADAS
//
//
//
//                        if (!_chkfecha || lin_inf != undefined) {
//
//                            var grid_collection_filter = [];
//
//                            // de la grid total, se quitan los elementos descartados por filtro de fechas
//                            $.each(_gridids_collection, function(index, item) {
//
//                                if ($.inArray(item, _computed_discarded_cells == -1)) {
//                                    grid_collection_filter.push(item);
//                                }
//
//                            });
//
//                            console.log(grid_collection_filter);
//
//                            _total_set_length = grid_collection_filter.length;
//                            _training_set_size = Math.floor(_total_set_length * (_slider_value / 100));
//                            _test_set_size = _total_set_length - _training_set_size;
//
//
//                            var shuffle_array = d3.shuffle(grid_collection_filter);
//                            discardedGridids = shuffle_array.slice(0, _test_set_size);
//
//
//                        }
//                        else {
//
//
//                            _total_set_length = _gridids_collection.length;
//                            _training_set_size = Math.floor(_total_set_length * (_slider_value / 100));
//                            _test_set_size = _total_set_length - _training_set_size;
//
//
//                            var shuffle_array = d3.shuffle(_gridids_collection);
//                            discardedGridids = shuffle_array.slice(0, _test_set_size);
//
//                        }
//
//                        _panelGeneration(discardedGridids);
//
//                        _VERBOSE ? console.log("ITER: " + _ITER) : _VERBOSE;
//                        _VERBOSE ? console.log("NUM_ITERATIONS: " + _NUM_ITERATIONS) : _VERBOSE;
//
//                    },
//                    error: function(jqXHR, textStatus, errorThrown) {
//                        _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
//                        _ITER = 0;
//                        _gridids_collection = [];
//                        _total_set_length = 0;
//                        _training_set_size = 0;
//                        _test_set_size = 0;
//                    }
//                });
//
//            }
//            else {
//
//                discardedGridids = [];
//                var shuffle_array = d3.shuffle(_gridids_collection);
//
//                discardedGridids = shuffle_array.slice(0, _test_set_size);
//
//                _panelGeneration(discardedGridids);
//
//                _VERBOSE ? console.log("ITER: " + _ITER) : _VERBOSE;
//                _VERBOSE ? console.log("NUM_ITERATIONS: " + _NUM_ITERATIONS) : _VERBOSE;
//
//            }
//
//
//        }
//        else {
//
//            _ITER = 0;
//            _gridids_collection = [];
//            _total_set_length = 0;
//            _training_set_size = 0;
//            _test_set_size = 0;
//
//            _VERBOSE ? console.log(_dataChartValSet.length) : _VERBOSE;
//            _VERBOSE ? console.log(_sp_gridids) : _VERBOSE;
//
//            _validation_module_all.validationProcess(_dataChartValSet, _sp_gridids, _NUM_ITERATIONS, _id_chartscr_decil);
//
//            // if the validation process is activated the last set_configuration value is used to create the table and histograms
//            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_inicia_histograma'), "info");
//            // _toastr.info(_iTrans.prop('lb_inicia_histograma'));
//
//            // _tdata["discardedids"] = [573324,581126,507259];
//
//            console.log(_tdata);
//
//            // tabla epsilon y score por especie 
//            _createTableEpSc(_tdata);
//
//            /* Generación de grid y administración de estilos */
//            // Sin implementar
//            _configureStyleMap(_sdata);
//
//            /* graficas epsilon y score por especie */
//            _createHistEpScr_Especie(_ddata);
//
//            /* grafica score por celda */
////            _createHistScore_Celda(_cdata);
//
//            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_carga_histograma'), "success");
//            // _toastr.success(_iTrans.prop('lb_carga_histograma'));
//
//
//        }
//
//    }


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

        // binding parents and sons
        fathers.forEach(function(father) {

            sons.forEach(function(son) {

                if (parseInt(father.item[0].title.type) == parseInt(son.item[0].title.type) && parseInt(father.item[0].title.group_item) == parseInt(son.item[0].title.group_item)) {

                    son_index = 0;

                    father.item.forEach(function(decil_item) {


                        // if there's no decil data in son, coninue for the next one
                        if (!son.item[son_index])
                            return;
                        if (son.item[son_index].decil != decil_item.decil)
                            return;

                        if (!(decil_item.arraynames.s)) {

//                            console.log(decil_item.arraynames);
                            var json_array = decil_item.arraynames[0].replace("{", "").replace("}", "").split(",");
                            var json_array_s = son.item[son_index].arraynames[0].replace("{", "").replace("}", "").split(",");

//                            console.log(json_array);
//                            console.log(json_array_s);

                            newnames_p = json_array;
                            newnames_s = json_array_s;
                            decil_item.arraynames = {p: newnames_p, s: [newnames_s]}
                        }
                        else {


//                            console.log(son.item[son_index].arraynames);
                            var json_array_s = son.item[son_index].arraynames[0].replace("{", "").replace("}", "").split(",");
//                            console.log(json_array_s);

                            newnames_s = json_array_s;
                            temp_s = decil_item.arraynames.s;
                            temp_s.push(newnames_s);
                            decil_item.arraynames.s = temp_s;
                        }

//                        if (!(decil_item.gridids.s)) {
//                            decil_item.gridids = {p: decil_item.gridids, s: [son.item[son_index].gridids]}
//                        }
//                        else {
//                            temp_s = decil_item.gridids.s;
//                            temp_s.push(son.item[son_index].gridids);
//                            // Array.prototype.push.apply(temp_s, son.item[son_index].gridids);
//                            decil_item.gridids.s = temp_s;
//                        }


                        if (!(decil_item.vp.s)) {
                            decil_item.vp = {p: decil_item.vp, s: [son.item[son_index].vp]}
                        }
                        else {
                            temp_s = decil_item.vp.s;
                            temp_s.push(son.item[son_index].vp);
                            decil_item.vp.s = temp_s;
                        }
                        if (!(decil_item.fn.s)) {
                            decil_item.fn = {p: decil_item.fn, s: [son.item[son_index].fn]}
                        }
                        else {
                            temp_s = decil_item.fn.s;
                            temp_s.push(son.item[son_index].fn);
                            decil_item.fn.s = temp_s;
                        }
                        if (!(decil_item.recall.s)) {
                            decil_item.recall = {p: decil_item.recall, s: [son.item[son_index].recall]}
                        }
                        else {
                            temp_s = decil_item.recall.s;
                            temp_s.push(son.item[son_index].recall);
                            decil_item.recall.s = temp_s;
                        }


                        if (!(decil_item.avg.s)) {
                            decil_item.avg = {p: decil_item.avg, s: [son.item[son_index].avg]}
                        }
                        else {
                            temp_s = decil_item.avg.s;
                            temp_s.push(son.item[son_index].avg);
                            decil_item.avg.s = temp_s;
                        }

//                        if (!(decil_item.sum.s)) {
//                            decil_item.sum = {p: decil_item.sum, s: [son.item[son_index].sum]}
//                        }
//                        else {
//                            temp_s = decil_item.sum.s;
//                            temp_s.push(son.item[son_index].sum);
//                            decil_item.sum.s = temp_s;
//                        }

                        if (!(decil_item.l_sup.s)) {
                            decil_item.l_sup = {p: decil_item.l_sup, s: [son.item[son_index].l_sup]}
                        }
                        else {
                            temp_s = decil_item.l_sup.s;
                            temp_s.push(son.item[son_index].l_sup);
                            decil_item.l_sup.s = temp_s;
                        }

                        if (!(decil_item.l_inf.s)) {
                            decil_item.l_inf = {p: decil_item.l_inf, s: [son.item[son_index].l_inf]}
                        }
                        else {
                            temp_s = decil_item.l_inf.s;
                            temp_s.push(son.item[son_index].l_inf);
                            decil_item.l_inf.s = temp_s;
                        }


                        if (!(decil_item.title.title.s)) {
                            decil_item.title.title = {p: decil_item.title.title, s: [son.item[son_index].title.title]}
                        }
                        else {
                            temp_s = decil_item.title.title.s;
                            temp_s.push(son.item[son_index].title.title);
                            decil_item.title.title.s = temp_s;
                        }

                        son_index++;

                    });

                }

            })

        });

        _VERBOSE ? console.log(fathers) : _VERBOSE;
        _VERBOSE ? console.log(fathers[0].item.length) : _VERBOSE;

        // binding parents by decil

        // NOTA: puede darse el caso que vengan menos de 10 deciles debido a que la especie objetivo y el grupo de variables tengan menos de 10 intersecciones
        // NOTA: Los grupos que ocmpoenn a fathers peuden variar en el numeor de deciles, por tanto el data_cahrt puede variar en tamaño segun el row de fathers
        data_chart = [];

        // se asignan siempre 10 deciles y depsues se valida si existe
        for (j = _NUM_DECILES; j > 0; j--) {
            data_chart.push({"decil": String(j)});
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
                }
                else {
                    temp = item_chart['vp'];
                    temp.push(decil.vp);
                    item_chart['vp'] = temp;
                }
                if (!(item_chart.fn)) {
                    item_chart['fn'] = [decil.fn];
                }
                else {
                    temp = item_chart['fn'];
                    temp.push(decil.fn);
                    item_chart['fn'] = temp;
                }
                if (!(item_chart.recall)) {
                    item_chart['recall'] = [decil.recall];
                }
                else {
                    temp = item_chart['recall'];
                    temp.push(decil.recall);
                    item_chart['recall'] = temp;
                }



                if (!(item_chart.values)) {
                    item_chart['values'] = [decil.avg];
                }
                else {
                    temp = item_chart['values'];
                    temp.push(decil.avg);
                    item_chart['values'] = temp;
                }


//                if (!(item_chart.gridids)) {
//                    item_chart['gridids'] = [decil.gridids];
//                }
//                else {
//                    temp = item_chart['gridids'];
//                    temp.push(decil.gridids);
//                    item_chart['gridids'] = temp;
//                }


                if (!(item_chart.names)) {
                    item_chart['names'] = [decil.title.title];
                }
                else {
                    temp = item_chart['names'];
                    temp.push(decil.title.title);
                    item_chart['names'] = temp;
                }

                if (!(item_chart.species)) {
                    item_chart['species'] = [decil.arraynames];
                }
                else {
                    temp = item_chart['species'];
                    temp.push(decil.arraynames);
                    item_chart['species'] = temp;
                }

                if (!(item_chart.decil)) {
                    item_chart['decil'] = decil.decil;
                }

                if (!(item_chart.lsup)) {
                    item_chart['lsup'] = [decil.l_sup];
                }
                else {
                    temp = item_chart['lsup'];
                    temp.push(decil.l_sup);
                    item_chart['lsup'] = temp;
                }

                if (!(item_chart.linf)) {
                    item_chart['linf'] = [decil.l_inf];
                }
                else {
                    temp = item_chart['linf'];
                    temp.push(decil.l_inf);
                    item_chart['linf'] = temp;
                }


            });

        });

        _VERBOSE ? console.log(data_chart) : _VERBOSE;

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
                temp.push({p: "Total", s: names});
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
                temp.push({p: decil_total[index].vp, s: vp});
                decil_item['vp'] = temp;

                fn = [];
                decil_item.fn.forEach(function(values_item, index) {
                    fn.push(values_item.p);
                });
                temp = decil_item['fn'];
                temp.push({p: decil_total[index].fn, s: fn});
                decil_item['fn'] = temp;

                recall = [];
                decil_item.recall.forEach(function(values_item, index) {
                    recall.push(values_item.p);
                });
                temp = decil_item['recall'];
                temp.push({p: decil_total[index].recall, s: recall});
                decil_item['recall'] = temp;



                values = [];
                decil_item.values.forEach(function(values_item, index) {
                    values.push(values_item.p);
                });
                temp = decil_item['values'];
                temp.push({p: decil_total[index].avg, s: values});
                decil_item['values'] = temp;



                lsups = [];
                decil_item.lsup.forEach(function(lsup_item, index) {
                    lsups.push(lsup_item.p);
                });
                temp = decil_item['lsup'];
                temp.push({p: decil_total[index].l_sup, s: lsups});
                decil_item['lsup'] = temp;

                linfs = [];
                decil_item.linf.forEach(function(linf_item, index) {
                    linfs.push(linf_item.p);
                });
                temp = decil_item['linf'];
                temp.push({p: decil_total[index].l_inf, s: linfs});
                decil_item['linf'] = temp;


//                species = [];
//                decil_item.species.forEach(function(species_item, index) {
//                    species.push(species_item.p);
//                });
//                temp = decil_item['species'];

//                temp.push({p: decil_total[index].arraynames.sort(), s: species});
//                decil_item['species'] = temp;

            });

        }

        // _VERBOSE ? console.log(data_chart) : _VERBOSE;
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
            }
            else {
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
    function showGetFeatureInfo(lat, long) {

        _VERBOSE ? console.log("showGetFeatureInfo") : _VERBOSE;


        var singleCellData = _cdata;

        var milliseconds = new Date().getTime();
        singleCellData['qtype'] = "getGridSpecies";
        singleCellData['lat'] = lat;
        singleCellData['long'] = long;
        singleCellData['idtime'] = milliseconds;

        $.ajax({
            url: _url_zacatuche + "/niche/getGridSpecies",
            type: 'post',
            data: singleCellData,
            success: function(resp) {

                var data = resp.data;

                _VERBOSE ? console.log(data) : _VERBOSE;

                var htmltable = _createTableFromData(data);
                _map_module_nicho.showPopUp(htmltable, [lat, long]);

            },
            error: function(jqXHR, textStatus, errorThrown) {

                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });


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
    function _createTableFromData(json_data) {

        _VERBOSE ? console.log("_createTableFromData") : _VERBOSE;

        var total_score = 0.0;
        var sp_values = false, raster_values = false;
        // contador de tipo de especies
        var contbio = 0, contabio = 0;
        // contador de especies positivas y negativas
        var posocc = 0, negocc = 0;

        _VERBOSE ? console.log(json_data) : _VERBOSE

        var htmltable = "<div class='myScrollableBlockPopup'>";
        var table_sp = "";
        var table_rt = "";
        var title_total;
        var total_celda;

        var apriori = (json_data[0].apriori) ? parseFloat(json_data[0].apriori) : undefined;
        var prob = (json_data[0].prob) ? parseFloat(json_data[0].prob) : undefined;


        console.log(json_data.length);
        console.log(json_data);


        for (i = 0; i < json_data.length; i++) {

            if (parseFloat(json_data[i].score) >= 0) {
                posocc++;
            }
            else {
                negocc++;
            }

            if (json_data[i].label === "") {
                contbio++;
                sp_values = true;
                continue;
            }
            if (json_data[i].nom_sp === "") {
                contabio++;
                raster_values = true;
                continue;
            }

        }

        if (json_data.length == 1 && json_data[0].gridid == 0) {

            console.log("Apriori");

            title_total = "Apriori";
            total_celda = parseFloat(apriori).toFixed(2);

            htmltable += "<div class='panel-primary'><div class='panel-heading'><h3>Total</h3></div><table class='table table-striped'><thead><tr><th>" + title_total + "</th><th>" + total_celda + "</th></tr></thead><tbody>";

        }
        else if (json_data.length == 1 && json_data[0].gridid == -1) {

            console.log("Probabilidad");

            title_total = $.i18n.prop('lb_pp_prob');
            total_celda = parseFloat(prob).toFixed(2);

            htmltable += "<div class='panel-primary'><div class='panel-heading'><h3>Total</h3></div><table class='table table-striped'><thead><tr><th>" + title_total + "</th><th>" + total_celda + "%</th></tr></thead><tbody>";

        }
        else {



            if (sp_values) {

                table_sp += "<div class='panel-primary'><div class='panel-heading'><h3>" + _iTrans.prop('tip_tbl_titulo') + "</h3></div><table class='table table-striped'><thead><tr><th>" + _iTrans.prop('tip_tbl_esp') + "</th><th>" + _iTrans.prop('tip_tbl_score') + "</th></tr></thead><tbody>";

                for (i = 0; i < json_data.length; i++) {

                    if (json_data[i].label === "" && json_data[i].gridid > 0) {

                        total_score += parseFloat(json_data[i].score);

                        table_sp += "<tr><td>" + json_data[i].nom_sp + "</td><td>" + parseFloat(json_data[i].score).toFixed(2) + "</td></tr>";

                    }

                }

                table_sp += "</tbody></table></div>";

            }

            if (raster_values) {

                // table_rt += "<div class='panel panel-primary'><div class='panel-heading'><h3>" + _iTrans.prop('tip_tbl_titulo_clima') + "</h3></div><table class='table table-striped'><thead><tr><th>" + _iTrans.prop('tip_tbl_bioclim') + "</th><th>" + _iTrans.prop('lb_rango') +" </th><th>" + _iTrans.prop('tip_tbl_score') + "</th></tr></thead><tbody>"
                table_rt += "<div class='panel-primary'><div class='panel-heading'><h3>" + _iTrans.prop('tip_tbl_titulo_clima') + "</h3></div><table class='table table-striped'><thead><tr><th>" + _iTrans.prop('tip_tbl_bioclim') + "</th><th>" + _iTrans.prop('tip_tbl_score') + "</th></tr></thead><tbody>"

                for (i = 0; i < json_data.length; i++) {
                    // _VERBOSE ? console.log(json_data[i]) : _VERBOSE;

                    if (json_data[i].nom_sp === "" && json_data[i].gridid > 0) {

                        total_score += parseFloat(json_data[i].score);

                        // tag = String(json_data[i].rango).split(":")
                        // min = tag[0].split(".")[0]
                        // max = tag[1].split(".")[0]      
                        // table_rt += "<tr><td>" + json_data[i].label +"</td><td>" + min+":"+max +"</td><td>" + parseFloat(json_data[i].score).toFixed(2) +"</td></tr>";
                        table_rt += "<tr><td>" + json_data[i].label + "</td><td>" + parseFloat(json_data[i].score).toFixed(2) + "</td></tr>";

                    }

                }

                table_rt += "</tbody></table></div>";
            }

            // _VERBOSE ? console.log(total_score) : _VERBOSE;
            // _VERBOSE ? console.log(total_score + apriori) : _VERBOSE;

            // se considera la suma de apriori cuando fue activada

            if (apriori) {

                title_score = $.i18n.prop('lb_pp_sp');
                parcial_score = parseFloat(total_score).toFixed(2);

                title_apriori = "Apriori";
                total_apriori = parseFloat(apriori).toFixed(2);
                
                // el valor apriori esta incluido en
                if(total_apriori===0){}
                else if(total_apriori>0){posocc--;}
                else{negocc--;}

                title_total = $.i18n.prop('lb_pp_st');
                total_celda = parseFloat(total_score + apriori).toFixed(2);

                htmltable += "<div class='panel-primary'>\n\
                                <div class='panel-heading'>\n\
                                    <h3>Total</h3>\n\
                                </div>\n\
                                <table class='table table-striped'>\n\
                                <thead>\n\
                                    <tr>\n\
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
                                    </tr>\n\
                                    <tr>\
                                        <th>" + $.i18n.prop('lb_pp_rbio') + "</th>\
                                        <th>" + contbio + "</th>\
                                    </tr>\
                                    <tr>\
                                        <th>" + $.i18n.prop('lb_pp_rabio') + "</th>\
                                        <th>" + contabio + "</th>\
                                    </tr>\
                                    <tr>\
                                        <th>" + $.i18n.prop('lb_pp_pos') + "</th>\
                                        <th>" + posocc + "</th>\
                                    </tr>\
                                    <tr>\
                                        <th>" + $.i18n.prop('lb_pp_neg') + "</th>\
                                        <th>" + negocc + "</th>\
                                    </tr>\
                                </thead>\n\
                                <tbody>";
            }
            else if (prob) {
                title_total = $.i18n.prop('lb_pp_probpre');
                prob = Math.floor(prob * 100) / 100;
                prob = parseFloat(prob) === 100.00 ? 99.99 : parseFloat(prob);
                prob = parseFloat(prob) === 0.00 ? 0.01 : parseFloat(prob);
                // console.log(prob);
                total_celda = parseFloat(prob).toFixed(2) + "%";

                htmltable += "<div class='panel-primary'>\n\
                                <div class='panel-heading'>\n\
                                <h3>Total</h3>\n\
                                </div>\n\
                                <table class='table table-striped'>\n\
                                <thead>\n\
                                <tr>\n\
                                <th>" + title_total + "</th>\n\
                                <th>" + total_celda + "</th>\n\
                                </tr>\n\
                                <tr>\
                                    <th>" + $.i18n.prop('lb_pp_rbio') + "</th>\
                                    <th>" + contbio + "</th>\
                                </tr>\
                                <tr>\
                                    <th>" + $.i18n.prop('lb_pp_rabio') + "</th>\
                                    <th>" + contabio + "</th>\
                                </tr>\
                                <tr>\
                                    <th>" + $.i18n.prop('lb_pp_pos') + "</th>\
                                    <th>" + posocc + "</th>\
                                </tr>\
                                <tr>\
                                    <th>" + $.i18n.prop('lb_pp_neg') + "</th>\
                                    <th>" + negocc + "</th>\
                                </tr>\
                                </thead>\n\
                                <tbody>";
            }
            else {
                title_total = $.i18n.prop('lb_pp_st');
                total_celda = parseFloat(total_score).toFixed(2);

                htmltable += "<div class='panel-primary'>\
                                    <div class='panel-heading'>\
                                        <h3>Total</h3>\
                                    </div>\
                                    <table class='table table-striped'>\
                                        <thead>\
                                            <tr>\
                                                <th>" + title_total + "</th>\
                                                <th>" + total_celda + "</th>\
                                            </tr>\
                                            <tr>\
                                                <th>" + $.i18n.prop('lb_pp_rbio') + "</th>\
                                                <th>" + contbio + "</th>\
                                            </tr>\
                                            <tr>\
                                                <th>" + $.i18n.prop('lb_pp_rabio') + "</th>\
                                                <th>" + contabio + "</th>\
                                            </tr>\
                                            <tr>\
                                                <th>" + $.i18n.prop('lb_pp_pos') + "</th>\
                                                <th>" + posocc + "</th>\
                                            </tr>\
                                            <tr>\
                                                <th>" + $.i18n.prop('lb_pp_neg') + "</th>\
                                                <th>" + negocc + "</th>\
                                            </tr>\
                                        </thead>\
                                    <tbody>";
            }

        }


        // htmltable += "<div class='panel panel-primary'><div class='panel-heading'><h3>Total</h3></div><table class='table table-striped'><thead><tr><th>" + title_total + "</th><th>" + total_celda +"</th></tr></thead><tbody>";
        htmltable += "</tbody></table></div>";

        htmltable += sp_values ? table_sp : "";
        htmltable += raster_values ? table_rt : "";

        htmltable += "</div>"; // cierra div myScrollableBlockPopup

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
    return{
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
        get_cData: get_cData,
        updateLabels: updateLabels,
        callDisplayProcess: callDisplayProcess,
        setHistogramModule: setHistogramModule
    }


});