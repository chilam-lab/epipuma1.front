
// Module Reveal Pattern
var module_nicho = (function (){

	
	// $('#map').css({'width':($(window).width()+100)+'px'}); 

	// Por default el sistema envia a producción
	var _AMBIENTE = 1,
		_TEST = false,
		_tipo_modulo;
	var _VERBOSE = true;

	_VERBOSE ? console.log("*** loading module_nicho... ***"): _VERBOSE;

	var _map_module_nicho,
		_variable_module_nicho,
		_res_display_module_nicho,
		_region_module_nicho,
		_table_module,
		_histogram_module_nicho,
		_language_module_nicho,
		_module_toast;
		// _validation_module;

	var _componente_fuente;

	var _url_front, _url_api;

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

	var _iTrans;
	
	
	// Enlaza funcionalidades a los componentes visuales del sistema de nicho. 
	// * Checkbox que activa el proceso de validación
	// * Botón para ir al sistema de comunidad.
	// * Funcionalidad de autocompletar input de categoría taxonómica.
	// * Botón que realiza las peticiones de los diferentes cálculos en los módulos.
	function _initializeComponents(){

		_VERBOSE ? console.log("_initializeComponents"): _VERBOSE;


		$("#lb_do_apriori").text("No");
		$("#lb_mapa_prob").text("No");

		// inicilizando slider
		$(function() {
			$( "#sliderValidation" ).slider({
			    disabled: true,
			    min: 0,
			    max: 100,
			    step: 10,
			    value: 70,
			    change: function( event, ui ) {
			      	// _VERBOSE ? console.log(ui.value): _VERBOSE;
			      	$("#labelValidation").text( ui.value + "%");
			      	_module_toast.showToast_BottomCenter(_iTrans.prop('lb_porcentaje_test', ui.value, (100 - ui.value)), "info");

			    }
			});
		});


		$(function() {
			
			var year = parseInt(new Date().getFullYear());
			// obtnego el proximo numero divisible entre 10. 2016 -> 2020; 2017 -> 2020; 2021 -> 2030
			year = Math.round(year / 10) * 10;
			console.log(year);

			$( "#sliderFecha" ).slider({
			    range: true,
			    min: 1500,
			    max: year,
			    step: 10,
			    values: [1500, year],
			    change: function( event, ui ) {

			      	_VERBOSE ? console.log(ui.values): _VERBOSE;

			      	var value =  ui.values[1];
			      	if(value == year){
			      		value = "Actual";
			      	}

			      	$("#labelFecha").text(ui.values[0] + "-" + value);


			      	if($( "#reload_map" ).hasClass( "btn-primary" ) && _map_module_nicho.get_specieTarget() ){

			      		_module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
	        			$("#reload_map").addClass('btn-success').removeClass('btn-primary');	

			      	}
			      	


			      	_module_toast.showToast_BottomCenter(_iTrans.prop('lb_rango_fecha', ui.values[0], value), "info");

			    }
			});


		});



		function forceNumeric(){
		    var $input = $(this);
		    $input.val($input.val().replace(/[^\d]+/g,''));
		}
		$('body').on('propertychange input', 'input[type="number"]', forceNumeric);


		// link generado
		genLinkURL();

	}


	// checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
	$("#chkValidation").click(function(event){

		var $this = $(this);

		if ($this.is(':checked')) {
	        
	        

	        $( "#sliderValidation" ).slider( "enable" );	        

	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_act'), "info");



	    } else {
	        
	        // _VERBOSE ? console.log("no checked"): _VERBOSE;
	        $( "#sliderValidation" ).slider({
	          disabled: true
	        });	        

	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_des'), "info");

	    }

	});


	// checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
	$("#chkMinOcc").click(function(event){

		var $this = $(this);

		if ($this.is(':checked')) {
	        
	        $( "#occ_number" ).prop( "disabled", false );	        
	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_act'), "info");

	    } 
	    else {
	        
	        $( "#occ_number" ).prop( "disabled", true );	        
	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_des'), "info");

	    }

	});

	// checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
	$("#chkFecha").click(function(event){

		var $this = $(this);

		if ($this.is(':checked')) {
	        // $( "#sliderFecha" ).slider( "enable" );	
	        $("#lb_sfecha").text("Sí");        

	        if( $( "#reload_map" ).hasClass( "btn-primary" ) && _map_module_nicho.get_specieTarget() ){

	        	_module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
		        $("#reload_map").addClass('btn-success').removeClass('btn-primary');

	        }

	        

	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha'), "info");


	    } else {
	        
	        // $( "#sliderFecha" ).slider({
	        //   disabled: true
	        // });	     
	        $("#lb_sfecha").text("No");   

	        if( $( "#reload_map" ).hasClass( "btn-primary" ) && _map_module_nicho.get_specieTarget() ){

	        	_module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
		        $("#reload_map").addClass('btn-success').removeClass('btn-primary');

	        }
	        
	        
	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha_des'), "info");

	    }

	});


	
	// checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
	$("#chkApriori").click(function(event){

		var $this = $(this);

		if ($this.is(':checked')) {
			$("#lb_do_apriori").text("Sí");
	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_apriori_act'), "info");

	    } else {
	    	$("#lb_do_apriori").text("No");
	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_apriori_desc'), "info");
	    }

	});



	// checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
	$("#chkMapaProb").click(function(event){

		var $this = $(this);

		if ($this.is(':checked')) {
			$("#lb_mapa_prob").text("Sí");
	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_mapprob_act'), "info");

	    } else {
	    	$("#lb_mapa_prob").text("No");
	        _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_mapprob_des'), "info");
	    }

	});


	// deshabilita controles temporales
	$("#chkFecha").prop('disabled',true);
	
	$("#sliderFecha").slider({
		disabled: true
	});	        




	// enalce para redirigirse al el modulo de comunidad
	$("#nicho_link").click(function(){
	  window.location.replace(_url_front + "/comunidad_v0.1.html");
	});

	var xhr;

	// funcionalidad del componente de selección de especie (Especie objetivo)
	$("#nom_sp").autocomplete({

		source : function (request, response){

		 	var url_ƒtrabajo_temp = "http://localhost:8080/snib";

		 	// xhr.abort();
		    
		    $.ajax({

		      	url: _url_api + "/niche/especie",
		      	dataType : "json",
		        type: "post",
		      	data : {
		      		qtype : 'getEntList',
		      		searchStr : request.term,
		      		nivel : 'especievalidabusqueda', // parametro default para nivel taxonomico, Nota migrar a nive variable como en target
		      		source : 1 // source para saber si viene de objetivo o el target

			        
			        // limit : 30,
			        // start : 0,
		      	},
		        success : function (resp){

		        	// _VERBOSE ? console.log(data): _VERBOSE;
			        
			        response($.map(resp.data, function (item){
			            
			            // _VERBOSE ? console.log(item): _VERBOSE;
			            // _VERBOSE ? console.log(item.especievalidabusqueda): _VERBOSE;

			            return{
			              label   	: item.especievalidabusqueda,
			              id    	: item.spid,
			              reino     : item.reinovalido,
			              phylum    : item.phylumdivisionvalido,
			              clase     : item.clasevalida,
			              orden     : item.ordenvalido,
			              familia   : item.familiavalida,
			              genero    : item.generovalido,
			              especie   : item.especievalidabusqueda
			            };
			          })
			        );
		      	}
		    });



		},
		minLength : 2,
		change : function (event, ui){
			    if (!ui.item){
			      $("#nom_sp").val("");
			    }
		},
		select : function (event, ui){
		      	// _VERBOSE ? console.log(ui.item): _VERBOSE;
		      	var specie_target = {
		      			"reino":ui.item.reino, 
		      			"phylum":ui.item.phylum, 
		      			"clase":ui.item.clase, 
		      			"orden":ui.item.orden, 
		      			"familia":ui.item.familia,
		      			"genero":ui.item.genero, 
		      			"especie":ui.item.especie, 
		      			"spid":ui.item.id, 
		      			"label":ui.item.label
		      	};

		      	_VERBOSE ? console.log(specie_target): _VERBOSE;

		      	_map_module_nicho.set_specieTarget(specie_target);
		    	_map_module_nicho.busca_especie(false);

		    	_module_toast.showToast_CenterCenter(_iTrans.prop('lb_occ_cargado'), "info");
		    	
		}

	});


	$("#reload_map").click(function(){


		_VERBOSE ? console.log("reload_map"): _VERBOSE;
		
		if(_map_module_nicho.get_specieTarget()){

			var rango_fechas = $( "#sliderFecha" ).slider( "values" );
	    	console.log(rango_fechas);
	    	// console.log($("#sliderFecha").slider("option", "min"));
	    	// console.log($("#sliderFecha").slider("option", "max"));
	    	
	    	if(rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")){
	    		rango_fechas = undefined;
	    	}

	    	var chkFecha = $("#chkFecha").is(':checked');
	    	console.log("chkFecha: " + chkFecha);

	    	 $('.nav-tabs a[href="#tab_resumen"]').tab('show');

			_map_module_nicho.busca_especie_filtros(rango_fechas, chkFecha);

			$("#reload_map").addClass('btn-primary').removeClass('btn-success');

		}
		else{

			_module_toast.showToast_CenterCenter(_iTrans.prop('lb_sin_especie'), "warning");

		}

	});


	
	$("#show_gen").click(function(e){
			
		_VERBOSE ? console.log("show_gen") : _VERBOSE;
		 
		 var cadena_ini =  _url_nicho + '#link/?';

		 var sp_data = JSON.stringify(_map_module_nicho.get_specieTarget());
		 var subgroups = _componente_fuente.getVarSelArray();
	     // var type_time = _componente_fuente.getTimeBioclim();

	     cadena_ini += "sp_data=" + sp_data + "&";

	     var val_process = $("#chkValidation").is(':checked');
	     if(val_process){
	     	cadena_ini += "chkVal=" + $( "#sliderValidation" ).slider( "value" ) + "&";
	     }

	     var mapa_prob = $("#chkMapaProb").is(":checked");
	     if(mapa_prob){
	     	cadena_ini += "chkPrb=" + mapa_prob + "&";
	     }

	     var apriori = $("#chkApriori").is(':checked');
	     if(apriori){
	     	cadena_ini += "chkApr=" + apriori + "&";
	     }

	     var chkFecha = $("#chkFecha").is(':checked');
	     console.log(chkFecha);
	     if(chkFecha){
	     	cadena_ini += "chkFec=" + chkFecha + "&";
	     }

	    var rango_fechas = $( "#sliderFecha" ).slider( "values" );
    	if(rango_fechas[0] != $("#sliderFecha").slider("option", "min") || rango_fechas[1] != $("#sliderFecha").slider("option", "max")){
    		cadena_ini += "minFec=" + rango_fechas[0] + "&maxFec=" + rango_fechas[1];
    	}

	    var min_occ = $("#chkMinOcc").is(':checked');
	    if(min_occ){
	     	cadena_ini += "chkOcc=" + parseInt($("#occ_number").val()) + "&";
	    }

	    cadena_ini += "num_filters=" + subgroups.length + "&";

		$.each(subgroups, function(index,item){

	     	var str_item = JSON.stringify(item);
	     	// console.log(str_item);

	     	if(index == 0){
	     		cadena_ini += "tfilters[" + index + "]=" + str_item;	
	     	}
	     	else{
	     		cadena_ini += "&tfilters[" + index + "]=" + str_item;		
	     	}

	    });


		 console.log(cadena_ini);

		 $("#modalRegenera").modal();

		 $("#lb_enlace").val(cadena_ini);


		 // 	var key = aesjs.util.convertStringToBytes("Example128BitKey");
			// var textBytes = aesjs.util.convertStringToBytes(cadena_ini);
			// // The counter is optional, and if omitted will begin at 0
			// var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
			// var encryptedBytes = aesCtr.encrypt(textBytes);
		 // 	console.log(aesCtr);
		 

	});

	$("#accept_link").click(function(){

		$("#modalRegenera").modal("hide");

	});

	$('#modalRegenera').on('shown.bs.modal', function (e) {

		// console.log("shown");
	    $('#modalRegenera input[type="text"]')[0].select();

	});



	function genLinkURL(){

		_VERBOSE ? console.log("genLinkURL") : _VERBOSE;

		console.log(_json_config);
		if(_json_config == undefined){
			return;
		}


		var sp_data =  JSON.parse(_json_config.sp_data) ;
		// console.log(sp_data);

		
		var chkVal = _json_config.chkVal ? parseInt(_json_config.chkVal) : undefined;
		console.log(chkVal);

		var chkPrb = _json_config.chkPrb ? _json_config.chkPrb === "true" : false;
		console.log(chkPrb);

		var chkApr = _json_config.chkApr ? _json_config.chkApr === "true" : false;
		console.log(chkApr);

		var chkFec = _json_config.chkFec ? _json_config.chkFec === "true" : false;
		console.log(chkFec);

		var chkOcc = _json_config.chkOcc ? parseInt(_json_config.chkOcc) : undefined;
		console.log(chkOcc);

		var minFec = _json_config.minFec ? parseInt(_json_config.minFec) : undefined;
		// console.log(minFec);

		var maxFec = _json_config.maxFec ? parseInt(_json_config.maxFec) : undefined;
		// console.log(maxFec);

		var rango_fechas = minFec != undefined && maxFec != undefined ? [minFec, maxFec] : undefined;
		console.log(rango_fechas);

		var num_filters = parseInt(_json_config.num_filters);
		// console.log(num_filters);


		var filters = [];
		for(i=0; i<num_filters; i++){
			
			item = _json_config["tfilters[" + i + "]"];
			// console.log(item);
			filters.push( JSON.parse( _json_config["tfilters[" + i + "]"]) );
		}
		// console.log(filters);

		_procesaValoresEnlace(sp_data, filters, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas);
		$("#show_gen").css('visibility', 'hidden');


	}


	function getQuerystring2(path, key, default_) { 

		// _VERBOSE ? console.log("getQuerystring2") : _VERBOSE;

	    if (default_==null) { 
	        default_=""; 
	    } 

	    var search = unescape(path);

	    if (search == "") { 
	        return default_; 
	    } 

	    search = search.substr(1); 
	    var params = search.split("&"); 

	    for (var i = 0; i < params.length; i++) { 
	        
	        var pairs = params[i].split("="); 
	        if(pairs[0] == key) { 
	            return pairs[1]; 
	        } 

	    } 

		return default_; 
	}



	function _procesaValoresEnlace(sp_data, subgroups, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas){

		_VERBOSE ? console.log("_procesaValoresEnlace"): _VERBOSE;
    	_VERBOSE ? console.log(subgroups): _VERBOSE;

    	// var sp_data = JSON.parse(_val_json.sp_data);

		var spid = sp_data.spid;
    	var discardedPoints = d3.map([]); // considerar arregle de puntos descartadas
    	var computed_discarded_cells = d3.map([]); // considerar arregle de celdas descartadas
    	var allowedPoints = d3.map([]); // considerar arregle de puntos permitidos
    	var idreg = ["Estados"]; // Módulo por desarrollar
    	// var subgroups = [];
    	var type_time = 0;
    	var num_items = 0;


    	$("#nom_sp").val(sp_data.label);

    	_map_module_nicho.set_specieTarget(sp_data);

    	
    	// setteando filtros
    	console.log(chkFec);
    	if(chkFec){
    		$("#chkFecha").prop('checked', true);
    		$("#lb_sfecha").text("Sí");
    	}
    	else{
    		$("#chkFecha").prop('checked', false);
    		$("#lb_sfecha").text("No");
    	}

    	console.log(chkVal);
    	if(chkVal != undefined){
    		
    		$("#chkValidation").prop('checked', true);
    		$( "#sliderValidation" ).slider( "enable" );	        
    		$("#sliderValidation").slider('value',chkVal);
    		$("#labelValidation").text(chkVal+"%");
	        
    	}
    	else{
    		
    		$("#chkValidation").prop('checked', false);
    		$( "#sliderValidation" ).slider({
	          disabled: true
	        });
	        // $("#sliderValidation").slider('value',70);
	        // $("#labelValidation").text("70%");
    	}

    	console.log(chkPrb);
    	if(chkPrb){
    		$("#chkMapaProb").prop('checked', true);
    		$("#lb_mapa_prob").text("Sí");
    	}
    	else{
    		$("#chkMapaProb").prop('checked', false);
    		$("#lb_mapa_prob").text("No");
    	}

    	console.log(chkApr);
    	if(chkApr){
    		$("#chkApriori").prop('checked', true);
    		$("#lb_do_apriori").text("Sí");
    	}
    	else{
    		$("#chkApriori").prop('checked', false);
    		$("#lb_do_apriori").text("No");
    	}

    	console.log(chkOcc);
    	if(chkOcc){
    		$("#chkMinOcc").prop('checked', true);
    		$( "#occ_number" ).prop( "disabled", false );	        
    		$("#occ_number").val(chkOcc);
    		
    	}
    	else{
    		$("#chkMinOcc").prop('checked', false);
    		$( "#occ_number" ).prop( "disabled", true );	        
    		$("#occ_number").val(chkOcc);
    	}

    	console.log(rango_fechas);
    	if(rango_fechas != undefined){
    		
    		$("#sliderFecha").slider('values',0,rango_fechas[0]);
    		$("#sliderFecha").slider('values',1,rango_fechas[1]);

    	}
    	// else{
    	// 	$("#sliderFecha").slider('values',0,rango_fechas[0]);
    	// 	$("#sliderFecha").slider('values',1,rango_fechas[1]);
    	// }

    	



    	if(chkFec != undefined || rango_fechas != undefined){
    		console.log("filtros");
    		_map_module_nicho.busca_especie_filtros(rango_fechas, chkFec);
    	}
    	else{
    		_map_module_nicho.busca_especie(false);	
    	}



    	_res_display_module_nicho.set_spid(spid);
    	_res_display_module_nicho.set_idReg(idreg);

    	// $.each(filters, function(index, item){
    	// 	var json_item = JSON.parse(item.value);
    	// 	subgroups.push(json_item);
    	// }); 

    	_componente_fuente.setVarSelArray(subgroups);

    	var groups = subgroups.slice();
    	_componente_fuente.addUIItem(groups);

		// console.log(_componente_fuente.groupDatasetTotal);
		// console.log(_componente_fuente.id);

    	_res_display_module_nicho.set_subGroups(subgroups);
        _res_display_module_nicho.set_typeBioclim(type_time);

        
        if(subgroups.length > 0){
            // asegura que si el grupo de variables seleccionado tiene mas de un grupo taxonomico agregue el total
            subgroups.forEach(function(grupo){
                if(grupo.value.length > 1){
                    grupo.value.forEach(function(item){
                        num_items++;
                    });
                }
            });
            // asegura que si existe mas de un grupo de variables, se calcule el total  de todos los grupos
            if(subgroups.length > 1){
                num_items++;
            }
        }
        else{
        	_module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "error");
          	return;
        }

        _res_display_module_nicho.set_discardedPoints(discardedPoints);
		_res_display_module_nicho.set_discardedCellFilter(computed_discarded_cells);
		_res_display_module_nicho.set_allowedCells(allowedPoints);

		



		// Falta obtener estos datos del JSON incrustado
		// var val_process = false;
		// var slider_value = 0;
		  //   	var min_occ = false;
		  //   	var mapa_prob = false;
		  //   	var rango_fechas = undefined;
		  //   	var chkFecha = true;



    	_module_toast.showToast_BottomCenter("Generando resultados a partir de link", "info");
    	
    	// _res_display_module_nicho.refreshData(num_items, val_process, slider_value, min_occ, mapa_prob, rango_fechas, chkFecha);


	}




	// se ejecutan los modulos necesarios para iniciar el proceso de obteción de epsilon y score y visualización de tablas, histogramas y mapa
	$("#get_esc_ep").click(function(){

	    _VERBOSE ? console.log("get_esc_ep"): _VERBOSE;
	    var num_items = 0, spid, idreg, subgroups;

	    $("#show_gen").css('visibility', 'visible');

	    // Configuración de TEST no actualizada. No se puede utilizat hasta el momento. 23-05-2016
	    if(_TEST){
	        // 58390 - panthera onca, 46920 - Lynx rufus
	        _spid = 49405;
	        idreg = ["Estados"];
	        subgroups = [ {value:["Orden >> Artiodactyla", "Orden >> Carnivora"], type:0, groupid:1}, 
	                      {value:[{label:"Bioclim >> Temperatura media anual", level:1, value:"bio01"}], type:1, groupid:1}
	                      // {label:"Bioclim >> Rango medio diurno", level:1, value:"bio02"}], type:1, groupid:1}, 
	                      // {value:[{label:"Bioclim >> Forma Isométrica", level:1, value:"bio03"}], type:1, groupid:2}
	                    ]; 
	        num_items = 5;

	    }
	    else{



	        if(_map_module_nicho.get_specieTarget()){
	            spid = _map_module_nicho.get_specieTarget().spid;
	            _res_display_module_nicho.set_spid(spid);
	            _VERBOSE ? console.log(spid): _VERBOSE;
	        }
	        else{

	        	_module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_especie'), "error");
	          	
	          return;
	        }

	        // agregar validación para estados
	        idreg = _region_module_nicho.getRegionSelected();

	        _res_display_module_nicho.set_idReg(idreg);
	        _VERBOSE ? console.log(idreg): _VERBOSE;
	        
	        subgroups = _componente_fuente.getVarSelArray();
	        type_time = _componente_fuente.getTimeBioclim();
	        _VERBOSE ? console.log(subgroups): _VERBOSE;
	        _VERBOSE ? console.log(type_time): _VERBOSE;

	        _res_display_module_nicho.set_subGroups(subgroups);
	        _res_display_module_nicho.set_typeBioclim(type_time);
	        

	        if(subgroups.length > 0){
	            
	            // asegura que si el grupo de variables seleccionado tiene mas de un grupo taxonomico agregue el total
	            subgroups.forEach(function(grupo){

	                if(grupo.value.length > 1){
	                    grupo.value.forEach(function(item){
	                        num_items++;
	                    });
	                }

	            });

	            // asegura que si existe mas de un grupo de variables, se calcule el total  de todos los grupos
	            if(subgroups.length > 1){
	                num_items++;
	            }

	        }
	        else{
	        	_module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "error");

	          	return;
	        }
	        
	    }

	    if(idreg[0] == "Estados" || idreg[0] == "Ecoregiones"){

			// obtieniendo las ocurrencias de la especie y los elementos eliminados
			// _res_display_module_nicho.set_allowedPoints(_map_module_nicho.get_allowedPoints());
			_res_display_module_nicho.set_discardedPoints(_map_module_nicho.get_discardedPoints());
			// _res_display_module_nicho.set_discardedPointsFilter(_map_module_nicho.get_discardedPointsFilter());

			_res_display_module_nicho.set_discardedCellFilter(_map_module_nicho.get_discardedCellFilter());
			_res_display_module_nicho.set_allowedCells(_map_module_nicho.get_allowedCells());


	    	val_process = $("#chkValidation").is(':checked');
	    	min_occ = $("#chkMinOcc").is(':checked');
	    	mapa_prob = $("#chkMapaProb").is(':checked');

	    	// console.log(mapa_prob);
	    	
	    	var rango_fechas = $( "#sliderFecha" ).slider( "values" );
	    	console.log(rango_fechas);

	    	if(rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")){
	    		rango_fechas = undefined;
	    	}

	    	var chkFecha = $("#chkFecha").is(':checked');
	    	// console.log("chkFecha: " + chkFecha);

	    	slider_value = val_process ? $( "#sliderValidation" ).slider( "value" ) : 0;


	    	// Falta agregar la condición makesense. 
	    	// Cuando se realiza una consulta por region seleccioanda se verica que la especie objetivo se encuentre dentro de esta area
	    	_res_display_module_nicho.refreshData(num_items, val_process, slider_value, min_occ, mapa_prob, rango_fechas, chkFecha);


	    	// TODO: Generar lógica de funcionamiento
	    	// document.getElementById("link_gen").style.display = "inline";

	    }


	});


	// Inicializa las variables de entorno del sistema así como crear una instancia del módulo lenguaje apuntando al sistema de nicho.
	function startModule(tipo_modulo, verbose){

		_AMBIENTE = ambiente;
		_VERBOSE = verbose;

		console.log("_AMBIENTE: " + _AMBIENTE);
		console.log("_VERBOSE: " + _VERBOSE);

		console.log("_url_api: " + _url_api);


		_VERBOSE ? console.log("startModule"): _VERBOSE;
		_tipo_modulo = tipo_modulo;

		// Se cargan los archivos de idiomas y depsues son cargados los modulos subsecuentes
		// _VERBOSE ? console.log(this): _VERBOSE;
		_language_module_nicho = language_module(_VERBOSE);
		_language_module_nicho.startLanguageModule(this, _tipo_modulo);

	}


	
	// Una vez que el módulo de lenguaje se ha generado, loadModules crea instancias de los módulos mapa, tabla, histograma, región, variable y el controlador de los módulos.
	function loadModules(){

		_VERBOSE ? console.log("loadModules"): _VERBOSE;

		_module_toast = toast_module(_VERBOSE);
		_module_toast.startToast();

		_histogram_module_nicho = histogram_module(_VERBOSE);
		_histogram_module_nicho.startHistogramModule();

		_iTrans = _language_module_nicho.getI18();

		console.log(_url_api);

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

	function setUrlApi(url_api){
		_url_api = url_api
	}

	function setUrlFront(url_front){
		_url_front = url_front
	}

	// retorna solamente un objeto con los miembros que son públicos.
	return {
		startModule:startModule,
		loadModules: loadModules,
		setUrlApi: setUrlApi,
		setUrlFront: setUrlFront
	};


})();


$(document).ready(function(){

	
	// verbose por default es true
	verbose = true;

	// 0 local, 1 producción
	ambiente = 0;
	// 0 nicho, 1 comunidad
	modulo = 0;

	if($.cookie("url_front")){
		console.log("COOKIE");

		module_nicho.setUrlFront($.cookie("url_front"))
		module_nicho.setUrlApi($.cookie("url_api"))

	}
	else{
		if(ambiente == 0){
			module_nicho.setUrlFront("http://localhost/species-front");
			module_nicho.setUrlApi("http://species.conabio.gob.mx/niche3");
		}
		else{
			module_nicho.setUrlFront("http://species.conabio.gob.mx/c3/charlie_dev");	
			module_nicho.setUrlApi("http://species.conabio.gob.mx/niche3");
		}
	}

	module_nicho.startModule(modulo, verbose);	

});



