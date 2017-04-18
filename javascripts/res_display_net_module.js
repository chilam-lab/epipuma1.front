var res_display_net_module = (function(verbose, url_zacatuche){

	var _url_zacatuche = url_zacatuche;

	var _VERBOSE = verbose;

	var _variable_module_net, _language_module_net, _map_module_net, _net_module, _histogram_module_net, _table_module_net;

	var iTrans;

	var _subgroups;

	var _idFilterGroup;
	var _min_occ;

	var _toastr = toastr;

	var _associativeArray, _arrayLinks, _json_nodes;

	var _TEST;

	var _first_map = true;

	var _tbl_net = false;

	var _ids_componentes_var;

	var _graph_component, _hist_component, _list_component;

	var _legend_groups = [];

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

	// Enlaza a variables globales los módulos previamente inicializados de lenguaje y variable.
	function _initilizeElementsForDisplay(variable_module, language_module, map_module, ids_comp_variables, tipo_modulo, test){

		_VERBOSE ? console.log("_initilizeElementsForDisplay") : _VERBOSE;

		// para realizar pruebas de red sin realizar selección de variables
		_TEST = test;
		test_msg  = "";
		test_msg = (_TEST) ? "*** Testing ***" : "*** Not Testing ***";
		_VERBOSE ? console.log(test_msg) : _VERBOSE;

		_idFilterGroup = 0;
		_tipo_modulo = tipo_modulo;
		_ids_componentes_var = ids_comp_variables;

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

		_language_module_net = language_module;
		_iTrans = _language_module_net.getI18();
		
		// _table_module_net = table_module;
		_variable_module_net = variable_module;
		_map_module_net = map_module;

		var self = this;
		self.NUM_BEANS = 21;

	}

	// Llama a la función que inicializa las variables necesarias para el despliegue de los componentes visuales.
	function startResNetDisplay(variable_module, language_module, map_module, ids_comp_variables, tipo_modulo, test){
		_VERBOSE ? console.log("startResNetDisplay") : _VERBOSE;
		_initilizeElementsForDisplay(variable_module, language_module, map_module, ids_comp_variables, tipo_modulo, test);
	}

	

	function cleanLegendGroups(){

		console.log("cleanLegendGroups");

		_legend_groups = [];
		_idFilterGroup = 0;

	}

	// Genera los filtros que son enviados al servidor basado en los conjuntos de variables de fuente y sumidero seleccionados.
	function getFilters(var_sel_array, grp_type){

		_VERBOSE ? console.log("getFilters") : _VERBOSE;

		_subgroups = var_sel_array;
		var filters = [];
		var side = grp_type;

		console.log(var_sel_array);
		// console.log(side);

		// $.each(var_sel_array, function(index, item_grp){
		// 	console.log(item_grp);	
		// 	// side 			: fuente = 0, sumidero = 1
		// 	// item_grp.type 	: taxon = 0, climatica = 1, tpografica = 2
		// 	// item_grp.title 	: nombre grupo
		// });


		
		_subgroups.forEach(function(grupo){
	        
	        _VERBOSE ? console.log(grupo) : _VERBOSE;
	        _idFilterGroup++;

	        // se añade titulo para labels
	        _legend_groups.push({"side":side, "tipo":grupo.type, "label":grupo.title, "idgrp":_idFilterGroup});
	        
	        var hasChildren = false;
	        
	        if(grupo.value.length > 1){
	            hasChildren = true;
	        }

	        
	        grupo.value.forEach(function(item){

	            itemGroup = item;
	            _VERBOSE ? console.log(itemGroup) : _VERBOSE;

	            
	            // bioticos
	            if(grupo.type == 0){

	                temp_item_field = itemGroup.label.toString().split(">>")[0].toLowerCase().trim();
	                temp_item_value = itemGroup.label.toString().split(">>")[1].trim();
	                temp_item_parent = itemGroup.parent ? itemGroup.parent : "";

	                _VERBOSE ? console.log(_reino_campos[temp_item_field]) : _VERBOSE;

	                _VERBOSE ? console.log(temp_item_field) : _VERBOSE;
	                _VERBOSE ? console.log(temp_item_value) : _VERBOSE;

	                filters.push({
	                    'field' : _reino_campos[temp_item_field],
	                    'value' : temp_item_value,
	                    'type'  : itemGroup.type,
	                    'parent': temp_item_parent,
	                    "fGroupId" : _idFilterGroup,
          				"grp" : grp_type
	                    // 'level' : parseInt(itemGroup.level)
	                });

	            }
	            // raster: bioclim, topo, elevacion y pendiente
	            else{
	                // if the type is not equal to 4 the item contains the parameter level
	                temp_item_value = itemGroup.label.split(">>")[1].trim();
	                _VERBOSE ? console.log(temp_item_value) : _VERBOSE;

	                filters.push({
	                    'value' : itemGroup.value,
	                    'type'  : itemGroup.type,
	                    'level' : parseInt(itemGroup.level),
	                    'label' : temp_item_value,
	                    "fGroupId" : _idFilterGroup,
          				"grp" : grp_type
	                });

	            }

	        });

	    });

		_VERBOSE ? console.log(filters) : _VERBOSE;




		// ****  TODO: utilzar est arreglo para ligar la leyenda de nodos **** 
		console.log(_legend_groups);


		return filters;

	}

	// Obtiene las especies (nodos) y los enlaces (links) de las especies conectadas por épsilon así como llamar a la función que construye la red a partir de estos datos
	function createLinkNodes(s_filters, t_filters, min_occ){

		_VERBOSE ? console.log("createLinkNodes") : _VERBOSE;

		// obtinene e numero minimo de interaciones entre las especies
		_min_occ = min_occ;

		var hasBiosSource = false;
		var hasRasterSource = false;

		var hasBiosTarget = false;
		var hasRasterTarget = false;

		if(_TEST){

			_VERBOSE ? console.log("Testing...") : _VERBOSE;

			// static files used to test the changes, it's in order to avoid input values each time that some features are changed.
		    
		    d3.json("/javascripts/nodes_test.json", function(error, json_file) {
		    // d3.json("/javascripts/nodes_mammalia.json", function(error, json_file) {
		    // d3.json("/javascripts/nodes_mammalia_amphibia.json", function(error, json_file) {
		      	_json_nodes = json_file;

		      	d3.json("/javascripts/links_test.json", function(error, json_temp) {
		      	// d3.json("javascripts/links_mammalia.json", function(error, json_temp) {
		      	// d3.json("javascripts/links_mammalia_amphibia.json", function(error, json_temp) {
		        
		        	_arrayLinks = json_temp;
		        	_createGraph(_arrayLinks, s_filters, t_filters);

		      	});

		    });

		}
		else{

			
		  	
			if(s_filters.length == 0 || t_filters.length == 0){

				_toastr.warning(_iTrans.prop('lb_sin_filtros'));

				return;

			}

			for (var i = 0; i < s_filters.length; i++){
				if(s_filters[i].type == 4){
					hasBiosSource = true;
				}
				else{
					hasRasterSource = true;
				}
			}

			for (var i = 0; i < t_filters.length; i++){
				if(t_filters[i].type == 4){
					hasBiosTarget = true;
				}
				else{
					hasRasterTarget = true;
				}
			}
			    

			milliseconds = new Date().getTime();
			  
			d3.json(_url_zacatuche + "/niche/getNodes")
			    .header("Content-Type", "application/json")
			    .post(
			        JSON.stringify({
			          	qtype: "getNodes", 
			          	s_tfilters: s_filters, 
			          	t_tfilters: t_filters,
			          	hasbiosource:hasBiosSource,
			          	hasrastersource:hasRasterSource,
			          	hasbiotarget:hasBiosTarget,
			          	hasrastertarget:hasRasterTarget,
		                min_occ: _min_occ
			      	}),
			        function (error, resp){
			          
			          	if (error) throw error;

			          	var json = resp.data;
			          	
			          	_createNodeDictionary(json, s_filters, t_filters);

			          	console.log(json);
			          
			          	
			          	// it ensures that the dictionary of nodes is created before the link list is recived.
			          	d3.json(_url_zacatuche + "/niche/getEdges")
			            	.header("Content-Type", "application/json")
			            	.post(
			              		JSON.stringify({
				                qtype: "getEdges", 
				                s_tfilters: s_filters, 
				                t_tfilters: t_filters,
				                hasbiosource:hasBiosSource,
					          	hasrastersource:hasRasterSource,
					          	hasbiotarget:hasBiosTarget,
					          	hasrastertarget:hasRasterTarget,
				                ep_th: 0.0,
				                min_occ: _min_occ
				            }),
				            function (error, resp){
				                
				                if (error) throw error;

				                var json = resp.data;

				                _createLinkDictionary(json);


				                console.log(json);

				                console.log(_arrayLinks);

				                // _VERBOSE ? console.log(JSON.stringify(_arrayLinks)) : _VERBOSE; // necesario para generar archivo para testing

				                // if(_arrayLinks.length > 10000){
							    //   _toastr.warning("Numero de aristas exceden memoria del explorador, intente un relación mas pequeña");
							    //   return;
							    // }
						      
						      	max_eps = d3.max(_arrayLinks.map(function(d) {return d.value;}));
						      	min_eps = d3.min(_arrayLinks.map(function(d) {return d.value;}));

						      	_createGraph(_arrayLinks, s_filters, t_filters);

				            });

			        });

		}

	}

	// Genera un arreglo asociativo de los nodos con su índice para llevar acabo la relación con el conjunto de enlaces.
	function _createNodeDictionary(json, s_filters, t_filters){

	  	_VERBOSE ? console.log("_createNodeDictionary") : _VERBOSE;  

	  	_associativeArray = {};

	  	map_node = d3.map([]);

	  	$.each(json, function(i,item){
	      
	      map_node.set(item.spid, item);
	  	});
	  
	  	// each node id has an index, 87456 -> 1, 87457 -> 2, ...
	  	$.each(map_node.values(), function(i,item){
	    	item["index"] = i;
	    	_associativeArray[item.spid] =  item;
	  	});

	  	// Saving nodes for future issues, and with index added.
	  	_json_nodes = map_node.values();

	  	console.log(_associativeArray);

	  	// _VERBOSE ? console.log(JSON.stringify(_json_nodes)) : _VERBOSE; // necesario para generar archivo para testing
	  	

	  	// funcion que asigna el color a los nodos
	  	_getColorFilterGroups(_json_nodes, s_filters, t_filters);

	}

	// Enlaza los nodos a cada enlace utilizando el arreglo asociativo generado por _createNodeDictionary.
	function _createLinkDictionary(json_file){

	  	_VERBOSE ? console.log("_createLinkDictionary") : _VERBOSE;
	  	_arrayLinks = [];
	  
	  	// replacing node id with the index of the node array
	  	$.each(json_file, function(i,item){

		    associativeLinkArray = {}
		    associativeLinkArray[ "source" ] = _associativeArray[ json_file[i].source ].index;

		    associativeLinkArray[ "nij" ] = json_file[i].nij;
		    associativeLinkArray[ "nj" ] = json_file[i].nj;
		    associativeLinkArray[ "ni" ] = json_file[i].ni;
		    associativeLinkArray[ "n" ] = json_file[i].n;

		    associativeLinkArray[ "source_node" ] = _associativeArray[ json_file[i].source ];

		    associativeLinkArray[ "target" ] = _associativeArray[ json_file[i].target ].index;
		    associativeLinkArray[ "target_node" ] = _associativeArray[ json_file[i].target ];
		    associativeLinkArray[ "value" ] = json_file[i].value;

		    _arrayLinks.push(associativeLinkArray);

	  	});

	}

	
	// Inicializa los módulos de red, histograma y tabla para generar los componentes visuales así como la conexión entre estos módulos para generar la interacción integrada. 
	function _createGraph(arrayTemp, s_filters, t_filters){

		_VERBOSE ? console.log("_createGraph") : _VERBOSE;

		$("#graph").empty();
		$("#hist").empty();
		
		document.getElementById("tbl_hist_comunidad").style.display = "inline";
		document.getElementById("map_panel").style.display = "inline";
		// document.getElementById("graph_map_comunidad").style.display = "inline";
		document.getElementById("hist_map_comunidad").style.display = "inline";


		// se carga mapa, controles y grid
		if(_first_map){
			_map_module_net.startMap(_language_module_net, _tipo_modulo, null);	
			_first_map = false;
		}
		

		var json = {"nodes":_json_nodes, "links":arrayTemp};  

		// verica que existan enlaces, reademás resuelve problema de genero vacio en queries
		if(arrayTemp.length == 0){

			_VERBOSE ? console.log(json) : _VERBOSE;
			_toastr.warning(_iTrans.prop('lb_nolinks'));
			return;

		}		
		
		_configFilters(json);

		console.log(json);

		_net_module = net_module(_VERBOSE, _url_zacatuche, _map_module_net);
		_net_module.startNet(_language_module_net, s_filters, t_filters);
		_net_module.setLanguageModule(_language_module_net);
		_net_module.setLegendGroup(_legend_groups);
		
		
		_graph_component = _net_module.createNet(json, this);
		// _graph_component = _net_module.createNetWebGL(json, this);
		

		_histogram_module_net = histogram_module(_VERBOSE);
		_histogram_module_net.startHistogramModule();
		_histogram_module_net.setLanguageModule(_language_module_net);
		_hist_component = _histogram_module_net.createBarChartNet(json, this);


		_table_module_net = table_module(_url_trabajo);
		_table_module_net.startTableModule(_tbl_net);
		_table_module_net.setLanguageModule(_language_module_net);
		_list_component = _table_module_net.createListNet(json, this);

		_tbl_net = true;
		// // _table_module_net.setTblNet(true);

		self.renderAll();

		// $( ".ui-menu .ui-menu-item" ).css( "color", "black" );

		
		adjust = $(window).height() + 60;
	  	_VERBOSE ? console.log("adjust: " + adjust) : _VERBOSE;
	  	$("html, body").animate({ scrollTop: ( adjust / 3 ) }, 1000);


	  	// $("#relation-list").css({"margin-top":"10px"});
	  	

	  	// Verificar si se desea agregar la interacción por selección de estados
		// loadStatesLayer();

	}

	// Inicializa una instancia de crossfilter para generar la relación de la información entre la red, el histograma y la tabla de relaciones.
	function _configFilters(json){

		_VERBOSE ? console.log("_configFilters") : _VERBOSE;

		self.nestByR = d3.nest().key(function(d) { return d.value });
		self.epsilon_beans = d3.range(1, self.NUM_BEANS, 1);

	    var min_eps = d3.min(json.links.map(function(d) {return parseFloat(d.value);}));
	    var max_eps = d3.max(json.links.map(function(d) {return parseFloat(d.value);}));

	    console.log("min_eps: " + min_eps);
	    console.log("max_eps: " + max_eps);

	  	self.epsRange = d3.scale.quantile().domain([min_eps, max_eps]).range(epsilon_beans);
	    
		self.links_sp = crossfilter(json.links);
	    self.all = links_sp.groupAll();
	    
	    self.dim_eps_freq = self.links_sp.dimension(function(d) { return parseFloat(d.value); });
	    self.group_eps_freq = dim_eps_freq.group(function(d) { return self.epsRange(d);});

	    self.dim_src = self.links_sp.dimension(function(d) { return d; });
	    self.group_eps_spname = dim_src.group();

	    self.dim_node_state = self.links_sp.dimension(function(d) { return d;  });


	    self.margin = {top: 5, right: 20, bottom: 30, left: 20};
	    self.width = $("#hist").width() - self.margin.left - self.margin.right;
	    self.height = $("#hist").height() - self.margin.top - self.margin.bottom;
	    self.x = d3.scale.ordinal().rangeRoundBands([self.margin.left, self.width - self.margin.left], .1);

	    self.ep_th = 2.0;

	}

	// Actualiza la red, el histograma y la tabla cuando ha ocurrido una selección del histograma.
	self.renderAll = function ()  {
	    
	    _VERBOSE ? console.log("renderAll") : _VERBOSE; 
	    

	    _graph_component.each(_render);
	    _hist_component.each(_render);
	    _list_component.each(_render);

	}

	function _render(method) {
	    
	    _VERBOSE ? console.log("render") : _VERBOSE;
	  	d3.select(this).call(method);

	}

	// Asigna un índice a cada conjunto de variables seleccionados tanto en fuente como en sumidero.
	function _getColorFilterGroups(json, s_filters, t_filters){

	  	_VERBOSE ? console.log("_getColorFilterGroups") : _VERBOSE;
	  
	  	var filters = s_filters.concat(t_filters);
	  	console.log(filters);
	  	
	  	// _VERBOSE ? console.log(json) : _VERBOSE;
	  	_VERBOSE ? console.log(s_filters) : _VERBOSE;
	  	_VERBOSE ? console.log(t_filters) : _VERBOSE;

	  
	  	$.each(filters, function(i,item){
	    
		    if(filters[i].type == 4){

		      	$.each(json, function(j,item){

		        // _VERBOSE ? console.log(filters[i].field) : _VERBOSE;

			        switch(filters[i].field){

			          case "reinovalido":
			            if(json[j].reinovalido == filters[i].value){
			              if(!json[j].group){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 6;
			              }
			              else if(json[j].stage > 6){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 6;
			              }
			            }
			            break;
			          case "phylumdivisionvalido":
			            if(json[j].phylumdivisionvalido == filters[i].value){
			              if(!json[j].group){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 5;
			              }
			              else if(json[j].stage > 5){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 5;
			              }
			            }
			            break;
			          case "clasevalida":
			            if(json[j].clasevalida == filters[i].value){
			              if(!json[j].group){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 4;
			              }
			              else if(json[j].stage > 4){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 4;
			              }
			            }
			            break;
			          case "ordenvalido":
			            if(json[j].ordenvalido == filters[i].value){
			              if(!json[j].group){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 3;
			              }
			              else if(json[j].stage > 3){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 3;
			              }
			            }
			            break;
			          case "familiavalida":
			            if(json[j].familiavalida == filters[i].value){
			              if(!json[j].group){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 2;
			              }
			              else if(json[j].stage > 2){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 2;
			              }
			            }
			            break;
			          case "generovalido":
			            if(json[j].generovalido == filters[i].value){
			              
			              if(!json[j].group){
			                json[j].group = filters[i].fGroupId;
			                json[j].stage = 1;
			              }
			              else if(json[j].stage > 1){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 1;
			              }   
			            }
			            break;

			          case "especievalidabusqueda":
			            
			            if(json[j].label.split(" ")[1] == filters[i].value){
			              if(!json[j].group){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 0;
			              }
			              else if(json[j].stage > 0){
			                  json[j].group = filters[i].fGroupId;
			                  json[j].stage = 0;
			              }
			            }
			            break;
			        
			        }
		      
		      	});
		  
		    }
		    else{

		      	_VERBOSE ? console.log(filters[i].value) : _VERBOSE;
		      	_VERBOSE ? console.log(filters[i].type) : _VERBOSE;

		      	$.each(json, function(j,item){

			        if(json[j].reinovalido == "Animalia" || json[j].reinovalido == "Plantae" || json[j].reinovalido == "Fungi"
			          || json[j].reinovalido == "Prokaryotae" || json[j].reinovalido == "Protoctista")
			          return true;

		        	switch(filters[i].level){

			          	case 0:
				            // _VERBOSE ? console.log(json_nodes[j].reinovalido) : _VERBOSE;
				            json[j].group = filters[i].fGroupId;
				            json[j].stage = 2;

				            break;

			          	case 1:
				            if(json[j].reinovalido == filters[i].value){
				              
				              if(!json[j].group){
				                  json[j].group = filters[i].fGroupId;
				                  json[j].stage = 1;
				              }
				              else if(json[j].stage > 1){
				                  json[j].group = filters[i].fGroupId;
				                  json[j].stage = 1;
				              }

				            }
				              // json[j].group = filters[i].fGroupId;
				            break;

			          	case 2:
				            if(json[j].spid == filters[i].value){

				              if(!json[j].group){
				                  json[j].group = filters[i].fGroupId;
				                  json[j].stage = 0;
				              }
				              else if(json[j].stage > 0){
				                  json[j].group = filters[i].fGroupId;
				                  json[j].stage = 0;
				              }

				            }
				              // json[j].group = filters[i].fGroupId;
				            break;
		        
		        	}
		      
		      	});

		    }
	  
	  	});

	}

	// Actualiza los labels del sistema de comunidad cuando es detectado un cambio de idioma por el modulo de lenguaje.
	function updateLabels(){

		_VERBOSE ? console.log("updateLabels display net") : _VERBOSE;

		_ids_componentes_var.forEach(function(item,index){

			$("#btn_variable_" + item).text($.i18n.prop('btn_variable') + " ");
			$("#btn_variable_" + item).append('<span class="caret"></span>');

			$("#btn_variable_bioclim_" + item).text($.i18n.prop('btn_variable_bioclim') + " ");
			$("#btn_variable_bioclim_" + item).append('<span class="caret"></span>');

			$("#btn_topo_" + item).text($.i18n.prop('btn_topo') + " ");
			$("#btn_topo_" + item).append('<span class="caret"></span>');

			$("#a_taxon_" + item).text($.i18n.prop('a_taxon'));
			$("#a_clima_" + item).text($.i18n.prop('a_clima'));
			$("#a_topo_" + item).text($.i18n.prop('a_topo'));


			$("#a_item_reino_" + item).text($.i18n.prop('a_item_reino'));
			$("#a_item_phylum_" + item).text($.i18n.prop('a_item_phylum'));
			$("#a_item_clase_" + item).text($.i18n.prop('a_item_clase'));
			$("#a_item_orden_" + item).text($.i18n.prop('a_item_orden'));
			$("#a_item_familia_" + item).text($.i18n.prop('a_item_familia'));
			$("#a_item_genero_" + item).text($.i18n.prop('a_item_genero'));

			$("#btn_variable_bioclim_time_" + item).text($.i18n.prop('btn_variable_bioclim_time') + " ");
			$("#btn_variable_bioclim_time_" + item).append('<span class="caret"></span>');

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

		})

		$("#yaxis_net").text($.i18n.prop('lb_frecuencia'));
		$('#relation-list tr:eq(0) th:eq(0)').text($.i18n.prop('lb_fuente_tbl'));
		$('#relation-list tr:eq(0) th:eq(1)').text($.i18n.prop('lb_sumidero_tbl'));
		// $('#relation-list tr:eq(0) th:eq(2)').text($.i18n.prop('lb_bioclim'));

		$("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));

		$("#pararRed").attr("title", $.i18n.prop('lb_detener_net'));
		$("#center_view_btn").attr("title", $.i18n.prop('lb_centrar_net'));
		$("#input_text_search").attr("placeholder", $.i18n.prop('lb_buscar_sp'));
		$("#export_btn").attr("title", $.i18n.prop('lb_exportar_net'));

		$("#info_text_net").text($.i18n.prop('lb_info_net'));

		$("#title_barnet").text($.i18n.prop('titulo_hist_eps'));

		
		// $("#csv_request").attr("title", $.i18n.prop('lb_descarga_tbl'));
		// $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));
		
	}

	

	return{
		startResNetDisplay: startResNetDisplay,
		getFilters: getFilters,
		createLinkNodes: createLinkNodes,
		renderAll: renderAll,
		updateLabels: updateLabels,
		cleanLegendGroups: cleanLegendGroups
	}
	
});