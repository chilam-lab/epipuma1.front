/**
 * Módulo mapa, utilizado para crear y gestionar el mapa en nicho ecológico y comunidad ecológica.
 *
 * @namespace map_module
 */
var map_module = (function(url_geoserver, workspace, verbose, url_zacatuche) {

    var map, map_sp;

    var _VERBOSE = verbose;
    var _first_loaded = true;

    var _grid_d3;
    var _grid_map, _grid_map_target, _grid_map_occ, _grid_map_epipuma, _grid_map_occ_epipuma, _grid_map_epipuma_white, _grid_map_occ_epipuma_white, _grid_map_state_mun = undefined
    var _grid_res = undefined;
    var _data_sp_occ, _scale_color_function_occ = undefined;
    var _excludedcells = [];
    var _highlight_obj = { "cells": [], "decil": null };

    var _grid_map_hash = d3.map([]);

    var _DELETE_STATE_CELLS = false;

    var _url_geoserver = url_geoserver,
        _workspace = workspace;

    var _url_zacatuche = url_zacatuche;

    var _OSM_layer,
        _species_layer,
        _markersLayer,
        _baseMaps,
        _overlayMaps,
        _layer_control,
        _specie_target;

    var _OSMSP_layer,
        _markersSP_Layer,
        _baseSP_Maps,
        _overlaySP_Maps,
        _layer_SP_control,
        _specie_target_SP;

    var _REGION_SELECTED;

    var _lin_inf = undefined;
    var _lin_sup = undefined;
    var _sin_fecha = undefined;
    var _con_fosil = undefined;

    var _decil_cells = []


    _loadCountrySelect();

    // estilos para eliminar puntos
    var _geojsonMarkerOptions = {
            radius: 5,
            fillColor: "#4F9F37",
            color: "#488336",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6
        },
        _geojsonMarkerOptionsDelete = {
            radius: 5,
            fillColor: "#E10C2C",
            color: "#833643",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6
        },
        _customOptions = {
            'maxWidth': '500',
            'className': 'custom'
        };


    // estilos para herrameintas de estados
    var _geojsonStyleDefault = {
            radius: 7,
            fillColor: "#E2E613",
            color: "#ACAE36",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        },
        _geojsonHighlightStyle = {
            radius: 7,
            fillColor: "#16EEDC",
            color: "#36AEA4",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        },
        _geojsonMouseOverStyle = {
            radius: 7,
            fillColor: "#CED122",
            color: "#8C8E3A",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        };

    var _allowedPoints = d3.map([]),
        _geojsonFeature = [],
        _geojsonFeatureSP = [],
        _discardedPoints = d3.map([]),
        _discardedPointsFilter = d3.map([]),
        _computed_occ_cells = d3.map([]),
        _computed_discarded_cells = d3.map([]);

    var NUM_SECTIONS = 9;

    var _display_module, _language_module, _histogram_module;

    var _iTrans;

    var _MODULO_NICHO = 0,
        _MODULO_NET = 1;

    var _tipo_modulo;

    // Es un layer ficticio que sirve para controlar el layer hecho en D3 con los eventos del componente que maneja los layers
    var _lineLayer = L.Class.extend({
        initialize: function() {
            return;
        },
        onAdd: function(map) {
            _grid_d3.style("display", "block");
        },
        onRemove: function(map) {
            _grid_d3.style("display", "none");
        }
    });

    var _switchD3Layer;

    var _toastr = toastr;

    var _range_limits_red = [];
    var _range_limits_blue = [];
    var _range_limits_total = [];
    var _resultado_grid;

    var _centro_mapa, _zoom_module;


    const _ACGetSpecies = new AbortController();

    var _getSpeciesInProcess = false;


    function _loadCountrySelect() {

        console.log("_loadCountrySelect");

        $.ajax({
            url: _url_zacatuche + "/niche/especie/getAvailableCountriesFootprint",
            type: 'post',
            dataType: "json",
            success: function(resp) {

                var data = resp.data;
                console.log(data);

                $.each(data, function(i, item) {

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
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });
    }


    /**
     * Método getter del controlador de capas.
     *
     * @function get_layerControl
     * @public
     * @memberof! map_module
     * 
     */
    function get_layerControl() {
        return _layer_control;
    }

    /**
     * Método getter de la especie objetivo seleccionada.
     *
     * @function get_specieTarget
     * @public
     * @memberof! map_module
     * 
     */
    function get_specieTarget() {
        return _specie_target;
    }


    function get_spTaxon() {
        return _taxones;
    }

    function getExcludedCells() {
        return _excludedcells
    }


    /**
     * Método setter de la especie objetivo seleccionada.
     *
     * @function set_specieTarget
     * @public
     * @memberof! map_module
     * 
     * @param {json} specie_target - Json con la información de la especie objetivo seleccionada
     */
    // Asigna el valor de una especie seleccionada a una variable global del módulo.
    function set_specieTarget(specie_target) {
        _specie_target = specie_target;
    }


    /**
     * Método setter de la especie objetivo seleccionada.
     *
     * @function setDecilCells
     * @public
     * @memberof! map_module
     * 
     * @param {array} decil_cells - array de celdas que tiene presencia el decil seleccionado
     */
    function setDecilCells(decil_cells) {
        _decil_cells = decil_cells;
    }





    /**
     * Método getter de las ocurrencias de la especie objetivo consideradas para el análisis de nicho o comunidad ecológica.
     *
     * @function get_allowedPoints
     * @public
     * @memberof! map_module
     * 
     */
    function get_allowedPoints() {
        return _allowedPoints;
    }


    /**
     * Método getter de las ocurrencias descartadas de la especie objetivo para el análisis de nicho o comunidad ecológica.
     *
     * @function get_allowedPoints
     * @public
     * @memberof! map_module
     * 
     */
    function get_discardedPoints() {
        return _discardedPoints;
    }


    /**
     * Método getter de las ocurrencias descartadas por filtros de la especie objetivo para el análisis de nicho o comunidad ecológica.
     *
     * @function get_discardedPointsFilter
     * @public
     * @memberof! map_module
     * 
     */
    function get_discardedPointsFilter() {
        return _discardedPointsFilter;
    }

    /**
     * Método getter de las celdas decartadas para el análisis de nicho o comunidad ecológica.
     *
     * @function get_discardedCellFilter
     * @public
     * @memberof! map_module
     * 
     */
    function get_discardedCellFilter() {
        return _computed_discarded_cells;
    }

    /**
     * Método getter de las celdas consideradas para el análisis de nicho o comunidad ecológica.
     *
     * @function get_allowedCells
     * @public
     * @memberof! map_module
     * 
     */
    function get_allowedCells() {
        return _computed_occ_cells;
    }


    /**
     * Método getter del mapa utilizado en el análisis de nicho o comunidad ecológica.
     *
     * @function getMap
     * @public
     * @memberof! map_module
     * 
     */
    function getMap() {
        return map;
    }


    /**
     * Método setter del controlador de nicho o comunidad ecológica.
     *
     * @function setDisplayModule
     * @public
     * @memberof! map_module
     * 
     * @param {object} display_module - Referencia al controlador de nicho o comunidad ecológica
     */
    function setDisplayModule(display_module) {
        _display_module = display_module;
    }



    // ******************************************************************* geojson-vt
    var _tileIndex, _tileIndexSP, _tileIndexSpecies, _tileIndexDecil, _tileIndexStateMun, titleIndexEpipuma, titleIndexEpipumaWhite;

    var _tileOptions = {
        maxZoom: 20, // max zoom to preserve detail on
        tolerance: 5, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 64, // tile buffer on each side
        debug: 0, // logging level (0 to disable, 1 or 2)

        indexMaxZoom: 0, // max zoom in the initial tile index
        indexMaxPoints: 100000, // max number of points per tile in the index
    };

    var _tileLayer, _tileLayerSP, _tileLayerSpecies, _tileDecilLayer, _tileLayerStateMun, titleLayerEpipuma, titleLayerEpipumaWhite;
    var _pad;

    function whenClicked(e) {
        // e = event
        console.log(e);
        // You can make your ajax call declaration here
        //$.ajax(... 
    }

    function onEachFeature(feature, layer) {

        console.log("onEachFeature");
        //bind click
        layer.on({
            click: whenClicked
        });
    }


    /**
     * Éste método realiza la creación del objeto mapa, configura el módulo de lenguaje, genera lso controles para interactur con el mapa y realiza petición de la malla.
     *
     * @function _mapConfigure
     * @private
     * @memberof! map_module
     * 
     * @param {object} language_module - Módulo lenguaje
     * @param {integer} tipo_modulo - Tipo de módulo donde será asignado el mapa, nicho o comunidad ecológica  
     * @param {object} histogram_module - Módulo histograma 
     */
    function _mapConfigure(language_module, tipo_modulo, histogram_module) {

        _VERBOSE ? console.log("_mapConfigure") : _VERBOSE;

        _tipo_modulo = tipo_modulo;

        _histogram_module = histogram_module;

        _language_module = language_module;
        _iTrans = _language_module.getI18();


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


        //        var milliseconds = new Date().getTime();
        //        var url = _url_geoserver + "t=" + milliseconds;
        //        var espacio_capa = _workspace + ":sp_grid_terrestre";


        // normal osm map: http://{s}.tile.osm.org/{z}/{x}/{y}.png
        // black and white map: http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png
        // relieve: http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png
        // cartoDB: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'


        // var Thunderforest_OpenCycleMap = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={apikey}', {
        //     attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        //     apikey: '<your apikey>',
        //     maxZoom: 22
        // });


        // _OSM_layer = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=ec5ffebe46bb43a5a9cb8700c882be4b');
        // _OSM_layer.getAttribution = function () {
        //     return '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // };

        // _OSM_layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
        // _OSM_layer.getAttribution = function () {
        //     return 'Map tiles by <a href="https://carto.com/attribution">Carto</a>, under CC BY 3.0. Data by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, under ODbL.';
        // };



        // _OSM_layer = L.tileLayer('https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=ec5ffebe46bb43a5a9cb8700c882be4b');
        _OSM_layer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png');


        // _OSM_layer.getAttribution = function () {
        //         return '&copy; <a href="http://www.thunderforest.com/landscape">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // };


        // ******************************************************************* geojson-vt
        _tileIndex = geojsonvt([], _tileOptions);
        _tileIndexSpecies = geojsonvt([], _tileOptions);
        _tileIndexDecil = geojsonvt([], _tileOptions);
        _tileIndexStateMun = geojsonvt([], _tileOptions);

        _tileLayer = L.canvasTiles()
            .params({
                debug: false,
                padding: 5,
                onEachFeature: onEachFeature
            })
            .drawing(_drawingOnCanvas);

        _tileLayerStateMun = L.canvasTiles()
            .params({
                debug: false,
                padding: 5,
                onEachFeature: onEachFeature
            })
            .drawing(_drawingOnCanvasStateMun);

        _tileLayerSpecies = L.canvasTiles()
            .params({
                debug: false,
                padding: 5,
                onEachFeature: onEachFeature
            })
            .drawing(_drawingTargetOnCanvas);


        _tileDecilLayer = L.canvasTiles()
            .params({
                debug: false,
                padding: 5,
                onEachFeature: onEachFeature
            })
            .drawing(_drawingDecilOnCanvas);


        // console.log(config)

        // if (parseInt(localStorage.getItem("ambiente")) === 0 || parseInt(localStorage.getItem("ambiente")) === 1 || parseInt(localStorage.getItem("ambiente")) === 2 || parseInt(localStorage.getItem("ambiente")) === 3) {
        _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [23.5, -102] : [23.5, -102];
        _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 5 : 4;

        // else {
        //     _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [23.5, -102] : [23.5, -102];
        //     _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 5 : 4;
        // }


        // ambos div tienen el id = 'map', tanto en nicho como en comunidad


        // var target_species = "Target species"

        _baseMaps = {
            "Open Street Maps": _OSM_layer
        }



        if (_tipo_modulo === _MODULO_NICHO) {

            map = L.map('map', {
                center: _centro_mapa,
                zoom: _zoom_module,
                layers: [
                    _OSM_layer, // capa con mapa base
                    _tileLayer, // capa de resultados del análisis
                    _tileLayerSpecies, // capa de celdas donde tien presencia la especie objetivo
                    _tileDecilLayer, // capa de prensencia de especies por decil
                    _tileLayerStateMun // capa de staods y municipios
                ]
            })

            _overlayMaps = {
                "Result": _tileLayer,
                "Target": _tileLayerSpecies,
                // "Decile": _tileDecilLayer 
            }

        } else {

            map = L.map('map', {
                center: _centro_mapa,
                zoom: _zoom_module,
                layers: [
                    _OSM_layer,
                    _tileLayer
                ]
            });

            _overlayMaps = { "Grid": _tileLayer }
        }


        _layer_control = L.control.layers(_baseMaps, _overlayMaps).addTo(map);

        map.scrollWheelZoom.disable();


        // oculta boton de siguiente paso
        if (_tipo_modulo === _MODULO_NICHO) {
            document.getElementById("dShape").style.display = "none";
            document.getElementById("return_map").style.display = "none";
            //            _addControls();

        }

        //        _loadD3GridMX();


    }


    function _mapSPConfigure() {

        _VERBOSE ? console.log("_mapSPConfigure") : _VERBOSE;
        titleIndexEpipuma = geojsonvt([], _tileOptions);
        titleLayerEpipuma = L.canvasTiles()
            .params({
                debug: false,
                padding: 5,
                onEachFeature: onEachFeature
            })
            .drawing(_drawingOnCanvasOcc);

        titleIndexEpipumaWhite = geojsonvt([], _tileOptions);
        titleLayerEpipumaWhite = L.canvasTiles()
            .params({
                debug: false,
                padding: 5,
                onEachFeature: onEachFeature
            })
            .drawing(_drawingOnCanvasOcc)


        // _OSMSP_layer = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=ec5ffebe46bb43a5a9cb8700c882be4b');
        // _OSMSP_layer.getAttribution = function () {
        //     return '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // };

        // _OSMSP_layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
        // _OSMSP_layer.getAttribution = function () {
        //     return 'Map tiles by <a href="https://carto.com/attribution">Carto</a>, under CC BY 3.0. Data by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, under ODbL.';
        // };

        // _OSMSP_layer = L.tileLayer('https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=ec5ffebe46bb43a5a9cb8700c882be4b');
        // _OSMSP_layer.getAttribution = function () {
        //         return '&copy; <a href="http://www.thunderforest.com/landscape">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // };

        _OSMSP_layer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png');





        // ******************************************************************* geojson-vt
        _tileIndexSP = geojsonvt([], _tileOptions);
        _tileLayerSP = L.canvasTiles()
            .params({
                debug: false,
                padding: 5,
                onEachFeature: onEachFeature
            })
            .drawing(_drawingOnCanvasOcc);




        map_sp = L.map('map2', {
            center: _centro_mapa,
            zoom: _zoom_module,
            layers: [
                _OSMSP_layer,
                _tileLayerSP,
                titleLayerEpipuma,
                titleLayerEpipumaWhite
            ],
            zoomControl: false
        });

        _baseSP_Maps = {
            "Open Street Maps": _OSMSP_layer
        };

        _overlaySP_Maps = {
            "Grid": _tileLayerSP,
            "Result": titleLayerEpipuma,
            "ResultWhite": titleLayerEpipumaWhite
        };

        _layer_SP_control = L.control.layers(_baseSP_Maps, _overlaySP_Maps).addTo(map_sp);

        new L.Control.Zoom({ position: 'topright' }).addTo(map_sp);

        map_sp.scrollWheelZoom.disable();

        // Agregando controles cuando es análsis de nicho        
        if (_tipo_modulo === _MODULO_NICHO) {
            _addControls();

            $('#toolbar .hamburger').on('click', function() {
                $(this).parent().toggleClass('open');
            });

            // $('#toolbar2 .hamburger').on('click', function () {
            //     $(this).parent().toggleClass('open');
            // });
        }


    }

    function updateDecilLayer(deciles) {

        _layer_control.removeLayer(_tileDecilLayer)
        _layer_control.addOverlay(_tileDecilLayer, "Deciles " + deciles.toString())

    }


    function updateStateMunLayer(deciles) {

        _layer_control.removeLayer(_tileLayerStateMun)
        _layer_control.addOverlay(_tileLayerStateMun, "State/Mun")

    }


    /**
     * Realiza la petición de la malla al servidor
     *
     * @function _loadD3GridMX
     * @public
     * @memberof! map_module
     * 
     */
    function loadD3GridMX(val_process, grid_res, region_selected, taxones = []) {

        _VERBOSE ? console.log("_loadD3GridMX") : _VERBOSE;

        _taxones = taxones

        $('#map').loading({
            stoppable: true
        });

        $('#map2').loading({
            stoppable: true
        });

        $('#tuto_mapa_occ').loading({
            stoppable: true
        });

        _REGION_SELECTED = region_selected;

        $.ajax({
            url: _url_zacatuche + "/niche/especie/getGridGeoJson",
            type: 'post',
            dataType: "json",
            data: {
                "grid_res": grid_res,
                "footprint_region": _REGION_SELECTED
            },
            success: function(json) {

                console.log(json);

                // Asegura que el grid este cargado antes de realizar una generacion por enlace
                $("#loadData").prop("disabled", false);
                $('#map').loading('stop');
                $('#map2').loading('stop');
                $('#tuto_mapa_occ').loading('stop');

                _grid_map = json;

                _grid_res = grid_res;
                _first_loaded = true;


                _pad = 0;
                colorizeFeatures([], _grid_map, _tileLayer);
                _tileIndex = geojsonvt(_grid_map, _tileOptions);
                _tileLayer.redraw();


                if (_tipo_modulo === _MODULO_NICHO) {

                    _grid_map_occ = jQuery.extend(true, {}, json) // se genera un clon del gridmap
                    _grid_map_target = jQuery.extend(true, {}, json) // se genera un clon del gridmap
                    _grid_map_decil = jQuery.extend(true, {}, json) // se genera un clon del gridmap
                    _grid_map_state_mun = jQuery.extend(true, {}, json) // se genera un clon del gridmap
                    _grid_map_epipuma = jQuery.extend(true, {}, json)
                    _grid_map_occ_epipuma = jQuery.extend(true, {}, json)
                    _grid_map_epipuma_white = jQuery.extend(true, {}, json)
                    _grid_map_occ_epipuma_white = jQuery.extend(true, {}, json)

                    // console.log(_grid_map_occ);
                    // console.log(_grid_map_target);



                    colorizeDecileFeatures(_grid_map_decil, _tileDecilLayer);
                    _tileIndexDecil = geojsonvt(_grid_map_decil, _tileOptions);
                    _tileDecilLayer.redraw();


                    colorizeTargetFeatures(_grid_map_target, _tileLayerSpecies);
                    _tileIndexSpecies = geojsonvt(_grid_map_target, _tileOptions);
                    _tileLayerSpecies.redraw();


                    colorizeFeatures([], _grid_map_occ, _tileLayerSP);
                    _tileIndexSP = geojsonvt(_grid_map_occ, _tileOptions);
                    _tileLayerSP.redraw();


                    colorizeFeaturesSelectedStateMun([], _grid_map_state_mun, _tileLayerStateMun);
                    _tileIndexStateMun = geojsonvt(_grid_map_state_mun, _tileOptions);
                    _tileLayerStateMun.redraw();


                    colorizeFeaturesEpipuma([], _grid_map_epipuma, titleLayerEpipuma);
                    titleIndexEpipuma = geojsonvt(_grid_map_epipuma, _tileOptions);
                    titleLayerEpipuma.redraw();


                    colorizeFeaturesEpipumaWhite([], _grid_map_epipuma_white, titleLayerEpipumaWhite);
                    titleIndexEpipumaWhite = geojsonvt(_grid_map_epipuma_white, _tileOptions);
                    titleLayerEpipumaWhite.redraw();


                }

                _first_loaded = false;



                // agrega listener para generar pop en celda
                map.on('click', function(e) {

                    console.log(e.latlng.lat + ", " + e.latlng.lng);

                    if (_tipo_modulo === _MODULO_NICHO) {
                        _display_module.showGetFeatureInfo(e.latlng.lat, e.latlng.lng, _taxones, _REGION_SELECTED);
                    }

                });

                if (_tipo_modulo === _MODULO_NICHO) {

                    map_sp.on('click', function(e) {

                        console.log(e.latlng.lat + ", " + e.latlng.lng);

                        if (_tipo_modulo === _MODULO_NICHO) {

                            // verifica que ya este la malla cargada y que al menos exista un especie solcitada
                            if (_grid_map_occ === undefined) {
                                return
                            }


                            var rango_fechas = $("#sliderFecha").slider("values");
                            // console.log(rango_fechas)

                            if (_lin_inf === undefined)
                                _lin_inf = rango_fechas[0]

                            if (_lin_sup === undefined)
                                _lin_sup = rango_fechas[1]


                            // console.log("_lin_inf: " + _lin_inf)
                            // console.log("_lin_sup: " + _lin_sup)
                            // console.log("_sin_fecha: " + _sin_fecha)
                            // console.log("_con_fosil: " + _con_fosil)
                            console.log(_taxones)
                            console.log("_DELETE_STATE_CELLS: " + _DELETE_STATE_CELLS)

                            _display_module.showGetFeatureInfoOccCell(e.latlng.lat, e.latlng.lng, _taxones, _lin_inf, _lin_sup, _sin_fecha, _con_fosil, _grid_res, _REGION_SELECTED, _DELETE_STATE_CELLS);

                        }

                    });

                    // metodo del módulo de NICHO para cargar las especies
                    busca_especie_grupo(taxones, region_selected, val_process, grid_res)

                } else {


                    _display_module.callDisplayProcess(val_process)


                }


            },
            error: function(requestObject, error, errorThrown) {

                console.log(requestObject);
                console.log(error);
                console.log(errorThrown);
                // alert("Existe un error en la conexión con el servidor, intente mas tarde");
                //                console.log("abort");
                $('#map').loading('stop');
                $('#map2').loading('stop');
            }

        });

    }




    /**
     * Elimina el color de las celdas del mapa despues de ejecutar el analisis de nicho.
     *
     * @function clearMap
     * @public
     * @memberof! map_module
     * 
     */
    function clearMap() {

        _VERBOSE ? console.log("clearMap") : _VERBOSE;

        // console.log(_tileLayer)
        console.log(map.hasLayer(_tileLayer))

        if (!map.hasLayer(_tileLayer)) {
            addMapLayer(_tileLayer, "Result")
        }

        if (!map.hasLayer(_tileLayerSpecies)) {
            addMapLayer(_tileLayerSpecies, "Target")
        }


        // Variable para highlight 
        _highlight_obj = { "cells": [], "decil": null };

        // _VERBOSE ? console.log(_grid_map) : _VERBOSE;
        // _VERBOSE ? console.log(_first_loaded) : _VERBOSE;

        if (!_first_loaded && _grid_map !== undefined && _grid_map.features !== undefined) {
            for (var i = 0; i < _grid_map.features.length; i++) {
                _grid_map.features[i].properties.color = 'rgba(255,0,0,0)';
                // _grid_map_occ.features[i].properties.color = 'rgba(255,0,0,0)';
            }
        }

        // _VERBOSE ? console.log("_tileLayer") : _VERBOSE;

        _tileLayer.redraw();
        // _tileLayerSP.redraw();
    }


    /**
     * Elimina el color de las celdas del mapa despues de ejecutar el analisis de nicho.
     *
     * @function clearMap
     * @public
     * @memberof! map_module
     * 
     */
    function clearMapOcc() {

        _VERBOSE ? console.log("clearMapOcc") : _VERBOSE;


        if (!_first_loaded && _grid_map_occ !== undefined && _grid_map_occ.features !== undefined) {
            for (var i = 0; i < _grid_map_occ.features.length; i++) {
                _grid_map_occ.features[i].properties.color = 'rgba(255,0,0,0)';
            }
        }


        // _tileLayer.redraw();
        _tileLayerSP.redraw();
    }


    function colorizeDecileFeatures(grid_map = _grid_map_decil, tileLayer = _tileDecilLayer) {

        _VERBOSE ? console.log("colorizeDecileFeatures") : _VERBOSE;


        var cells_map = _decil_cells.map(function(d) { return d.cell })
        var decile_map = _decil_cells.map(function(d) { return d.decile })

        // var min_score = d3.min(score_map)  
        // var max_score = d3.max(score_map)  

        // var verdes = colorbrewer.Greens[9]
        // var verdes = ["#41ab5d","#238b45","#006d2c"]
        // var verdes = ["#74c476","#238b45","#00441b"]
        // var verdes = ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#006228","#00441b"];
        var verdes = ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#00542d", "#004529"]
            // var verdes = colorbrewer.BrBG[10];

        var scale_color_function = d3.scale.quantile()
            .domain(d3.range(1, 11))
            .range(verdes)

        // console.log(cells_map)
        // console.log(score_map)

        for (var i = 0; i < grid_map.features.length; i++) {


            // verifica si en la celda tiene presencia de la especie objetivo
            var index = cells_map.indexOf(grid_map.features[i].properties.gridid)
            if (index !== -1) {

                // console.log(scale_color_function(decile_map[index]))

                // console.log("celda objetivo")
                // grid_map.features[i].properties.color = 'rgba(17,227,217,0.6)'; cyan
                // grid_map.features[i].properties.color = 'rgba(96,247,20,0.6)';
                grid_map.features[i].properties.color = scale_color_function(decile_map[index]);
                grid_map.features[i].properties.stroke = 'rgba(0,0,0,0.3)';


            } else {

                // console.log("no match")
                grid_map.features[i].properties.color = 'rgba(0,0,0,0)';
                grid_map.features[i].properties.stroke = 'rgba(0,0,0,0)';

            }

        }

        tileLayer.redraw();

        if (!_first_loaded) {
            var values_occ = d3.range(1, 11)
            _cargaPaletaColorDecil(verdes, values_occ)
        }


    }




    function colorizeTargetFeatures(grid_map = _grid_map_target, tileLayer = _tileLayerSpecies) {

        _VERBOSE ? console.log("colorizeTargetFeatures") : _VERBOSE;

        var gridid_occ = []

        // se obtiene arreglos de celdas de la malla y de la especie objetivo
        if (_data_sp_occ !== undefined) {

            gridid_occ = _data_sp_occ.map(function(d) {
                return parseInt(d.gridid);
            })

        } else {
            return
        }

        console.log(gridid_occ)
            // console.log(_grid_map_target)

        for (var i = 0; i < grid_map.features.length; i++) {


            // verifica si en la celda tiene presencia de la especie objetivo
            if (gridid_occ.indexOf(parseInt(grid_map.features[i].properties.gridid)) !== -1) {

                console.log("celda objetivo")
                    // grid_map.features[i].properties.stroke = 'rgba(0,255,255,1)';
                    // grid_map.features[i].properties.stroke = 'rgba(152,78,173,1)';
                    // grid_map.features[i].properties.stroke = 'rgba(247,129,191,1)';

                // grid_map.features[i].properties.stroke = 'rgba(152,78,163,1)';
                // grid_map.features[i].properties.stroke = 'rgba(77,175,74,1)';
                // grid_map.features[i].properties.stroke = 'rgba(255,127,0,1)';

                grid_map.features[i].properties.stroke = 'rgba(255,0,0,0.6)';



            } else {

                // console.log("no match")
                grid_map.features[i].properties.stroke = 'rgba(0,0,0,0)';

            }

        }

        tileLayer.redraw();

    }



    /**
     * Asigna color y borde a las celdas que componen la malla en nicho ecológico.
     *
     * @function colorizeFeatures
     * @public
     * @memberof! map_module
     * 
     * @param {json} grid_map_color - funciones de color
     * @param {json} grid_map - GeoJson de la malla
     */
    function colorizeFeatures(grid_map_color, grid_map = _grid_map, tileLayer = _tileLayer) {

        _VERBOSE ? console.log("colorizeFeatures") : _VERBOSE;

        console.log(grid_map_color)
        console.log(grid_map)

        if (_first_loaded) {
            _VERBOSE ? console.log("first loaded") : _VERBOSE;

            for (var i = 0; i < grid_map.features.length; i++) {

                // grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                grid_map.features[i].properties.color = 'rgba(0,0,0,0)';
                grid_map.features[i].properties.score = null;

            }

        } else {


            for (var i = 0; i < grid_map.features.length; i++) {

                if (grid_map_color.has(grid_map.features[i].properties.gridid)) {

                    // if(grid_map.features[i].properties.gridid == 268 || grid_map.features[i].properties.gridid == "268"
                    //     || grid_map.features[i].properties.gridid == 269 || grid_map.features[i].properties.gridid == "269"){

                    //     console.log("es mun 268")
                    //     console.log("** gridid: " + grid_map.features[i].properties.gridid) 
                    //     console.log(grid_map_color.get(grid_map.features[i].properties.gridid).color)   

                    // }
                    // else{
                    //     console.log("no es mun")
                    //      console.log(grid_map.features[i].properties.gridid)       
                    //      console.log(grid_map_color.get(grid_map.features[i].properties.gridid).color)
                    // }


                    grid_map.features[i].properties.opacity = 1;
                    grid_map.features[i].properties.color = grid_map_color.get(grid_map.features[i].properties.gridid).color; //'hsl(' + 360 * Math.random() + ', 50%, 50%)'; 
                    grid_map.features[i].properties.score = grid_map_color.get(grid_map.features[i].properties.gridid).score;


                } else {

                    grid_map.features[i].properties.color = 'rgba(255,0,0,0)';
                    // grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    grid_map.features[i].properties.score = null;
                    // _grid_map.features[i].properties.opacity = 0;
                }


            }

        }

        tileLayer.redraw();

    }



    /**
     * Asigna color y borde a las celdas que componen la malla en nicho ecológico.
     *
     * @function Epipuma
     * @public
     * @memberof! map_module
     * 
     * @param {json} grid_map_color - funciones de color
     * @param {json} grid_map - GeoJson de la malla
     */
    function colorizeFeaturesEpipuma(grid_map_color, grid_map = _grid_map, tileLayer = titleLayerEpipuma) {

        _VERBOSE ? console.log("colorizeFeatures") : _VERBOSE;

        console.log(grid_map_color)
        console.log(grid_map)

        if (_first_loaded) {
            _VERBOSE ? console.log("first loaded") : _VERBOSE;

            for (var i = 0; i < grid_map.features.length; i++) {

                // grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                grid_map.features[i].properties.color = 'rgba(0,0,0,0)';
                grid_map.features[i].properties.score = null;

            }

        } else {


            for (var i = 0; i < grid_map.features.length; i++) {

                if (grid_map_color.has(grid_map.features[i].properties.gridid)) {

                    // if(grid_map.features[i].properties.gridid == 268 || grid_map.features[i].properties.gridid == "268"
                    //     || grid_map.features[i].properties.gridid == 269 || grid_map.features[i].properties.gridid == "269"){

                    //     console.log("es mun 268")
                    //     console.log("** gridid: " + grid_map.features[i].properties.gridid) 
                    //     console.log(grid_map_color.get(grid_map.features[i].properties.gridid).color)   

                    // }
                    // else{
                    //     console.log("no es mun")
                    //      console.log(grid_map.features[i].properties.gridid)       
                    //      console.log(grid_map_color.get(grid_map.features[i].properties.gridid).color)
                    // }


                    grid_map.features[i].properties.opacity = 1;
                    grid_map.features[i].properties.color = grid_map_color.get(grid_map.features[i].properties.gridid).color; //'hsl(' + 360 * Math.random() + ', 50%, 50%)'; 
                    grid_map.features[i].properties.score = grid_map_color.get(grid_map.features[i].properties.gridid).score;


                } else {

                    grid_map.features[i].properties.color = 'rgba(255,0,0,0)';
                    // grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    grid_map.features[i].properties.score = null;
                    // _grid_map.features[i].properties.opacity = 0;
                }


            }

        }

        tileLayer.redraw();

    }


    /**
     * Asigna color y borde a las celdas que componen la malla en nicho ecológico.
     *
     * @function Epipuma
     * @public
     * @memberof! map_module
     * 
     * @param {json} grid_map_color - funciones de color
     * @param {json} grid_map - GeoJson de la malla
     */
    function colorizeFeaturesEpipumaWhite(grid_map_color, grid_map = _grid_map, tileLayer = titleLayerEpipumaWhite) {

        _VERBOSE ? console.log("colorizeFeatures") : _VERBOSE;

        console.log(grid_map_color)
        console.log(grid_map)

        if (_first_loaded) {
            _VERBOSE ? console.log("first loaded") : _VERBOSE;

            for (var i = 0; i < grid_map.features.length; i++) {

                // grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                grid_map.features[i].properties.color = 'rgba(0,0,0,0)';
                grid_map.features[i].properties.score = null;

            }

        } else {


            for (var i = 0; i < grid_map.features.length; i++) {

                if (grid_map_color.has(grid_map.features[i].properties.gridid)) {

                    // if(grid_map.features[i].properties.gridid == 268 || grid_map.features[i].properties.gridid == "268"
                    //     || grid_map.features[i].properties.gridid == 269 || grid_map.features[i].properties.gridid == "269"){

                    //     console.log("es mun 268")
                    //     console.log("** gridid: " + grid_map.features[i].properties.gridid) 
                    //     console.log(grid_map_color.get(grid_map.features[i].properties.gridid).color)   

                    // }
                    // else{
                    //     console.log("no es mun")
                    //      console.log(grid_map.features[i].properties.gridid)       
                    //      console.log(grid_map_color.get(grid_map.features[i].properties.gridid).color)
                    // }


                    grid_map.features[i].properties.opacity = 1;
                    grid_map.features[i].properties.color = grid_map_color.get(grid_map.features[i].properties.gridid).color; //'hsl(' + 360 * Math.random() + ', 50%, 50%)'; 
                    grid_map.features[i].properties.score = grid_map_color.get(grid_map.features[i].properties.gridid).score;


                } else {

                    grid_map.features[i].properties.color = 'rgba(255,0,0,0)';
                    // grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    grid_map.features[i].properties.score = null;
                    // _grid_map.features[i].properties.opacity = 0;
                }


            }

        }

        tileLayer.redraw();

    }






    function colorizeFeaturesSelectedStateMun(grid_map_color, grid_map = _grid_map_state_mun, tileLayer = _tileLayerStateMun) {

        _VERBOSE ? console.log("colorizeFeaturesSelectedStateMun") : _VERBOSE;

        console.log(grid_map_color)
            // console.log(grid_map)

        if (_first_loaded) {
            _VERBOSE ? console.log("first loaded") : _VERBOSE;

            for (var i = 0; i < grid_map.features.length; i++) {

                grid_map.features[i].properties.color = 'rgba(0,0,0,0)';
                // grid_map.features[i].properties.score = null;

            }

        } else {


            for (var i = 0; i < grid_map.features.length; i++) {

                // if(parseInt(grid_map.features[i].properties.gridid) == 7){

                //     console.log("existe!!!!")

                // }

                if (grid_map_color.indexOf(parseInt(grid_map.features[i].properties.gridid)) != -1) {

                    // console.log("entra!!!!")
                    // console.log(parseInt(grid_map.features[i].properties.gridid))

                    // grid_map.features[i].properties.opacity = 1;
                    grid_map.features[i].properties.stroke = 'rgba(0,255,0,0.6)';
                    // grid_map.features[i].properties.color = 'rgba(255,0,0,0)' //grid_map_color.get(grid_map.features[i].properties.gridid).color;  //'hsl(' + 360 * Math.random() + ', 50%, 50%)'; 
                    // grid_map.features[i].properties.score = grid_map_color.get(grid_map.features[i].properties.gridid).score;


                } else {

                    grid_map.features[i].properties.stroke = 'rgba(0,0,0,0)';
                    // grid_map.features[i].properties.color = 'rgba(0,0,0,0)';
                    // grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    // grid_map.features[i].properties.score = null;
                    // _grid_map.features[i].properties.opacity = 0;
                }


            }

        }

        tileLayer.redraw();

    }


    /**
     * Asigna color y borde a las celdas que componen la malla en comunidad ecológica.
     *
     * @function colorizeFeaturesNet
     * @public
     * @memberof! map_module
     * 
     * @param {array} arg_gridid - Array con los ids de la malla
     * @param {type} arg_count - Número de ocurrencias por celda contenidas en la malla
     * @param {function} link_color_brewer - Función que asigna color a cada celda de la malla
     */
    function colorizeFeaturesNet(arg_gridid, arg_count, link_color_brewer) {

        _VERBOSE ? console.log("colorizeFeaturesNet") : _VERBOSE;

        // console.log(arg_gridid);
        // console.log(arg_count);
        // console.log(link_color_brewer);
        // console.log(_grid_map);

        var arg_gridid = arg_gridid.map(function(d) { return parseInt(d) })

        // var tonos = colorbrewer.YlOrRd[9];

        var min_occ = d3.min(arg_count);
        var max_occ = d3.max(arg_count);
        var range_labels = [];
        var tonos = [];


        console.log("min_occ: " + min_occ);
        console.log("max_occ: " + max_occ);
        console.log(range_labels);


        if (max_occ <= 9) {
            tonos = jQuery.extend(true, [], colorbrewer.YlOrRd[9])
            tonos = tonos.reverse().slice(0, max_occ)
            tonos.reverse()

            range_labels = d3.range(1, max_occ + 1);
        } else {
            tonos = colorbrewer.YlOrRd[9];

            var delta = max_occ / tonos.length
            d3.range(0, tonos.length).forEach(function(item, index) {
                if (index != 0)
                    range_labels.push(parseFloat(index * delta).toFixed(2))
            })


        }

        console.log(tonos)
        console.log(range_labels)


        for (var i = 0; i < _grid_map.features.length; i++) {


            index_grid = arg_gridid.indexOf(_grid_map.features[i].properties.gridid);

            if (index_grid != -1) {

                _grid_map.features[i].properties.opacity = 1;
                _grid_map.features[i].properties.color = link_color_brewer(arg_count[index_grid]);

            } else {

                _grid_map.features[i].properties.color = 'rgba(255,0,0,0)';

            }

        }


        _tileLayer.redraw();
        // _tileLayerSP.redraw();


        // if (!_first_loaded) {
        var values_occ = d3.range(1, 11)
        var pos_center_lb = (max_occ <= 9) // calcula la posición del label, si es centrado por cuadro o en el cambio de color
        _cargaPaletaColorNet(tonos, range_labels, pos_center_lb)
            // }



    }
    /**
     * Asigna color y borde a las celdas que componen la malla en comunidad ecológica.
     *
     * @function colorizeFeaturesByJSON
     * @public
     * @memberof! map_module
     * 
     * @param {array} grid_array - Referencia de la malla total
     * @param {type} data_sp - json con gridiid y conteos por celda
     */
    function colorizeFeaturesByJSON(grid_array, data_sp, deletecells = false) {

        _VERBOSE ? console.log("colorizeFeaturesByJSON") : _VERBOSE;

        var new_data = []
        $.each(data_sp, function(index, item) {
            if (_excludedcells.indexOf(item.gridid) === -1)
                new_data.push(item)
        })

        console.log("new_data: " + new_data.length)


        var min_occ = d3.min(new_data.map(function(d) {
            return parseFloat(d.occ);
        }));
        console.log("min_occ: " + min_occ)

        var max_occ = d3.max(new_data.map(function(d) {
            return parseFloat(d.occ);
        }));
        console.log("max_occ: " + max_occ)

        // var color_escale = colorbrewer.RdPu[9]
        var color_escale = colorbrewer.YlOrRd[5]
            // var color_escale = colorbrewer.OrRd[5]
            // var color_escale = colorbrewer.PuBuGn[5]

        console.log(color_escale)

        var scale_color_function = d3.scale.quantile()
            .domain([min_occ, max_occ])
            .range(color_escale)

        var array_ids = new_data.map(function(d) { return parseFloat(d.gridid); });
        // console.log("array_ids: " + array_ids.length)


        for (var i = 0; i < grid_array.features.length; i++) {


            var index_grid = array_ids.indexOf(grid_array.features[i].properties.gridid);

            if (index_grid != -1) {

                //console.log("entra")

                grid_array.features[i].properties.opacity = 1;
                if (deletecells) {
                    grid_array.features[i].properties.color = "#ff0000";
                } else {
                    grid_array.features[i].properties.color = scale_color_function(new_data[index_grid].occ);
                }


                grid_array.features[i].properties.stroke = 'rgba(0,0,0,0.4)';


            } else {

                // grid_array.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                grid_array.features[i].properties.color = 'rgba(255,0,0,0)';
                grid_array.features[i].properties.score = null;

                grid_array.features[i].properties.stroke = 'rgba(0,0,0,0)';


            }

        }


        _tileLayer.redraw();
        _tileLayerSP.redraw();



        // enviando datos para creación de barra de gradiente
        var values_occ = scale_color_function.quantiles()
        _cargaPaletaColorMapaOcc(color_escale, values_occ)


    }

    /**
     * Asigna color y borde a las celdas que componen la malla en comunidad ecológica.
     *
     * @function colorizeFeaturesByJSONEPIPUMA
     * @public
     * @memberof! map_module
     * 
     * @param {array} grid_array - Referencia de la malla total
     * @param {type} data_sp - json con gridiid y conteos por celda
     */
    function colorizeFeaturesByJSONEPIPUMA(grid_array, data_sp, deletecells = false, Color = "normal", iteracion = 0) {

        _VERBOSE ? console.log("colorizeFeaturesByJSON") : _VERBOSE;
        console.log(data_sp);

        var new_data = []
        $.each(data_sp, function(index, item) {
            if (_excludedcells.indexOf(item.gridid) === -1)
                new_data.push(item)
        })

        console.log("new_data: " + new_data.length)


        var min_occ = d3.min(new_data.map(function(d) {
            return parseFloat(d.occ);
        }));
        console.log("min_occ: " + min_occ)

        var max_occ = d3.max(new_data.map(function(d) {
            return parseFloat(d.occ);
        }));
        console.log("max_occ: " + max_occ)

        // var color_escale = colorbrewer.RdPu[9]
        //var color_escale = colorbrewer.YlOrRd[5]
        // var color_escale = colorbrewer.OrRd[5]
        // var color_escale = colorbrewer.PuBuGn[5]
        //alert(Color);
        if (Color == "azul") {
            var color_escale = ["#87CEEB"]
        }
        if (Color == "blanco") {
            var color_escale = ["#ffffff"]
        }
        if (Color == "normal") {
            var color_escale = colorbrewer.YlOrRd[5]

        }
        if (Color == "verde") {
            var color_escale = ["#008000"]

        }
        if (Color == "rojo") {
            var color_escale = ["#FF0000"]

        }

        console.log(color_escale)
        if (iteracion == 0) {
            var scale_color_function = d3.scale.quantile()
                .domain([min_occ, max_occ])
                .range(color_escale)

            var array_ids = new_data.map(function(d) { return parseFloat(d.gridid); });
            // console.log("array_ids: " + array_ids.length)


            for (var i = 0; i < grid_array.features.length; i++) {


                var index_grid = array_ids.indexOf(grid_array.features[i].properties.gridid);

                if (index_grid != -1) {
                    //console.log("entra")
                    grid_array.features[i].properties.opacity = 1;
                    if (deletecells) {
                        grid_array.features[i].properties.color = "#ff0000";
                    } else {
                        grid_array.features[i].properties.color = scale_color_function(new_data[index_grid].occ);
                    }
                    grid_array.features[i].properties.stroke = 'rgba(0,0,0,0.4)';


                } else {
                    // grid_array.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    grid_array.features[i].properties.color = 'rgba(255,0,0,0)';
                    grid_array.features[i].properties.score = null;
                    grid_array.features[i].properties.stroke = 'rgba(0,0,0,0)';
                }

            }
            _tileLayer.redraw();
            _tileLayerSP.redraw();
            // map.addLayer(_tileLayer);
            // map.addLayer(_tileLayerSP);

            // enviando datos para creación de barra de gradiente
            var values_occ = scale_color_function.quantiles()
            _cargaPaletaColorMapaOcc(color_escale, values_occ)

        }
        if (iteracion == 1) {
            console.log("addTo");
            var scale_color_function = d3.scale.quantile()
                .domain([min_occ, max_occ])
                .range(color_escale)

            var array_ids = new_data.map(function(d) { return parseFloat(d.gridid); });
            // console.log("array_ids: " + array_ids.length)
            for (var i = 0; i < grid_array.features.length; i++) {


                var index_grid = array_ids.indexOf(grid_array.features[i].properties.gridid);

                if (index_grid != -1) {
                    //console.log("entra")
                    grid_array.features[i].properties.opacity = 1;
                    if (deletecells) {
                        grid_array.features[i].properties.color = "#ff0000";
                    } else {
                        grid_array.features[i].properties.color = scale_color_function(new_data[index_grid].occ);
                    }
                    grid_array.features[i].properties.stroke = 'rgba(0,0,0,0.4)';


                } else {
                    // grid_array.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    grid_array.features[i].properties.color = 'rgba(255,0,0,0)';
                    grid_array.features[i].properties.score = null;
                    grid_array.features[i].properties.stroke = 'rgba(0,0,0,0)';
                }

            }
            var values_occ = scale_color_function.quantiles()
            _cargaPaletaColorMapaOcc(color_escale, values_occ)
                //L.marker(array_ids).addLayer(map);
                //L.marker(_tileLayerSP).addLayer(map);
                // map.addLayer(_tileLayer);
                // map.addLayer(_tileLayerSP);
            titleLayerEpipumaWhite.redraw();
            //_tileLayer.addLayer(map);
            //  _tileLayerSP.addLayer(map);

            // enviando datos para creación de barra de gradiente

        }
        if (iteracion == 2) {
            console.log("addTo");
            var scale_color_function = d3.scale.quantile()
                .domain([min_occ, max_occ])
                .range(color_escale)

            var array_ids = new_data.map(function(d) { return parseFloat(d.gridid); });
            // console.log("array_ids: " + array_ids.length)
            for (var i = 0; i < grid_array.features.length; i++) {


                var index_grid = array_ids.indexOf(grid_array.features[i].properties.gridid);

                if (index_grid != -1) {
                    //console.log("entra")
                    grid_array.features[i].properties.opacity = 1;
                    if (deletecells) {
                        grid_array.features[i].properties.color = "#ff0000";
                    } else {
                        grid_array.features[i].properties.color = scale_color_function(new_data[index_grid].occ);
                    }
                    grid_array.features[i].properties.stroke = 'rgba(0,0,0,0.4)';


                } else {
                    // grid_array.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    grid_array.features[i].properties.color = 'rgba(255,0,0,0)';
                    grid_array.features[i].properties.score = null;
                    grid_array.features[i].properties.stroke = 'rgba(0,0,0,0)';
                }

            }
            var values_occ = scale_color_function.quantiles()
            _cargaPaletaColorMapaOcc(color_escale, values_occ)
                //L.marker(array_ids).addLayer(map);
                //L.marker(_tileLayerSP).addLayer(map);
                // map.addLayer(_tileLayer);
                // map.addLayer(_tileLayerSP);
            titleLayerEpipuma.redraw();
            //_tileLayer.addLayer(map);
            //  _tileLayerSP.addLayer(map);

            // enviando datos para creación de barra de gradiente

        }



    }


    /**
     * Crea y configura la malla embebida en la capa del mapa.
     *
     * @function _drawingOnCanvas
     * @private
     * @memberof! map_module
     * 
     * @param {object} canvasOverlay - Objecto canvas donde esta contenida la malla
     * @param {json} params - Json con los parámetros para configurar la malla
     */
    function _drawingOnCanvas(canvasOverlay, params) {

        // console.log("_drawingOnCanvas")

        var bounds = params.bounds;
        params.tilePoint.z = params.zoom,
            elemLeft = params.canvas.offsetLeft,
            elemTop = params.canvas.offsetTop;

        var ctx = params.canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';

        ctx.canvas.addEventListener('click', function(event) {

            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

        }, false);


        var tile = _tileIndex.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
        if (!tile) {
            return;
        }

        ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

        var features = tile.features;

        // borde de la malla
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        // ctx.strokeStyle = 'rgba(255,255,255,0)';

        // ctx.strokeStyle = 'rgba(255,0,0,0)';
        // ctx.strokeStyle = 'grey'; // hace malla visible


        for (var i = 0; i < features.length; i++) {
            var feature = features[i],
                type = feature.type;

            // if(i == 0)      
            //     console.log(feature)

            // background de la celda
            ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0)';
            // ctx.strokeStyle = feature.tags.stroke ? feature.tags.stroke : 'rgba(0,0,0,0.1)';

            // Aun no se encuentra una propiedad para hacer el borde de la celda mas ancho
            // ctx["stroke-width"] = 5;

            ctx.beginPath();

            for (var j = 0; j < feature.geometry.length; j++) {
                var geom = feature.geometry[j];

                if (type === 1) {
                    ctx.arc(geom[0] * ratio + _pad, geom[1] * ratio + _pad, 2, 0, 2 * Math.PI, false);
                    continue;
                }

                for (var k = 0; k < geom.length; k++) {
                    var p = geom[k];
                    var extent = 4096;

                    var x = p[0] / extent * 256;
                    var y = p[1] / extent * 256;
                    if (k)
                        ctx.lineTo(x + _pad, y + _pad);
                    else
                        ctx.moveTo(x + _pad, y + _pad);
                }
            }

            if (type === 3 || type === 1) {
                ctx.fill('evenodd');
            }

            ctx.stroke();
        }

    }


    /**
     * Crea y configura la malla embebida en la capa del mapa.
     *
     * @function _drawingOnCanvas
     * @private
     * @memberof! map_module
     * 
     * @param {object} canvasOverlay - Objecto canvas donde esta contenida la malla
     * @param {json} params - Json con los parámetros para configurar la malla
     */
    function _drawingOnCanvasStateMun(canvasOverlay, params) {

        // console.log("_drawingOnCanvasStateMun")

        var bounds = params.bounds;
        params.tilePoint.z = params.zoom,
            elemLeft = params.canvas.offsetLeft,
            elemTop = params.canvas.offsetTop;

        var ctx = params.canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';

        ctx.canvas.addEventListener('click', function(event) {

            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

        }, false);


        var tile = _tileIndexStateMun.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
        if (!tile) {
            return;
        }

        ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

        var features = tile.features;

        // borde de la malla

        // ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        // ctx.strokeStyle = 'rgba(255,0,0,0)';
        // ctx.strokeStyle = 'grey'; // hace malla visible


        for (var i = 0; i < features.length; i++) {
            var feature = features[i],
                type = feature.type;

            // if(i == 0)      
            //     console.log(feature)

            // background de la celda
            ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0)';
            ctx.strokeStyle = feature.tags.stroke ? feature.tags.stroke : 'rgba(0,0,0,0)';

            // Aun no se encuentra una propiedad para hacer el borde de la celda mas ancho
            // ctx["stroke-width"] = 5;

            ctx.beginPath();

            for (var j = 0; j < feature.geometry.length; j++) {
                var geom = feature.geometry[j];

                if (type === 1) {
                    ctx.arc(geom[0] * ratio + _pad, geom[1] * ratio + _pad, 2, 0, 2 * Math.PI, false);
                    continue;
                }

                for (var k = 0; k < geom.length; k++) {
                    var p = geom[k];
                    var extent = 4096;

                    var x = p[0] / extent * 256;
                    var y = p[1] / extent * 256;
                    if (k)
                        ctx.lineTo(x + _pad, y + _pad);
                    else
                        ctx.moveTo(x + _pad, y + _pad);
                }
            }

            if (type === 3 || type === 1) {
                ctx.fill('evenodd');
            }

            ctx.stroke();
        }

    }


    /**
     * Crea y configura la malla embebida en la capa del mapa.
     *
     * @function _drawingOnCanvas
     * @private
     * @memberof! map_module
     * 
     * @param {object} canvasOverlay - Objecto canvas donde esta contenida la malla
     * @param {json} params - Json con los parámetros para configurar la malla
     */
    function _drawingTargetOnCanvas(canvasOverlay, params) {

        var bounds = params.bounds;
        params.tilePoint.z = params.zoom,
            elemLeft = params.canvas.offsetLeft,
            elemTop = params.canvas.offsetTop;

        var ctx = params.canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';

        ctx.canvas.addEventListener('click', function(event) {

            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

        }, false);


        var tile = _tileIndexSpecies.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
        if (!tile) {
            return;
        }

        ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

        var features = tile.features;

        // borde de la malla

        // ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        // ctx.strokeStyle = 'rgba(255,0,0,0)';
        // ctx.strokeStyle = 'grey'; // hace malla visible


        for (var i = 0; i < features.length; i++) {
            var feature = features[i],
                type = feature.type;

            // if(i == 0)      
            //     console.log(feature)

            // background de la celda
            ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0)';
            ctx.strokeStyle = feature.tags.stroke ? feature.tags.stroke : 'rgba(0,0,0,0)';

            // Aun no se encuentra una propiedad para hacer el borde de la celda mas ancho
            // ctx["stroke-width"] = 5;

            ctx.beginPath();

            for (var j = 0; j < feature.geometry.length; j++) {
                var geom = feature.geometry[j];

                if (type === 1) {
                    ctx.arc(geom[0] * ratio + _pad, geom[1] * ratio + _pad, 2, 0, 2 * Math.PI, false);
                    continue;
                }

                for (var k = 0; k < geom.length; k++) {
                    var p = geom[k];
                    var extent = 4096;

                    var x = p[0] / extent * 256;
                    var y = p[1] / extent * 256;
                    if (k)
                        ctx.lineTo(x + _pad, y + _pad);
                    else
                        ctx.moveTo(x + _pad, y + _pad);
                }
            }

            if (type === 3 || type === 1) {
                ctx.fill('evenodd');
            }

            ctx.stroke();
        }

    }




    /**
     * Crea y configura la malla embebida en la capa del mapa.
     *
     * @function _drawingOnCanvas
     * @private
     * @memberof! map_module
     * 
     * @param {object} canvasOverlay - Objecto canvas donde esta contenida la malla
     * @param {json} params - Json con los parámetros para configurar la malla
     */
    function _drawingDecilOnCanvas(canvasOverlay, params) {

        // console.log("_drawingDecilOnCanvas")

        var bounds = params.bounds;
        params.tilePoint.z = params.zoom,
            elemLeft = params.canvas.offsetLeft,
            elemTop = params.canvas.offsetTop;

        var ctx = params.canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';

        ctx.canvas.addEventListener('click', function(event) {

            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

        }, false);


        var tile = _tileIndexDecil.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
        if (!tile) {
            return;
        }

        ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

        var features = tile.features;

        // borde de la malla

        // ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        // ctx.strokeStyle = 'rgba(255,0,0,0)';
        // ctx.strokeStyle = 'grey'; // hace malla visible


        for (var i = 0; i < features.length; i++) {
            var feature = features[i],
                type = feature.type;

            // if(i == 0)      
            //     console.log(feature)

            // background de la celda
            ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0)';
            ctx.strokeStyle = feature.tags.stroke ? feature.tags.stroke : 'rgba(0,0,0,0)';

            // Aun no se encuentra una propiedad para hacer el borde de la celda mas ancho
            // ctx["stroke-width"] = 5;

            ctx.beginPath();

            for (var j = 0; j < feature.geometry.length; j++) {
                var geom = feature.geometry[j];

                if (type === 1) {
                    ctx.arc(geom[0] * ratio + _pad, geom[1] * ratio + _pad, 2, 0, 2 * Math.PI, false);
                    continue;
                }

                for (var k = 0; k < geom.length; k++) {
                    var p = geom[k];
                    var extent = 4096;

                    var x = p[0] / extent * 256;
                    var y = p[1] / extent * 256;
                    if (k)
                        ctx.lineTo(x + _pad, y + _pad);
                    else
                        ctx.moveTo(x + _pad, y + _pad);
                }
            }

            if (type === 3 || type === 1) {
                ctx.fill('evenodd');
            }

            ctx.stroke();
        }

    }




    /**
     * Crea y configura la malla embebida en la capa del mapa.
     *
     * @function _drawingOnCanvas
     * @private
     * @memberof! map_module
     * 
     * @param {object} canvasOverlay - Objecto canvas donde esta contenida la malla
     * @param {json} params - Json con los parámetros para configurar la malla
     */
    function _drawingOnCanvasOcc(canvasOverlay, params) {
        var bounds = params.bounds;
        params.tilePoint.z = params.zoom,
            elemLeft = params.canvas.offsetLeft,
            elemTop = params.canvas.offsetTop;

        var ctx = params.canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';

        ctx.canvas.addEventListener('click', function(event) {

            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

            //            console.log(event);
            //            console.log(x);
            //            console.log(y);

        }, false);

        var tile = _tileIndexSP.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
        if (!tile) {
            return;
        }

        ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

        var features = tile.features;

        // borde de la malla
        // se agrega borde de la malla
        // ctx.strokeStyle = 'rgba(0,0,0,0)';
        // ctx.strokeStyle = 'rgba(255,0,0,0)';
        // ctx.strokeStyle = 'grey'; // hace malla visible


        for (var i = 0; i < features.length; i++) {
            var feature = features[i],
                type = feature.type;

            // background de la celda
            ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(0,0,0,0)';
            ctx.strokeStyle = feature.tags.stroke ? feature.tags.stroke : 'rgba(0,0,0,0)';


            ctx.beginPath();

            for (var j = 0; j < feature.geometry.length; j++) {
                var geom = feature.geometry[j];

                if (type === 1) {
                    ctx.arc(geom[0] * ratio + _pad, geom[1] * ratio + _pad, 2, 0, 2 * Math.PI, false);
                    continue;
                }

                for (var k = 0; k < geom.length; k++) {
                    var p = geom[k];
                    var extent = 4096;

                    var x = p[0] / extent * 256;
                    var y = p[1] / extent * 256;
                    if (k)
                        ctx.lineTo(x + _pad, y + _pad);
                    else
                        ctx.moveTo(x + _pad, y + _pad);
                }
            }

            if (type === 3 || type === 1) {
                ctx.fill('evenodd');
            }

            ctx.stroke();
        }

    }

    /**
     * Modifica el color de celdas en el mapa, segun decil del histograma seleccionado.
     * 
     * @function set_colorCellsDecilMap
     * @public
     * @memberof! map_module
     * 
     *@param {array} tbl - arreglo donde se obtien los Gridid del decil seleccionado
     *@param {integer} dec - Numero del decil que se escogió 
     */
    function set_colorCellsDecilMap(tbl = _highlight_obj["cells"], dec = _highlight_obj["decil"]) {

        if (dec == null)
            return

        _VERBOSE ? console.log("set_colorCellsDecilMap") : _VERBOSE;

        $("#map_text").empty();
        document.getElementById("return_map").style.display = "inline";

        var svg_t = d3.select("#map_text")
            .append("svg")

        svg_t.append("rect")
            .attr("width", 40)
            .attr("height", 16)
            .attr("fill", "#00ff8c")
            .attr("stroke", "gray")
            .attr("y", 10)

        svg_t.append("text")
            .style("font-size", "9px")
            .attr("x", 0)
            .attr("y", 38)
            .text("Cells decil: " + dec);

        var Cells_id = [];

        _highlight_obj["cells"] = tbl;
        _highlight_obj["decil"] = dec;

        tbl.forEach(function(obj) {
            Cells_id.push(obj.gridid);
        });
        //   console.log(Cells_id);

        for (var i = 0; i < _grid_map.features.length; i++) {

            if (Cells_id.includes(_grid_map.features[i].properties.gridid)) {
                _grid_map.features[i].properties.color = '#00ff8c';
            }
        }

        _tileLayer.redraw();
    }

    /**
     * Agrega capas al controlador de capas.
     *
     * @function addMapLayer
     * @public
     * @memberof! map_module
     * 
     * @param {object} layer - Capa para ser agregada al controlador de capas
     * @param {String} name - Nombre de la capa
     */
    function addMapLayer(layer, name) {

        _VERBOSE ? console.log("addMapLayer") : _VERBOSE;

        map.addLayer(layer);
        _layer_control.addOverlay(layer, name);

    }


    /**
     * Elimina capas del controlador de capas.
     *
     * @function removeMapLayer
     * @public
     * @memberof! map_module
     * 
     * @param {object} layer - Capa para ser agregada al controlador de capas
     * @param {String} name - Nombre de la capa
     */
    function removeMapLayer(layer, name) {

        _VERBOSE ? console.log("removeMapLayer") : _VERBOSE;

        map.removeLayer(layer);
        _layer_control.removeLayer(layer);

    }

    /**
     * Agrega controles a la instancia del mapa.
     *
     * @function addMapControl
     * @public
     * @memberof! map_module
     * 
     * @param {object} control - Objeto tipo control
     */
    function addMapControl(control) {

        map.addControl(control);

    }


    /**
     * Elimina controles a la instancia del mapa.
     *
     * @function removeMapControl
     * @public
     * @memberof! map_module
     * 
     * @param {object} control - Objeto tipo control
     */
    function removeMapControl(control) {

        map.removeControl(control);

    }

    var _fisrtMap = true;



    /**
     * Despliega la tabla con los elementos que contiene la celda seleccioanda.
     *
     * @function showPopUp
     * @public
     * @memberof! map_module
     * 
     * @param {String} htmltable - Tabla estructurada en formato HTML con la información por celda del análisis de nicho ecológico
     * @param {object} latlng - Objeto que contiene las coordenadas donde fue seleccionada la celda
     */
    function showPopUp(htmltable, latlng, is_occ_map = false) {

        _VERBOSE ? console.log("showPopUp") : _VERBOSE;

        var map_ref = is_occ_map ? map_sp : map

        var popup = L.popup();
        popup.setLatLng(latlng).setContent(htmltable).openOn(map_ref);

    }


    /**
     * Agrega control personalizado para la eliminación de puntos.
     *
     * @function _addControls
     * @private
     * @memberof! map_module
     * 
     */
    function _addControls() {

        _VERBOSE ? console.log("_addControls") : _VERBOSE;

        // Control para boton de eliminación de puntos
        var PointDeleteControl = L.Control.extend({
            options: {
                position: 'topright',
            },
            onAdd: function(map) {
                var controlDiv = L.DomUtil.create('div', 'leaflet-control-command ');

                L.DomEvent
                    .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
                    .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
                    .addListener(controlDiv, 'click', function() {
                        _deleteCells();
                    });

                _VERBOSE ? console.log(_iTrans.prop('lb_borra_puntos')) : _VERBOSE;

                var controlUI = L.DomUtil.create('div', 'leaflet-control-command-interior glyphicon glyphicon-erase', controlDiv);
                controlUI.title = _iTrans.prop('lb_borra_puntos');
                controlUI.id = "deletePointsButton";

                return controlDiv;
            }
        });

        L.control.command = function(options) {
            return new PointDeleteControl(options);
        };

        map_sp.addControl(new PointDeleteControl());

    }






    /**
     * Reinicia los layers de los mampas.
     *
     * @function clearAllLayers
     * @public
     * @memberof! map_module
     * 
     */
    function clearAllLayers() {

        try {
            _markersSP_Layer.clearLayers();
            _layer_SP_control.removeLayer(_markersSP_Layer);

            _markersLayer.clearLayers();
            _layer_control.removeLayer(_markersLayer);

        } catch (e) {
            _VERBOSE ? console.log("primera vez") : _VERBOSE;
        }

    }


    /**
     * Busca las ocurrencias de un grupo de especies.
     *
     * @function busca_especie_grupo
     * @public
     * @memberof! map_module
     * 
     * @param {array} taxones - Array con taxones seleccionados
     */

    function busca_especie_grupo(taxones, region = 1, val_process = false, grid_res = "state", fuente = "nicho") {

        _VERBOSE ? console.log("busca_especie_grupo") : _VERBOSE;

        console.log("_grid_map_occ: " + _grid_map_occ)
        console.log("_grid_res: " + _grid_res)
        console.log("grid_res: " + grid_res)
        console.log("_REGION_SELECTED: " + _REGION_SELECTED)
        console.log("region: " + region)

        _taxones = taxones

        console.log(_taxones)


        if ((_grid_map_occ === undefined && fuente === "nicho") || _grid_map === undefined || _grid_res !== grid_res || _REGION_SELECTED !== region) {

            console.log("Carga de Malla (nueva o cambio de resolución)")

            map.off('click');

            if (_tipo_modulo === _MODULO_NICHO) {
                map_sp.off('click');
            }

            _grid_res = grid_res
            _REGION_SELECTED = region

            loadD3GridMX(val_process, grid_res, region, _taxones)
            return

        } else {

            console.log("Permanece de Malla")

            if (_tipo_modulo === _MODULO_NET) {
                _display_module.callDisplayProcess(val_process)
                return
            }

        }


        let todayDate = new Date();
        let todayDateToNextThirtyDays = String(todayDate.getFullYear() + "-" + (Number((todayDate.getMonth() + 1)) < 10 ? "0" + (todayDate.getMonth() + 1) : (todayDate.getMonth() + 1)) + "-" + (Number(todayDate.getDate()) < 10 ? "0" + todayDate.getDate() : todayDate.getDate()));
        //if($("#date_timepicker_start").val() == )
        var milliseconds = new Date().getTime();


        if ($("#pred_des_control")[0].checked) {
            var liminf_initial = $("#date_timepicker_start_val").val();

        } else {
            var liminf_initial = $("#date_timepicker_start").val();
        }
        if (liminf_initial == todayDateToNextThirtyDays) {
            var todayDateMinusThirtyDays = new Date(todayDate.setDate(todayDate.getDate() - 30))
            let parsedTodayDateMinusThirtyDays = String(todayDateMinusThirtyDays.getFullYear() + "-" + (Number((todayDateMinusThirtyDays.getMonth() + 1)) < 10 ? "0" + (todayDateMinusThirtyDays.getMonth() + 1) : (todayDateMinusThirtyDays.getMonth() + 1)) + "-" + (Number(todayDateMinusThirtyDays.getDate()) < 10 ? "0" + todayDateMinusThirtyDays.getDate() : todayDateMinusThirtyDays.getDate()));
            var liminf = parsedTodayDateMinusThirtyDays;
            var limsup = todayDateToNextThirtyDays;

        } else {
            var liminf_splited = liminf_initial.split("-");
            var month = liminf_splited[1]
            var endMonthDay = "";
            switch (month) {
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

            var liminf = liminf_splited[0] + "-" + liminf_splited[1] + "-01";
            var limsup = liminf_splited[0] + "-" + liminf_splited[1] + "-" + endMonthDay;
            console.log("liminf: " + liminf)
            console.log("limsup: " + limsup)
        }

        var rango_fechas = []
        if (liminf == "" || limsup == "") {
            rango_fechas = undefined;
        } else {
            rango_fechas.push(liminf)
            rango_fechas.push(limsup)
        }
        // var rango_fechas = $("#sliderFecha").slider("values");
        console.log(rango_fechas)


        _lin_inf = rango_fechas ? rango_fechas[0] : undefined
        _lin_sup = rango_fechas ? rango_fechas[1] : undefined


        console.log("_lin_inf: " + _lin_inf)
        console.log("_lin_sup: " + _lin_sup)


        _sin_fecha = $("#chkFecha").is(':checked') ? true : false;
        _con_fosil = $("#chkFosil").is(':checked') ? true : false;

        console.log("_sin_fecha: " + _sin_fecha)
        console.log("_con_fosil: " + _con_fosil)

        $('#tuto_mapa_occ').loading({
            stoppable: true
        });

        if (_tipo_modulo === _MODULO_NICHO) {

            console.log("entra!!!")

            $('#hist_fecha_container').loading({
                stoppable: true
            });

        }



        //limpia el mapa antes de generar un nuevo análisis
        // clearMapOcc()

        var flag_modifiers = sessionStorage.getItem("modifiers_flag");
        var state_model = $("#pred_des_control")[0].checked;

        if (state_model) {
            var liminf_initial = $("#date_timepicker_start_val").val();

        } else {
            var liminf_initial = $("#date_timepicker_start").val();
        }
        if (liminf_initial == todayDateToNextThirtyDays) {
            let parsedTodayDateMinusThirtyDays = String(todayDate.getFullYear() + "-" + (Number((todayDate.getMonth() + 1)) < 10 ? "0" + (todayDate.getMonth() + 1) : (todayDate.getMonth() + 1)) + "-" + (Number(todayDate.getDate()) < 10 ? "0" + todayDate.getDate() : todayDate.getDate()));
            var liminf = parsedTodayDateMinusThirtyDays;
            var limsup = todayDateToNextThirtyDays;

        } else {
            var liminf_splited = liminf_initial.split("-");
            var liminf = liminf_splited[0] + "-" + liminf_splited[1] + "-01";
            var limsup = liminf_splited[0] + "-" + liminf_splited[1] + "-" + endMonthDay;
        }
        var url_mod;

        if (flag_modifiers == "true") {
            let modifiers = JSON.parse(sessionStorage.getItem("modifiers"))
            let modifier = Object.values(modifiers);


            console.log("getGridGeneratedSpecies");
            console.log(modifier);
            //url_mod = _url_zacatuche + "dev/niche/especie/getGridGeneratedSpecies";
            url_mod = _url_zacatuche + "niche/especie/getGridGeneratedSpecies";
            let enfoque = sessionStorage.getItem("light_traffic");

            var data = {
                "name": "k",
                "target_taxons": taxones,
                "idtime": milliseconds,
                "liminf": _lin_inf,
                "limsup": _lin_sup,
                "sfecha": _sin_fecha,
                "sfosil": _con_fosil,
                "grid_res": grid_res,
                "region": region,
                "modifier": modifier[0],
                "liminf": liminf,
                "limsup": limsup,
                "traffic_light": enfoque,

            }
        } else {
            console.log("getGridSpeciesTaxon");
            url_mod = _url_zacatuche + "niche/especie/getGridSpeciesTaxon";
            //url_mod = _url_zacatuche + "dev/niche/especie/getGridSpeciesTaxon";
            var tar_var = taxones[0]["value"];
            console.log(tar_var);
            let enfoque = sessionStorage.getItem("light_traffic");
            var data = {
                "name": "k",
                "target_taxons": taxones,
                "idtime": milliseconds,
                "liminf": _lin_inf,
                "limsup": _lin_sup,
                "sfecha": _sin_fecha,
                "sfosil": _con_fosil,
                "grid_res": grid_res,
                "region": region,
                "liminf": liminf,
                "limsup": limsup,
                "traffic_light": enfoque,

            }

        }
        console.log(data)
        fetch(url_mod, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(resp => {

                $('#tuto_mapa_occ').loading('stop');


                // inicializa variables para eliminar celdas
                _DELETE_STATE_CELLS = false;
                _excludedcells = []
                $("#deletePointsButton").css("backgroundColor", "#fff");


                _data_sp_occ = resp.data
                    // asigna una referencia global para tener el resultado de la útima petición
                    // _data_sp_occ = data_sp

                var num_cell_occ = resp.data.length
                var num_occ = 0

                _data_sp_occ.forEach(function(item) {
                    num_occ += parseInt(item["occ"])
                })

                console.log(_data_sp_occ)
                sessionStorage.setItem("res_modif", JSON.stringify(_data_sp_occ))
                console.log("num_cell_occ: " + num_cell_occ)
                console.log("num_occ: " + num_occ)

                // rellena cuadro de resumen
                _fillSpeciesData(num_occ, num_cell_occ);


                // manda mensaje cuando no hay registro de especies en celdas
                if (num_cell_occ === 0) {
                    _VERBOSE ? console.log("No hay registros de especie") : _VERBOSE;
                    _toastr.info($.i18n.prop('lb_norecords'));
                    return;
                }


                // Se activa boton de siguiente paso
                $("#specie_next").css('visibility', 'visible');
                $("#specie_next").show("slow");
                console.log(_data_sp_occ)
                console.log("como a la fucnion")

                let selectedData = JSON.parse(sessionStorage.getItem("selectedData"));
                let specie = Object.values(selectedData)[0];
                var modifiers_flag = sessionStorage.getItem("modifiers_flag")
                console.log("La bandera del modificador")
                console.log(modifiers_flag)
                if (modifiers_flag == "true") {
                    let modifiers = JSON.parse(sessionStorage.getItem("modifiers"));
                    var modifier = Object.values(modifiers)[0];

                } else {
                    console.log("Deberia entrar aqui")
                    var modifier = "sin_modificador";
                }
                let focus = sessionStorage.getItem("light_traffic");

                console.log("A ver, el specie ", specie["label"])
                console.log("A ver, el modifier ", modifier)
                console.log("A ver, el focus ", focus)

                const editResumenTable = (row_number, texts, numbers) => {
                    try {
                        for (let index = 0; index < row_number; index++) {
                            $("#row_table_resumen").remove()
                        }

                    } catch (error) {
                        console.log("primera vez")
                    };

                    for (let index = 0; index < row_number; index++) {
                        let d = document.createElement("div");
                        d.setAttribute("class", "col-md-6 margin-top-five");
                        let d2 = document.createElement("div");
                        d2.setAttribute("class", "col-md-6 margin-top-five");
                        let d3 = document.createElement("div");
                        d3.setAttribute("class", "row");
                        d3.setAttribute("id", "row_table_resumen");
                        //LABEL
                        let h = document.createElement("h5");
                        let textnode = document.createTextNode(texts[index]);
                        h.appendChild(textnode);
                        h.setAttribute("id", "lb_occ_celda");
                        h.setAttribute("class", "summary_lb");
                        d.appendChild(h);
                        //NUMBER
                        let h2 = document.createElement("h5");
                        let textnode2 = document.createTextNode(numbers[index]);
                        h2.appendChild(textnode2);
                        h2.setAttribute("id", "num_occ_celda");
                        h2.setAttribute("class", "summary_lb");
                        d2.appendChild(h2);
                        d3.appendChild(d);
                        d3.appendChild(d2);
                        $("#res_tabla_epipuma").append(d3);
                    };
                };
                const getColorizedData = (_data_sp_occ, fp, tp, exclude1, exclude2, modifier = true, modifierFocus, modifierStar = false) => {
                    var lalistadelosazules = [];
                    var lalistadelosblancos = [];
                    var lalistadelosgradientes = [];
                    var lalistadelosverdes = [];
                    var sum_tv = 0;
                    if (modifier) {
                        for (let i = 0; i < _data_sp_occ.length; i++) {
                            if (_data_sp_occ[i].fp == fp) {
                                _data_sp_occ[i].occ = 100
                                lalistadelosblancos.push(_data_sp_occ[i])
                            } else if ((_data_sp_occ[i].fp == exclude1) && (_data_sp_occ[i].tp == exclude2)) {
                                // if ((_data_sp_occ[i].fp == 1) && (_data_sp_occ[i].tp == 0)) {
                                _data_sp_occ[i].occ = 100
                                lalistadelosazules.push(_data_sp_occ[i])
                            } else {
                                _data_sp_occ[i].occ = _data_sp_occ[i].tv
                                sum_tv += parseInt(_data_sp_occ[i].tv);
                                lalistadelosgradientes.push(_data_sp_occ[i])

                            }
                        };
                        colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosazules, false, "azul");
                        colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosblancos, false, "blanco", 1);
                        colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosgradientes, false, "normal", 2);
                    } else {
                        if (modifierStar) {
                            for (let i = 0; i < _data_sp_occ.length; i++) {
                                if (_data_sp_occ[i].tp == tp) {
                                    _data_sp_occ[i].occ = _data_sp_occ[i].tv
                                    sum_tv += parseInt(_data_sp_occ[i].tv);
                                    lalistadelosgradientes.push(_data_sp_occ[i])
                                } else {
                                    _data_sp_occ[i].occ = 100
                                    lalistadelosazules.push(_data_sp_occ[i])

                                }
                            };
                            colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosazules, false, "azul");
                            colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosgradientes, false, "normal", 2);

                        } else {
                            for (let i = 0; i < _data_sp_occ.length; i++) {
                                //Excluidos
                                if (_data_sp_occ[i].fp == fp) {
                                    _data_sp_occ[i].occ = 100
                                    lalistadelosblancos.push(_data_sp_occ[i])
                                //La clase
                                } else if ((_data_sp_occ[i].fp == exclude1) && (_data_sp_occ[i].tp == exclude2)) {
                                    // if ((_data_sp_occ[i].fp == 1) && (_data_sp_occ[i].tp == 0)) {
                                    _data_sp_occ[i].occ = 100
                                    lalistadelosverdes.push(_data_sp_occ[i])
                                //No clase
                                } else if ((_data_sp_occ[i].fp == exclude1) && (_data_sp_occ[i].tp == exclude1)) {
                                        _data_sp_occ[i].occ = 100
                                        lalistadelosazules.push(_data_sp_occ[i])
                                }
                            };
                            colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosazules, false, "azul");
                            colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosblancos, false, "blanco", 1);
                            modifierFocus ? colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosverdes, false, "verde", 2) : colorizeFeaturesByJSONEPIPUMA(_grid_map_occ, lalistadelosverdes, false, "rojo", 2)
                        }
                    };
                    return [lalistadelosazules.length, lalistadelosblancos.length, lalistadelosgradientes.length, lalistadelosverdes.length, sum_tv]
                };
                const colorized_by_modifier = (specie, modifier, focus) => {
                  var periodSelectedShort = liminf_initial.match(/....-../)[0]
                  var periodSelectedToDate= new Date(liminf_initial)
                  var periodSelectedToDateMinusAMonth = new Date(periodSelectedToDate.setDate(periodSelectedToDate.getMonth()-1))
                  var previousPeriodSelected = String(periodSelectedToDateMinusAMonth.getFullYear() + "-" + (Number(periodSelectedToDateMinusAMonth.getMonth()) < 10 ? "0" + (periodSelectedToDateMinusAMonth.getMonth()) : (periodSelectedToDateMinusAMonth.getMonth() + 1)))

                    switch (specie["label"]) {
                        case "COVID-19 CONFIRMADO":
                            switch (modifier) {
                                case "cases":
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers = getColorizedData(_data_sp_occ, 0, 1, 1, 0);
                                            listed_numbers = [numbers[4], numbers[2], numbers[0], numbers[1]];
                                            editResumenTable(4, texts, listed_numbers)
                                            break;
                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que no Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 0);
                                            listed_numbers2 = [numbers2[4], numbers2[2], numbers2[0], numbers2[1]]
                                            editResumenTable(4, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios en Top 10", "No. Municipios en Bottom 90"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], numbers3[2], numbers3[0]]
                                            editResumenTable(3, texts3, listed_numbers3)
                                            break;

                                    }
                                    break;
                                case "incidence":
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers = getColorizedData(_data_sp_occ, 0, 1, 1, 1);
                                            listed_numbers = [numbers[4], numbers[2], numbers[0], numbers[1]];
                                            editResumenTable(4, texts, listed_numbers)
                                            break;

                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que no Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 0);
                                            listed_numbers2 = [numbers2[4], numbers2[2], numbers2[0], numbers2[1]] 
                                            editResumenTable(4, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios en Top 10", "No. Municipios en Bottom 90"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], numbers3[2], numbers3[0]]
                                            editResumenTable(3, texts3, listed_numbers3)
                                            break;
                                    }
                                    break;
                                case "prevalence":
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers = getColorizedData(_data_sp_occ, 0, 1, 1, 1);
                                            listed_numbers = [numbers[4], numbers[2], numbers[0], numbers[1]];
                                            editResumenTable(4, texts, listed_numbers)
                                            break;

                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que no Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 0);
                                            listed_numbers2 = [numbers2[4], numbers2[2], numbers2[0], numbers2[1]] 
                                            editResumenTable(4, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios en Top 10", "No. Municipios en Bottom 90"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], numbers3[2], numbers3[0]]
                                            editResumenTable(3, texts3, listed_numbers3)
                                            break;
                                    }
                                    break;
                                default:
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Total de Casos Confirmados en " +periodSelectedShort, "No. Municipios Donde Dejaron de Haber Casos en "+periodSelectedShort, "No. Municipios Donde Siguieron Habiendo Casos en "+periodSelectedShort, "No. de Municipios en Donde no Había Casos en "+previousPeriodSelected];
                                            numbers = getColorizedData(_data_sp_occ, 0, 0, 1, 0, false, true);
                                            listed_numbers = [numbers[3], numbers[0], numbers[1]];
                                            editResumenTable(4, texts, listed_numbers)
                                            break;

                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Municipios en Rojo", "No. Municipios en Azul", "No. Municipios Excluidos"];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 1, false, false);
                                            listed_numbers2 = [numbers2[3], numbers2[0], numbers2[1]];
                                            editResumenTable(3, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos en los Municipios de la Clase", "No. Municipios en la Clase", "No. Municipios en la No-Clase", "No. Municipios Excluidos"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], 2458 - numbers3[0], numbers3[0], numbers3[1]]
                                            editResumenTable(4, texts3, listed_numbers3)
                                            break;
                                    }
                                    break;
                            }
                            break;
                        case "COVID-19 FALLECIDO":
                            switch (modifier) {
                                case "cases":
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers = getColorizedData(_data_sp_occ, 0, 1, 1, 1);
                                            listed_numbers = [numbers[4], numbers[2], numbers[0], numbers[1]];
                                            editResumenTable(4, texts, listed_numbers)
                                            break;
                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que no Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 0);
                                            listed_numbers2 = [numbers2[4], numbers2[2], numbers2[0], numbers2[1]]
                                            editResumenTable(4, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios en Top 10", "No. Municipios en Bottom 90"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], numbers3[2], numbers3[0]]
                                            editResumenTable(3, texts3, listed_numbers3)
                                            break;
                                    }
                                    break;
                                case "incidence":
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers = getColorizedData(_data_sp_occ, 0, 1, 1, 1);
                                            listed_numbers = [numbers[4], numbers[2], numbers[0], numbers[1]];
                                            editResumenTable(4, texts, listed_numbers)
                                            break;

                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que no Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 0);
                                            listed_numbers2 = [numbers2[4], numbers2[2], numbers2[0], numbers2[1]] 
                                            editResumenTable(4, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios en Top 10", "No. Municipios en Bottom 90"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], numbers3[2], numbers3[0]]
                                            editResumenTable(3, texts3, listed_numbers3)
                                            break;
                                    }
                                    break;
                                case "lethality":
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Salieron del Top 10 en "+periodSelectedShort, "No. Municipios que no Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers = getColorizedData(_data_sp_occ, 0, 1, 1, 1);
                                            listed_numbers = [numbers[4], numbers[2], numbers[0], numbers[1]];
                                            editResumenTable(4, texts, listed_numbers)
                                            break;

                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios que Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que no Pasaron al Top 10 en "+periodSelectedShort, "No. Municipios que Estaban en el Top 10 en "+previousPeriodSelected];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 0);
                                            listed_numbers2 = [numbers2[4], numbers2[2], numbers2[0], numbers2[1]] 
                                            editResumenTable(4, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos Confirmados en " +periodSelectedShort, "No. Municipios en Top 10", "No. Municipios en Bottom 90"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], numbers3[2], numbers3[0]]
                                            editResumenTable(3, texts3, listed_numbers3)
                                            break;
                                    }
                                    break;
                                default:
                                    switch (focus) {
                                        case "green":
                                            let numbers, listed_numbers;
                                            let texts = ["No. Municipios en Verde", "No. Municipios en Azul", "No. Municipios Excluidos"];
                                            numbers = getColorizedData(_data_sp_occ, 0, 0, 1, 0, false, true);
                                            listed_numbers = [numbers[3], numbers[0], numbers[1]];
                                            editResumenTable(3, texts, listed_numbers)
                                            break;

                                        case "red":
                                            let numbers2, listed_numbers2;
                                            let texts2 = ["No. Municipios en Rojo", "No. Municipios en Azul", "No. Municipios Excluidos"];
                                            numbers2 = getColorizedData(_data_sp_occ, 1, 0, 0, 1, false, false);
                                            listed_numbers2 = [numbers2[3], numbers2[0], numbers2[1]];
                                            editResumenTable(3, texts2, listed_numbers2)
                                            break;
                                        case "star":
                                            let numbers3, listed_numbers3;
                                            let texts3 = ["No. Total Casos en los Municipios de la Clase", "No. Municipios en la Clase", "No. Municipios en la No-Clase", "No. Municipios Excluidos"];
                                            numbers3 = getColorizedData(_data_sp_occ, 1, 1, 1, 0, false, false, true);
                                            listed_numbers3 = [numbers3[4], 2458 - numbers3[0], numbers3[0], numbers3[1]]
                                            editResumenTable(4, texts3, listed_numbers3)
                                            break;
                                    }
                                    break;
                            }
                            break;
                    }

                }
                colorized_by_modifier(specie, modifier, focus)

                //colorizeFeaturesByJSON(_grid_map_occ, _data_sp_occ)
                clearAllLayers();

                if (_tipo_modulo === _MODULO_NICHO) {


                    var data = {
                        "target_taxons": taxones,
                        "liminf": _lin_inf,
                        "limsup": _lin_sup,
                        "sfecha": _sin_fecha,
                        "sfosil": _con_fosil,
                        "grid_res": grid_res,
                        "region": region
                    }


                    // $('#hist_fecha_container').loading({
                    //     stoppable: true
                    // });

                    // Histograma de años de la especie. Se comenta para analisis de covid19
                    // TODO: Hacerlo en fechas mensuales y diarias

                    // fetch(_url_zacatuche + "/niche/especie/getCountByYear", {
                    //     method: "POST",
                    //     body: JSON.stringify(data),
                    //     headers: {
                    //         "Content-Type": "application/json"
                    //     }
                    // })
                    // .then(resp => resp.json())
                    // .then(resp => {

                    //     if(resp.ok == true){

                    //        var data = resp.data
                    //        console.log(data)

                    //        $('#hist_fecha_container').loading('stop');

                    //        _histogram_module.createBarChartFecha(data);

                    //     }

                    // })
                    // .catch(err => {

                    //    // _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
                    //    _VERBOSE ? console.log(errorThrown) : _VERBOSE;
                    //    _VERBOSE ? console.log(jqXHR.responseText) : _VERBOSE;

                    // });

                }

            })
            .catch(err => {

                // _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
                // _VERBOSE ? console.log(errorThrown) : _VERBOSE;
                // _VERBOSE ? console.log(jqXHR.responseText) : _VERBOSE;

                $('#tuto_mapa_occ').loading('stop');
                $('#hist_fecha_container').loading('stop');
                $("#specie_next").css('visibility', 'hidden');

            });

    }

    /**
     * Éste método obtiene las ocurrencias de una especie seleccionada en el análisis de nicho ecológico.
     *
     * @function busca_especie
     * @public
     * @memberof! map_module
     * 
     */
    function busca_especie(dPoints, region, arg_spids = []) {

        _VERBOSE ? console.log("busca_especie") : _VERBOSE;
        var milliseconds = new Date().getTime();
        var grid_res_val = $("#grid_resolution").val();

        //        console.log("grid_res_val: " + grid_res_val)
        //        console.log(_specie_target)

        $('#footprint_region_select').val(region);


        var rango_fechas = $("#sliderFecha").slider("values");
        if (rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")) {
            rango_fechas = undefined;
        } else {
            _lin_inf = _rangofechas ? _rangofechas[0] : undefined;
            _lin_sup = _rangofechas ? _rangofechas[1] : undefined;
        }

        _sin_fecha = $("#chkFecha").is(':checked') ? true : false;
        _con_fosil = $("#chkFosil").is(':checked') ? true : false;

        //        console.log(dPoints);

        $('#tuto_mapa_occ').loading({
            stoppable: true
        });


        //TODO: gueardar el footprint region en el enalce de generacion
        var footprint_region = region;
        console.log("footprint_region: " + footprint_region);


        $.ajax({
            url: _url_zacatuche + "/niche/especie/getSpeciesArray",
            type: 'post',
            dataType: "json",
            data: {
                "spids": arg_spids,
                "idtime": milliseconds,
                "lim_inf": _lin_inf,
                "lim_sup": _lin_sup,
                "sfecha": _sin_fecha,
                "sfosil": _con_fosil,
                "grid_res": grid_res_val,
                "footprint_region": footprint_region
            },
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-Test-Header', 'test-value');
                xhr.setRequestHeader("Accept", "text/json");
                changeRegionView(footprint_region);
            },
            success: function(resp) {

                console.log(resp)

                $('#tuto_mapa_occ').loading('stop');
                $("#specie_next").css('visibility', 'visible');
                $("#specie_next").show("slow"); //

                var data_sp = resp.data;
                // console.log("data_sp: " + data_sp)

                clearAllLayers();

                _discardedPoints = dPoints; // puntos descartados por eliminacion
                _allowedPoints = d3.map([]); // puntos para analisis
                _discardedPointsFilter = d3.map([]); // puntos descartados por filtros
                _computed_occ_cells = d3.map([]); // celdas para analisis
                // _computed_discarded_cells = d3.map([]);    // celdas descartadas por filtros

                var gridItems = [];
                if (dPoints.values().length > 0) {
                    $.each(dPoints.values(), function(index, item) {
                        gridItems.push(item.feature.properties.gridid);
                    });
                    //                    console.log(gridItems);
                }

                // var computed_occ_cells_totals = d3.map([]);
                var distinctPoints = d3.map([]);

                // manda mensaje cuando no hay registro de especies en celdas
                if (data_sp.length === 0) {
                    _VERBOSE ? console.log("No hay registros de especie") : _VERBOSE;

                    $("#specie_next").css('visibility', 'hidden');
                    _toastr.info($.i18n.prop('lb_norecords'));
                    _clearFieldsSP();

                    return;
                }


                // obtiene registros unicos en coordenadas
                for (i = 0; i < data_sp.length; i++) {

                    var item_id = JSON.parse(data_sp[i].json_geom).coordinates;
                    // console.log(d[i].gridid);
                    distinctPoints.set(item_id, data_sp[i]);
                    _computed_occ_cells.set(parseInt(data_sp[i].gridid), data_sp[i]);
                }


                //                var occ_cell = _computed_occ_cells.values().length;
                var occ_cell = data_sp[0].occ;

                $.each(distinctPoints.values(), function(index, item) {

                    var item_id = JSON.parse(item.json_geom).coordinates.toString();

                    // this map is fill with the records in the database from an specie, so it discards repetive elemnts.

                    if ($.inArray(item.gridid, gridItems) === -1) {

                        var fecha_ano = item.aniocolecta === 9999 ? "" : item.aniocolecta;
                        _allowedPoints.set(item_id, {
                            "type": "Feature",
                            "properties": {
                                "url": item.urlejemplar,
                                "fecha": fecha_ano,
                                "specie": _specie_target.label,
                                "specie": item.especie,
                                "gridid": item.gridid
                            },
                            "geometry": JSON.parse(item.json_geom)
                        });
                    }

                });


                try {
                    //                    map.removeLayer(_switchD3Layer);
                    map_sp.removeLayer(_switchD3Layer);
                } catch (e) {
                    _VERBOSE ? console.log("layer no creado") : _VERBOSE;
                }

                _addPointLayer();

                if (_tipo_modulo === _MODULO_NICHO) {

                    _histogram_module.createBarChartFecha(distinctPoints.values());

                }

                _fillSpeciesData(_allowedPoints.values().length, occ_cell);

                $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));

            },
            error: function(jqXHR, textStatus, errorThrown) {
                // _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
                _VERBOSE ? console.log(errorThrown) : _VERBOSE;
                _VERBOSE ? console.log(jqXHR.responseText) : _VERBOSE;

                $('#tuto_mapa_occ').loading('stop');
                $("#specie_next").css('visibility', 'hidden');
            }

        });


    }


    /**
     * Éste método limpia los valores de la especie que estan en el panel de resumen
     *
     * @function _clearFieldsSP
     * @private
     * @memberof! map_module
     * 
     */
    function _clearFieldsSP() {
        $("#lb_sum_reino_res").text("");
        $("#lb_sum_phylum_res").text("");
        $("#lb_sum_clase_res").text("");
        $("#lb_sum_orden_res").text("");
        $("#lb_sum_familia_res").text("");
        $("#lb_sum_genero_res").text("");
        $("#lb_sum_especie_res").text("");

        $("#num_occ").text("0");
        $("#num_occ_celda").text("0");
    }


    /**
     * Éste método despliega la información de la especie seleccionada en el análisis de nicho ecológico.
     *
     * @function _fillSpeciesData
     * @private
     * @memberof! map_module
     * 
     * @param {integer} occ - Número de ocurrencias de la especie
     * @param {integer} occ_cell - Número de celdas ocupadas por la especie
     */
    function _fillSpeciesData(occ, occ_cell) {

        _VERBOSE ? console.log("_specie_target") : _VERBOSE;

        // $("#lb_sum_reino_res").text(_specie_target.reino);
        // $("#lb_sum_phylum_res").text(_specie_target.phylum);
        // $("#lb_sum_clase_res").text(_specie_target.clase);
        // $("#lb_sum_orden_res").text(_specie_target.orden);
        // $("#lb_sum_familia_res").text(_specie_target.familia);
        // // $("#lb_sum_genero_res").text(_specie_target.genero);
        // $("#lb_sum_especie_res").text(_specie_target.especie);


        $("#num_occ").text(occ);
        $("#num_occ_celda").text(occ_cell);

    }

    function updateLabels() {

        _VERBOSE ? console.log("updateLabels map_module") : _VERBOSE;
        reloadPointLayer();

    }

    function reloadPointLayer() {

        _VERBOSE ? console.log("reloadPointLayer") : _VERBOSE;

        if (_markersSP_Layer !== undefined) {

            console.log("clear layers");

            map_sp.removeLayer(_markersSP_Layer);
            map.removeLayer(_markersLayer);

            _markersSP_Layer.clearLayers();
            _layer_SP_control.removeLayer(_markersSP_Layer);

            _markersLayer.clearLayers();
            _layer_control.removeLayer(_markersLayer);
        }

        _markersSP_Layer = L.markerClusterGroup({ maxClusterRadius: 30, chunkedLoading: true });
        _markersLayer = L.markerClusterGroup({ maxClusterRadius: 30, chunkedLoading: true });

        _addClusterLayer(_markersSP_Layer);
        map_sp.addLayer(_markersSP_Layer);
        _layer_SP_control.addOverlay(_markersSP_Layer,
            // _specie_target.label)
            "Species");

        _addClusterLayer(_markersLayer);
        map.addLayer(_markersLayer);
        _layer_control.addOverlay(_markersLayer,
            // _specie_target.label
            "Species");

    }

    /**
     * Éste método convierte una capa de puntos en una capa cluster de las ocurrencias de la especie objetivo seleccionada.
     *
     * @function _addClusterLayer
     * @private
     * @memberof! map_module
     * 
     * @param {markerClusterGroup} marker_layer Variable tipo Cluster de leaflet para ser añadida al mapa.
     */
    function _addClusterLayer(marker_layer) {

        var geoJsonFeature = {
            "type": "FeatureCollection",
            "features": _allowedPoints.values()
        };

        var layer = L.geoJson(geoJsonFeature, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, _geojsonMarkerOptions);
            },
            onEachFeature: function(feature, layer) {
                var message = _getMessagePopup(feature);
                layer.bindPopup(message, _customOptions);
            }
        });
        marker_layer.addLayer(layer);

    }

    /**
     * Éste método realiza la carga de una capa en el mapa con las ocurrencias de la especie objetivo seleccionada en el análisis de nicho ecológico.
     *
     * @function _addPointLayer
     * @private
     * @memberof! map_module
     * 
     */
    function _addPointLayer() {

        _VERBOSE ? console.log("_addPointLayer") : _VERBOSE;
        reloadPointLayer();

    }

    /**
     * Éste método controla la eliminación de puntos de una capa de ocurrencias de la especie objetivo seleccionada en el análisis de nicho ecológico.
     *
     * @function _deleteCells
     * @private
     * @memberof! map_module
     * 
     */
    function _deleteCells() {

        _VERBOSE ? console.log("_deleteCells") : _VERBOSE;

        if (_grid_map_occ === undefined) {
            console.log("_grid_map_occ null");
            return;
        }

        if (_DELETE_STATE_CELLS === false) {

            _DELETE_STATE_CELLS = true;

            $("#deletePointsButton").css("backgroundColor", "#BFADB6");

            colorizeFeaturesByJSON(_grid_map_occ, _data_sp_occ, true)



        } else {

            _DELETE_STATE_CELLS = false;

            $("#deletePointsButton").css("backgroundColor", "#fff");

            colorizeFeaturesByJSON(_grid_map_occ, _data_sp_occ)



        }

    }


    /**
     * Elimina la celda selecionada de la malla
     *
     * @function deleteCellFromOccGrid
     * @private
     * @memberof! map_module
     * 
     */
    function deleteCellFromOccGrid(gridid) {

        _VERBOSE ? console.log("deleteCellFromOccGrid") : _VERBOSE;

        // _VERBOSE ? console.log("gridid: " + gridid) : _VERBOSE;

        _excludedcells.push(gridid)

        colorizeFeaturesByJSON(_grid_map_occ, _data_sp_occ, true)

    }


    /**
     * Éste método despliega el mensaje informativo de la ocurrencia de la especie seleccionada en el análisis de nicho ecológico.
     *
     * @function _getMessagePopup
     * @private
     * @memberof! map_module
     * 
     * @param {object} feature - Objeto tipo punto de la ocucurrencia seleccionada para el análisis de nicho ecológico
     */
    function _getMessagePopup(feature) {

        //        _VERBOSE ? console.log("_getMessagePopup") : _VERBOSE;

        var coordinates = parseFloat(feature.geometry.coordinates[1]).toFixed(2) + ", " + parseFloat(feature.geometry.coordinates[0]).toFixed(2)

        var fecha = feature.properties.fecha == null ? "" : feature.properties.fecha;

        var url = "";

        if (feature.properties.url.startsWith("http://")) {
            url = feature.properties.url.replace("http://", "");
        } else if (feature.properties.url.startsWith("https://")) {
            url = feature.properties.url.replace("https://", "");
        } else {
            url = feature.properties.url;
        }

        //        _VERBOSE ? console.log("prueba: " + _iTrans.prop("lb_occ_title_sp")) : _VERBOSE;

        var message = _iTrans.prop("lb_occ_title_sp") + "<br/>" + _iTrans.prop("lb_occ_nombre") + ": " + feature.properties.specie + "<br/>" + _iTrans.prop("lb_occ_colecta") + ": " + fecha + "<br/>" + _iTrans.prop("lb_occ_coord") + ": " + coordinates + "<br/><a target='_blank' class='enlace_sp' href='http://" + url + "'>" + _iTrans.prop("link_sp") + "</a>";
        return message;
    }



    /**
     * Éste método realiza la partición en deciles y la asignación de escala de colores de un conjunto de celdas con valores de score asignado.
     *
     * @function createRankColor
     * @public
     * @memberof! map_module
     * 
     * @param {json} json - Json con el conjunto de celdas y score asignado resultado del análisis de nicho ecológico
     * @param {boolean} mapa_prob - Bandera para saber si el mapa despliega el color con probalidad por celda
     */

    function createRankColor(json, mapa_prob, map_type) {

        _VERBOSE ? console.log("createRankColor") : _VERBOSE;

        console.log(json)

        // console.log("map_type: " + map_type)

        var equal_range_sections = 9;
        var grid_color = d3.map([]);
        var colors = jQuery.extend(true, [], colorbrewer.RdBu[9]);
        colors = colors.reverse()
            // console.log(colors)


        var equal_range_colors = jQuery.extend(true, [], colorbrewer.Blues[equal_range_sections])



        equal_range_colors = equal_range_colors.reverse()
        equal_range_colors = equal_range_colors.concat(jQuery.extend(true, [], colorbrewer.Reds[equal_range_sections]))


        console.log(equal_range_colors)


        if (!mapa_prob) {

            var scales = {};

            var rateById = {};
            // var rateById2 = {};
            json.forEach(function(d) { rateById[d.gridid] = +d.tscore; });
            // json.forEach(function(d) { rateById2[d.gridid] = d.tscore; });

            var arr_scores = json.map(function(d) { return parseFloat(d.tscore); })
            var min_scr = d3.min(arr_scores);
            var max_scr = d3.max(arr_scores);

            var deviation = d3.deviation(arr_scores)
            var mean = d3.mean(arr_scores)
            var breaks = ss.jenks(json.map(function(d) { return +d.tscore; }), (colors.length - 2))

            console.log("min_scr: " + min_scr)
            console.log("max_scr: " + max_scr)
            console.log("deviation: " + deviation)
            console.log("mean: " + mean)
                // console.log(ss.jenks(json.map(function(d) { return +d.tscore; }), (colors.length-2)))



            // Calculo de rangos para coloración EQUAL RANGE
            var equal_range_values = []
                // solo positivos 
            if (min_scr > 0) {
                console.log("positivos")
                    // Revisar: chear si el minimo debe ser min_src o cero [0, max_src]
                var scale_test = d3.scale.quantile()
                    // .domain([min_scr, max_scr])
                    .domain([0, max_scr])
                    .range(d3.range(equal_range_sections));

                equal_range_values = scale_test.quantiles()
                equal_range_colors = jQuery.extend(true, [], colorbrewer.Reds[equal_range_sections]);

            }
            // solo negativos
            else if (max_scr < 0) {
                console.log("negativos")

                var scale_test = d3.scale.quantile()
                    // .domain([min_scr, max_scr])
                    .domain([min_scr, 0])
                    .range(d3.range(equal_range_sections));

                equal_range_values = scale_test.quantiles()
                equal_range_colors = jQuery.extend(true, [], colorbrewer.Blues[equal_range_sections]);

            }
            // existen valores positivos y negativos
            // negativo absoluto es mayor que positivo absoluto
            else if (Math.abs(min_scr) > Math.abs(max_scr)) {
                console.log("negativo mayor")

                var scale_test = d3.scale.quantile()
                    .domain([min_scr, 0])
                    .range(d3.range(equal_range_sections));

                console.log(scale_test.quantiles())

                equal_range_values = scale_test.quantiles()
                var inverse_temp = jQuery.extend(true, [], equal_range_values)

                console.log(equal_range_values)

                inverse_temp = inverse_temp.map(function(d) { return -d })

                console.log(inverse_temp)

                equal_range_values = equal_range_values.concat([0].concat(inverse_temp.reverse()))
                    // equal_range_colors = jQuery.extend(true, [], colorbrewer.Blues[equal_range_sections]); 

            }
            // positivo absoluto es mayor que negativo absoluto
            else {
                console.log("positivo mayor")

                var scale_test = d3.scale.quantile()
                    .domain([0, max_scr])
                    .range(d3.range(equal_range_sections));

                equal_range_values = scale_test.quantiles()
                var inverse_temp = jQuery.extend(true, [], equal_range_values)

                console.log(equal_range_values)

                inverse_temp = inverse_temp.map(function(d) { return -d })
                equal_range_values = inverse_temp.reverse().concat([0].concat(equal_range_values))

            }

            console.log("********values")
            console.log(equal_range_values)
            console.log(equal_range_colors)



            // Calculo de rangos para coloración STANDARD DEVIATION
            var arr_range_deviations = []
            arr_range_deviations = d3.range(4).map(function(d) { return mean + (d * -deviation) })
            arr_range_deviations.reverse()
            arr_range_deviations = arr_range_deviations.concat(d3.range(1, 5).map(function(d) { return mean + (d * deviation) }))

            console.log(arr_range_deviations)
            console.log(colors)


            scales.range = d3.scale.threshold()
                .domain(equal_range_values)
                .range(equal_range_colors);

            //TODO: crear el dominio a partir del numero de desviaciones estandar de cada
            // parsear o redondear a entero cada elemento
            scales.deviation = d3.scale.threshold()
                .domain(arr_range_deviations)
                .range(colors);


            // scales.quantize = d3.scale.quantize()
            //     .domain([min_scr, max_scr])
            //     .range(colors);

            scales.jenks = d3.scale.threshold()
                .domain(breaks)
                .range(colors);

            // console.log(colors)
            // console.log(rateById)
            // console.log(scales['jenks9'])
            // console.log(rateById[8526])
            // console.log(scales['jenks'](rateById[8526]))
            // console.log(scales['deviation'](-45))
            // console.log(scales['deviation'](0))
            // console.log(scales['deviation'](3))
            // console.log(scales['deviation'](20))
            // console.log(scales['deviation'](80))

            $.each(json, function(index, d) {

                grid_color.set(parseInt(d.gridid), { color: scales[map_type](rateById[d.gridid]), score: d.tscore });
                // grid_color.set(parseInt(d.gridid), {color: scales['deviation'](rateById[d.gridid]), score: d.tscore});

            })



            var colors_array = map_type === "range" ? equal_range_colors : colors
            var values_array = [];

            switch (map_type) {
                case "range":
                    values_array = equal_range_values
                    break;
                case "deviation":
                    values_array = arr_range_deviations
                    break;
                    // case "quantize":
                    //     var temp_scale = d3.scale.quantile()
                    //         .domain([min_scr, max_scr])
                    //         .range(colors);
                    //     values_array = temp_scale.quantiles()
                    //     break;
                case "jenks":
                    values_array = breaks
                    break;
                default:
                    values_array = equal_range_values

            }

            _cargaPaletaColor(colors_array, values_array);

            // console.log(grid_color.values())

        } else {

            _VERBOSE ? console.log("Probabilidad") : _VERBOSE;
            prob_arg = json;

            var link_color = d3.scale.quantize().domain([1, 0]).range(colorbrewer.RdBu[11]);


            $.each(prob_arg, function(index, value) {

                grid_color.set(value.gridid, { color: link_color(parseFloat(value.tscore)), score: parseFloat(value.tscore) });

            });

            var temp_scale = d3.scale.quantile()
                .domain([0, 100])
                .range(colors);

            _cargaPaletaColor(colors, temp_scale.quantiles(), true);

        }




        return grid_color;


    }





    /**
     * Éste método obtiene la escala de colores para la coloración del mapa
     *
     * @function _cargaPaletaColorMapaOcc
     * @private
     * @memberof! map_module
     * 
     * @param {boolean} mapa_prob - Bandera para saber si el mapa despliega el color con probalidad por celda
     */
    function _cargaPaletaColorMapaOcc(colors_array, values_array) {

        _VERBOSE ? console.log("_cargaPaletaColorMapaOcc") : _VERBOSE;

        $("#escala_color_occ").empty();

        var w = 140,
            h = 500;

        var key = d3.select("#escala_color_occ").append("svg")
            .attr("width", w)
            .attr("height", h)

        var rects = key.selectAll(".rects")
            .data(colors_array)
            .enter()
            .append("rect")
            .attr("y", 70)
            .attr("height", 40)
            .attr("x", (d, i) => -250 + i * 15)
            .attr("width", 16)
            .attr("fill", (d, i) => colors_array[i])
            .attr("stroke", "gray")
            .attr("transform", "rotate(270)");


        var texts = key.selectAll(".rect")
            .data(values_array)
            .enter()
            .append("text")
            .style("font-size", "8px")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", function(d, i) {
                return 125
            })
            .attr("y", function(d, i) {
                return (250 - ((i + 1) * 15)) + 3
            })
            .text(function(d) {
                return parseFloat(d).toFixed(2);
            })

        key.append("text")
            .attr("id", "num_records")
            .attr("y", 100)
            .attr("x", 135)
            .attr("dy", ".71em")
            .style("font-size", "10px")
            .style("text-anchor", "end")
            .text(_iTrans.prop('num_records'));





    }


    /**
     * Éste método obtiene la escala de colores para la coloración del mapa
     *
     * @function _cargaPaletaColor
     * @private
     * @memberof! map_module
     * 
     * @param {boolean} mapa_prob - Bandera para saber si el mapa despliega el color con probalidad por celda
     */
    function _cargaPaletaColorDecil(colors_array, values_array) {

        _VERBOSE ? console.log("_cargaPaletaColorDecil") : _VERBOSE;

        $("#escala_color_decil").empty();

        var w = 80,
            h = 170;

        var key = d3.select("#escala_color_decil").append("svg")
            .attr("width", w)
            .attr("height", h)

        var rects = key.selectAll(".rects")
            .data(colors_array)
            .enter()
            .append("rect")
            .attr("y", 10)
            .attr("height", 40)
            .attr("x", (d, i) => -170 + i * 15)
            .attr("width", 16)
            .attr("fill", (d, i) => colors_array[i])
            .attr("stroke", "gray")
            .attr("transform", "rotate(270)");


        var texts = key.selectAll(".rect")
            .data(values_array)
            .enter()
            .append("text")
            .style("font-size", "8px")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", function(d, i) {
                return 65
            })
            .attr("y", function(d, i) {
                return (170 - ((i + 1) * 15)) + 10
            })
            .text(function(d) {
                return parseFloat(d).toFixed(2);
            })


        key.append("text")
            .attr("id", "lb_decil_legend")
            .attr("y", 0)
            .attr("x", 45)
            .attr("dy", ".71em")
            .style("font-size", "10px")
            .style("text-anchor", "end")
            .text(_iTrans.prop('lb_decil_legend'));




    }



    /**
     * Éste método obtiene la escala de colores para la coloración del mapa
     *
     * @function _cargaPaletaColor
     * @private
     * @memberof! map_module
     * 
     * @param {boolean} mapa_prob - Bandera para saber si el mapa despliega el color con probalidad por celda
     */
    function _cargaPaletaColorNet(colors_array, values_array, center_lb = true) {

        _VERBOSE ? console.log("_cargaPaletaColorNet") : _VERBOSE;

        $("#escala_color_net").empty();

        var w = 110,
            h = 170;

        var key = d3.select("#escala_color_net").append("svg")
            .attr("width", w)
            .attr("height", h)

        var rects = key.selectAll(".rects")
            .data(colors_array)
            .enter()
            .append("rect")
            .attr("y", 10)
            .attr("height", 40)
            .attr("x", (d, i) => -170 + i * 15)
            .attr("width", 16)
            .attr("fill", (d, i) => colors_array[i])
            .attr("stroke", "gray")
            .attr("transform", "rotate(270)");


        var texts = key.selectAll(".rect")
            .data(values_array)
            .enter()
            .append("text")
            .style("font-size", "8px")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", function(d, i) {
                return 65
            })
            .attr("y", function(d, i) {
                if (center_lb)
                    return (170 - ((i + 1) * 15)) + 10
                else
                    return (170 - ((i + 1) * 15)) + 3
            })
            .text(function(d) {
                return parseFloat(d).toFixed(2);
            })


        key.append("text")
            .attr("id", "lb_net_legend")
            .attr("y", 170 - ((colors_array.length + 1) * 15))
            .attr("x", 100)
            .attr("dy", ".71em")
            .style("font-size", "10px")
            .style("text-anchor", "end")
            .text(_iTrans.prop('lb_net_legend'));




    }






    /**
     * Éste método obtiene la escala de colores para la coloración del mapa
     *
     * @function _cargaPaletaColor
     * @private
     * @memberof! map_module
     * 
     * @param {boolean} mapa_prob - Bandera para saber si el mapa despliega el color con probalidad por celda
     */
    function _cargaPaletaColor(colors_array, values_array, mapa_prob = false) {

        _VERBOSE ? console.log("_cargaPaletaColor") : _VERBOSE;

        $("#escala_color").empty();
        $("#map_text").empty();

        var w = 80,
            h = 300;

        var key = d3.select("#escala_color").append("svg")
            .attr("width", w)
            .attr("height", h)


        var rects = key.selectAll(".rects")
            .data(colors_array)
            .enter()
            .append("rect")
            .attr("y", 10)
            .attr("height", 40)
            .attr("x", (d, i) => -300 + i * 15)
            .attr("width", 16)
            .attr("fill", (d, i) => colors_array[i])
            .attr("stroke", "gray")
            .attr("transform", "rotate(270)");


        var texts = key.selectAll(".rect")
            .data(values_array)
            .enter()
            .append("text")
            .style("font-size", "8px")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", function(d, i) {
                return 65
            })
            .attr("y", function(d, i) {
                return (300 - ((i + 1) * 15)) + 3
            })
            // .attr("x", (d,i)=>-300 + (i+1)*15)
            // .attr("y", function (d,i) {
            //     // return i%2==0 ? 6 : 60
            //     return 6
            // })
            .text(function(d) {
                return parseFloat(d).toFixed(2);
            })


        key.append("text")
            .attr("id", "score_celda")
            .attr("y", 10)
            .attr("x", 75)
            .attr("dy", ".71em")
            .style("font-size", "10px")
            .style("text-anchor", "end")
            .text(_iTrans.prop('score_celda'));

    }


    /**
     * Éste método obtiene los límites de las particiones realizadas por deciles que serán utilizadas para la asignación de color a las celdas.
     *
     * @function _cargaPaletaColor
     * @private
     * @memberof! map_module
     * 
     * @param {array} arg_1 - Array de valores positivos o negativos resultado del análisis de nicho ecológico.
     * @param {array} arg_2 - Array de valores positivos o negativos resultado del análisis de nicho ecológico.
     * @param {boolean} first_pos - Bandera para indicar que array de valores esta en el primer parámetro de la función, true para positivos y false para negativos
     * @param {boolean} mapa_prob - Bandera para indicar si el análisis de nicho ecológico se hizo con probabilidad
     */
    function _getDividedChunks(arg_1, arg_2, first_pos, mapa_prob, apriori_cells = []) {

        _VERBOSE ? console.log("_getDividedChunks") : _VERBOSE;

        _range_limits_red = [];
        _range_limits_blue = [];
        _range_limits_total = [];

        var val_apriori = apriori_cells.length > 0 ? apriori_cells[0].tscore : 0

        // _VERBOSE ? console.log(arg_1.length) : _VERBOSE;
        //        var decil_length_1 = arg_1.length / NUM_SECTIONS;
        //        var module_1 = arg_1.length % NUM_SECTIONS;

        // si esta completo
        var arg_result_1 = chunkify(arg_1, NUM_SECTIONS, true);
        // arg_result_1 = _chunks(arg_1, decil_length_1, NUM_SECTIONS, module_1);
        console.log(arg_result_1)


        if (mapa_prob) {
            [arg_result_1, []];
        }

        var first = true;
        var r_limit = 0.0;

        // getting boundaries of each decil
        $.each(arg_result_1, function(index, decil) {

            // se estan quedando elementos fuera, ya que no estan tocamdo el cero
            if (first) {

                first = false;

                if (first_pos) {

                    var max_decil = d3.max(decil.map(function(d) {
                        return parseFloat(d.tscore)
                    }));
                    r_limit = d3.min(decil.map(function(d) {
                        return parseFloat(d.tscore)
                    }));

                    _range_limits_red.push({ right_limit: max_decil, left_limit: r_limit });

                } else {
                    var max_decil = 0;
                    r_limit = d3.min(decil.map(function(d) {
                        return parseFloat(d.tscore)
                    }));

                    _range_limits_blue.push({ right_limit: max_decil, left_limit: r_limit });
                }



            } else if (index == NUM_SECTIONS - 1) {

                if (first_pos) {
                    var max_decil = d3.max(decil.map(function(d) {
                        return parseFloat(d.tscore)
                    }));
                    r_limit = 0;

                    _range_limits_red.push({ right_limit: max_decil, left_limit: r_limit });

                } else {
                    var max_decil = r_limit;
                    r_limit = d3.min(decil.map(function(d) {
                        return parseFloat(d.tscore)
                    }));

                    _range_limits_blue.push({ right_limit: max_decil, left_limit: r_limit });
                }



            } else {

                // avoiding spaces between decil boundaries
                var max_decil = r_limit;
                r_limit = d3.min(decil.map(function(d) {
                    return parseFloat(d.tscore)
                }));

                if (first_pos) {
                    _range_limits_red.push({ right_limit: max_decil, left_limit: r_limit });
                } else {
                    _range_limits_blue.push({ right_limit: max_decil, left_limit: r_limit });
                }

            }

        });

        console.log(val_apriori);
        console.log(_range_limits_red);
        console.log(_range_limits_blue);

        var range = first_pos ? _range_limits_red : _range_limits_blue;

        if (arg_2.length > 0) {

            // clustering items of the second array
            var arg_result_2 = [];

            $.each(range, function(i, r_item) {

                if (first_pos) {

                    var rlimit = r_item.right_limit * -1;
                    var llimit = r_item.left_limit * -1;

                    _range_limits_blue.push({ right_limit: llimit, left_limit: rlimit });

                } else {

                    var rlimit = r_item.right_limit * -1;
                    var llimit = r_item.left_limit * -1;

                    _range_limits_red.push({ right_limit: llimit, left_limit: rlimit });

                }


            });

            var rangeinverse = first_pos ? _range_limits_blue : _range_limits_red;
            if (first_pos) {
                rangeinverse.reverse();
            }
            _VERBOSE ? console.log(rangeinverse) : _VERBOSE;


            $.each(rangeinverse, function(i, limits) {

                var decil_item = [];

                $.each(arg_2, function(j, item) {

                    // score = Math.abs(item.tscore);
                    var score = parseFloat(item.tscore);
                    var llimit = limits.left_limit;
                    var rlimit = limits.right_limit;

                    // when the negative values (blues scale) is sent as arg_1, the boundaries must be changed
                    if (first_pos) {

                        if (score >= llimit && score < rlimit) {
                            decil_item.push(item);
                        }
                    } else {

                        if (score >= llimit && score < rlimit) {
                            decil_item.push(item);
                        }
                    }

                });

                arg_result_2.push(decil_item);

            });


            //            console.log(arg_result_1);
            //            $.each(_range_limits_red, function (index, item) {
            //
            //                console.log(item);
            //                if (item.left_limit < val_apriori && val_apriori >= item.right_limit) {
            //                    arg_result_1[index] = arg_result_1[index].concat(apriori_cells)
            //                }
            //
            //            })
            //
            //            console.log(arg_result_2);
            //            $.each(_range_limits_blue, function (index, item) {
            //
            //                console.log(item);
            //                if (item.left_limit < val_apriori && val_apriori >= item.right_limit) {
            //                    arg_result_1[index] = arg_result_1[index].concat(apriori_cells)
            //                }
            //
            //            })

            return [arg_result_1, arg_result_2];

        }

        //        console.log(arg_result_1);
        //
        //        $.each(range, function (index, item) {
        //
        //            console.log(item);
        //            if (item.left_limit < val_apriori && val_apriori >= item.right_limit) {
        //                arg_result_1[index] = arg_result_1[index].concat(apriori_cells)
        //            }
        //
        //        })

        return [arg_result_1, []];

    }


    /**
     * Éste método secciona el array de celdas y score realcionado en deciles
     *
     * @function _cargaPaletaColor
     * @private
     * @memberof! map_module
     * 
     * @param {array} a - Array de celdas y score relacionado
     * @param {integer} n - Núemro de particiones
     * @param {boolean} balanced - Bandera para indicar si las particiones serán balanceadas
     */
    function chunkify(a, n, balanced) {

        //        console.log("chunkify");
        //        console.log(a);

        if (n < 2)
            return [a];

        var len = a.length,
            out = [],
            i = 0,
            size;

        console.log("len: " + len);
        console.log("n: " + n);

        if (len % n === 0) {
            console.log("caso uno");

            size = Math.floor(len / n);

            // console.log("size: " + size);

            while (i < len) {
                out.push(a.slice(i, i += size));
            }
        } else if (balanced) {
            console.log("caso dos");

            while (i < len) {
                size = Math.ceil((len - i) / n--);
                out.push(a.slice(i, i += size));
            }
        } else {

            console.log("caso tres");

            n--;
            size = Math.floor(len / n);
            if (len % size === 0)
                size--;
            while (i < size * n) {
                out.push(a.slice(i, i += size));
            }
            out.push(a.slice(size * n));

        }

        return out;
    }

    function getGridMap2Export() {

        _VERBOSE ? console.log("getGridMap") : _VERBOSE;
        var date = new Date();
        var sufijo = "_Exp_" + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + ":" + date.getMinutes();
        $("#map_download").attr("download", "map" + sufijo + ".geojson");

        var grid_map_2export = { "type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }, "features": [] }
        var features = [];

        for (var i = 0; i < _grid_map.features.length; i++) {

            if (_grid_map.features[i].properties.score !== null) {
                features.push(_grid_map.features[i]);
            }

        }

        grid_map_2export.features = features;
        return grid_map_2export;

    }

    function getSP2Export() {

        _VERBOSE ? console.log("getSP2Export") : _VERBOSE;

        var date = new Date();
        var sufijo = "_Exp_" + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + ":" + date.getMinutes();
        //        $("#sp_download").attr("download", _specie_target.label.replace(/\s/g, '')  + sufijo + ".geojson");
        $("#sp_download").attr("download", _specie_target.label.replace(/\s/g, '') + sufijo + ".geojson");

        var sp_target_2export = { "type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }, "features": [] }
        var features = [];
        var temp_features = _allowedPoints.values();

        for (var i = 0; i < temp_features.length; i++) {
            features.push(temp_features[i]);
        }

        sp_target_2export.features = features;
        return sp_target_2export;

    }


    function changeRegionView(region) {

        _VERBOSE ? console.log("changeRegionView") : _VERBOSE;
        _VERBOSE ? console.log("region: " + region) : _VERBOSE;

        if (region === 1) {
            _VERBOSE ? console.log("region_1") : _VERBOSE;
            _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [23.5, -102] : [23.5, -102];
            _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 5 : 4;
        } else if (region === 2) {
            _VERBOSE ? console.log("region2") : _VERBOSE;
            _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [40.5, -97] : [30.5, -102];
            _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 4 : 3;
        } else if (region === 3) {
            _VERBOSE ? console.log("region_3") : _VERBOSE;
            _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [30.5, -97] : [23.5, -102];
            _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 4 : 3;
        } else {
            _VERBOSE ? console.log("region_4") : _VERBOSE;
            _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [4, -73] : [4, -73];
            _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 5 : 4;
        }

        //        _VERBOSE ? console.log(_centro_mapa) : _VERBOSE;
        //        _VERBOSE ? console.log(_zoom_module) : _VERBOSE;

        map.setView(_centro_mapa, _zoom_module, { animate: true });
        if (_tipo_modulo === _MODULO_NICHO) {
            map_sp.setView(_centro_mapa, _zoom_module, { animate: true });
        }

    }





    /**
     * Éste método inicializa la configuración del mapa
     *
     * @function startMap
     * @public
     * @memberof! map_module
     * 
     * @param {array} language_module - Módulo lenguaje
     * @param {integer} tipo_modulo - Tipo de módulo donde será creado el mapa, nicho o comunidad ecológica
     * @param {boolean} histogram_module - Módulo histograma
     */
    function startMap(language_module, tipo_modulo, histogram_module) {
        _VERBOSE ? console.log("startMap") : _VERBOSE;
        _mapConfigure(language_module, tipo_modulo, histogram_module);
        if (tipo_modulo === _MODULO_NICHO) {
            _mapSPConfigure();
        }

    }

    return {
        map: map,
        get_spTaxon: get_spTaxon,
        busca_especie: busca_especie,
        busca_especie_grupo: busca_especie_grupo,
        changeRegionView: changeRegionView,
        // busca_especie_filtros: busca_especie_filtros,
        set_specieTarget: set_specieTarget,
        get_specieTarget: get_specieTarget,
        get_allowedPoints: get_allowedPoints,
        get_discardedPoints: get_discardedPoints,
        get_discardedPointsFilter: get_discardedPointsFilter,
        get_discardedCellFilter: get_discardedCellFilter,
        get_allowedCells: get_allowedCells,
        // createDecilColor: createDecilColor,
        set_colorCellsDecilMap: set_colorCellsDecilMap,
        setDisplayModule: setDisplayModule,
        showPopUp: showPopUp,
        get_layerControl: get_layerControl,
        addMapLayer: addMapLayer,
        removeMapLayer: removeMapLayer,
        addMapControl: addMapControl,
        removeMapControl: removeMapControl,
        getMap: getMap,
        colorizeFeatures: colorizeFeatures,
        colorizeFeaturesNet: colorizeFeaturesNet,
        colorizeTargetFeatures: colorizeTargetFeatures,
        loadD3GridMX: loadD3GridMX,
        updateLabels: updateLabels,
        clearMap: clearMap,
        clearMapOcc: clearMapOcc,
        startMap: startMap,
        getGridMap2Export: getGridMap2Export,
        getSP2Export: getSP2Export,
        createRankColor: createRankColor,
        clearAllLayers: clearAllLayers,
        deleteCellFromOccGrid: deleteCellFromOccGrid,
        getExcludedCells: getExcludedCells,
        setDecilCells: setDecilCells,
        colorizeDecileFeatures: colorizeDecileFeatures,
        updateDecilLayer: updateDecilLayer,
        colorizeFeaturesSelectedStateMun: colorizeFeaturesSelectedStateMun,
        updateStateMunLayer: updateStateMunLayer
    }

});
