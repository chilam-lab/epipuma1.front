var region_module = (function(url_trabajo, verbose){

	var _region_selected = ["Estados"];
	var _url_trabajo = url_trabajo;
	var _map_module_nicho;
	var _module_toast;
	var _language_module_nicho;
	var arrayLayerStates = [];
	var _VERBOSE = verbose;
	var _iTrans;

	var _states_layer;
	var eco_layer;
	var drawnItems = new L.FeatureGroup();
	var drawControl;


	/***************************************************************** map styles */
	var geojsonStyleDefault = {
	    radius: 7,
	    fillColor: "#E6E6E6", // "#E2E613",
	  color: "#E6E6E6", //"#ACAE36",
	    weight: 1,
	    opacity: 1,
	    fillOpacity: 0.2
	};

	var geojsonHighlightStyle = {
	    radius: 7,
	    fillColor: "#16EEDC",
	  color: "#36AEA4",
	    weight: 1,
	    opacity: 1,
	    fillOpacity: 0.6
	};

	var geojsonMouseOverStyle = {
	    radius: 7,
	    fillColor: "#BDBDBD", //"#CED122",
	  color: "#BDBDBD", //"#8C8E3A",
	    weight: 1,
	    opacity: 1,
	    fillOpacity: 0.6
	};



	function getRegionSelected(){
		return _region_selected;
	}


	function _getStatesLayer(){

		_VERBOSE ? console.log("_getStatesLayer") : _VERBOSE;

		$.ajax({
		    
		    url: _url_trabajo + "/getStates",
		    type : 'post',
		    dataType : "json",
		    success : function (res){

		      // $( "#progress" ).css( "width", "95%" );
		      d = res.data;
		      
		      console.log("JSON recibido");
		      _module_toast.showToast_BottomCenter(_iTrans.prop('msg_estados_loaded'), "success");

		      // console.log(d);

		    //   try {

		    //     _states_layer.clearLayers();
		    //     layer_control.removeLayer(_states_layer);
		      
		    //   } 
		    //   catch (e) {
		    //     console.log("primera vez");
		    //   }

		    //   try {
		    //       tree_states = [];
		    //       $('#jstree-ecoregiones').jstree("destroy").empty();
		          
		    //       arrayLayerEco = [];
		    //       eco_layer.clearLayers();
		    //       map.removeLayer(eco_layer);
		    //       layer_control.removeLayer(eco_layer);
		      
		    // } 
		    // catch (e) {

		    //   	console.log("no existe aun el componente eco_layer");

		    // }

		      var states_polygons = [];
		      var states_tree = [];

		      for(i=0; i<d.length; i++){

		        // polygons array
		        states_polygons.push({ "type": "Feature",
		                    "properties": {
		                        "name" : d[i].name,
		                        "cve" : d[i].cve
		                      },
		                              "geometry": JSON.parse(d[i].json_geom)
		                            });

		        // jstree array
		        states_tree.push({ 
		                    "id"  : d[i].cve,
		                    "text": d[i].name,
		                              "icon": "assets/images/estado_icon.png"
		                            });
		      }

		      
		      console.log("construyendo mapa");
		      // console.log(states_polygons);

		      results = _setupStatesLayer(states_polygons, arrayLayerStates, 'jstree-estados');
		      _states_layer = results[0];
		      // arrayLayerStates = results[1];


		      console.log(_states_layer);
		      _map_module_nicho.addMapLayer(_states_layer, "Estados");
		      console.log("mapa get_layerControl");


		      _setupJSTree(states_tree, 'jstree-estados', 'Estados', arrayLayerStates);

		      
		      

		    },
		    error : function (){

		      // $( "#progress" ).css( "width", "0%" );
		      // $( "#progress" ).hide();
		      console.log("Error");
		      _module_toast.showToast_BottomCenter(_iTrans.prop('msg_estados_error'), "error");

		    }

		});

	}


	function _setupStatesLayer(polygons, array_items, id_div){

	    console.log("_setupStatesLayer");


	    var geojsonFeature =  { "type": "FeatureCollection",
	      "features": polygons};

	    layer_temp = L.geoJson(geojsonFeature, {
	      	
	      	style: geojsonStyleDefault,
	      
	      	onEachFeature: function (feature, layer) {

		        layer.on("mouseover", function (e) {
		          layer.setStyle(geojsonMouseOverStyle);
		        });

		        layer.on("mouseout", function (e) {
		            layer.setStyle(geojsonStyleDefault); 
		        });

		        layer.on("click", function (e) {
		          	
		          	// actualiza seleccion y deselección de elementos
			        for(i=0; i<array_items.length; i++){

			            if (array_items[i].cve == feature.properties.cve){

			              if(array_items[i].selected == true){

			                array_items[i].layer.setStyle(geojsonStyleDefault);
			                array_items[i].layer.on("mouseout", function (e) {
			                                  layer.setStyle(geojsonStyleDefault); 
			                              });
			                array_items[i].layer.on("mouseover", function (e) {
			                                layer.setStyle(geojsonMouseOverStyle);
			                              });
			                array_items[i].selected = false;

			                $('#'+id_div).jstree(true).deselect_node(feature.properties.cve);

			              }
			              else{
			                array_items[i].layer.setStyle(geojsonHighlightStyle);
			                array_items[i].layer.off('mouseout');
			                array_items[i].layer.off('mouseover');
			                array_items[i].selected = true; 

			                $('#'+id_div).jstree(true).select_node(feature.properties.cve);

			              }
			              break;
			            }
			        }

	        	});

		        // popup al dar clic
		        // layer.bindPopup(feature.properties.state);

		        array_items.push({
		          "layer"   : layer,
		          "cve"   : feature.properties.cve,
		          "selected"  : false
		        });

	      	}

	    });

	    console.log("_setupStatesLayer2x");

	    return [layer_temp, array_items];

	}

	function _setupJSTree(tree_elements, id_div, root_name, array_items){

		var tree_states = [{
		    "id": root_name,
		    "text": root_name,
		    'state' : {
		           'opened' : true
		         },
		    "children": tree_elements
		}];

		$('#'+id_div).jstree({
	       	'plugins': ["wholerow", "checkbox"],
	       	'core': {
	           	'data': tree_states,
	           	'themes': {
	               'name': 'proton',
	               'responsive': true
	           	}
	       	}
	   	});

		
		$('#'+id_div).on('changed.jstree', function (e, data) {


		    if(data.node.state.selected){
		        
		        // j1_1 es el id enviado cuando se seleccionan o deseleccionan todos los nodos
		        // WARNING: este identificador cambia cuando se agregan otros arboles a la pagina
		        // if (data.node.id == "j4_1" || data.node.id == "j3_1"){
		      // console.log(/j\d_1/.test(data.node.id));
		      	console.log(data.node.id);
		      
		        if (data.node.id == "Ecoregiones" || data.node.id == "Estados"){
		          

		          	for(i=0; i<array_items.length; i++){

			            array_items[i].layer.setStyle(geojsonHighlightStyle);
			            array_items[i].layer.off('mouseout');
			            array_items[i].layer.off('mouseover');
			            array_items[i].selected = true;
		            
		        	}


			        // ****************************************************************************************************** getting region selected
			          
			        if(data.node.id == "Estados"){

			            if($('#jstree-estados').jstree(true)){

			              	if ($('#jstree-estados').jstree(true).get_top_selected().length > 0){

				                var region_sel = "";
				                var id_region_sel = [];

				                // console.log($('#jstree-estados').jstree(true).get_top_selected());
				                var headers_selected = $('#jstree-estados').jstree(true).get_top_selected().length;
				                  
				                for(i=0; i<headers_selected; i++){
				                  
					                var  node_temp = $('#jstree-estados').jstree(true).get_node($('#jstree-estados').jstree(true).get_top_selected()[i]).original;
					                  // console.log(node_temp);
					                region_sel += " | " + node_temp.text + " | "
					                id_region_sel.push(node_temp.id);

				                }

				                // $ ("#label_region_selected").append("<pre>" + region_sel + "</pre>");
				                // $("#label_region_selected").prop("data-field", id_region_sel);

				                console.log(id_region_sel);
				                // console.log($("#label_region_selected"));
				                // console.log($("#label_region_selected").prop("data-field"));

			              	}
			          	}

			        }

		        }
		        else{

			        for(i=0; i<array_items.length; i++){

			            if (array_items[i].cve == data.node.id){

			              array_items[i].layer.setStyle(geojsonHighlightStyle);
			              array_items[i].layer.off('mouseout');
			              array_items[i].layer.off('mouseover');
			              array_items[i].selected = true;
			              break;
			            }


			        }
		        
		        }
		      
		    }
		    else{

		        // j1_1 es el id enviado cuando se seleccionan o deseleccionan todos los nodos
		        // WARNING: este identificador cambia cuando se agregan otros arboles a la pagina
		      	if (data.node.id == "Ecoregiones" || data.node.id == "Estados"){

			        for(i=0; i<array_items.length; i++){

			            array_items[i].layer.setStyle(geojsonStyleDefault);
			          array_items[i].layer.on("mouseout", function (e) {
			                              e.layer.setStyle(geojsonStyleDefault); 
			                          });
			          array_items[i].layer.on("mouseover", function (e) {
			                            e.layer.setStyle(geojsonMouseOverStyle);
			                          });
			          array_items[i].selected = false;
			            
			          }

		      	}
		      	else{

			        for(i=0; i<array_items.length; i++){

			            if (array_items[i].cve == data.node.id){

			              array_items[i].layer.setStyle(geojsonStyleDefault);
			              array_items[i].layer.on("mouseout", function (e) {
			                                e.layer.setStyle(geojsonStyleDefault); 
			                            });
			              array_items[i].layer.on("mouseover", function (e) {
			                              e.layer.setStyle(geojsonMouseOverStyle);
			                            });
			              array_items[i].selected = false;
			              break;
			            }
			          }
			    }
		    }

		}).jstree();

	}

	function _createSelectionControl(map){
		/***************************************************************** tools for area selection */

		// funcion utilizda para seleccionar una region por herramientas de leaflet.
		// COMENTADO: Aun no ecxiste la fucionalidad para generar una malla a partir de una region seleccioanda.

		L.drawLocal.draw.toolbar.buttons.polygon = 'Selecciona región';
		L.drawLocal.draw.toolbar.buttons.circle = 'Selecciona región';
		L.drawLocal.draw.toolbar.buttons.rectangle = 'Selecciona región';
		L.drawLocal.draw.toolbar.buttons.edit = 'Edita región';

		drawControl = new L.Control.Draw({
		 position: 'topleft',
		 draw: {
		   polyline: false,
		   polygon: {
		     allowIntersection: false,
		     showArea: true,
		     drawError: {
		       color: '#5B7CF4',
		       timeout: 1000
		     },
		     shapeOptions: {
		       color: '#5B7CF4'
		     }
		   },
		   circle: {
		     shapeOptions: {
		       color: '#5B7CF4'
		     }
		   },
		   marker: false,
		   rectangle: {
		     shapeOptions: {
		       color: '#5B7CF4'
		     }
		   }
		 },
		 edit: {
		   featureGroup: drawnItems,
		   remove: true
		 }
		});

		map.on('draw:created', function (e) {
		 var type = e.layerType,
		   layer = e.layer;

		 if (type === 'marker') {
		   layer.bindPopup('A popup!');
		 }

		 drawnItems.addLayer(layer);
		});

		map.on('draw:edited', function (e) {
		 var layers = e.layers;
		 var countOfEditedLayers = 0;
		 layers.eachLayer(function(layer) {
		   countOfEditedLayers++;
		 });
		 console.log("Edited " + countOfEditedLayers + " layers");
		});

	}


	function _regionConfigure(map_module_nicho, language_module_nicho){
		
		_VERBOSE ? console.log("_regionConfigure") : _VERBOSE;

		// _url_trabajo = "http://localhost:8080/snib";

		_language_module_nicho = language_module_nicho;
		_iTrans = _language_module_nicho.getI18();

		_module_toast = toast_module(_VERBOSE);
		_module_toast.startToast();

		_map_module_nicho = map_module_nicho;

		map = _map_module_nicho.getMap();
		_createSelectionControl(map);



		$("#obtiene_estados").click(function(){

			_getStatesLayer();

		});

		$('#panel-tools').on('show.bs.collapse', function (e) {
			
			e.stopPropagation();

			_map_module_nicho.addMapLayer(drawnItems, "Selección");
			_map_module_nicho.addMapControl(drawControl);
			
		});

		$('#panel-tools').on('hide.bs.collapse', function (e) {
			
			e.stopPropagation();

			_map_module_nicho.removeMapLayer(drawnItems);
			_map_module_nicho.removeMapControl(drawControl);

			  
		  // $('#collapseOne').toggleClass("in");
		  // $('#collapseTwo').toggleClass("in");

		});

		$('#panel-region').on('show.bs.collapse', function (e) {
			
			e.stopPropagation();

			try {

			    if(arrayLayerStates.length != 0){

			    	_map_module_nicho.addMapLayer(_states_layer);
			      	// _states_layer.addTo(map);
			      	// layer_control.addOverlay(_states_layer, "Estados"); 
				}

			} 
			catch (e) {
			    console.log("no existe aun el componente states_layer");
			}

			// try {
			//     if(arrayLayerEco.length != 0){
			//       	eco_layer.addTo(map);
			//     	layer_control.addOverlay(eco_layer, "Ecoregiones");
			//     }

			// } catch (e) {
			//     console.log("no existe aun el componente eco_layer");
			// }
			  
		});


		$('#panel-region').on('hide.bs.collapse', function (e) {
			
			e.stopPropagation();

			try {
			    // if(arrayLayerStates.length != 0){
			   	map.removeLayer(_states_layer);
			    // map.removeLayer(_states_layer);
			    // layer_control.removeLayer(_states_layer);
			    // }  
			} 
			catch (e) {
			    console.log("no existe aun el componente _states_layer");
			}

			  // try {
			  //     map.removeLayer(eco_layer);
			  //   layer_control.removeLayer(eco_layer);

			  // } catch (e) {
			  //   console.log("no existe aun el componente eco_layer");
			  // }

			  // $('#collapseOne').toggleClass("in");
			  // $('#collapseTwo').toggleClass("in");
			  
		});




	}

	// funcion pública que inicializa la configuración del mapa
	function startRegion(map_module_nicho, language_module_nicho){
		_VERBOSE ? console.log("startRegion") : _VERBOSE;
		_regionConfigure(map_module_nicho, language_module_nicho);
	}




	return{
		getRegionSelected: getRegionSelected,
		startRegion: startRegion
	}
	
});