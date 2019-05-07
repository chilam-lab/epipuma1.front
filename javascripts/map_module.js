
/**
 * Módulo mapa, utilizado para crear y gestionar el mapa en nicho ecológico y comunidad ecológica.
 *
 * @namespace map_module
 */
var map_module = (function (url_geoserver, workspace, verbose, url_zacatuche) {

    var map, map_sp;

    var _VERBOSE = verbose;
    var _first_loaded = true;

    var _grid_d3;
    var _grid_map = undefined;
    var _grid_res = undefined;

    var _grid_map_hash = d3.map([]);

    var _DELETE_STATE_POINTS = false;

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

    var _MODULO_NICHO = 0, _MODULO_NET = 1;

    var _tipo_modulo;

    // Es un layer ficticio que sirve para controlar el layer hecho en D3 con los eventos del componente que maneja los layers
    var _lineLayer = L.Class.extend({
        initialize: function () {
            return;
        },
        onAdd: function (map) {
            _grid_d3.style("display", "block");
        },
        onRemove: function (map) {
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
    var _tileIndex;
    var _tileOptions = {
        maxZoom: 20, // max zoom to preserve detail on
        tolerance: 5, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 64, // tile buffer on each side
        debug: 0, // logging level (0 to disable, 1 or 2)

        indexMaxZoom: 0, // max zoom in the initial tile index
        indexMaxPoints: 100000, // max number of points per tile in the index
    };
    var _tileLayer, _tileBoudary;
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


        _OSM_layer = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=ec5ffebe46bb43a5a9cb8700c882be4b');
        _OSM_layer.getAttribution = function () {
            return '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };

        // _OSM_layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
        // _OSM_layer.getAttribution = function () {
        //     return 'Map tiles by <a href="https://carto.com/attribution">Carto</a>, under CC BY 3.0. Data by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, under ODbL.';
        // };


        // ******************************************************************* geojson-vt
        _tileIndex = geojsonvt([], _tileOptions);
        _tileLayer = L.canvasTiles()
                .params({
                    debug: false,
                    padding: 5,
                    onEachFeature: onEachFeature
                })
                .drawing(_drawingOnCanvas);


        if (parseInt(localStorage.getItem("ambiente")) === 0 || parseInt(localStorage.getItem("ambiente")) === 1 || parseInt(localStorage.getItem("ambiente")) === 2 || parseInt(localStorage.getItem("ambiente")) === 3) {
            _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [23.5, -102] : [23.5, -102];
            _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 5 : 4;

        } else if (parseInt(localStorage.getItem("ambiente")) === 4 || parseInt(localStorage.getItem("ambiente")) === 5) {
            _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [30.5, -99] : [30.5, -102];
            _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 4 : 3;
        } else {
            _centro_mapa = (_tipo_modulo === _MODULO_NICHO) ? [23.5, -102] : [23.5, -102];
            _zoom_module = (_tipo_modulo === _MODULO_NICHO) ? 5 : 4;
        }

        // ambos div tienen el id = 'map', tanto en nicho como en comunidad
        map = L.map('map', {
            center: _centro_mapa,
            zoom: _zoom_module,
            layers: [
                _OSM_layer,
                _tileLayer
            ]
        });

        _baseMaps = {
            "Open Street Maps": _OSM_layer
        };

        _overlayMaps = {
            "Grid": _tileLayer
        };

        _layer_control = L.control.layers(_baseMaps, _overlayMaps).addTo(map);

        map.scrollWheelZoom.disable();


        if (_tipo_modulo === _MODULO_NICHO) {
            // document.getElementById("tbl_hist").style.display = "none";
            document.getElementById("dShape").style.display = "none";
//            _addControls();
        }

//        _loadD3GridMX();


    }


    function _mapSPConfigure() {

        _VERBOSE ? console.log("_mapSPConfigure") : _VERBOSE;

        
        _OSMSP_layer = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=ec5ffebe46bb43a5a9cb8700c882be4b');
        _OSMSP_layer.getAttribution = function () {
            return '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };

        // _OSMSP_layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');
        // _OSMSP_layer.getAttribution = function () {
        //     return 'Map tiles by <a href="https://carto.com/attribution">Carto</a>, under CC BY 3.0. Data by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, under ODbL.';
        // };

        map_sp = L.map('map2', {
            center: _centro_mapa,
            zoom: _zoom_module,
            layers: [
                _OSMSP_layer
            ],
            zoomControl: false
        });

        _baseSP_Maps = {
            "Open Street Maps": _OSMSP_layer
        };

        _overlaySP_Maps = {};

        _layer_SP_control = L.control.layers(_baseSP_Maps, _overlaySP_Maps).addTo(map_sp);

        new L.Control.Zoom({position: 'topright'}).addTo(map_sp);

        map_sp.scrollWheelZoom.disable();

        // Agregando controles cuando es análsis de nicho        
        if (_tipo_modulo === _MODULO_NICHO) {
            _addControls();

            $('#toolbar .hamburger').on('click', function () {
                $(this).parent().toggleClass('open');
            });
        }


    }


    /**
     * Realiza la petición de la malla al servidor
     *
     * @function _loadD3GridMX
     * @public
     * @memberof! map_module
     * 
     */
    function loadD3GridMX(val_process, grid_res, region_selected) {

        _VERBOSE ? console.log("_loadD3GridMX") : _VERBOSE;

        _VERBOSE ? console.log("_REGION_SELECTED: " + _REGION_SELECTED) : _VERBOSE;
        _VERBOSE ? console.log("region_selected: " + region_selected) : _VERBOSE;

        // Deja la malla cuando ya existe previemente y no se cambia la resolución
        if (_grid_map !== undefined && _grid_res === grid_res && _REGION_SELECTED === region_selected) {
            _VERBOSE ? console.log("Se mantiene resolución") : _VERBOSE;
            _display_module.callDisplayProcess(val_process);
            return;
        } else {
            // Se elimina evento cuando la malla es reemplazada. Evita la acumulación de eventos
            _VERBOSE ? console.log("Carga de malla") : _VERBOSE;
            map.off('click');
        }

        $('#map').loading({
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
            success: function (json) {

//                console.log(json);

                // Asegura que el grid este cargado antes de realizar una generacion por enlace
                $("#loadData").prop("disabled", false);
                $('#map').loading('stop');

//                _grid_map = null;
                _grid_map = json;
                _grid_res = grid_res;
                _first_loaded = true;

                console.log(_grid_map);

                // importacion con otras APIs
                // // Se comprime json del lado del servidor, se descomprime en el cliente
                // json = JSONC.decompress(jsonc);
                // // console.log(json);

                colorizeFeatures(_grid_map);
                _pad = 0;
//                _tileIndex = null;
                _tileIndex = geojsonvt(_grid_map, _tileOptions);
                _tileLayer.redraw();

                // agrega listener para generar pop en celda
                map.on('click', function (e) {
                    console.log(e.latlng.lat + ", " + e.latlng.lng);

                    if (_tipo_modulo === _MODULO_NICHO) {
                        _display_module.showGetFeatureInfo(e.latlng.lat, e.latlng.lng);
                    }

                });

                _display_module.callDisplayProcess(val_process);

            },
            error: function (requestObject, error, errorThrown) {

                console.log(requestObject);
                console.log(error);
                console.log(errorThrown);
                // alert("Existe un error en la conexión con el servidor, intente mas tarde");
//                console.log("abort");
                $('#map').loading('stop');
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
        _VERBOSE ? console.log(_grid_map) : _VERBOSE;
        _VERBOSE ? console.log(_first_loaded) : _VERBOSE;

        if (!_first_loaded && _grid_map !== undefined && _grid_map.features !== undefined) {
            for (var i = 0; i < _grid_map.features.length; i++) {
                _grid_map.features[i].properties.color = 'rgba(255,0,0,0)';
            }
        }

        _VERBOSE ? console.log("_tileLayer") : _VERBOSE;

        _tileLayer.redraw();
    }



    /**
     * Asigna color y borde a las celdas que componen la malla en nicho ecológico.
     *
     * @function colorizeFeatures
     * @public
     * @memberof! map_module
     * 
     * @param {json} grid_map_color - GeoJson de la malla
     */
    function colorizeFeatures(grid_map_color) {

        _VERBOSE ? console.log("colorizeFeatures") : _VERBOSE;

        if (_first_loaded) {
            _VERBOSE ? console.log("first loaded") : _VERBOSE;

            _first_loaded = false;

            for (var i = 0; i < _grid_map.features.length; i++) {
//                _grid_map.features[i].properties.color = '';
                _grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                _grid_map.features[i].properties.score = null;
            }
        } else {

//            console.log(grid_map_color.values());
            console.log(_grid_map);

            for (var i = 0; i < _grid_map.features.length; i++) {

                if (grid_map_color.has(_grid_map.features[i].properties.gridid)) {

                    _grid_map.features[i].properties.opacity = 1;
                    _grid_map.features[i].properties.color = grid_map_color.get(_grid_map.features[i].properties.gridid).color;  //'hsl(' + 360 * Math.random() + ', 50%, 50%)'; 
                    _grid_map.features[i].properties.score = grid_map_color.get(_grid_map.features[i].properties.gridid).score;
                } else {

//                    _grid_map.features[i].properties.color = 'rgba(255,0,0,0)';
                    _grid_map.features[i].properties.color = 'rgba(219, 219, 219, 1)';
                    _grid_map.features[i].properties.score = null;

                    // _grid_map.features[i].properties.opacity = 0;
                }
            }
        }

        _tileLayer.redraw();

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

//        console.log(_grid_map);


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

        var bounds = params.bounds;
        params.tilePoint.z = params.zoom,
                elemLeft = params.canvas.offsetLeft,
                elemTop = params.canvas.offsetTop;

        var ctx = params.canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';

        ctx.canvas.addEventListener('click', function (event) {

            var x = event.pageX - elemLeft,
                    y = event.pageY - elemTop;

//            console.log(event);
//            console.log(x);
//            console.log(y);

        }, false);

        var tile = _tileIndex.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
        if (!tile) {
            return;
        }

        ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

        var features = tile.features;

        // borde de la malla
        ctx.strokeStyle = 'rgba(255,0,0,0)';
        // ctx.strokeStyle = 'grey'; // hace malla visible


        for (var i = 0; i < features.length; i++) {
            var feature = features[i],
                    type = feature.type;

            // background de la celda
            ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(255,0,0,0)';
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
    ;




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
    function showPopUp(htmltable, latlng) {

        _VERBOSE ? console.log("showPopUp") : _VERBOSE;
//        _VERBOSE ? console.log(htmltable) : _VERBOSE;
//        _VERBOSE ? console.log(latlng) : _VERBOSE;

        var popup = L.popup();
        popup.setLatLng(latlng).setContent(htmltable).openOn(map);

    }


    var _search_control, _searchboxControl, _items_sp;
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

//        var sidebar = L.control.sidebar('sidebar').addTo(map_sp);



        // Control para boton de eliminación de puntos
        var PointDeleteControl = L.Control.extend({
            options: {
                position: 'topright',
            },
            onAdd: function (map) {
                var controlDiv = L.DomUtil.create('div', 'leaflet-control-command ');

                L.DomEvent
                        .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
                        .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
                        .addListener(controlDiv, 'click', function () {
                            _deletePoints();
                        });

                _VERBOSE ? console.log(_iTrans.prop('lb_borra_puntos')) : _VERBOSE;

                var controlUI = L.DomUtil.create('div', 'leaflet-control-command-interior glyphicon glyphicon-erase', controlDiv);
                controlUI.title = _iTrans.prop('lb_borra_puntos');
                controlUI.id = "deletePointsButton";

                return controlDiv;
            }
        });

        L.control.command = function (options) {
            return new PointDeleteControl(options);
        };

        map_sp.addControl(new PointDeleteControl());

    }




    

    /**
     * Busca las ocurrencias de una especie asignando filtros por fecha.
     *
     * @function busca_especie_filtros
     * @public
     * @memberof! map_module
     * 
     * @param {array} rango - Array con el rango de fechas
     * @param {boolean} sfecha - Bandera para saber si serán considerados los registros sin fecha
     * @param {boolean} sfosil - Bandera para saber si serán considerados los registros sin fosiles
     */
    function busca_especie_filtros(rango, sfecha, sfosil, dPoints, region) {

        _VERBOSE ? console.log("busca_especie_filtros") : _VERBOSE;

        _lin_inf = rango ? rango[0] : undefined;
        _lin_sup = rango ? rango[1] : undefined;
        _sin_fecha = sfecha;
        _con_fosil = sfosil;

        // console.log("Region en busca_especie_filtros " + region);
        // _VERBOSE ? console.log(_specie_target.spid) : _VERBOSE;

        // busca_especie(dPoints, region, _specie_target.spid);
        //TODO: Obtener los taxones del compornete variable
        var taxones = _componente_target.getVarSelArray();
        busca_especie_grupo(taxones, dPoints);

        _toastr.info($.i18n.prop('lb_cal_occ'));

    }

    function clearAllLayers(){

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
    function busca_especie_grupo(taxones, dPoints = d3.map([]), region = 1) {

        _VERBOSE ? console.log("busca_especie_grupo") : _VERBOSE;

        var milliseconds = new Date().getTime();
        var grid_res_val = $("#grid_resolution").val();

        var footprint_region = $("#footprint_region_select").val() === undefined ? region : parseInt($("#footprint_region_select").val());
        console.log("footprint_region: " + footprint_region);


        var rango_fechas = $("#sliderFecha").slider("values");
        if (rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")) {
            rango_fechas = undefined;
        }
        else{
            _lin_inf = rango_fechas ? rango_fechas[0] : undefined;
            _lin_sup = rango_fechas ? rango_fechas[1] : undefined;
        }

        
        _sin_fecha = $("#chkFecha").is(':checked') ? true : false;
        _con_fosil = $("#chkFosil").is(':checked') ? true : false;

        $('#tuto_mapa_occ').loading({
            stoppable: true
        });


        $.ajax({
               url: _url_zacatuche + "/niche/especie/getSpeciesTaxon",
               type: 'post',
               dataType: "json",
               data: {
                   "taxones": taxones,
                   "idtime": milliseconds,
                   "lim_inf": _lin_inf,
                   "lim_sup": _lin_sup,
                   "sfecha": _sin_fecha,
                   "sfosil": _con_fosil,
                   "grid_res": grid_res_val,
                   "footprint_region": footprint_region
               },
               beforeSend: function (xhr) {
                   xhr.setRequestHeader('X-Test-Header', 'test-value');
                   xhr.setRequestHeader("Accept", "text/json");
                   changeRegionView(footprint_region);
               },
               success: function (resp) {

                   // console.log(resp)

                   $('#tuto_mapa_occ').loading('stop');
                   $("#specie_next").css('visibility', 'visible');
                   $("#specie_next").show("slow");//

                   var data_sp = resp.data;
                   // console.log("data_sp: " + data_sp)

                   clearAllLayers();

                   _discardedPoints = dPoints;        // puntos descartados por eliminacion
                   _allowedPoints = d3.map([]);        // puntos para analisis
                   _discardedPointsFilter = d3.map([]);     // puntos descartados por filtros
                   _computed_occ_cells = d3.map([]);    // celdas para analisis
                   // _computed_discarded_cells = d3.map([]);    // celdas descartadas por filtros

                   var gridItems = [];
                   if (dPoints.values().length > 0) {
                       $.each(dPoints.values(), function (index, item) {
                           gridItems.push(item.feature.properties.gridid);
                       });
    //                    console.log(gridItems);
                   }

                   // var computed_occ_cells_totals = d3.map([]);
                   var distinctPoints = d3.map([]);


                   if (data_sp.length === 0) {
                       _VERBOSE ? console.log("No hay registros de especie") : _VERBOSE;
                       $("#specie_next").css('visibility', 'hidden');
    //                    TODO: HAcer internacionalización del label
                       _toastr.info("La especie no tiene registros");
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


                   // var occ_cell = _computed_occ_cells.values().length;
                   var occ_cell = data_sp[0].occ;

                   $.each(distinctPoints.values(), function (index, item) {

                       var item_id = JSON.parse(item.json_geom).coordinates.toString();

                       // this map is fill with the records in the database from an specie, so it discards repetive elemnts.

                       if ($.inArray(item.gridid, gridItems) === -1) {

                           var fecha_ano = item.aniocolecta === 9999 ? "" : item.aniocolecta;
                           _allowedPoints.set(item_id, {
                               "type": "Feature",
                               "properties": {"url": item.urlejemplar, "fecha": fecha_ano, 
                               // "specie": _specie_target.label, 
                               "specie": item.especie, 
                               "gridid": item.gridid},
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
               error: function (jqXHR, textStatus, errorThrown) {
                   _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
                   _VERBOSE ? console.log(errorThrown) : _VERBOSE;
                   _VERBOSE ? console.log(jqXHR.responseText) : _VERBOSE;

                   $('#tuto_mapa_occ').loading('stop');
                   $("#specie_next").css('visibility', 'hidden');
               }

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
        }
        else{
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
               beforeSend: function (xhr) {
                   xhr.setRequestHeader('X-Test-Header', 'test-value');
                   xhr.setRequestHeader("Accept", "text/json");
                   changeRegionView(footprint_region);
               },
               success: function (resp) {

                   console.log(resp)

                   $('#tuto_mapa_occ').loading('stop');
                   $("#specie_next").css('visibility', 'visible');
                   $("#specie_next").show("slow");//

                   var data_sp = resp.data;
                   // console.log("data_sp: " + data_sp)

                   clearAllLayers();

                   _discardedPoints = dPoints;        // puntos descartados por eliminacion
                   _allowedPoints = d3.map([]);        // puntos para analisis
                   _discardedPointsFilter = d3.map([]);     // puntos descartados por filtros
                   _computed_occ_cells = d3.map([]);    // celdas para analisis
                   // _computed_discarded_cells = d3.map([]);    // celdas descartadas por filtros

                   var gridItems = [];
                   if (dPoints.values().length > 0) {
                       $.each(dPoints.values(), function (index, item) {
                           gridItems.push(item.feature.properties.gridid);
                       });
    //                    console.log(gridItems);
                   }

                   // var computed_occ_cells_totals = d3.map([]);
                   var distinctPoints = d3.map([]);


                   if (data_sp.length === 0) {
                       _VERBOSE ? console.log("No hay registros de especie") : _VERBOSE;
                       $("#specie_next").css('visibility', 'hidden');
    //                    TODO: HAcer internacionalización del label
                       _toastr.info("La especie no tiene registros");
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

                   $.each(distinctPoints.values(), function (index, item) {

                       var item_id = JSON.parse(item.json_geom).coordinates.toString();

                       // this map is fill with the records in the database from an specie, so it discards repetive elemnts.

                       if ($.inArray(item.gridid, gridItems) === -1) {

                           var fecha_ano = item.aniocolecta === 9999 ? "" : item.aniocolecta;
                           _allowedPoints.set(item_id, {
                               "type": "Feature",
                               "properties": {"url": item.urlejemplar, "fecha": fecha_ano, 
                               "specie": _specie_target.label, 
                               "specie": item.especie, 
                               "gridid": item.gridid},
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
               error: function (jqXHR, textStatus, errorThrown) {
                   _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
                   _VERBOSE ? console.log(errorThrown) : _VERBOSE;
                   _VERBOSE ? console.log(jqXHR.responseText) : _VERBOSE;

                   $('#tuto_mapa_occ').loading('stop');
                   $("#specie_next").css('visibility', 'hidden');
               }

           });
        
        
//        $.ajax({
//            url: _url_zacatuche + "/niche/especie/getSpecies",
//            type: 'post',
//            dataType: "json",
//            data: {
//                "id": _specie_target.spid,
//                "idtime": milliseconds,
//                "lim_inf": _lin_inf,
//                "lim_sup": _lin_sup,
//                "sfecha": _sin_fecha,
//                "sfosil": _con_fosil,
//                "grid_res": grid_res_val,
//                "footprint_region": footprint_region
//            },
//            beforeSend: function (xhr) {
//                xhr.setRequestHeader('X-Test-Header', 'test-value');
//                xhr.setRequestHeader("Accept", "text/json");
//                changeRegionView(footprint_region);
//            },
//            success: function (resp) {

//                $('#tuto_mapa_occ').loading('stop');
//                $("#specie_next").css('visibility', 'visible');
//                $("#specie_next").show("slow");//

//                var data_sp = resp.data;
// //                console.log("data_sp: " + data_sp)

//                try {
//                    _markersSP_Layer.clearLayers();
//                    _layer_SP_control.removeLayer(_markersSP_Layer);

//                    _markersLayer.clearLayers();
//                    _layer_control.removeLayer(_markersLayer);

//                } catch (e) {
//                    _VERBOSE ? console.log("primera vez") : _VERBOSE;
//                }

//                _discardedPoints = dPoints;		// puntos descartados por eliminacion
//                _allowedPoints = d3.map([]);		// puntos para analisis
//                _discardedPointsFilter = d3.map([]); 	// puntos descartados por filtros
//                _computed_occ_cells = d3.map([]);	// celdas para analisis
//                // _computed_discarded_cells = d3.map([]);	// celdas descartadas por filtros

//                var gridItems = [];
//                if (dPoints.values().length > 0) {
//                    $.each(dPoints.values(), function (index, item) {
//                        gridItems.push(item.feature.properties.gridid);
//                    });

// //                    console.log(gridItems);
//                }

//                // var computed_occ_cells_totals = d3.map([]);
//                var distinctPoints = d3.map([]);


//                if (data_sp.length === 0) {
//                    _VERBOSE ? console.log("No hay registros de especie") : _VERBOSE;
//                    $("#specie_next").css('visibility', 'hidden');
// //                    TODO: HAcer internacionalización del label
//                    _toastr.info("La especie no tiene registros");
//                    _clearFieldsSP();

//                    return;
//                }


//                // obtiene registros unicos en coordenadas
//                for (i = 0; i < data_sp.length; i++) {

//                    var item_id = JSON.parse(data_sp[i].json_geom).coordinates;
//                    // console.log(d[i].gridid);
//                    distinctPoints.set(item_id, data_sp[i]);
//                    _computed_occ_cells.set(parseInt(data_sp[i].gridid), data_sp[i]);
//                }


// //                var occ_cell = _computed_occ_cells.values().length;
//                var occ_cell = data_sp[0].occ;

//                $.each(distinctPoints.values(), function (index, item) {

//                    var item_id = JSON.parse(item.json_geom).coordinates.toString();

//                    // this map is fill with the records in the database from an specie, so it discards repetive elemnts.

//                    if ($.inArray(item.gridid, gridItems) === -1) {

//                        var fecha_ano = item.aniocolecta === 9999 ? "" : item.aniocolecta;
//                        _allowedPoints.set(item_id, {
//                            "type": "Feature",
//                            "properties": {"url": item.urlejemplar, "fecha": fecha_ano, "specie": _specie_target.label, "gridid": item.gridid},
//                            "geometry": JSON.parse(item.json_geom)
//                        });
//                    }

//                });


//                try {
// //                    map.removeLayer(_switchD3Layer);
//                    map_sp.removeLayer(_switchD3Layer);
//                } catch (e) {
//                    _VERBOSE ? console.log("layer no creado") : _VERBOSE;
//                }

//                _addPointLayer();

//                if (_tipo_modulo === _MODULO_NICHO) {

//                    _histogram_module.createBarChartFecha(distinctPoints.values());

//                }

//                _fillSpeciesData(_allowedPoints.values().length, occ_cell);

//                $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));

//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
//                _VERBOSE ? console.log(errorThrown) : _VERBOSE;
//                _VERBOSE ? console.log(jqXHR.responseText) : _VERBOSE;

//                $('#tuto_mapa_occ').loading('stop');
//                $("#specie_next").css('visibility', 'hidden');
//            }

//        });

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

        _markersSP_Layer = L.markerClusterGroup({maxClusterRadius: 30, chunkedLoading: true});
        _markersLayer = L.markerClusterGroup({maxClusterRadius: 30, chunkedLoading: true});

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

        var geoJsonFeature = {"type": "FeatureCollection",
            "features": _allowedPoints.values()};

        var layer = L.geoJson(geoJsonFeature, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, _geojsonMarkerOptions);
            },
            onEachFeature: function (feature, layer) {
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
     * @function _deletePoints
     * @private
     * @memberof! map_module
     * 
     */
    function _deletePoints() {

        _VERBOSE ? console.log("_deletePoints") : _VERBOSE;

        if (!(_markersSP_Layer)) {
            console.log("_markersSP_Layer null");
            return;
        }



        if (_DELETE_STATE_POINTS) {

            try {
                map_sp.addLayer(_switchD3Layer);
            } catch (e) {
                _VERBOSE ? console.log("layer no creado") : _VERBOSE;
            }

            _DELETE_STATE_POINTS = false;

            $("#deletePointsButton").css("backgroundColor", "#fff");

            _markersSP_Layer.getLayers().forEach(function (item) {

                item.setStyle(_geojsonMarkerOptions);

                item.off('click');

                item.on('click', function () {

                    L.DomEvent.stopPropagation;

                    var popup = L.popup({className: 'custom'});
                    // popup.className('custom');

                    var message = _getMessagePopup(item.feature);
                    popup.setLatLng([item.feature.geometry.coordinates[1], item.feature.geometry.coordinates[0]]).setContent(message).openOn(map_sp);

                });

            });

        } else {

            // remueve el layer del grid para poder eliminar puntos
            try {
                map_sp.removeLayer(_switchD3Layer);
            } catch (e) {
                _VERBOSE ? console.log("layer no creado") : _VERBOSE;
            }

            _DELETE_STATE_POINTS = true;

            $("#deletePointsButton").css("backgroundColor", "#BFADB6");

            _markersSP_Layer.getLayers().forEach(function (item) {

                item.off('click');

                item.on('click', function () {

                    L.DomEvent.stopPropagation;

                    var item_id = item.feature.geometry.coordinates.toString();

                    _discardedPoints.set(item_id, item);


                    if (_allowedPoints.remove(item_id)) {
                        _VERBOSE ? console.log("deleted") : _VERBOSE;
                    } else {
                        _VERBOSE ? console.log("Error: point not deleted") : _VERBOSE;
                    }
                    _markersSP_Layer.removeLayer(item);


                    _markersLayer.clearLayers();
                    _addClusterLayer(_markersLayer);


                });

                item.setStyle(_geojsonMarkerOptionsDelete);

            });

        }

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

        // console.log("map_type: " + map_type)

        var equal_range_sections = 9;
        var grid_color = d3.map([]);
        var colors = jQuery.extend(true, [], colorbrewer.RdBu[9]); 
        colors = colors.reverse()
        // console.log(colors)


        var equal_range_colors = jQuery.extend(true, [], colorbrewer.Blues[equal_range_sections])
        equal_range_colors = equal_range_colors.reverse()
        equal_range_colors = equal_range_colors.concat(jQuery.extend(true, [], colorbrewer.Reds[equal_range_sections]))
        // console.log(equal_range_colors)

        
        if (!mapa_prob) {

            var scales = {};
            
            var rateById = {};
            // var rateById2 = {};
            json.forEach(function(d) { rateById[d.gridid] = +d.tscore; });
            // json.forEach(function(d) { rateById2[d.gridid] = d.tscore; });

            var arr_scores = json.map(function(d) {return parseFloat(d.tscore);})
            var min_scr = d3.min(arr_scores);
            var max_scr = d3.max(arr_scores);

            var deviation = d3.deviation(arr_scores)
            var mean = d3.mean(arr_scores)
            var breaks = ss.jenks(json.map(function(d) { return +d.tscore; }), (colors.length-2))

            // console.log("min_scr: " + min_scr)
            // console.log("max_scr: " + max_scr)
            // console.log("deviation: " + deviation)
            // console.log("mean: " + mean)
            // console.log(ss.jenks(json.map(function(d) { return +d.tscore; }), (colors.length-2)))

            

            // Calculo de rangos para coloración EQUAL RANGE
            var equal_range_values = []
            // solo positivos 
            if(min_scr>0){
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
            else if(max_scr<0){
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
            else if(Math.abs(min_scr) > Math.abs(max_scr)){
                console.log("negativo mayor")

                var scale_test = d3.scale.quantile()
                .domain([min_scr, 0])
                .range(d3.range(equal_range_sections));

                equal_range_values = scale_test.quantiles()
                var inverse_temp = jQuery.extend(true, [], equal_range_values)
                inverse_temp = inverse_temp.map(function(d) {return -d})
                equal_range_values = equal_range_values.concat([0].concat(inverse_temp.reverse()))
                
            }
            // positivo absoluto es mayor que negativo absoluto
            else{
                console.log("positivo mayor")

                var scale_test = d3.scale.quantile()
                .domain([0, max_scr])
                .range(d3.range(equal_range_sections));

                equal_range_values = scale_test.quantiles()
                var inverse_temp = jQuery.extend(true, [], equal_range_values)
                inverse_temp = inverse_temp.map(function(d) {return -d})
                equal_range_values = inverse_temp.reverse().concat([0].concat(equal_range_values))   

            }
            // console.log(equal_range_values)
            // console.log(equal_range_colors)
                

            
            // Calculo de rangos para coloración STANDARD DEVIATION
            var arr_range_deviations = []
            arr_range_deviations = d3.range(4).map(function(d) {return mean + (d * -deviation) })
            arr_range_deviations.reverse()
            arr_range_deviations = arr_range_deviations.concat(d3.range(1,5).map(function(d) {return mean + (d * deviation) })) 
            // console.log(arr_range_deviations)
            // console.log(colors)


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

            $.each(json, function (index, d) {

                grid_color.set(parseInt(d.gridid), {color: scales[map_type](rateById[d.gridid]), score: d.tscore});
                // grid_color.set(parseInt(d.gridid), {color: scales['deviation'](rateById[d.gridid]), score: d.tscore});

            })

            

            var colors_array = map_type === "range" ?  equal_range_colors : colors           
            var values_array = [];

            switch(map_type){
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
            
        }
        else{

            _VERBOSE ? console.log("Probabilidad") : _VERBOSE;
            prob_arg = json;

            var link_color = d3.scale.quantize().domain([1, 0]).range(colorbrewer.RdBu[11]);


            $.each(prob_arg, function (index, value) {

                grid_color.set(value.gridid, {color: link_color(parseFloat(value.tscore)), score: parseFloat(value.tscore)});

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
     * @function _cargaPaletaColor
     * @private
     * @memberof! map_module
     * 
     * @param {boolean} mapa_prob - Bandera para saber si el mapa despliega el color con probalidad por celda
     */
    function _cargaPaletaColor(colors_array, values_array, mapa_prob = false) {

        _VERBOSE ? console.log("_cargaPaletaColor") : _VERBOSE;

        $("#escala_color").empty();

        var w = 140, h = 300;

        var key = d3.select("#escala_color").append("svg")
                .attr("width", w)
                .attr("height", h)

                
        var rects = key.selectAll(".rects")
            .data(colors_array)
            .enter()
            .append("rect")
            .attr("y", 10)
            .attr("height", 40)
            .attr("x", (d,i)=>-300 + i*15)
            .attr("width", 16)
            .attr("fill", (d,i)=>colors_array[i])
            .attr("stroke", "gray")
            .attr("transform", "rotate(270)");

        // // console.log(values_array)
        // var delta = Math.abs(values_array[0] - values_array[1])
        // values_array.unshift(values_array[0] - delta); 
        // // console.log(values_array)
        // values_array.push(values_array[values_array.length-1]+delta)
        // console.log(values_array)
        // console.log(colors_array)
        // console.log("length values: " + values_array.length)
        // console.log("length colors: " + colors_array.length)


        var texts = key.selectAll(".rect")
            .data(values_array)
            .enter()
            .append("text")
            .style("font-size", "8px")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", function(d,i){
                return 65
            })
            .attr("y", function (d,i) {
                return (300 - ((i+1)*15))+3
            })
            // .attr("x", (d,i)=>-300 + (i+1)*15)
            // .attr("y", function (d,i) {
            //     // return i%2==0 ? 6 : 60
            //     return 6
            // })
            .text(function (d) {
                return parseFloat(d).toFixed(2);
            })
            
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
        $.each(arg_result_1, function (index, decil) {

            // se estan quedando elementos fuera, ya que no estan tocamdo el cero
            if (first) {

                first = false;

                if (first_pos) {

                    var max_decil = d3.max(decil.map(function (d) {
                        return parseFloat(d.tscore)
                    }));
                    r_limit = d3.min(decil.map(function (d) {
                        return parseFloat(d.tscore)
                    }));

                    _range_limits_red.push({right_limit: max_decil, left_limit: r_limit});

                } else {
                    var max_decil = 0;
                    r_limit = d3.min(decil.map(function (d) {
                        return parseFloat(d.tscore)
                    }));

                    _range_limits_blue.push({right_limit: max_decil, left_limit: r_limit});
                }



            } else if (index == NUM_SECTIONS - 1) {

                if (first_pos) {
                    var max_decil = d3.max(decil.map(function (d) {
                        return parseFloat(d.tscore)
                    }));
                    r_limit = 0;

                    _range_limits_red.push({right_limit: max_decil, left_limit: r_limit});

                } else {
                    var max_decil = r_limit;
                    r_limit = d3.min(decil.map(function (d) {
                        return parseFloat(d.tscore)
                    }));

                    _range_limits_blue.push({right_limit: max_decil, left_limit: r_limit});
                }



            } else {

                // avoiding spaces between decil boundaries
                var max_decil = r_limit;
                r_limit = d3.min(decil.map(function (d) {
                    return parseFloat(d.tscore)
                }));

                if (first_pos) {
                    _range_limits_red.push({right_limit: max_decil, left_limit: r_limit});
                } else {
                    _range_limits_blue.push({right_limit: max_decil, left_limit: r_limit});
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

            $.each(range, function (i, r_item) {

                if (first_pos) {

                    var rlimit = r_item.right_limit * -1;
                    var llimit = r_item.left_limit * -1;

                    _range_limits_blue.push({right_limit: llimit, left_limit: rlimit});

                } else {

                    var rlimit = r_item.right_limit * -1;
                    var llimit = r_item.left_limit * -1;

                    _range_limits_red.push({right_limit: llimit, left_limit: rlimit});

                }


            });

            var rangeinverse = first_pos ? _range_limits_blue : _range_limits_red;
            if (first_pos) {
                rangeinverse.reverse();
            }
            _VERBOSE ? console.log(rangeinverse) : _VERBOSE;


            $.each(rangeinverse, function (i, limits) {

                var decil_item = [];

                $.each(arg_2, function (j, item) {

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

        var grid_map_2export = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": []}
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

        var sp_target_2export = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": []}
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

        map.setView(_centro_mapa, _zoom_module, {animate: true});
        map_sp.setView(_centro_mapa, _zoom_module, {animate: true});

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

    return{
        map: map,
        get_spTaxon: get_spTaxon,
        busca_especie: busca_especie,
        busca_especie_grupo: busca_especie_grupo,
        changeRegionView: changeRegionView,
        busca_especie_filtros: busca_especie_filtros,
        set_specieTarget: set_specieTarget,
        get_specieTarget: get_specieTarget,
        get_allowedPoints: get_allowedPoints,
        get_discardedPoints: get_discardedPoints,
        get_discardedPointsFilter: get_discardedPointsFilter,
        get_discardedCellFilter: get_discardedCellFilter,
        get_allowedCells: get_allowedCells,
        // createDecilColor: createDecilColor,
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
        loadD3GridMX: loadD3GridMX,
        updateLabels: updateLabels,
        clearMap: clearMap,
        startMap: startMap,
        getGridMap2Export: getGridMap2Export,
        getSP2Export: getSP2Export,
        createRankColor: createRankColor,
        clearAllLayers: clearAllLayers
    }

});