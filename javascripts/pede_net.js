// Module Reveal Pattern
var module_net = (function (){

	
	// Por default el sistema envia a producción
	var _AMBIENTE = 1,
		_TEST = false;
	var _VERBOSE = true;

	_VERBOSE ? console.log("*** loading module_net... ***") : _VERBOSE;

	var _map_module_net,
		_variable_module_net,
		_language_module_net,
		_res_display_module_net;
		

	// DESARROLLO
	// var _url_trabajo = "http://geoportal.conabio.gob.mx/niche?", 
	// 	_url_nicho = "http://geoportal.conabio.gob.mx/charlie_dev/geoportal_v0.1.html",
	// 	_url_comunidad = "http://geoportal.conabio.gob.mx/charlie_dev/comunidad_v0.1.html";

	// PRODUCCION
	// var _url_trabajo = "http://geoportal.conabio.gob.mx/niche2?", 
	// 	_url_nicho = "http://geoportal.conabio.gob.mx/charlie/geoportal_v0.1.html",
	// 	_url_comunidad = "http://geoportal.conabio.gob.mx/charlie/comunidad_v0.1.html";

	// TEMPORAL DESARROLLO
	var _url_trabajo = "http://species.conabio.gob.mx/niche?", 
		_url_nicho = "http://species.conabio.gob.mx/c3/charlie_dev/geoportal_v0.1.html",
		_url_comunidad = "http://species.conabio.gob.mx/c3/charlie_dev/comunidad_v0.1.html";

	var _url_zacatuche = "http://species.conabio.gob.mx/niche3";

	// TEMPORAL PRODUCCION
	// var _url_trabajo = "http://species.conabio.gob.mx/niche2?", 
	// 	_url_nicho = "http://species.conabio.gob.mx/geoportal_v0.1.html",
	// 	_url_comunidad = "http://species.conabio.gob.mx/comunidad_v0.1.html";


	var _url_geoserver = "http://geoportal.conabio.gob.mx:80/geoserver/cnb/wms?",
		_workspace = "cnb";

	var	_NEG_DECIL = true,
		_ADD_TOTAL = false,
		_TOTALS_NAME = "Total",
		_DELETE_STATE_POINTS = false,
		_REQUESTS = 0,
	 	_ITER_REQUESTS = 0,
	 	_GROUP_REQUEST = 0,
		_NUM_SECTIONS = 9;

	var _fathers = [],
	 	_sons = [];
	 	// _validationPoints = d3.map([]);

	

	var _dataChartValSet = [],
		_cell_set = d3.map([]),
		_discarded_cell_set = d3.map([]);
		// _subgroups;
	


	var _toastr = toastr;
	var _iTrans;
	var _tipo_modulo;

	var _componente_fuente;
	var _componente_sumidero;

	var TIPO_FUENTE = 0,
		TIPO_SUMIDERO = 1;
	
	$("#net_link").click(function(){
	  	window.location.replace(_url_nicho);
	});
	

	// metodo de inicialización de componentes necesarios en la primera pantalla del sistema
	function _initializeComponents(){

		_VERBOSE ? console.log("_initializeComponents") : _VERBOSE;

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

		$("#generaRed").click(function(e){
			
			_VERBOSE ? console.log("generaRed") : _VERBOSE;
			_VERBOSE ? console.log(_componente_fuente.getVarSelArray()) : _VERBOSE;
			_VERBOSE ? console.log(_componente_sumidero.getVarSelArray()) : _VERBOSE;
			
			tipo_fuente = 0;

			var min_occ = parseInt($("#occ_number").val());

			_res_display_module_net.cleanLegendGroups();

			s_filters = _res_display_module_net.getFilters(_componente_fuente.getVarSelArray(), TIPO_FUENTE);
			t_filters = _res_display_module_net.getFilters(_componente_sumidero.getVarSelArray(), TIPO_SUMIDERO);

			_res_display_module_net.createLinkNodes(s_filters, t_filters, min_occ);

		});	



		document.getElementById("tbl_hist_comunidad").style.display = "none";
		document.getElementById("map_panel").style.display = "none";
		// document.getElementById("graph_map_comunidad").style.display = "none";
		document.getElementById("hist_map_comunidad").style.display = "none";

		
		



	}


	function startModule(ambiente, tipo_modulo){

		
		_AMBIENTE = ambiente;
		_VERBOSE = verbose;

		console.log("_AMBIENTE: " + _AMBIENTE);
		console.log("_VERBOSE: " + _VERBOSE);


		_VERBOSE ? console.log("startModule NET") : _VERBOSE;

		_tipo_modulo = tipo_modulo;
		
		if (_AMBIENTE != 1){

			_VERBOSE ? console.log("** AMBIENTE LOCAL **") : _VERBOSE;

		  	_url_trabajo = "http://localhost:3000/";
		  	_url_zacatuche = "http://localhost:8080";

		  	_url_geoserver = "http://localhost:8080/geoserver/conabio/wms?";
		  	_workspace = "conabio";
		  	_url_nicho = "http://localhost:3000/geoportal_v0.1.html";
		  	_url_comunidad = "http://localhost:3000/comunidad_v0.1.html";
		} 
		else{

			_VERBOSE ? console.log("** AMBIENTE PRODUCCIÓN **") : _VERBOSE;
		}


		// Se cargan los archivos de idiomas y depsues son cargados los modulos subsecuentes
		// _VERBOSE ? console.log(this) : _VERBOSE;
		_language_module_net = language_module(_VERBOSE);
		_language_module_net.startLanguageModule(this, _tipo_modulo);


	}

	function loadModules(){

		_VERBOSE ? console.log("loadModules") : _VERBOSE;


		_iTrans = _language_module_net.getI18();

		_map_module_net = map_module(_url_trabajo, _url_geoserver, _workspace, _VERBOSE, _url_zacatuche);

		// un id es enviado para diferenciar el componente del grupo de variables en caso de que sea mas de uno (caso comunidad)
		_variable_module_net = variable_module(_url_trabajo, _VERBOSE, _url_zacatuche);
		_variable_module_net.startVar(0, _language_module_net, _tipo_modulo);

		// creación dinámica de selector de variables
		var ids_comp_variables = ['fuente','sumidero'];
		_componente_fuente = _variable_module_net.createSelectorComponent("div_seleccion_variables_fuente", ids_comp_variables[0], "lb_fuente");
		_componente_sumidero = _variable_module_net.createSelectorComponent("div_seleccion_variables_sumidero", ids_comp_variables[1], "lb_sumidero");

		_res_display_module_net = res_display_net_module(_url_trabajo, _VERBOSE, _url_zacatuche);
		_res_display_module_net.startResNetDisplay(_variable_module_net, _language_module_net, _map_module_net, ids_comp_variables, _tipo_modulo, _TEST);


		_language_module_net.addModuleForLanguage(_res_display_module_net, null, _map_module_net, _variable_module_net);

		
		_initializeComponents();

	}


	// retorna solamente un objeto con los miembros que son públicos.
	return {
		startModule:startModule,
		loadModules: loadModules 
	};


})();


$(document).ready(function(){

	// verbose por default es true
	verbose = true;

	// 0 local, 1 producción
	ambiente = 0;
	// 0 nicho, 1 comunidad
	modulo = 1;
	module_net.startModule(ambiente, modulo, verbose);
	

});