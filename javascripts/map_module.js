		var map_module = (function (url_geoserver, workspace, verbose, url_zacatuche){

			// ************ variables publicas y privadas ( denotadas por _ ) ************

			var map;

			var _VERBOSE = verbose;

			var _grid_d3, _grid_map;
			var _grid_map_hash = d3.map([]);

			var _DELETE_STATE_POINTS = false;

			var _url_geoserver = url_geoserver,
				_workspace = workspace;

			var _url_zacatuche = url_zacatuche;

			var _OSM_layer,
				_grid_wms,
				_species_layer,
				_states_layer,
			 	_eco_layer,
			 	_markersLayer,
			 	_baseMaps,
			 	_overlayMaps,
			 	_layer_control,
			 	_specie_target;

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
			_customOptions ={
			  'maxWidth': '500',
			  'className' : 'custom'
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



			// ************ funciones publicas y privadas ( denotadas por _ ) ************


			// getters y setters necesarios hasta el momento

			// function get_markersLayer(){
			// 	return _markersLayer;
			// }
			
			function get_layerControl(){
				return _layer_control;
			}

			// Obtiene el valor de una especie previamente seleccionada.
			function get_specieTarget(){
				return _specie_target;
			}

			// Asigna el valor de una especie seleccionada a una variable global del módulo.
			function set_specieTarget(specie_target){
				_specie_target = specie_target;
			}

			// Obtienen un map (no repetidas) de las ocurrencias de una especie previamente seleccionada y de ocurrencias descartadas.
			function get_allowedPoints(){
				return _allowedPoints;
			}

			// Obtienen un map (no repetidos) de las ocurrencias descartadas de una especie.
			function get_discardedPoints(){
				return _discardedPoints;
			}

			function get_discardedPointsFilter(){
				return _discardedPointsFilter;
			}


			function get_discardedCellFilter(){
				return _computed_discarded_cells;
			}

			function get_allowedCells(){
				return _computed_occ_cells;
			}

			function getMap(){
				return map;
			}

			

			// function get_gridWms(){
			// 	return _grid_d3;
			// }

			// Asigna el valor de la instancia del controlador a una variable global del módulo para generar interacción con el mapa.
			function setDisplayModule(display_module){
				_display_module = display_module;
				// _grid_wms.wmsParams.display_obj = _display_module;
			}
			// function setLanguageModule(language_module){
			// 	_language_module = language_module;
			// 	_iTrans = _language_module.getI18();
			// }

			// ******************************************************************* geojson-vt
			var _tileIndex;
			var _tileOptions = {
		            maxZoom: 20,  // max zoom to preserve detail on
		            tolerance: 5, // simplification tolerance (higher means simpler)
		            extent: 4096, // tile extent (both width and height)
		            buffer: 64,   // tile buffer on each side
		            debug: 0,      // logging level (0 to disable, 1 or 2)

		            indexMaxZoom: 0,        // max zoom in the initial tile index
		            indexMaxPoints: 100000, // max number of points per tile in the index
		        };
		    var _tileLayer;
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


		    // ******************************************************************* Web-GL
		    // var _glLayer;

		    



			// Función que realiza la creación del objeto L.map, enlaza la capa base de Open Street Map, asigna el módulo de lenguaje a una variable global del módulo y llama a las funciones de la carga de controles y la petición de la malla en geojson.
			function _mapConfigure(language_module, tipo_modulo, histogram_module){

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


				var milliseconds = new Date().getTime();
				var url = _url_geoserver + "t=" + milliseconds;
				var espacio_capa = _workspace + ":sp_grid_terrestre";

				// normal osm map: http://{s}.tile.osm.org/{z}/{x}/{y}.png
				// black and white map: http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png
				// relieve: http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png
				// cartoDB: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
				_OSM_layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png');


				// var grid_ame = L.tileLayer.betterWms("http://localhost:8080/geoserver/snib_local/wms", {
			 //        layers: 'snib_local:gridame_20km',
			 //        dataType: "jsonp",
			 //        transparent: true,
			 //        format: 'image/png'
			 //      });

				
				// ******************************************************************* geojson-vt
				_tileIndex = geojsonvt([], _tileOptions);
				_tileLayer = L.canvasTiles()
		                      .params({ 
		                      	debug: false, 
		                      	padding: 5,
		                      	onEachFeature: onEachFeature
		                      })
		                      .drawing(_drawingOnCanvas);

		        // ******************************************************************* Web-GL
		        // _glLayer = L.canvasOverlay()
		        //                .drawing(_drawingOnCanvas_GL)
		        //                // .addTo(map);
		        

				// asigna en centro del mapa dependiendo se en nicho o comunidad
				var centro_mapa = (_tipo_modulo == _MODULO_NICHO) ? [30.5, -99] : [30.5, -102];
				var zoom_module = (_tipo_modulo == _MODULO_NICHO) ? 4 : 3;

				// ambos div tienen el id = 'map', tanto en nicho como en comunidad
				map = L.map('map', {
					    center: centro_mapa,
					    zoom: zoom_module,
					    layers: [
					      	_OSM_layer,
					      	_tileLayer
					      	// _glLayer
					      	// grid_ame
					    ]
				});



				_baseMaps = {
				    "Open Street Maps": _OSM_layer
				};
				_overlayMaps = {
				    // "Malla": svg
				    "Malla GeoJsonTV": _tileLayer
				    // "Malla WegGL": _glLayer
				    // "Geoserver grid": grid_ame
				};
				_layer_control = L.control.layers(_baseMaps, _overlayMaps).addTo(map);

				map.scrollWheelZoom.disable();

				if(_tipo_modulo == _MODULO_NICHO){
					// document.getElementById("tbl_hist").style.display = "none";
					// document.getElementById("dShape").style.display = "none";
					_addControls();
				}



				
				// map.on('zoomend', function(zoom_level) {

				// 	console.log('zoomend');


				// 	_zoom_level = map.getZoom();

				// 	var northEast = map.getBounds().getNorthEast();
				// 	var southWest = map.getBounds().getSouthWest();

				// 	// console.log(northEast);
				// 	// console.log(southWest);
					
				// 	_loadD3Grid(northEast, southWest);

				// });

				// map.on('moveend', function() {

				// 	console.log('moveend');

				//     var northEast = map.getBounds().getNorthEast();
				// 	var southWest = map.getBounds().getSouthWest();

				// 	// console.log(northEast);
				// 	// console.log(southWest);

				// 	_loadD3Grid(northEast, southWest);

				// });

				

				_loadD3GridMX();
				
				
			}

			var _zoom_level;
			var _xhr = null;


			// Realiza la petición de la malla al servidor en formato geojson y la asigna a una variable global dentro del módulo. Si el modulo es llamado por el sistema de comunidad es llamada la función de creación de la malla _createMapGrid.
			// TODO: sincronizar meotodo para que sea realizado antes de que se busque una especie y de un error.
			// SOl: inhabilitar el text input hasta que se cargue la red
			// function _loadD3Grid(northEast, southWest){
			function _loadD3GridMX(){

			  _VERBOSE ? console.log("_loadD3GridMX") : _VERBOSE;
			  _VERBOSE ? console.log(_url_zacatuche) : _VERBOSE;

			  // if(_xhr != null)
			  // 	_xhr.abort();

			  $.ajax({
			  	url: _url_zacatuche + "/niche/especie",
			    type : 'post',
			    dataType : "json",
			    data : {
			      "qtype" : "getGridGeoJsonMX"
			      // "qtype" : "getSegmentedGridGeoJson",
			      // "xmin" : southWest.lng,
			      // "ymin" : southWest.lat,
			      // "xmax" : northEast.lng,
			      // "ymax" : northEast.lat,
			      // "zoom" : _zoom_level
			    },
			    // success : function (jsonc){
			    success : function (json){

			    	// Asegura que el grid este cargado antes de realizar una generacion por enlace
			    	$("#loadData").prop("disabled",false);
			    	
			    	// _grid_map = d3.map([]);
			    	// $.each(json.features, function(index, item){
			    	// 	_grid_map.set(item.properties.gridid, item.properties.geometry);
			    	// });

			    	_grid_map = json;

			    	// importacion con otras APIs
			    	// // Se comprime json del lado del servidor, se descomprime en el cliente
			    	// json = JSONC.decompress(jsonc);
			    	// // console.log(json);

			    	// var final_json = {
								// 		"type": "FeatureCollection",
								// 		"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
								// 		"features": []
								// 	}


			    	// $.each(json, function(index, item){
			    	// 	// console.log(item.geom);
			    	// 	var json_item = { 
			    	// 		"type": "Feature", 
			    	// 		"properties": { 
			    	// 				"gridid": item.gridid 
			    	// 		},
			    	// 		"geometry" : JSON.parse(item.geom)
			    	// 	}
			    		
			    	// 	final_json.features.push(json_item);

			    	// });
			    	// // console.log(JSON.stringify(final_json));

			    	// _grid_map = final_json;

			    	
			    	// ******************************************************************* geojson-vt

			    	// _loadD3GridEU();
			    	colorizeFeatures(_grid_map, true);
			    	_pad = 0;
			    	_tileIndex = geojsonvt(_grid_map, _tileOptions); 
		            _tileLayer.redraw();



		            // agrega listener para generar pop en celda
		            map.on('click', function(e) {
					    console.log(e.latlng.lat + ", " + e.latlng.lng);

					    if(_tipo_modulo == _MODULO_NICHO){
					    	_display_module.showGetFeatureInfo(e.latlng.lat, e.latlng.lng);	
					    }

					});

		            
		            // ******************************************************************* Web-GL

		            // _createWeGLGrid(_grid_map);
		                   
					
		            // ******************************************************************* ACTUAL - D3

			    	
			    	// acrtivar cuando se cargue el grid al inicio!!
			    	// if(_tipo_modulo == _MODULO_NET){
			    	// 	createMapGrid();
			    	// }
			    	

			    },
			    error : function (){
			      // alert("Existe un error en la conexión con el servidor, intente mas tarde");
			      console.log("abort");
			    }

			  });

			}


			// function _loadD3GridEU(){

			//   _VERBOSE ? console.log("_loadD3GridEU") : _VERBOSE;

			//   // if(_xhr != null)
			//   // 	_xhr.abort();

			//   $.ajax({
			//     url: _url_zacatuche,
			//     type : 'post',
			//     dataType : "json",
			//     data : {
			//       "qtype" : "getGridGeoJsonEU"
			//       // "qtype" : "getSegmentedGridGeoJson",
			//       // "xmin" : southWest.lng,
			//       // "ymin" : southWest.lat,
			//       // "xmax" : northEast.lng,
			//       // "ymax" : northEast.lat,
			//       // "zoom" : _zoom_level
			//     },
			//     // success : function (jsonc){
			//     success : function (json){

			//     	// _grid_map = json;
			//     	// console.log(_grid_map.features);

			//     	// $.each(json.features, function(idex,item){
			//     	// 	_grid_map.features.push(item);
			//     	// });

			//     	// TODO: GENERAR LOGICA PARA NO AGREGAR CELDAS DOBLES, LA MALLNA DE MEXICO TIENE CELDAS DE ESTADOS UNIDOS
			//     	$.each(json.features, function(index, item){
			//     		_grid_map.features.push(item);
			//     	});

			//     	_pad = 0;
			//     	_tileIndex = geojsonvt(_grid_map, _tileOptions); 
		 //            _tileLayer.redraw();

			    	                   
			// 		// ******************************************************************* ACTUAL - D3

			//     	// // Asegura que el grid este cargado antes de realizar una generacion por enlace
			//     	// $("#loadData").prop("disabled",false);
			    	
			//     	// // acrtivar cuando se cargue el grid al inicio!!
			//     	// if(_tipo_modulo == _MODULO_NET){
			//     	// 	createMapGrid();
			//     	// }
			    	

			//     },
			//     error : function (){
			//       // alert("Existe un error en la conexión con el servidor, intente mas tarde");
			//       console.log("abort");
			//     }

			//   });

			// }



			function colorizeFeatures(grid_map_color, first) {

		        _VERBOSE ? console.log("colorizeFeatures") : _VERBOSE;

		        console.log(_grid_map);

		        if(first){
		        	console.log("first loaded");
		        	for (var i = 0; i < _grid_map.features.length; i++) {
		        		_grid_map.features[i].properties.color = ''; 
		        	}
		        }
		        else{
		        	for (var i = 0; i < _grid_map.features.length; i++) {

			        	if(grid_map_color.has(_grid_map.features[i].properties.gridid)){
			        		_grid_map.features[i].properties.opacity = 1;
			        		_grid_map.features[i].properties.color = grid_map_color.get(_grid_map.features[i].properties.gridid);  //'hsl(' + 360 * Math.random() + ', 50%, 50%)'; 
			        	}
			        	else{
			        		_grid_map.features[i].properties.color = 'rgba(255,0,0,0)'; 


			        		// _grid_map.features[i].properties.opacity = 0;
			        	}
			        }
		        }

		        _tileLayer.redraw();

		    }


		    function colorizeFeaturesNet(arg_gridid, arg_count, link_color_brewer) {
				
		        _VERBOSE ? console.log("colorizeFeaturesNet") : _VERBOSE;

		        console.log(_grid_map);


		        for (var i = 0; i < _grid_map.features.length; i++) {


		        	index_grid = arg_gridid.indexOf(_grid_map.features[i].properties.gridid);

		        	if(index_grid != -1){

		        		_grid_map.features[i].properties.opacity = 1;
		        		_grid_map.features[i].properties.color = link_color_brewer(arg_count[index_grid]); 

		        	}
		        	else{

		        		_grid_map.features[i].properties.color = 'rgba(255,0,0,0)'; 

		        	}

		        }


		        _tileLayer.redraw();

		    }

			function _drawingOnCanvas(canvasOverlay, params) {

		            var bounds = params.bounds;
		            params.tilePoint.z = params.zoom,

		            elemLeft = params.canvas.offsetLeft,
	    			elemTop = params.canvas.offsetTop;

		            var ctx = params.canvas.getContext('2d');
		            ctx.globalCompositeOperation = 'source-over';

		            
		            // console.log(canvasOverlay);

		            ctx.canvas.addEventListener('click', function(event) {

		            	// console.log(event.target.id);
					  
					  	var x = event.pageX - elemLeft,
	        				y = event.pageY - elemTop;

	        			console.log(event);
	    				console.log(x);
	    				console.log(y);


					}, false);


		            // console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

		            var tile = _tileIndex.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
		            if (!tile) {
		                // console.log('tile empty');
		                return;
		            }

		            ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

		            var features = tile.features;

		            // console.log(features);

		            // borde de la malla
		            ctx.strokeStyle = 'rgba(255,0,0,0)';
		            // ctx.strokeStyle = 'grey'; // hace malla visible


		            for (var i = 0; i < features.length; i++) {
		                var feature = features[i],
		                    type = feature.type;

		                // json object
		                // console.log(feature);
		       			// feature.on('click', function (e) {
					    //   console.log(e);
					    // });

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
		                        if (k) ctx.lineTo(x  + _pad, y   + _pad);
		                        else ctx.moveTo(x  + _pad, y  + _pad);
		                    }
		                }

		                if (type === 3 || type === 1){
		                	ctx.fill('evenodd');
		                } 

		                // if(i<5){
		                	// console.log(feature);
			                // ctx.canvas.id = feature.tags.gridid;
			                // console.log(ctx.canvas);
		                // }
		                

		                ctx.stroke();
		            }

		        };


		    var gl;
		    var canvas;
		    var pixelsToWebGLMatrix;
		    var mapMatrix;
		    var u_matLoc;
		    var numPoints;

			function _createWeGLGrid(data){

				canvas = _glLayer.canvas();

		        _glLayer.canvas.width = canvas.clientWidth;
		        _glLayer.canvas.height = canvas.clientHeight;


		        gl = canvas.getContext('experimental-webgl', { antialias: true });

		        pixelsToWebGLMatrix = new Float32Array(16);
		        mapMatrix = new Float32Array(16);

		        // -- WebGl setup
		        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		        gl.shaderSource(vertexShader, document.getElementById('vshader').text);
		        gl.compileShader(vertexShader);

		        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		        gl.shaderSource(fragmentShader, document.getElementById('fshader').text);
		        gl.compileShader(fragmentShader);

		        // link shaders to create our program
		        var program = gl.createProgram();
		        gl.attachShader(program, vertexShader);
		        gl.attachShader(program, fragmentShader);
		        gl.linkProgram(program);
		        gl.useProgram(program);



		        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		        gl.enable(gl.BLEND);
		        //  gl.disable(gl.DEPTH_TEST);
		        // ----------------------------
		        // look up the locations for the inputs to our shaders.
		        u_matLoc = gl.getUniformLocation(program, "u_matrix");
		        gl.aPointSize = gl.getAttribLocation(program, "a_pointSize");
		        // Set the matrix to some that makes 1 unit 1 pixel.

		        pixelsToWebGLMatrix.set([2 / canvas.width, 0, 0, 0, 0, -2 / canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
		        gl.viewport(0, 0, canvas.width, canvas.height);

		        gl.uniformMatrix4fv(u_matLoc, false, pixelsToWebGLMatrix);


		        // -- data

		        var verts = [];
		        var rawVerts = [];
		        //-- verts only

		        var start = new Date();

		        for (var f = 0; f < data.features.length ; f++) {
		            rawVerts = [];
		            var feature = data.features[f];

		            // console.log(feature);


		            //***
		            // for (var i = 0; i < feature.geometry.coordinates[0].length; i++) {
		            for (var i = 0; i < feature.geometry.coordinates[0][0].length; i++) {

		            	// console.log(feature.geometry.coordinates[0][0][i][1]);


		                rawVerts.push([feature.geometry.coordinates[0][0][i][1], feature.geometry.coordinates[0][0][i][0]]);
		                // rawVerts.push([feature.geometry.coordinates[0][i][1], feature.geometry.coordinates[0][i][0]]);

		                
		            }

		            // console.log(rawVerts.length);

		            rawVerts.pop();
		            currentColor = [Math.random(), Math.random(), Math.random()]; //[0.1, 0.6, 0.1];

		            var triangles = earcut([rawVerts]);

		            for (var i = 0; i < triangles.length; i++) {
		                pixel = _LatLongToPixelXY(triangles[i][0], triangles[i][1]);
		                verts.push(pixel.x, pixel.y, currentColor[0], currentColor[1], currentColor[2]);
		            }

		        }


		        console.log("updated at  " + new Date().setTime(new Date().getTime() - start.getTime()) + " ms ");

		        // return;


		         // tirangles or point count
		        numPoints = verts.length / 5;
		        console.log("num points:   " + numPoints);
		        var vertBuffer = gl.createBuffer();
		        var vertArray = new Float32Array(verts);
		        var fsize = vertArray.BYTES_PER_ELEMENT;
		        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
		        gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);
		        var vertLoc = gl.getAttribLocation(program, "a_vertex");
		        gl.vertexAttribPointer(vertLoc, 2, gl.FLOAT, false, fsize * 5, 0);
		        gl.enableVertexAttribArray(vertLoc);
		        // -- offset for color buffer
		        var colorLoc = gl.getAttribLocation(program, "a_color");
		        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, fsize * 5, fsize * 2);
		        gl.enableVertexAttribArray(colorLoc);

		        _glLayer.redraw();

			}


			function _drawingOnCanvas_GL (canvasOverlay, params) {
		        if (gl == null) return;

		        gl.clear(gl.COLOR_BUFFER_BIT);


		        pixelsToWebGLMatrix.set([2 / canvas.width, 0, 0, 0, 0, -2 / canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
		        gl.viewport(0, 0, canvas.width, canvas.height);



		        var pointSize = Math.max(map.getZoom() - 4.0, 1.0);
		        gl.vertexAttrib1f(gl.aPointSize, pointSize);

		        // -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
		        mapMatrix.set(pixelsToWebGLMatrix);

		        var bounds = map.getBounds();
		        var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());
		        var offset = _LatLongToPixelXY(topLeft.lat, topLeft.lng);

		        // -- Scale to current zoom
		        var scale = Math.pow(2, map.getZoom());
		        _scaleMatrix(mapMatrix, scale, scale);

		        _translateMatrix(mapMatrix, -offset.x, -offset.y);

		        // -- attach matrix value to 'mapMatrix' uniform in shader
		        gl.uniformMatrix4fv(u_matLoc, false, mapMatrix);
		        gl.drawArrays(gl.TRIANGLES, 0, numPoints);

		    }

		    // Returns a random integer from 0 to range - 1.
		    function randomInt(range) {
		        return Math.floor(Math.random() * range);
		    }

		  
		    // -- converts latlon to pixels at zoom level 0 (for 256x256 tile size) , inverts y coord )
		    // -- source : http://build-failed.blogspot.cz/2013/02/displaying-webgl-data-on-google-maps.html

		    function _LatLongToPixelXY(latitude, longitude) {
		        var pi_180 = Math.PI / 180.0;
		        var pi_4 = Math.PI * 4;
		        var sinLatitude = Math.sin(latitude * pi_180);
		        var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
		        var pixelX = ((longitude + 180) / 360) * 256;

		        var pixel = { x: pixelX, y: pixelY };

		        return pixel;
		    }

		    function _translateMatrix(matrix, tx, ty) {
		        // translation is in last column of matrix
		        matrix[12] += matrix[0] * tx + matrix[4] * ty;
		        matrix[13] += matrix[1] * tx + matrix[5] * ty;
		        matrix[14] += matrix[2] * tx + matrix[6] * ty;
		        matrix[15] += matrix[3] * tx + matrix[7] * ty;
		    }

		    function _scaleMatrix(matrix, scaleX, scaleY) {
		        // scaling x and y, which is just scaling first two columns of matrix
		        matrix[0] *= scaleX;
		        matrix[1] *= scaleX;
		        matrix[2] *= scaleX;
		        matrix[3] *= scaleX;

		        matrix[4] *= scaleY;
		        matrix[5] *= scaleY;
		        matrix[6] *= scaleY;
		        matrix[7] *= scaleY;
		    }

			

			// Procesa el archivo geojson de la malla para que sea visualizada en el mapa y añade un listener para ajustar el tamaño de la malla a los eventos de zoom in y zoom out. Para el sistema de comunidad enlaza una función de detalles al seleccionar una celda de la malla.
			function createMapGrid(){

				_VERBOSE ? console.log("createMapGrid") : _VERBOSE;

				// var json = {	
				// 				"type": "FeatureCollection",
				// 				"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
				// 				"features": _grid_map.values()
				// 			}

				var json = _grid_map;
			

				try{
					_layer_control.removeLayer(_switchD3Layer);
					map.removeLayer(_switchD3Layer);
					$("#grid_map").remove();
					
					// _VERBOSE ? console.log("grid map removed") : _VERBOSE;
					map.off("viewreset", reset);

				}catch(error){
					_VERBOSE ? console.log("first time") : _VERBOSE;
				}



				_grid_d3 = d3.select(map.getPanes().overlayPane).append("svg"),
			        g = _grid_d3.append("g")
			            .attr("id","grid_map")
			            .attr("class", "leaflet-zoom-hide")
			            .style("fill", "none")
			            .style("opacity", 0.8)

			    var transform = d3.geo.transform({point: projectPoint}),
			    	path = d3.geo.path().projection(transform);

			    var feature = g.selectAll("path")
			          .data(json.features)
			        .enter().append("path")
			        .on("click", function(d){
			    		// _VERBOSE ? console.log(d) : _VERBOSE;
			    		// este metodo es oslo para el modulo de nicho, si se desea gregar interacción en comunidad generar metodo.
			    		if(_tipo_modulo == _MODULO_NICHO){
			    			_showGridDetails(d);
			    		}

				    });
			    
			    
			    map.on("viewreset", reset);
			    reset();

			    // Reposition the SVG to cover the features.
			    function reset() {

			    	_VERBOSE ? console.log("reset") : _VERBOSE;

			        var bounds = path.bounds(json),
			            topLeft = bounds[0],
			            bottomRight = bounds[1];

			        _grid_d3.attr("width", bottomRight[0] - topLeft[0])
			            .attr("height", bottomRight[1] - topLeft[1])
			            .style("left", topLeft[0] + "px")
			            .style("top", topLeft[1] + "px");

			        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

			        feature.attr("d", path)
			              .attr("id",function(d){
			                return d.properties.gridid;
			              })
			    }

			    // Use Leaflet to implement a D3 geometric transformation.
			    function projectPoint(x, y) {
			        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
			        this.stream.point(point.x, point.y);
			    }


			 //    _VERBOSE ? console.log(_switchD3Layer) : _VERBOSE;
				// if(!_switchD3Layer){
				// 	_VERBOSE ? console.log("first time") : _VERBOSE;
					_switchD3Layer = new _lineLayer();
					_layer_control.addOverlay(_switchD3Layer, "Grid");
					map.addLayer(_switchD3Layer);
				// }
				// else{
				// 	_VERBOSE ? console.log("NOT first time") : _VERBOSE;
				// }

			   
			}


			function addMapLayer(layer, name){

				_VERBOSE ? console.log("addMapLayer") : _VERBOSE;

				map.addLayer(layer);
				_layer_control.addOverlay(layer, name);

			}

			function removeMapLayer(layer, name){

				_VERBOSE ? console.log("removeMapLayer") : _VERBOSE;

				map.removeLayer(layer);
				_layer_control.removeLayer(layer);

			}


			function addMapControl(control){
				
				map.addControl(control);

			}

			function removeMapControl(control){

				map.removeControl(control); 

			}

			var _fisrtMap = true;

			// TODO: Remover y agregar la capa cambiando el titulo segun el idioma. SOLUCION: Generar un layer global para poder removerlo...
			// function updateLabels(){
			// 	_VERBOSE ? console.log("updateLabels") : _VERBOSE;
			// 	// _VERBOSE ? console.log(_layer_control) : _VERBOSE;
			// }

			// Obtiene las coordenadas de una celda seleccionada así como el centroide de la celda para desplegar información por la función showPopUp.
			function _showGridDetails(item){

				_VERBOSE ? console.log("_showGridDetails") : _VERBOSE;

				var gridid = item.properties.gridid;
				var polygon = L.multiPolygon(item.geometry.coordinates.map(function(d){return _mapPolygon(d)}), {color: '#0f0', weight:'1px'});
				var latlng = polygon.getBounds().getCenter();

				_display_module.showGetFeatureInfo(gridid, latlng);

			}

			function _mapPolygon(poly){
		      return poly.map(function(line){return _mapLineString(line)})
		    }

		    function _mapLineString(line){
		      return line.map(function(d){return [d[1],d[0]]})  
		    }

		    // Despliega la tabla con los elementos que contiene la celda seleccioanda.
		    function showPopUp(htmltable, latlng){

		    	_VERBOSE ? console.log("showPopUp") : _VERBOSE;

		    	var popup = L.popup();
		    	popup.setLatLng(latlng).setContent(htmltable).openOn(map);


		    }


			// se agregan los controles custom que son necesarios para la funcionalidad del mapa. Ej: Boton de borrado de puntos
			function _addControls(){

				_VERBOSE ? console.log("_addControls") : _VERBOSE;

				PointDeleteControl = L.Control.extend({
				    options: {
				        position: 'topleft',
				    },

				    onAdd: function (map) {
				        var controlDiv = L.DomUtil.create('div', 'leaflet-control-command ');
				        
				        L.DomEvent
				            .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
				            .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
				        .addListener(controlDiv, 'click', function () { _deletePoints(); });

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

				map.addControl(new PointDeleteControl());

			}


			var _lin_inf = undefined;
			var _lin_sup = undefined;
			var _sin_fecha = undefined;

			function busca_especie_filtros(rango, sfecha){

				_VERBOSE ? console.log("busca_especie") : _VERBOSE;

				_lin_inf = rango ? rango[0] : undefined;
				_lin_sup = rango ? rango[1] : undefined;
				_sin_fecha = sfecha;

				busca_especie(true);

				_toastr.info("Recalculando ocurrencias de especie");	

			}


			// metodo activado cuando se selecciona una especie objetivo, el cual realiza la peticion al servidor para obtener sus ocurrencias
			function busca_especie(cfiltros){

				_VERBOSE ? console.log("busca_especie") : _VERBOSE;
			  	_VERBOSE ? console.log(_specie_target.spid) : _VERBOSE;
			  	_VERBOSE ? console.log(_specie_target.label) : _VERBOSE;

			  	var milliseconds = new Date().getTime();
			  	_sin_fecha = $("#chkFecha").is(':checked') ? true : false;

			  	console.log(_url_zacatuche + "/niche/especie");


			  	$.ajax({

				    url: _url_zacatuche + "/niche/especie",
				    type : 'post',
				    dataType : "json",
				    data : {
				      "qtype" : "getSpecies",
				      "id" : _specie_target.spid,
				      "idtime": milliseconds,
				      "lim_inf": _lin_inf,
				      "lim_sup": _lin_sup,
				      "sfecha": _sin_fecha
				    },
				    beforeSend: function(xhr){ 
				      xhr.setRequestHeader('X-Test-Header', 'test-value');
				      xhr.setRequestHeader("Accept","text/json");
				    },
				    success : function (resp){


				    	// NOTA LA NUEVA ESTRUCTURA DE LA BASE SOLO OBTIENE LOS PUNTOS QUE NO SON DESCARTADOS POR FILTROS
				    	// LAS NUEVAS QUERIES NO REQUEIREN DE LAS CELDAS DESCARTADAS!!!!!

				    	d = resp.data;
				    	// console.log(d);

				    	try {
					      	_markersLayer.clearLayers();
					        _layer_control.removeLayer(_markersLayer);

					    } catch (e) {
					        _VERBOSE ? console.log("primera vez") : _VERBOSE;
					    }



					    _discardedPoints = d3.map([]);			// puntos descartados por eliminacion
					    
					    _allowedPoints = d3.map([]);			// puntos para analisis
					    _discardedPointsFilter = d3.map([]); 	// puntos descartados por filtros
					    
					    _computed_occ_cells = d3.map([]);		// celdas para analisis
					    // _computed_discarded_cells = d3.map([]);	// celdas descartadas por filtros
		   			    

					    // var computed_occ_cells_totals = d3.map([]);
					    var distinctPoints = d3.map([]);

					    
					    if(d.length == 0){
					    	_VERBOSE ? console.log("No hay registros de especie") : _VERBOSE;
					    	return;
					    }

					    // var dict = {};

					    // _VERBOSE ? console.log("computed occs cell: " + computed_occ_cells.values().length) : _VERBOSE;
					    _VERBOSE ? console.log("occs: " + d.length) : _VERBOSE;


					    // obtiene registros unicos en coordenadas
					    for(i=0; i<d.length; i++){
					    	
					    	item_id = JSON.parse(d[i].json_geom).coordinates;
					    	
					    	// console.log(d[i].gridid);
				    		distinctPoints.set(item_id, d[i]);
				    		_computed_occ_cells.set( parseInt(d[i].gridid) , d[i]);

				    		

							// dict[d[i].gridid] = d[i];
					    	
					    }


					    _VERBOSE ? console.log("distinctPoints: " + distinctPoints.values().length) : _VERBOSE;
					    occ_cell = _computed_occ_cells.values().length;
					    _VERBOSE ? console.log("occs cell: " + occ_cell) : _VERBOSE;
					    _VERBOSE ? console.log(_computed_occ_cells.values()) : _VERBOSE;

					    // _VERBOSE ? console.log(Object.keys(dict).length) : _VERBOSE;



					    

					    $.each(distinctPoints.values(), function(index, item){

					         item_id = JSON.parse(item.json_geom).coordinates.toString();
					         
				    		 // this map is fill with the records in the database from an specie, so it discards repetive elemnts.
					        _allowedPoints.set(item_id, { 
				                    "type"      : "Feature",
				                    "properties": {"url": item.urlejemplar, "fecha": item.fechacolecta, "specie" : _specie_target.label, "gridid": item.gridid},
				                    "geometry"  : JSON.parse(item.json_geom)
				                  });

					    });

						_VERBOSE ? console.log("_allowedPoints: " + _allowedPoints.values().length) : _VERBOSE;
						// _VERBOSE ? console.log("_discardedPointsFilter: " + _discardedPointsFilter.values().length) : _VERBOSE;


					    

					    try{
				    		map.removeLayer(_switchD3Layer);
				    	}
				    	catch(e){
				    		_VERBOSE ? console.log("layer no creado") : _VERBOSE;
				    	} 
					    
					    _addPointLayer(); 

					    if(_tipo_modulo == _MODULO_NICHO){
					    	
					    	_histogram_module.createBarChartFecha(distinctPoints.values());	
					    }

					    _fillSpeciesData(_allowedPoints.values().length, occ_cell);

					    $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));

				    },
				    error: function( jqXHR ,  textStatus,  errorThrown ){
				        _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;
				        _VERBOSE ? console.log(errorThrown) : _VERBOSE;
				        _VERBOSE ? console.log(jqXHR.responseText) : _VERBOSE;
				    }

			  	});

			};

			// Despliega en la interfaz la información de la especie seleccionada.
			function _fillSpeciesData(occ, occ_cell){

				_VERBOSE ? console.log("_specie_target") : _VERBOSE;
				
				_VERBOSE ? console.log(_specie_target) : _VERBOSE;

				// $('#lb_sum_especie_res').removeAttr('readonly').val(_specie_target.reino);
				// $("#lb_sum_especie_res").val(_specie_target.especie);
			  	
			  	$("#lb_sum_reino_res").text(_specie_target.reino);
				$("#lb_sum_phylum_res").text(_specie_target.phylum);
				$("#lb_sum_clase_res").text(_specie_target.clase);
				$("#lb_sum_orden_res").text(_specie_target.orden);
				$("#lb_sum_familia_res").text(_specie_target.familia);
				$("#lb_sum_genero_res").text(_specie_target.genero);
				$("#lb_sum_especie_res").text(_specie_target.especie);
				

				$("#num_occ").text(occ);
				$("#num_occ_celda").text(occ_cell);

				// var occ_min = parseInt(occ_cell*0.3) 
				// console.log("occ_min: " + occ_min);
				// $("#occ_number").val(5); // Valor default para interacción con especies
				// $("#occ_number").attr("max",occ_cell);

			}


			// Realiza la carga de una capa en el mapa con las coordenadas de una especie seleccionada previamente
			function _addPointLayer(){

				_VERBOSE ? console.log("_addPointLayer") : _VERBOSE;

			    // _VERBOSE ? console.log("geojsonFeature: " + _allowedPoints.values().length) : _VERBOSE;
			    // _VERBOSE ? console.log(geojsonFeature) : _VERBOSE;

			    _geojsonFeature =  { "type": "FeatureCollection",
			          "features": _allowedPoints.values()};

			    _markersLayer = L.markerClusterGroup({ maxClusterRadius: 30, chunkedLoading: true });
			    
			    _species_layer = L.geoJson(_geojsonFeature, {
			        pointToLayer: function (feature, latlng) {
			        	
			        	return L.circleMarker(latlng, _geojsonMarkerOptions);
			        },
			        onEachFeature: function (feature, layer) {
			        	// _VERBOSE ? console.log(feature.properties.url) : _VERBOSE;
			        	var message = _getMessagePopup(feature);
			            layer.bindPopup(message, _customOptions);
			        }

			    });


			    _markersLayer.addLayer(_species_layer);
			    map.addLayer(_markersLayer);
			    
			    // there is an error with great amount of points ex: zea mays
			    // map.fitBounds(markersLayer.getBounds());
			    _layer_control.addOverlay(_markersLayer, _specie_target.label);
			}


			// funcionalidad que activa o desactiva la eliminación de puntos de una capa de ocurrencias de la especie objetivo desplegada
			function _deletePoints(){

			    _VERBOSE ? console.log("_deletePoints") : _VERBOSE;

			    if(!(_markersLayer))
			      return;

			    
			    if(_DELETE_STATE_POINTS){

			    	// agrega el layer del grid cuando se temrina la eliminación de puntos
			    	try{
			    		map.addLayer(_switchD3Layer);
			    	}catch(e){
			    		_VERBOSE ? console.log("layer no creado") : _VERBOSE;
			    	}
			    	

			        _DELETE_STATE_POINTS = false;

			        $("#deletePointsButton").css("backgroundColor","#fff");

			        _markersLayer.getLayers().forEach(function(item){

			            item.setStyle(_geojsonMarkerOptions);
			            
			            item.off('click');
			            
			            item.on('click',function(){
			              
			              L.DomEvent.stopPropagation;
			              
			              var popup = L.popup({className: 'custom'});
			              // popup.className('custom');

			              var message = _getMessagePopup(item.feature);
			              popup.setLatLng([item.feature.geometry.coordinates[1],item.feature.geometry.coordinates[0]]).setContent(message).openOn(map);

			            });
			            
			        });

			    }
			    else{

			    	// remueve el layer del grid para poder eliminar puntos
			    	try{
			    		map.removeLayer(_switchD3Layer);
			    	}catch(e){
			    		_VERBOSE ? console.log("layer no creado") : _VERBOSE;
			    	}

			    	

			       _DELETE_STATE_POINTS = true; 

			       $("#deletePointsButton").css("backgroundColor","#BFADB6");

			        _markersLayer.getLayers().forEach(function(item){

			            item.off('click');
			        
			            item.on('click',function(){

			                L.DomEvent.stopPropagation;

			                item_id = item.feature.geometry.coordinates.toString();
			                
			                _VERBOSE ? console.log(item_id) : _VERBOSE;
			                _VERBOSE ? console.log(item) : _VERBOSE;


			                _discardedPoints.set(item_id, item);

			                // _VERBOSE ? console.log(_discardedPoints.values()) : _VERBOSE;
			                
			                if(_allowedPoints.remove(item_id)){
			                  _VERBOSE ? console.log("deleted") : _VERBOSE;
			                }
			                else{
			                  _VERBOSE ? console.log("Error: point not deleted") : _VERBOSE;
			                }
			                _markersLayer.removeLayer(item);

			            });

			            item.setStyle(_geojsonMarkerOptionsDelete);

			        });

			    }

			}

			function _getMessagePopup(feature){

				// console.log("_getMessagePopup");

				coordinates = parseFloat(feature.geometry.coordinates[1]).toFixed(2) + ", " +  parseFloat(feature.geometry.coordinates[0]).toFixed(2)

				var fecha = feature.properties.fecha == null ? "" : feature.properties.fecha;

				var url = "";
				
				if(feature.properties.url.startsWith("http://")){
					url = feature.properties.url.replace("http://","");
				}
				else if(feature.properties.url.startsWith("https://")){
					url = feature.properties.url.replace("https://","");
				}
				else{
					url = feature.properties.url;
				}
				// console.log(url);
				

			    var message = "INFORMACIÓN ESPECIE<br/>Nombre: " + feature.properties.specie + "<br/>Colecta: " + fecha + "<br/>Coordenadas: " + coordinates + "<br/><a target='_blank' class='enlace_sp' href='http://" + url + "'>" + _iTrans.prop("link_sp") + "</a>";
				return message;
			}

			function _getMax(arr, prop) {
			    var max;
			    for (var i=0 ; i<arr.length ; i++) {
			        if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
			            max = arr[i];
			    }
			    return max;
			}

			function _getMin(arr, prop) {
			    var min;
			    for (var i=0 ; i<arr.length ; i++) {
			        if (!min || parseInt(arr[i][prop]) < parseInt(min[prop]))
			            min = arr[i];
			    }
			    return min;
			}


			
			

			// Realiza la partición en deciles y la asignación de escala de colores de un conjunto de celdas con valores de score asignado a cada celda.
			function createDecilColor(json, mapa_prob){

				// _cargaPaletaColor();

			  _VERBOSE ? console.log("createDecilColor") : _VERBOSE;
			  _VERBOSE ? console.log(json.length) : _VERBOSE;
			  
			  var red_arg = [];
			  var blue_arg = [];
			  var prob_arg = [];
			  var t_chunks = [];
			  var prob_chunks = [];
			  var red_chunks = [];
			  var blue_chunks = [];
					  

			  grid_color = d3.map([]);

			  if(!mapa_prob){

			  		_VERBOSE ? console.log("Sin probabilidad") : _VERBOSE;

			  		console.log(json);

			  		$.each(json,function(index,d){

			  				d.tscore = parseFloat(d.tscore);

					      if(d.tscore >= 0){
					      	red_arg.push(d)
					      }
					      else{
					      	blue_arg.push(d);
					      }
					        
					  });
					  
					  _VERBOSE ? console.log(red_arg[0]) : _VERBOSE;
					  _VERBOSE ? console.log(red_arg[red_arg.length-1]) : _VERBOSE;
					  _VERBOSE ? console.log(blue_arg[0]) : _VERBOSE;
					  _VERBOSE ? console.log(blue_arg[blue_arg.length-1]) : _VERBOSE;
					  
					  if(blue_arg.length > 0 && red_arg.length > 0){

					      _VERBOSE ? console.log("ambos") : _VERBOSE;

					      
					      
					      // ***** NO ESTA FUNCIONADO!!
					      // _VERBOSE ? console.log(blue_arg.map( function(d) { return parseFloat(d.tscore) })) : _VERBOSE;
					      // _VERBOSE ? console.log(red_arg.map( function(d) { return parseFloat(d.tscore) })) : _VERBOSE;
					      var min_json = d3.min(blue_arg.map( function(d) { return parseFloat(d.tscore) }));
					      var max_json = d3.max(red_arg.map( function(d) { return parseFloat(d.tscore) }));
					      
					      _VERBOSE ? console.log("min_json: " + min_json) : _VERBOSE;
					      _VERBOSE ? console.log("max_json: " + max_json) : _VERBOSE;

					      
					      // var min_obj = _getMin(blue_arg, "tscore");
					      // var max_obj = _getMax(red_arg, "tscore");
					      // var min_json = min_obj.tscore;
					      // var max_json = max_obj.tscore;

					      // _VERBOSE ? console.log(min_json) : _VERBOSE;
					      // _VERBOSE ? console.log(max_json) : _VERBOSE;
					      

					      if(Math.abs(min_json) > Math.abs(max_json)){

					          _VERBOSE ? console.log("primero blue") : _VERBOSE;

					          _resultado_grid = 0;

					          // _VERBOSE ? console.log(blue_arg.length) : _VERBOSE;
					          t_chunks = _getDividedChunks(blue_arg,red_arg,false,mapa_prob);
					          blue_chunks = t_chunks[0];
					          red_chunks = t_chunks[1];

					          // red_chunks.reverse();


					          // when blues go first the collection goes from min to max

					      }
					      else{

					          _VERBOSE ? console.log("primero red") : _VERBOSE;

					          _resultado_grid = 1;

					          // _VERBOSE ? console.log(red_arg.length) : _VERBOSE;
					          t_chunks = _getDividedChunks(red_arg,blue_arg,true,mapa_prob);
					          red_chunks = t_chunks[0];
					          blue_chunks = t_chunks[1];

					          
					          
					          // when reds go first the collection goes from max to min
					          red_chunks.reverse();
					          // blue_chunks.reverse();


					          // console.log(red_chunks);

					      }

					  }
					  else if(blue_arg.length == 0 && red_arg.length > 0){

					    _VERBOSE ? console.log("positivos") : _VERBOSE;

					      t_chunks = _getDividedChunks(red_arg,[],true,mapa_prob);
					      red_chunks = t_chunks[0];
					      blue_chunks = t_chunks[1];

					      // when reds go first the collection goes from max to min
					      red_chunks.reverse();
					      // blue_chunks.reverse();

					  }
					  else if(blue_arg.length > 0 && red_arg.length == 0){

					    _VERBOSE ? console.log("negativos") : _VERBOSE;

					      t_chunks = _getDividedChunks(blue_arg,[],false,mapa_prob);
					      blue_chunks = t_chunks[0];
					      red_chunks = t_chunks[1];

					      // when blues go first the collection goes from min to max

					  }

					  _VERBOSE ? console.log(blue_chunks) : _VERBOSE;
					  _VERBOSE ? console.log(red_chunks) : _VERBOSE;
					  
					  

					  color_scale = colorbrewer.Reds[9];
					  $.each(red_chunks, function( index, value ) {

					    value.forEach(function(d){

					      grid_color.set(d.gridid, color_scale[index]);

					    }); 

					  });

					  color_scale = colorbrewer.Blues[9];
					  $.each(blue_chunks, function( index, value ) {

					    value.forEach(function(d){

					      grid_color.set(d.gridid, color_scale[index]);

					    });

					  });

			  }
			  else{


			  		_VERBOSE ? console.log("Probabilidad") : _VERBOSE;

			  		prob_arg = json;
			  		
			  		// Los valores pueden ser divididos por deciles o por rangos equivalentes
			  		// t_chunks = _getDividedChunks(prob_arg,[],false,mapa_prob);
			  		// prob_chunks = t_chunks[0];
			  // 		_VERBOSE ? console.log(prob_chunks) : _VERBOSE;
			  // 		color_scale = colorbrewer.RdBu[9];
			  // 		$.each(prob_chunks, function( index, value ){
					//     value.forEach(function(d){
					//     	grid_color.set(d.gridid, color_scale[index]);
					//     });
					// });

					console.log(colorbrewer.RdBu[11]);
					var link_color = d3.scale.quantize().domain([1,0]).range(colorbrewer.RdBu[11]);
					// console.log(link_color(0));
					// console.log(link_color(1));
					// console.log(link_color(0.5));
					// console.log(link_color(0.3));
					// console.log(link_color(0.7));


					$.each(prob_arg, function( index, value ){

						// if(index < 100){
						// 	console.log(value);
						// 	console.log(link_color(parseFloat(value.tscore)));
						// }

						grid_color.set(value.gridid, link_color(parseFloat(value.tscore)));

					});

			  }

			  _VERBOSE ? console.log(grid_color.values()) : _VERBOSE;

			  _cargaPaletaColor(mapa_prob);
			  
			  return grid_color;

			}


			function _cargaPaletaColor(mapa_prob){

				_VERBOSE ? console.log("_cargaPaletaColor") : _VERBOSE;

				$("#escala_color").empty();

				// _VERBOSE ? console.log(_range_limits_red) : _VERBOSE;
				_VERBOSE ? console.log(_range_limits_blue) : _VERBOSE;
				// _VERBOSE ? console.log(_resultado_grid) : _VERBOSE;

				var data = [];

				var rojos = colorbrewer.Reds[9].slice();;
				var azules = colorbrewer.Blues[9].slice();

				// _VERBOSE ? console.log(colorbrewer.Reds[9]) : _VERBOSE;

				if(mapa_prob){
					data = colorbrewer.RdBu[11];
				}
				else{
					if(_range_limits_red.length > 0 && _range_limits_blue.length > 0 && _resultado_grid == 0){ // ambos, primero negativos
					
						_range_limits_total = _range_limits_blue.reverse().concat(_range_limits_red);
						
						data = d3.merge([rojos.reverse(), azules]);
					}
					else if(_range_limits_red.length > 0 && _range_limits_blue.length > 0 && _resultado_grid == 1){ // ambos, primero positivos
						
						_range_limits_total = _range_limits_blue.reverse().concat(_range_limits_red.reverse()); 
						
						data = d3.merge([rojos.reverse(), azules]);
					} 
						
					else if(_range_limits_red.length > 0 && _range_limits_blue.length == 0){// solo positivos
						_VERBOSE ? console.log("solo positivos") : _VERBOSE;
						
						_range_limits_total = d3.merge([[{right_limit:0, left_limit:0}], _range_limits_red]);
						data = d3.merge([rojos, ["#ffffff"]]);
						// data = colorbrewer.Reds[9];
					} 
						
					else if(_range_limits_red.length == 0 && _range_limits_blue.length > 0){// solo negativos
						_VERBOSE ? console.log("solo negativos") : _VERBOSE;

						_range_limits_total = d3.merge([_range_limits_blue.reverse(), [{right_limit:0, left_limit:0}]]);
						data = d3.merge([["#ffffff"], azules]); ;
					} 

				}

				console.log(_range_limits_total);
				console.log(data);


				gradient_data = [];

				$.each(data, function(index, item){

					// console.log(parseFloat((index)/data.length*100).toFixed(2)+"%");
					gradient_data.push({offset: parseFloat((index)/data.length*100).toFixed(2)+"%" , color:item });

				});

				// console.log(gradient_data);


				var w = 70, h = 300;

				var key = d3.select("#escala_color").append("svg")
							.attr("width", w)
							.attr("height", h);
							// .attr("transform", "translate(10,0)");

				var legend = key.append("defs")
								.append("svg:linearGradient")
									.attr("id", "gradient")
									.attr("x1", "100%")
									.attr("y1", "0%")
									.attr("x2", "100%")
									.attr("y2", "100%")
									.attr("spreadMethod", "pad");


				legend.selectAll("stop") 
				    .data(gradient_data)                  
				    .enter().append("stop")
				    .attr("offset", function(d) { return d.offset; })   
				    .attr("stop-color", function(d) { return d.color; });
				
				key.append("rect")
					.attr("width", w - 50)
					.attr("height", h - 100)
					.style("fill", "url(#gradient)")
					.attr("transform", "translate(50,10)");

				
				if(mapa_prob){
					var y = d3.scale.linear().range([h - 100, 0]).domain([1, 100]);	
				}
				else{
					var y = d3.scale.ordinal().rangeBands([h-100, 0], .5);
					y.domain(_range_limits_total.map(function(d) { 
						// console.log(d.right_limit);
						return parseFloat(d.left_limit).toFixed(2); 
					}));
				}
				
				var yAxis = d3.svg.axis()
								.scale(y)
								.orient("left");

				var text_legend = mapa_prob ? "Porcentaje probabilidad" : "Score";

				key.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(49,10)")
					.call(yAxis)
						.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", -45)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
						.text(text_legend);

			}



			// Obtiene los límites de la partición realizada por _chunks y realiza la partición de los valores positivos en los negativos o viceversa según el análisis realizado por createDecilColor así como la asignación de escala de colores.
			function _getDividedChunks(arg_1, arg_2, first_pos, mapa_prob){

			    _VERBOSE ? console.log("_getDividedChunks") : _VERBOSE;

			    _range_limits_red = [];
		        _range_limits_blue = [];
		        _range_limits_total = [];

			    
			    // _VERBOSE ? console.log(arg_1.length) : _VERBOSE;
			    decil_length_1 = arg_1.length/NUM_SECTIONS;
			    module_1 = arg_1.length%NUM_SECTIONS;

			    // si esta completo
			    arg_result_1 = chunkify(arg_1, NUM_SECTIONS, true);
			    // arg_result_1 = _chunks(arg_1, decil_length_1, NUM_SECTIONS, module_1);
			    

			    if(mapa_prob){
			    	[arg_result_1, []];
			    }

			    // _VERBOSE ? console.log(arg_result_1) : _VERBOSE;
			    // _VERBOSE ? console.log(arg_result_new) : _VERBOSE;


		        first = true;
		        r_limit = 0.0;

		        // getting boundaries of each decil
		        $.each(arg_result_1, function(index, decil){

		          	// se estan quedando elementos fuera, ya que no estan tocamdo el cero
		            if(first){

		                first = false;

		                if(first_pos){

		                  	max_decil = d3.max(decil.map( function(d) { return parseFloat(d.tscore) }));
		                  	r_limit = d3.min(decil.map( function(d) { return parseFloat(d.tscore) }));

		                  	_range_limits_red.push({right_limit: max_decil, left_limit: r_limit});  

		                }
		                else{
		                  	max_decil = 0;
		                  	r_limit = d3.min(decil.map( function(d) { return parseFloat(d.tscore) }));

		                  	_range_limits_blue.push({right_limit: max_decil, left_limit: r_limit});  
		                }
		                
		                

		            }
		            else if(index == NUM_SECTIONS-1){

		                if(first_pos){
		                  	max_decil = d3.max(decil.map( function(d) { return parseFloat(d.tscore) }));
		                  	r_limit = 0;  

		                  	_range_limits_red.push({right_limit: max_decil, left_limit: r_limit}); 

		                }
		                else{
		                  	max_decil = r_limit;
		                  	r_limit = d3.min(decil.map( function(d) { return parseFloat(d.tscore) }));

		                  	_range_limits_blue.push({right_limit: max_decil, left_limit: r_limit}); 
		                }
		                  
		                

		            }
		            else{

		                // avoiding spaces between decil boundaries
		                max_decil = r_limit;
		                r_limit = d3.min(decil.map( function(d) { return parseFloat(d.tscore) }));

		                if(first_pos){
		                	_range_limits_red.push({right_limit: max_decil, left_limit: r_limit});  	
		                }
		                else{
		                	_range_limits_blue.push({right_limit: max_decil, left_limit: r_limit});  	
		                }

		            }
		            
		        });

		       
		        var range = first_pos ? _range_limits_red : _range_limits_blue;
		        _VERBOSE ? console.log(range) : _VERBOSE;





			    if(arg_2.length > 0){

			        // clustering items of the second array
			        arg_result_2 = [];

			        $.each(range, function(i, r_item){

			        	if(first_pos){
			                  	
		                  	rlimit = r_item.right_limit * -1;
		                  	llimit = r_item.left_limit * -1;

		                  	_range_limits_blue.push({right_limit: llimit, left_limit: rlimit});  

		                }
		                else{

		                  	rlimit = r_item.right_limit * -1;
		                  	llimit = r_item.left_limit * -1;

		                  	_range_limits_red.push({right_limit: llimit, left_limit: rlimit});  

		                }


			        });

			        var rangeinverse = first_pos ? _range_limits_blue : _range_limits_red;
			        if(first_pos){
			        	rangeinverse.reverse();	
			       	}
			        _VERBOSE ? console.log(rangeinverse) : _VERBOSE;
					

					$.each(rangeinverse, function(i, limits){

						var decil_item = [];

						$.each(arg_2, function(j, item){

			                // score = Math.abs(item.tscore);
			                score = parseFloat(item.tscore);
			                llimit = limits.left_limit;
			                rlimit = limits.right_limit;

			                // when the negative values (blues scale) is sent as arg_1, the boundaries must be changed
			                if(first_pos){
			                  	
			                  	if( score >= llimit && score < rlimit ){
				                    decil_item.push(item);  
				                }
			                }
			                else{

			                  	if( score >= llimit && score < rlimit ){
				                    decil_item.push(item);  
				                }
			                }
			              
			            });

			            arg_result_2.push(decil_item);

					});

					
			        _VERBOSE ? console.log(arg_result_2) : _VERBOSE;

			        // arg_result_2.reverse();
			        // _VERBOSE ? console.log(arg_result_2) : _VERBOSE;
			        // _VERBOSE ? console.log(arg_result_1) : _VERBOSE;

			        return [arg_result_1, arg_result_2];

			    }
			    
			    return [arg_result_1, []];

			}


			// Realiza la partición en deciles de un conjunto de celdas con valores de score asignado a cada celda.
			function _chunks(array, size, sections, module) {

			    _VERBOSE ? console.log("_chunks") : _VERBOSE;

			    var results = [];

			    size  = parseInt(size);
			    // _VERBOSE ? console.log(array.length) : _VERBOSE;
			    // _VERBOSE ? console.log(size) : _VERBOSE;
			    // _VERBOSE ? console.log(sections) : _VERBOSE;
			    // _VERBOSE ? console.log(module) : _VERBOSE;

			    while (array.length) {
			        if(module > 0)
			          results.push(array.splice(0, size+1));
			        else
			          results.push(array.splice(0, size));
			        module--;
			    }

			    if(results.length > sections){
			      // _VERBOSE ? console.log("resize") : _VERBOSE;
			      results[sections-1] = results[sections-1].concat(results[sections]);
			      results = results.splice(0, sections);
			    }

			    // _VERBOSE ? console.log(results) : _VERBOSE;
			    

			    return results;

			};


			function chunkify(a, n, balanced) {

				console.log("chunkify");
				console.log(a);
	    
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

			        console.log("size: " + size);

			        while (i < len) {
			            out.push(a.slice(i, i += size));
			        }
			    }

			    else if (balanced) {
			    	console.log("caso dos");

			        while (i < len) {
			            size = Math.ceil((len - i) / n--);
			            out.push(a.slice(i, i += size));
			        }
			    }

			    else {

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



			// Borra la malla del mapa.
			function deleteStyle(ID_STYLE_GENERATED){

				g = d3.select("#grid_map");
		            feature = g.selectAll("path");
		            feature.each(function(d,i){
		                d3.select(this).style("fill", "none");
		        })


			}


			// funcion pública que inicializa la configuración del mapa
			function startMap(language_module, tipo_modulo, histogram_module){
				_VERBOSE ? console.log("startMap") : _VERBOSE;
				_mapConfigure(language_module, tipo_modulo, histogram_module);
			}

			// Añadir los miembros públicos
			return{
				map: map,
				busca_especie: busca_especie,
				busca_especie_filtros: busca_especie_filtros,
				set_specieTarget: set_specieTarget,
				get_specieTarget: get_specieTarget,
				get_allowedPoints: get_allowedPoints,
				get_discardedPoints: get_discardedPoints,
				get_discardedPointsFilter: get_discardedPointsFilter,
				get_discardedCellFilter: get_discardedCellFilter,
				get_allowedCells: get_allowedCells,
				createDecilColor: createDecilColor,
				createMapGrid: createMapGrid,
				// get_gridWms: get_gridWms,
				setDisplayModule: setDisplayModule,
				deleteStyle: deleteStyle,
				showPopUp:showPopUp,
				get_layerControl: get_layerControl,
				addMapLayer: addMapLayer,
				removeMapLayer: removeMapLayer,
				addMapControl: addMapControl,
				removeMapControl: removeMapControl,
				getMap: getMap,
				colorizeFeatures: colorizeFeatures,
				colorizeFeaturesNet: colorizeFeaturesNet,
				// updateLabels: updateLabels,
				startMap: startMap
			}

		});