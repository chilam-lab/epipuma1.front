var toast_module = (function(verbose){

	var _toastr;
	var _VERBOSE = verbose;
	var _type_info = "info",
		_type_error = "error",
		_type_warning = "warning",
		_type_success = "success";

	function _toastConfigure(){
		_VERBOSE ? console.log("_toastConfigure") : _VERBOSE;
		_toastr = toastr;
	}

	function _displayMessage(message, type){

		if(type == _type_info){
			_toastr.info(message);
		}
		else if(type == _type_error){
			_toastr.error(message);	
		}
		else if(type == _type_warning){
			_toastr.warning(message);	
		}
		else if(type == _type_success){
			_toastr.success(message);	
		}

	}

	function showToast_CenterCenter(message, type){

		_toastr.options = {
			"debug": false,
			"onclick": null,
			"fadeIn": 300,
			"fadeOut": 1000,
			"timeOut": 2000,
			"extendedTimeOut": 2000,
			"positionClass": "toast-center-center",
			"preventDuplicates": true,
			"progressBar": true
		};
		_displayMessage(message, type);

	}

	function showToast_BottomCenter(message, type){

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
		_displayMessage(message, type);

	}
	
	// funcion pública que inicializa la configuración del mapa
	function startToast(){
		_VERBOSE ? console.log("startToast") : _VERBOSE;
		_toastConfigure();
	}

	return{

		showToast_CenterCenter: showToast_CenterCenter,
		showToast_BottomCenter: showToast_BottomCenter,
		startToast: startToast

	}
	
});