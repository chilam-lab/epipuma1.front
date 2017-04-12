// Module Reveal Pattern
var module_index = (function (){

	

	// Por default el sistema envia a producción
	var _AMBIENTE = 1,
		_TEST = false

	var _VERBOSE = true

	_VERBOSE ? console.log("*** loading index... ***") : _VERBOSE

	var _language_module

	var _toastr = toastr
	var _iTrans
	var _tipo_modulo
	var _link_val

	// TEMPORAL DESARROLLO
	var _url_api, _url_nicho, _url_comunidad


	// metodo de inicialización de componentes necesarios en la primera pantalla del sistema
	function _initializeComponents(){

		_VERBOSE ? console.log("_initializeComponents") : _VERBOSE


		if($.cookie("register") == undefined){

			$.cookie("register", true, {expires: 7});
			$( "#link_modelo_nicho" ).append( '<a href="#"  id="a_modelo_nicho" link-id="' + _url_nicho + '" data-target="#modalLogin" data-toggle="modal" >' + _iTrans.prop("a_modelo_nicho") + '</a>' )
			$( "#link_modelo_comunidad" ).append( '<a href="#" id="a_modelo_comunidad" link-id="' + _url_comunidad + '" data-target="#modalLogin" data-toggle="modal" ">' + _iTrans.prop("a_modelo_comunidad") + '</a>' )

		}
		else{

			$( "#link_modelo_nicho" ).append( '<a href="' + _url_nicho + '"  id="a_modelo_nicho"  >' + _iTrans.prop("a_modelo_nicho") + '</a>' )
			$( "#link_modelo_comunidad" ).append( '<a href="' + _url_comunidad + '" id="a_modelo_comunidad" ">' + _iTrans.prop("a_modelo_comunidad") + '</a>' )
		
		}
		
		// href="' + _url_comunidad + '

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
		}	


		// obtien el parametro link-id para redireccionar segun el enalce selecicoando
		$('a[data-toggle=modal]').click(function () {

				_VERBOSE ? console.log("entro") : _VERBOSE
				_link_val = ""
				_VERBOSE ? console.log($(this).attr("link-id")) : _VERBOSE
			    _link_val = $(this).attr("link-id")

		})

		$("#btn_redirect").click(function(){

			_VERBOSE ? console.log("btn_redirect") : _VERBOSE
			_VERBOSE ? console.log(_link_val) : _VERBOSE
			window.location.replace(_link_val)

		})
		
		

		$("#send_email_login").click(function(){

			  _VERBOSE ? console.log("send_email_login") : _VERBOSE
			  _VERBOSE ? console.log(_link_val) : _VERBOSE

			  _VERBOSE ? console.log($("#email_address")[0].validity["valid"]) : _VERBOSE
			  _VERBOSE ? console.log($("#usaer_name").val()) : _VERBOSE

			  var regexp = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?\s)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/

			  if(!regexp.test($("#usaer_name").val() ) ){
			  		_toastr.error("Por favor inserte un usuario valido. Debe contener al menos un nombre y un apellido")
			  		$("#usaer_name").val("")
			  		return
			  }

			  if($("#email_address")[0].validity["valid"]){
			    
			    var email = $("#email_address").val()
			    var fecha = getDateNow()
			    var usuario = $("#usaer_name").val()

			    _VERBOSE ? console.log("email: " + email) : _VERBOSE
			    _VERBOSE ? console.log("fecha: " + fecha) : _VERBOSE
			    _VERBOSE ? console.log("usuario: " + usuario) : _VERBOSE


			    // TODO: Registro de correo y redireccionamiento a pagina.
			    $.ajax({
				      // url : "http://localhost:8080/snib/getUserReg",
					  url : _url_api,
				      type : 'post',
				      data : {
				      	// qtype: "getUserReg",
				      	email: email
				      },
				      success : function (d){

				      		var res = d.data
				      		// var res = JSON.parse(d)

				        	var count = res[0].registro
					        _VERBOSE ? console.log(count) : _VERBOSE

					        if(count == 0){

					        	$.ajax({
								      url : _url_trabajo,
								      type : 'post',
								      data : {
								      	qtype: "setUserReg",
								      	email: email,
								      	fecha: fecha,
								      	usuario: usuario
								      },
								      success : function (d){
								        
									        _VERBOSE ? console.log("registrado") : _VERBOSE
									        _VERBOSE ? console.log(d) : _VERBOSE
									        $('#modalLogin').modal('hide')
									        window.location.replace(_link_val)
									        
								      },
								      error: function( jqXHR ,  textStatus,  errorThrown ){
								        
									        _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE
									        
									        $("#email_address").val("")
									        $("#usaer_name").val("")

									        $('#modalLogin').modal('hide')
									        
									        _toastr.error("Existio un error de registro, intentelo nuevamente")
									        // _module_toast.showToast_BottomCenter(_iTrans.prop('lb_correo_error'), "error")
								      }
							    })

					        }
					        else{

					        	_VERBOSE ? console.log("Ya registrado") : _VERBOSE
					        	$('#modalLogin').modal('hide')
						        window.location.replace(_link_val)

					        }


				      },
				      error: function( jqXHR ,  textStatus,  errorThrown ){
				        
					        _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE

					        $("#email_address").val("")
					        $("#usaer_name").val("")

					        

					        $('#modalLogin').modal('hide')

					        _toastr.error("Existio un error de registro, intentelo nuevamente")
				      }
			    })


			  }
			  else{

			  	$("#email_address").val("")
			    _toastr.error("Correo invalido, intentelo nuevamente")

			  }

		})

	}

	function getDateNow(){

		_VERBOSE ? console.log("getDateNow") : _VERBOSE

		var today = new Date()
		var dd = today.getDate()
		var mm = today.getMonth()+1 //January is 0!
		var yyyy = today.getFullYear()

		if(dd<10) {dd='0'+dd} 
		if(mm<10) {mm='0'+mm} 
		today = yyyy+'-'+mm+'-'+dd

		return today

	}



	function startModule(url_front, url_api, tipo_modulo, verbose){

		
		// _AMBIENTE = ambiente
		_VERBOSE = verbose
		console.log("_AMBIENTE: " + _AMBIENTE)
		console.log("_VERBOSE: " + _VERBOSE)

		_VERBOSE ? console.log("startModule Index") : _VERBOSE
		_tipo_modulo = tipo_modulo


		// se guardan cookies para enviarlas a comunidad y nicho
		$.cookie("url_front", url_front);
		$.cookie("url_api", url_api);


		// var _url_trabajo = "http://species.conabio.gob.mx/niche?", 
		_url_nicho = url_front + "/geoportal_v0.1.html"
		_url_comunidad = url_front + "/comunidad_v0.1.html"
		_url_api = url_api

		// Se cargan los archivos de idiomas y depsues son cargados los modulos subsecuentes
		// _VERBOSE ? console.log(this) : _VERBOSE
		_language_module_net = language_module()
		_language_module_net.startLanguageModule(this, _tipo_modulo)


	}

	function loadModules(){

		_VERBOSE ? console.log("loadModules") : _VERBOSE
		_iTrans = _language_module_net.getI18()
		_initializeComponents()


	}


	// retorna solamente un objeto con los miembros que son públicos.
	return {
		startModule:startModule,
		loadModules: loadModules 
	}


})()

$(document).ready(function(){

	// verbose por default es true
	var verbose = true

	// 0 local, 1 producción
	var ambiente = 0
	// 0 nicho, 1 comunidad, 2 index
	var modulo = 2


	var url_front
	var url_api

	if(ambiente == 0){
		url_front = "http://localhost/species-front"
		url_api = "http://species.conabio.gob.mx/niche3"
	}
	else{
		url_front = "http://species.conabio.gob.mx/c3/charlie_dev"	
		url_api = "http://species.conabio.gob.mx/niche3"
	}	

	module_index.startModule(url_front, url_api, modulo, verbose)

})

