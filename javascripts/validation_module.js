var validation_module = (function(url_trabajo, verbose){

	// ************ variables publicas y privadas ( denotadas por _ ) ************

	var _url_trabajo = url_trabajo;

	var _VERBOSE = verbose;

	var _histogram_module_nicho;

	var _nameMap = d3.map([]);

	var _NUM_DECIL = 10, _NUM_ITERATIONS;
	
	// ************ funciones publicas y privadas ( denotadas por _ ) ************

	function set_histogram_module(histogram_module){
		_histogram_module_nicho = histogram_module;
	}

	// Inicializa variables y componentes que son necesarios en el proceso de validación.
	function _initilizeElementsForValidationModule(){
		_VERBOSE ? console.log("_initilizeElementsForValidationModule") : _VERBOSE;


	}

	

	// Obtiene los valores de recall de los cálculos realizados a través del conteo de verdaderos positivos, falsos negativos y falsos positivos de un conjunto de datos dado.
	function validationProcess(validationData, sp_gridids, n_iterations, id_chartscr_decil){

	    _VERBOSE ? console.log("validationProcess") : _VERBOSE;
	    _VERBOSE ? console.log(validationData) : _VERBOSE;

	    _NUM_ITERATIONS = n_iterations;
	    _nameMap = d3.map([]);
	    
	    // va concatenando lso valores para el line chart
	    var item_recall = [];
	    // recolecta el ultimo valor de la ultima iteracion para hacer la gráfica de barras
	    var item_chart = [];
	    
	    for(l = 0; l < validationData.length; l++){

	        var iter_recall = [];

	        // var array_recall_groups = [];
	        item_chart = validationData[l].data_chart;
	        test_set = validationData[l].test_set;

	        // _VERBOSE ? console.log(item_chart) : _VERBOSE;
	        // mapSpecies = d3.map([]);

	        // obtiene los limites de los deciles por cada iteración
	        decilBoundaries = _getLimitBoudaries(item_chart);

	        // obtiene las especies con sus scores por grupo de variables
	        mapScoreSp = _getMapSpecies(item_chart);
	        
	        // obtiene la intersección entre los gridids de la especie objetivo con los del conjunto de prueba
	        // este proceso disminuye el proceso tomando solo los gridids que son necesario analizar
	        sp_grid_temp = [];
	        $.each(sp_gridids, function(index, item){
	            if($.inArray( item.gridid, test_set) != -1){
	              sp_grid_temp.push(item);
	            }
	        });

	        // obtener el score de las especies del conjunto de prueba por celda
	        // _VERBOSE ? console.log(sp_grid_temp) : _VERBOSE;

	        // verifica que al menos existio una intersección entre el conjunto de prueba y la especie objetivo
	        _VERBOSE ? console.log( (sp_grid_temp.length > 0) ? "Intersección" : "Sin intersección de especies") : _VERBOSE;

	        // obtiene los scores por celda de las celdas con intersección entre el conjunto de prueba y la especie objetivo
	        scoresByGroup = _getTestDataScore(sp_grid_temp, mapScoreSp);

	        // obtiene los VP, FN y Recall y vetifica si el recall es nulo en algun conjunto de datos
	        iter_recall = _getMeasure(decilBoundaries, scoresByGroup);
	        item_recall = item_recall.concat(iter_recall);

	    }

	    // _VERBOSE ? console.log(item_recall) : _VERBOSE;

	    recall_crs = crossfilter(item_recall),
	    all = recall_crs.groupAll(),
	    dim_name = recall_crs.dimension(function(d) { 
	      return d.group_name;
	    }),
	    dim_decil = recall_crs.dimension(function(d) { 
	      return d.decil;
	    });

	    // obtener el arreglo de los nombres de la colecicón y deciles, hacer funcion para sumar y promediar valores!!
	    arg_decil = d3.range(1,_NUM_DECIL+1,1).reverse();
	    // _VERBOSE ? console.log(arg_decil) : _VERBOSE;
	    // _VERBOSE ? console.log(nameMap.values()) : _VERBOSE;

	    // var prom_item_recall = [];
	    var array_recall_groups = [];
	    
	    $.each(_nameMap.values(), function(i, group_name){

	        dim_name.filter(group_name.name);
	        // _VERBOSE ? console.log(dim_name.top(Infinity)) : _VERBOSE;

	        prom_item_recall = [];

	        $.each(arg_decil, function(j, decil){

	            var tp_tot = 0;
	            var fn_tot = 0;
	            var recall_tot = 0;
	            var iter_tot = 0;

	            dim_decil.filter(decil.toString());
	            // _VERBOSE ? console.log(dim_decil.top(Infinity)) : _VERBOSE;

	            // Se agrupan por decil y se recorren los resultados de las n iteraciones para obtener el total de fn, vp y recall
	            $.each(dim_decil.top(Infinity), function(k, item){

	            	// descarta las iteraciones donde el recall esta indefinido
	            	if(!item.recall_nulo){
	            		tp_tot += item.vp;
		                fn_tot += item.fn;
		                recall_tot += item.recall;	
	            	}
	            	else{
	            		iter_tot++;
	            	}
	            });

	            // _VERBOSE ? console.log(iter_tot) : _VERBOSE;
	            // _VERBOSE ? console.log(tp_tot) : _VERBOSE;
	            // _VERBOSE ? console.log(fn_tot) : _VERBOSE;
	            // _VERBOSE ? console.log(recall_tot) : _VERBOSE;

	            // descarta las iteraciones que no se obtuvieron valores
	            var iteraciones_validas = _NUM_ITERATIONS - iter_tot;
	            if(iteraciones_validas > 0){

	            	tp_tot = parseFloat(tp_tot)/iteraciones_validas;
		            fn_tot = parseFloat(fn_tot)/iteraciones_validas;
		            recall_tot = parseFloat(recall_tot)/iteraciones_validas;	
		            // _VERBOSE ? console.log(tp_tot) : _VERBOSE;
		            // _VERBOSE ? console.log(fn_tot) : _VERBOSE;
		            // _VERBOSE ? console.log(recall_tot) : _VERBOSE;

		            // prom_item_recall.push({"group_name":group_name, "recall": recall_tot, "vp": tp_tot, "fn": fn_tot, "decil":decil});

	            }
				// se asigna valor de cero en recall al line chart del decil N si no tiene valores
				prom_item_recall.push({"group_name":group_name, "recall": recall_tot, "vp": tp_tot, "fn": fn_tot, "decil":decil});	            	

	            dim_decil.filterAll();

	        })

	        array_recall_groups.push(prom_item_recall);
	        dim_name.filterAll();
	        

	    });

	    

	    // se envia el ultimo item del grupo conjuntado en las iteraciones (item_chart)
	    // _VERBOSE ? console.log(array_recall_groups) : _VERBOSE;
	    _histogram_module_nicho.createMultipleBarChart(item_chart, array_recall_groups, id_chartscr_decil, _nameMap);
	    
	    // _adjustComponents();
	  
	}

	// Recalcula los límites superiores e inferiores de los deciles que son enviados por el conjunto de prueba con el fin de eliminar rangos intermedios entre los deciles
	// el promedio del limite inferior de decil N con el limite superior del decil N-1.
	function _getLimitBoudaries(item_chart){

	    _VERBOSE ? console.log("getLimitBoudaries") : _VERBOSE;
	    var decilBoundaries = [];
	    var num_deciles_values;

	    // _VERBOSE ? console.log(item_chart) : _VERBOSE;

	    // obtiene el numero de grupos creados (incluye totales)
	    for(i=0; i<_NUM_DECIL; i++){
	    	try{
	    		num_groups = item_chart[i].gridids.length;
	    		num_deciles_values = i;
	    		break;
	    	}catch(e){
	    		_VERBOSE ? console.log("sin valores decil: " + i) : _VERBOSE;
	    	}
	    }

	    // _VERBOSE ? console.log(num_groups) : _VERBOSE;
	    // _VERBOSE ? console.log(num_deciles_values) : _VERBOSE;
	    
	        
	    for(j = 0; j<num_groups; j++){

	        var decilGroupBoundaries = [];
	        
	        for(i = num_deciles_values; i < item_chart.length-1; i++){

	            current_decil_item = item_chart[i];
	           	// _VERBOSE ? console.log(current_decil_item) : _VERBOSE;	
	            

	            c_linf = parseFloat(current_decil_item.linf[j].p);
	            c_lsup = parseFloat(current_decil_item.lsup[j].p);
	            
	            next_decil_item = item_chart[i+1];
	            // _VERBOSE ? console.log(next_decil_item) : _VERBOSE;

	            n_linf = parseFloat(next_decil_item.linf[j].p);
	            n_lsup = parseFloat(next_decil_item.lsup[j].p);

	            g_name = current_decil_item.names[j].p;

	            // _VERBOSE ? console.log(c_linf) : _VERBOSE;
	            // _VERBOSE ? console.log(c_lsup) : _VERBOSE;
	            // _VERBOSE ? console.log(n_linf) : _VERBOSE;
	            // _VERBOSE ? console.log(n_lsup) : _VERBOSE;
	            

	            if(i == num_deciles_values){
	              // nota: (parseFloat((c_linf+n_lsup)/2).toFixed(2))/1 -- se divide entre 1 para que el valor de retorno no sea un strind si no un float
	              decilGroupBoundaries.push({group_name:g_name, decil:current_decil_item.decil, lsup:Number.POSITIVE_INFINITY, linf:(parseFloat((c_linf+n_lsup)/2).toFixed(2))/1 });
	            }
	            else if(i==item_chart.length-2){

	              decilGroupBoundaries.push({group_name:g_name, decil:current_decil_item.decil, lsup:decilGroupBoundaries[decilGroupBoundaries.length-1].linf, linf:(parseFloat((c_linf+n_lsup)/2).toFixed(2))/1 });
	              
	              decilGroupBoundaries.push({group_name:g_name, decil:next_decil_item.decil, lsup:decilGroupBoundaries[decilGroupBoundaries.length-1].linf, linf:Number.NEGATIVE_INFINITY});

	              break;
	            }
	            else{
	              decilGroupBoundaries.push({group_name:g_name, decil:current_decil_item.decil, lsup:decilGroupBoundaries[decilGroupBoundaries.length-1].linf, linf:(parseFloat((c_linf+n_lsup)/2).toFixed(2))/1});
	            }
	            
	        }

	        decilBoundaries.push(decilGroupBoundaries);

	    }

	    _VERBOSE ? console.log(decilBoundaries) : _VERBOSE;
	    return decilBoundaries;
	}

	// Obtiene el score de las especies que resultaron del conjunto de entrenamiento.
	function _getMapSpecies(item_chart){

	    _VERBOSE ? console.log("getMapSpecies") : _VERBOSE;
	    var scoreSpeciesTotal = [];
	    var num_deciles_values;


	    // obtiene el numero de grupos creados (incluye totales)
	    for(i=0; i<_NUM_DECIL; i++){
	    	try{
	    		num_groups = item_chart[i].gridids.length;
	    		num_deciles_values = i;
	    		break;
	    	}catch(e){
	    		_VERBOSE ? console.log("sin valores decil: " + i) : _VERBOSE;
	    	}
	    }

	    // obtiene el numero de grupos creados (incluye totales)
	    // num_groups = item_chart[0].gridids.length;
	        
	    // for para recorrer por grupos, (grupo bio1, grupo bio2, etc...)
	    for(j = 0; j<num_groups; j++){

	        var scoreSpecies = d3.map([]);
	        
	        
	        // se recorren todos los deciles del grupo 0 al N
	        for(i=num_deciles_values; i < item_chart.length-1; i++){

	            current_decil_item = item_chart[i];

	            strArgSpecies = current_decil_item.species[j].p;
	            strArgName = current_decil_item.names[j].p;
	            

	            $.each(strArgSpecies, function(index,strItem){
	                
	                // index 0 = spid y index 3 = score
	                scoreSpecies.set(parseInt(strItem.split("|")[0]), {score:parseFloat(strItem.split("|")[3]), group_name:strArgName});

	            }); 
	           
	        }

	        scoreSpeciesTotal.push(scoreSpecies);

	    }

	    _VERBOSE ? console.log(scoreSpeciesTotal) : _VERBOSE;
	    return scoreSpeciesTotal;

	}

	// Obtiene los scores de las especies que se encuentran en el conjunto de prueba basado en los resultados del conjunto de entrenamiento
	function _getTestDataScore(spGridid, scoreSpecies){

	    // scoreSpecies: mapa de score de las especies por grupo de variables
	    // spGridid: celdas con intersección entre el conjunto de prueba y la especie objetivo

	    // console.log(spGridid);
	    // console.log(scoreSpecies);

	    _VERBOSE ? console.log("getTestDataScore") : _VERBOSE;
	    var scoresByGroup = [];

	    $.each(scoreSpecies, function(index, scoreSpecies_item){

	        // scoreSpecies_item: mapa de socre de las especies por grupo de variables
	        // console.log(scoreSpecies_item);

	        var scoresGroup = [];

	        $.each(spGridid, function(index, item_gridid){

	        	// console.log(item_gridid);

	            var gridSum = 0;
	            var anyRecords = false;
	            var group_name = "";

	            $.each(item_gridid.spids, function(index, spid){

	            	// console.log(spid);
	                
	                if(scoreSpecies_item.has(spid)){

	                    gridSum += scoreSpecies_item.get(spid).score;
	                    group_name = scoreSpecies_item.get(spid).group_name;
	                    anyRecords = true;

	                }

	            });

	            scoresGroup.push({gridid: item_gridid.gridid, score: (anyRecords ? gridSum : null), group_name: group_name});

	        });

	        scoresByGroup.push(scoresGroup);

	    });

	    _VERBOSE ? console.log(scoresByGroup) : _VERBOSE;
	    return scoresByGroup;

	}

	// Obtiene los verdaderos positivos, falsos negativos, falsos positivos y recall por cada iteración.
	function _getMeasure(decilBoundaries, scoresByGroup){

	    _VERBOSE ? console.log("getMeasure") : _VERBOSE;

	    // _VERBOSE ? console.log(decilBoundaries) : _VERBOSE;
	    // _VERBOSE ? console.log(scoresByGroup) : _VERBOSE;

	    var iter_recall = [];

	    for(i=0; i<decilBoundaries.length; i++){


	        groupBoudaries = decilBoundaries[i];
	        groupScores = scoresByGroup[i];
	        _VERBOSE ? console.log(groupBoudaries) : _VERBOSE;
	        _VERBOSE ? console.log(groupScores) : _VERBOSE;
	        
	        $.each(groupBoudaries, function(index, decil){
	            // _VERBOSE ? console.log("boundary: " + decil.group_name) : _VERBOSE;
	            var vp = 0;
	            var fn = 0;
	            var recall = 0;
	            var null_values = 0;
	            var name = "";
	            var recall_nulo = false;

	            $.each(groupScores, function(index, gridid){
	                // _VERBOSE ? console.log("groupScores: " + gridid.group_name) : _VERBOSE;
	                // la comparación null >= Number.NEGATIVE_INFINITY es verdadera, XD
	                if(gridid.score == null){
	                // if(decil.linf == Number.NEGATIVE_INFINITY && gridid.score == null){
	                    null_values++;
	                    // _VERBOSE ? console.log("valor nulo") : _VERBOSE;
	                }
	                else if(gridid.score >= decil.linf){
	                    vp++;
	                }
	                name = (gridid.group_name != "") ? gridid.group_name : name;
	            });

	            

	            fn = groupScores.length - null_values - vp;
	            if(fn == 0 && vp == 0){
	            	recall = 0;
	            	recall_nulo = true;
	            }
	            else{
	            	recall = vp / (vp + fn);	
	            	recall_nulo = false;
	            }
	            
	            _VERBOSE ? console.log("boundary: " + decil.group_name + " groupScores: " + name + " decil: " + decil.decil + " lon: " + groupScores.length + " nulos: " + null_values + " vp: " + vp + " fn: " + fn + " recall: " + recall + " recall nulo: " + recall_nulo) : _VERBOSE;

	            if(_nameMap.has(decil.group_name)){
	                
	                var ar_temp = _nameMap.get(decil.group_name).nulos;
	                ar_temp.push(null_values);

	                var arg_nulo = _nameMap.get(decil.group_name).recall_nulo;
	                arg_nulo.push(recall_nulo); 
	                // nulo = (nulo == true) ? nulo : recall_nulo;
	                // _VERBOSE ? console.log("nulo: " + nulo) : _VERBOSE;

	                _nameMap.set(decil.group_name, {name: decil.group_name, nulos: ar_temp, recall_nulo: arg_nulo});

	            }
	            else{
	                _nameMap.set(decil.group_name, {name: decil.group_name, nulos: [null_values], recall_nulo: [recall_nulo]});
	            }
	            
	            // los elementos no se agrupan por grupo de pre seleccionado, se genera una sola colecicón que depsues es procesada con Crossfilter
	            // iter_recall.push({"group_name":decil.group_name, "recall": recall, "vp": vp, "fn": fn, "decil":decil.decil, "ausentes":null_values});
	            iter_recall.push({"group_name":decil.group_name, "recall": recall, "vp": vp, "fn": fn, "decil":decil.decil, "recall_nulo": recall_nulo});

	        });

	    }

	    // _VERBOSE ? console.log(iter_recall) : _VERBOSE;
	    return iter_recall;

	}


	function _adjustComponents(){

	    // getting margin of divs
	    var leftMarginPixel = parseInt( ( $(window).width() - $(".myScrollableBlockEpsilonTable").width() ) / 2) - 10;
	    
	    _VERBOSE ? console.log("leftMarginPixel: " + leftMarginPixel) : _VERBOSE;

	    // $('#chartdiv_epsilon').css({'margin-left':(leftMarginPixel+20)+'px'}); 
	    // $('#chartdiv_score_decil').css({'margin-left':leftMarginPixel+'px'}); 
	    

	    // $('.myScrollableBlockEpsilonSmallHist').css({'margin-left':leftMarginPixel+'px'}); 
	    // $('.myScrollableBlockEpsilon').css({'margin-left':leftMarginPixel+'px'}); 
	    
	    // $('.myScrollableBlockEpsilonTable').css({'margin-left':leftMarginPixel+'px'}); 
	    // $('.myScrollableBlockDecilList').css({'margin-left':leftMarginPixel+'px'}); 

	    // $('.title_element').css({'margin-left':leftMarginPixel+'px'});  


	}

	
	// Llama a la función que inicializa las variables necesarias para realizar el proceso de validación
	function startValidationModule(){
		_VERBOSE ? console.log("startValidationModule") : _VERBOSE;
		_initilizeElementsForValidationModule();
	}

	// Añadir los miembros públicos
	return{
		startValidationModule: startValidationModule,
		validationProcess: validationProcess,
		set_histogram_module: set_histogram_module
	}
	

});