var table_module = (function(url_trabajo, verbose){

	// ************ variables publicas y privadas ( denotadas por _ ) ************

	var _url_trabajo = url_trabajo;
	var _VERBOSE = verbose;
	var _tbl_decil = false, 
		_tbl = false,
		_tbl_net = false;
	var _language_module;
	var _iTrans;
	var _json, _display_obj;
	var def_epsilon = "Es una prueba de hipótesis que pretende saber si la proporción de la clase C es la misma cuando no existen variables explicatorias y cuando si estan presentes. A continuacion se despliega la fórmula:";
	var def_score = "Es la comparación entre la proporción de X en el espacio de la clase C y la proporción de X en el espacio del complemento de la clase C. De esta manera, si la proporción de X en el espacio de C es mas grande que su complemento, se puede entender que existe mayor confianza para denotar que X favorece el espacio de C y viceversa. A continuacion se muestra la fórmula (El valor de alpha es 0.01 y se aplica logaritmo natural a los resultados):";
	// var img_epsilon = '<img src=\'images/epsilon.png\'>';
	// var img_score = "<img src=images/score.png>";
            

	var _fcols = {
	    '0' : 'generovalido', '1' : 'epitetovalido',
	    // '2' : 'bioclim', '3' : 'rango',
	    '2' : 'nij', '3' : 'nj',
	    '4' : 'ni', '5' : 'n', 
	    '6' : 'epsilon', '7' : 'score',
	    '8' : 'reinovalido', '9' : 'phylumdivisionvalido',
	    '10' : 'clasevalida', '11' : 'ordenvalido',
	    '12' : 'familiavalida'
	};


	
	 // ************ funciones publicas y privadas ( denotadas por _ ) ************

	 // Verifica cuando la tabla del sistema de comunidad ya ha sido generada.
	 // function setTblNet(tbl_net){
	 // 	_VERBOSE ? console.log("setTblNet") : _VERBOSE;
	 // 	_tbl_net = tbl_net;
	 // }

	// Inicializa variables y componentes que son necesarios en la generación de tablas.
	function _initilizeTableModule(tbl_net){
		_VERBOSE ? console.log("_initilizeTableModule") : _VERBOSE;
		_tbl_net = tbl_net;
	}

	// Asigna a una variable global una instancia del módulo de lenguaje.
	function setLanguageModule(language_module){
		_language_module = language_module;
		_iTrans = _language_module.getI18();
	}

	// Genera una tabla para el sistema de comunidad recibiendo datos del módulo histograma.
	function createDecilList(list_elements){

		  _VERBOSE ? console.log("createDecilList") : _VERBOSE;

		  data_list = [];

		  list_elements.forEach(function(d){
		    item_list = [];
		    item_list.push(d.decil)
		    item_list.push(d.species)
		    item_list.push(d.epsilons)
		    item_list.push(d.scores)
		    item_list.push(d.occ)

		    data_list.push(item_list)

		  })

		  // _VERBOSE ? console.log(data_list) : _VERBOSE;


		  if(_tbl_decil != false){
		    $('#example').dataTable().fnClearTable();
		    $('#example').dataTable().fnAddData(data_list);
		  }
		  else{

		    $('#example').DataTable( {
		    	"dom": 'Bfrtip',
		        "info" : true,
		        "bSort" : true,
		        "aoColumnDefs" : [{
		            "bSortable" : false,
		            "aTargets" : []
		          }],
		        // "bFilter" : false,
		        "bLengthChange" : false,
		        "bPaginate" : true, // Pagination True
		        "processing" : true, // Pagination True
		        // "pagingType" : 'simple',
		        "iDisplayLength" : 10,

		        "searching": true,
		        "scrollY":        "300px",
		        "scrollCollapse": true,
		        "paging":         false,

		        data: data_list,
		        columns: [
		        	{ title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Decil'); $('#lb_body_info').text('Decil donde existe presencia de las variables explicatorias.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_decil') },
		            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Variable'); $('#lb_body_info').text('Nombre de la especie o raster de la variable explicatoria.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_especie_tbl') },
		            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Epsilon'); $('#lb_body_info').text('" + def_epsilon + "'); table_module().addImageEpsilon(); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_epsilon') },
		            { title: ' <button type=\'button\' class=\'btn btn-info glyphicon glyphicon-info-sign btn_column\' onclick=\' $("#div_formula").empty(); $("#lb_header_info").text("Score"); $("#lb_body_info").text("' + def_score + '"); table_module().addImageScore(); $("#modalInfo").modal()\' ></button> ' + _iTrans.prop('tip_tbl_score') },
		            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Porcentaje por decil'); $('#lb_body_info').text('Porcentaje de celdas con ocurrencias del total de la variable explicatoria que se encuentra dentro del decil.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_procentaje_occ') }
		        ],
		        // 'copy', 'csv', 'excel', 'pdf', 'print'
		        buttons: [
			            'copy', 'csv', 'excel', 'print'
			        ],
			        language: {
			        	"sEmptyTable":     "Sin regsitros",
				        "info":             "Mostrando _START_ a _END_ de _TOTAL_ entradas",
				        "search":           "Buscar: ",
				        "zeroRecords":      "Sin coincidencias encontradas",
				        "infoEmpty":        "Mostrando 0 a 0 de 0 entradas",
				        "infoFiltered":     "(Filtrados de _MAX_ entradas totales)"
			        }

			        
				        
				    
		    } );

		  }

		  _tbl_decil = true;

	}

	function addImageScore(){

		$("#div_formula").append("<img src=images/score.png>");

	}

	function addImageEpsilon(){

		$("#div_formula").append("<img src=images/epsilon.png>");

	}

	// Genera una tabla general de resultados para el sistema de nicho. NOTA: La implementación de esta tabla realiza petición al servidor con paramtros de configuración previos.
	function createEspList(rawdata){

		_VERBOSE ? console.log("createEspList") : _VERBOSE;
		
		data_list = rawdata.data;
		// _VERBOSE ? console.log(data_list) : _VERBOSE;

		var prev = 0;
		if (_tbl != false){

			// _VERBOSE ? console.log("*********** second time") : _VERBOSE;

			$('#tdisplay').dataTable().fnClearTable();
		    $('#tdisplay').dataTable().fnAddData(data_list);
		}	
		else{

			$('#tdisplay').dataTable({

				  "dom": 'Bfrtip',
			      "info" : true,
			      "bSort" : true,
			      "aoColumnDefs" : [{
			          "bSortable" : false,
			          "aTargets" : []
			        }],
			      // "bFilter" : false,
			      "bLengthChange" : false,
			      "bPaginate" : true, // Pagination True
			      "processing" : true, // Pagination True
			      // "serverSide" : true,
			      // "pagingType" : 'simple',
			      "iDisplayLength" : 10,
			      "searching": true,
			      	"scrollY":        "300px",
			        "scrollCollapse": true,
			        "paging":         false,
			      "data": data_list,
			      "columns": [
			            // { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Género/Raster'); $('#lb_body_info').text('Genero o raster de la variable explicatoria.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_genero_tbl') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\"$('#lb_header_info').text('Especie/Rango'); $('#lb_body_info').text('Especie o rango del raster de la variable explicatoria.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_especie_tbl_eps') },
			            // { title: _iTrans.prop('lb_raster') },
			            // { title: _iTrans.prop('lb_rango') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nij'); $('#lb_body_info').text('Es el número de celdas donde ocurre una interacción de la variable explicatoria con la variable objetivo.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nij') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nj'); $('#lb_body_info').text('Es el número de celdas con almenos una ocurrencia de la variable explicatoria.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nj') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Ni'); $('#lb_body_info').text('Es el número de celdas con almenos una ocurrencia de la variable objetivo.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_ni') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('N'); $('#lb_body_info').text('Es el número de celdas consideradas en el análisis. Cada celda tiene 20km cuadrados.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_n')},

			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Epsilon'); $('#lb_body_info').text('" + def_epsilon + "'); table_module().addImageEpsilon(); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_epsilon') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Score'); $('#lb_body_info').text('" + def_score + "'); table_module().addImageScore(); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('tip_tbl_score') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Reino'); $('#lb_body_info').text('Reino de la variable explicatoria. Solo aplica cuando la variable, es una variable taxonómica.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_reino') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Phylum'); $('#lb_body_info').text('Phylum de la variable explicatoria. Solo aplica cuando la variable, es una variable taxonómica.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_phylum') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Clase'); $('#lb_body_info').text('Clase de la variable explicatoria. Solo aplica cuando la variable, es una variable taxonómica.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_clase') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Orden'); $('#lb_body_info').text('Orden de la variable explicatoria. Solo aplica cuando la variable, es una variable taxonómica.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_orden') },
			            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Familia'); $('#lb_body_info').text('Familia de la variable explicatoria. Solo aplica cuando la variable, es una variable taxonómica.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_familia') }
			        ],
			         // 'copy', 'csv', 'excel', 'pdf', 'print'
		        	buttons: [
			            'copy', 'csv', 'excel', 'print'
			        ],
			        language: {
			        	"sEmptyTable":     "Sin regsitros",
				        "info":             "Mostrando _START_ a _END_ de _TOTAL_ entradas",
				        "search":           "Buscar: ",
				        "zeroRecords":      "Sin coincidencias encontradas",
				        "infoEmpty":        "Mostrando 0 a 0 de 0 entradas",
				        "infoFiltered":     "(Filtrados de _MAX_ entradas totales)"
			        }

			});

			 _adjustComponents();


		}

		$('#tdisplay tbody').each( function() {

	  		_VERBOSE ? console.log("show table") : _VERBOSE;

	        var sTitle;
	        var nTds = $('td', this);


	        var column = $(nTds[1]).text();
	        
	        // _VERBOSE ? console.log(nTds) : _VERBOSE;
	        // _VERBOSE ? console.log(column) : _VERBOSE;
	        
	        sTitle = 'test...'; 
	        this.setAttribute( 'title', sTitle );

	    } );	  
		  
		

		_tbl = true;

	}


	function _adjustComponents(){

		_VERBOSE ? console.log("_adjustComponents") : _VERBOSE;

		var window_width = $(window).width();
		var left_margin = window_width * 0.05;
		left_margin = left_margin / 2;

		_VERBOSE ? console.log("left_margin: " + left_margin) : _VERBOSE;
		// $( "myScrollableBlockEpsilonTable" ).css( "margin-left", left_margin );
		$( "#treeAddedPanel" ).css( { marginLeft : left_margin + "px"}  );
		$( "#div_example" ).css( { marginLeft : left_margin + "px"}  );
		$( "#histcontainer_row" ).css( { marginLeft : left_margin + "px"}  );
		$( "#myScrollableBlockEpsilonDecil" ).css( { marginLeft : left_margin + "px"}  );
		$('.title_element').css({'margin-left':left_margin+'px'});  		

	}

	// Retorna un objeto de tipo EpsilonList para el histograma del sistema de comunidad
	function createListNet(json, display_obj){

		_VERBOSE ? console.log("createListNet") : _VERBOSE;
		// _tbl_net = tbl_net;
		
		var list_array = [EpsilonList];
		var list_component = d3.selectAll(".list")
      		.data(list_array);
		
		_json = json;
		_VERBOSE ? console.log(_json.links) : _VERBOSE;

		_display_obj = display_obj;

      	return list_component;

	}

	// Es una clase que genera instancias de tipo tabla así como interacción con el módulo de histograma y el modulo de red a través del controlador res_diplay_net.
	function EpsilonList(div) {

		_VERBOSE ? console.log("EpsilonList: " + _tbl_net) : _VERBOSE;

		var epsilonByGender = _display_obj.nestByR.entries(dim_eps_freq.top(Infinity));
        temp = [];

        epsilonByGender.forEach(function(bean, i) { 
            if( Math.abs( parseFloat( bean.values[0].value ) ) > ep_th ){
                temp.push(bean);
            }
        });
        
        epsilonByGender = temp;

		_VERBOSE ? console.log("list") : _VERBOSE;

		
		div.each(function() {

            _VERBOSE ? console.log("div each epsilonList") : _VERBOSE;

            data_list = [];
            
            
            epsilonByGender.forEach(function(d){
                
                // item = d.values[0];
                d.values.forEach(function(val){

                    item_list = [];

                    item_list.push(_json.nodes[val.source].label);
                    item_list.push(_json.nodes[val.target].label);

                    item_list.push(val.nij);
                    item_list.push(val.nj);
                    item_list.push(val.ni);
                    item_list.push(val.n);

                    item_list.push(val.value);

                    data_list.push(item_list)

                });
                
            })



            if(_tbl_net == true){
            	// $('#relation-list').dataTable().fnClearTable();
            	$('#relation-list').dataTable().fnDestroy();
            }
            _tbl_net = true;

            
            $('#relation-list').DataTable( {

            	"info" : false,
		      	"bSort" : true,
			    "aoColumnDefs" : [{
			        "bSortable" : false,
			        "aTargets" : []
			    }],
			     
			    "bLengthChange" : false,
			    "bPaginate" : true, // Pagination True
			    "processing" : true, // Pagination True
			    "iDisplayLength" : 10,
			    "searching": true,
			    "scrollY":   "300px",
			    "scrollCollapse": true,
			    "paging":         false,

                data: data_list,
                columns: [
                	
                	// { sTitle: "<input type='checkbox'></input>","mDataProp": null, "sWidth": "20px", "sDefaultContent": "<input type='checkbox' ></input>", "bSortable": false}
                    
                    { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Variable fuente'); $('#lb_body_info').text('Nombre de la variable fuente.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_fuente_tbl') },
                    { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Variable destino'); $('#lb_body_info').text('Nombre de la variable destino.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_sumidero_tbl') },

                    { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nij'); $('#lb_body_info').text('Es el número de celdas donde ocurre una interacción de la variable explicatoria con la variable objetivo.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nij') },
		            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nj'); $('#lb_body_info').text('Es el número de celdas con almenos una ocurrencia de la variable explicatoria.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nj') },
		            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Ni'); $('#lb_body_info').text('Es el número de celdas con almenos una ocurrencia de la variable objetivo.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_ni') },
		            { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('N'); $('#lb_body_info').text('Es el número de celdas consideradas en el análisis. Cada celda tiene 20km cuadrados.'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_n')},

                    { title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Epsilon'); $('#lb_body_info').text('" + def_epsilon + "'); table_module().addImageEpsilon(); $('#modalInfo').modal()\" ></button> " + "Epsilon" }
                ]
            } );
            	// data-target='#modalInfo' data-toggle='modal'
				// header_param='Variable fuente' body_param='Variable fuente'
        });

        
    }
    
	
	// Llama a la función que inicializa las variables necesarias para la creación de tablas en los sistemas de nicho y comunidad.
	function startTableModule(tbl_net){
		_VERBOSE ? console.log("startTableModule") : _VERBOSE;
		_initilizeTableModule(tbl_net);
	}

	// Añadir los miembros públicos
	return{
		startTableModule: startTableModule,
		createDecilList: createDecilList,
		createEspList: createEspList,
		setLanguageModule: setLanguageModule,
		createListNet: createListNet,
		addImageScore: addImageScore,
		addImageEpsilon: addImageEpsilon
		// setTblNet: setTblNet
	}
	

});





// ********  implemeantacion con paginacion
	// function createEspList(tdata){

	// 	_VERBOSE ? console.log("createEspList") : _VERBOSE;
	// 	// _VERBOSE ? console.log(tdata) : _VERBOSE;

	// 	var prev = 0;
	// 	if (_tbl != false){
	// 		// $('#tdisplay').dataTable().fnClearTable();
	// 	    $('#tdisplay').dataTable().fnDestroy();
	// 	    // $('#tdisplay_tbody').empty();
	// 	}		  
		  
	// 	$('#tdisplay').dataTable({

	// 	      "info" : false,
	// 	      "bSort" : true,
	// 	      "aoColumnDefs" : [{
	// 	          "bSortable" : false,
	// 	          "aTargets" : []
	// 	        }],
	// 	      // "bFilter" : false,
	// 	      "bLengthChange" : false,
	// 	      "bPaginate" : true, // Pagination True
	// 	      "processing" : true, // Pagination True
	// 	      "serverSide" : true,
	// 	      // "pagingType" : 'simple',
	// 	      "iDisplayLength" : 10,
	// 	      "searching": true,

	// 	      	"scrollY":        "300px",
	// 	        "scrollCollapse": true,
	// 	        "paging":         false,

	// 	      "ajax" : function (data, callback, settings){

	// 	        // tdata['limit'] = data.length;
	// 	        // tdata['start'] = data.start;

	// 	        _VERBOSE ? console.log(data) : _VERBOSE;
	// 	        _VERBOSE ? console.log(data.search.value) : _VERBOSE;
	// 	        tdata['search'] = data.search.value;

	// 	        if (data.order[0].column >= 0){
	// 	          // _VERBOSE ? console.log(data.order[0]) : _VERBOSE;
	// 	          // _VERBOSE ? console.log(data.order) : _VERBOSE;
	// 	          // _VERBOSE ? console.log(_fcols[data.order[0].column]) : _VERBOSE;
	// 	          // _VERBOSE ? console.log(data.order[0].dir) : _VERBOSE;

	// 	          tdata['sortField'] = _fcols[data.order[0].column];
	// 	          tdata['sortDir'] = data.order[0].dir;
	// 	        }

	// 	        $.ajax({
	// 	          url : url_trabajo,
	// 	          type : 'post',
	// 	          data : tdata,
	// 	          dataType : "json",
	// 	          success : function (d){

	// 	            var table = $('#tdisplay').DataTable();
	// 	            var info = table.page.info();

	// 	            if (info.page > prev){
	// 	              if (d.data.length != 0){
	// 	                callback(d);
	// 	                prev = info.page;
	// 	              }
	// 	              else{

	// 	                table.page(prev).draw(false);
	// 	              }
	// 	            }
	// 	            else{
	// 	              callback(d);
	// 	              prev = info.page;
	// 	            }


	// 	            _adjustComponents();

	// 	          }
	// 	        });
	// 	      },
	// 	      columns: [
	// 	            { title: _iTrans.prop('lb_genero_tbl') },
	// 	            { title: _iTrans.prop('lb_especie_tbl') },
	// 	            // { title: _iTrans.prop('lb_raster') },
	// 	            // { title: _iTrans.prop('lb_rango') },
	// 	            { title: _iTrans.prop('lb_nij') },
	// 	            { title: _iTrans.prop('lb_nj') },
	// 	            { title: _iTrans.prop('lb_ni') },
	// 	            { title: _iTrans.prop('lb_n') },
	// 	            { title: _iTrans.prop('lb_epsilon') },
	// 	            { title: _iTrans.prop('tip_tbl_score') },
	// 	            { title: _iTrans.prop('a_item_reino') },
	// 	            { title: _iTrans.prop('a_item_phylum') },
	// 	            { title: _iTrans.prop('a_item_clase') },
	// 	            { title: _iTrans.prop('a_item_orden') },
	// 	            { title: _iTrans.prop('a_item_familia') }
	// 	        ]

	// 	});

	// 	_tbl = true;

	// }