
/**
 * Éste módulo es el encargado de la presentación de los componentes de la 
 * página de inicio
 *
 * @namespace module_index
 */
var module_index = (function() {
    var _VERBOSE = true;

    _VERBOSE ? console.log("*** loading index... ***") : _VERBOSE;

    var _language_module_net;
    var _toastr = toastr;
    var _iTrans;
    var _tipo_modulo;
    var _link_val;

    var url_front;
    var url_api;



    // TEMPORAL DESARROLLO
    var _url_api, _url_nicho, _url_comunidad;

    /**
     * Método de inicialización de componentes necesarios en la primera pantalla
     * del sistema
     *
     * @function _initializeComponents
     * @private
     * @memberof! module_index
     */
    function _initializeComponents() {

        _VERBOSE ? console.log("_initializeComponents") : _VERBOSE;

//        Cookies.remove('register');

        if (Cookies.get("register") === undefined) {
            Cookies.set("register", true, {expires: 7});
            $("#div_rel_nicho").attr('href',_url_nicho);
            $("#div_rel_com").attr('href',_url_comunidad);
            $("#link_modelo_nicho").append("<a href=\"#\"  id=\"a_modelo_nicho\" link-id=\"" + _url_nicho + "\" data-target=\"#modalLogin\" data-toggle=\"modal\" >" + _iTrans.prop("a_modelo_nicho") + "</a>");
            $("#link_modelo_comunidad").append("<a href=\"#\" id=\"a_modelo_comunidad\" link-id=\"" + _url_comunidad + "\" data-target=\"#modalLogin\" data-toggle=\"modal\" \">" + _iTrans.prop("a_modelo_comunidad") + "</a>");
        }
        else {
            $("#div_rel_nicho").attr('href',_url_nicho);
            $("#div_rel_com").attr('href',_url_comunidad);
            $("#link_modelo_nicho").append("<a href=\"" + _url_nicho + "\"  id=\"a_modelo_nicho\"  >" + _iTrans.prop("a_modelo_nicho") + "</a>");
            $("#link_modelo_comunidad").append("<a href=\"" + _url_comunidad + "\" id=\"a_modelo_comunidad\" \">" + _iTrans.prop("a_modelo_comunidad") + "</a>");
        }

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

        // obtien el parametro link-id para redireccionar segun el enalce selecicoando
        $("a[data-toggle=modal]").click(function() {
            _VERBOSE ? console.log("entro") : _VERBOSE;
            _link_val = "";
            _VERBOSE ? console.log($(this).attr("link-id")) : _VERBOSE;
            _link_val = $(this).attr("link-id");
        });

        $("#btn_redirect").click(function() {

            _VERBOSE ? console.log("btn_redirect") : _VERBOSE;
            _VERBOSE ? console.log(_link_val) : _VERBOSE;
            window.location.replace(_link_val);

        });

        $("#send_email_login").click(function() {
            _VERBOSE ? console.log("send_email_login") : _VERBOSE;
            _VERBOSE ? console.log(_link_val) : _VERBOSE;

            _VERBOSE ? console.log($("#email_address")[0].validity["valid"]) : _VERBOSE;
            _VERBOSE ? console.log($("#usaer_name").val()) : _VERBOSE;

            var regexp = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?\s)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/;

            if (!regexp.test($("#usaer_name").val())) {
                _toastr.error("Por favor inserte un usuario valido. Debe contener al menos un nombre y un apellido");
                $("#usaer_name").val("");
                return;
            }

            if ($("#email_address")[0].validity["valid"]) {
                var email = $("#email_address").val();
                var fecha = getDateNow();
                var usuario = $("#usaer_name").val();

                _VERBOSE ? console.log("email: " + email) : _VERBOSE;
                _VERBOSE ? console.log("fecha: " + fecha) : _VERBOSE;
                _VERBOSE ? console.log("usuario: " + usuario) : _VERBOSE;

                // TODO: Registro de correo y redireccionamiento a pagina.
                $.ajax({
                    // url : "http://localhost:8080/snib/getUserReg",
                    url: _url_api + "/niche/especie",
                    type: "post",
                    data: {
                        qtype: "getUserReg",
                        email: email
                    },
                    success: function(d) {
                        var res = d.data;
                        // var res = JSON.parse(d)

                        var count = res[0].registro;
                        _VERBOSE ? console.log(count) : _VERBOSE;

                        if (count == 0) {
                            $.ajax({
                                url: _url_api,
                                type: "post",
                                data: {
                                    qtype: "setUserReg",
                                    email: email,
                                    fecha: fecha,
                                    usuario: usuario
                                },
                                success: function(d) {
                                    _VERBOSE ? console.log("registrado") : _VERBOSE;
                                    _VERBOSE ? console.log(d) : _VERBOSE;
                                    $("#modalLogin").modal("hide");
                                    window.location.replace(_link_val);
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

                                    $("#email_address").val("");
                                    $("#usaer_name").val("");

                                    $("#modalLogin").modal("hide");
                                    _toastr.error("Existio un error de registro, intentelo nuevamente");
                                    // _module_toast.showToast_BottomCenter(_iTrans.prop('lb_correo_error'), "error")
                                }
                            });
                        } else {
                            _VERBOSE ? console.log("Ya registrado") : _VERBOSE;
                            $("#modalLogin").modal("hide");
                            window.location.replace(_link_val);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

                        $("#email_address").val("");
                        $("#usaer_name").val("");
                        $("#modalLogin").modal("hide");

                        _toastr.error("Existio un error de registro, intentelo nuevamente");
                    }
                });

            } else {
                $("#email_address").val("");
                _toastr.error("Correo invalido, intentelo nuevamente");
            }
        });


        $("#btn_tutorial").click(function() {
            window.open(url_front + "/docs/tutorial.pdf");
        });

        var timer = 5000;
        
        
        var names_nicho = ["lb_index_hist_decil", "lb_index_hist_score", "lb_index_map_pres"];
        var names_net = [ "lb_index_map_riq", "lb_index_tbl_rel", "lb_index_net"];
        
        var index_nicho = 0;
        var index_net = 0;
        $("#lb_ini_nicho").text(_iTrans.prop(names_nicho[names_nicho.length-1]));
        
        setInterval(function() {
            $("#lb_ini_nicho").text(_iTrans.prop(names_nicho[index_nicho]));
            index_nicho = index_nicho === 2 ? 0 : ++index_nicho;
        }, timer);
        
        $("#lb_ini_net").text(_iTrans.prop(names_net[names_net.length-1]));
        setInterval(function() {
            $("#lb_ini_net").text(_iTrans.prop(names_net[index_net]));
            index_net = index_net === 2 ? 0 : ++index_net;
        }, timer);



        $(".box_nicho").bgswitcher({
            images: [
                url_front + "/images/mapa.png",
                url_front + "/images/decil.png",
                url_front + "/images/score_celda.png"],
            effect: "fade",
            interval: timer
        });

        $(".box_net").bgswitcher({
            images: [
                url_front + "/images/red.png",
                url_front + "/images/mapa_riqueza.png",
                url_front + "/images/tabla_red.png"],
            effect: "fade",
            interval: timer
        });

    }


    /**
     * Regresa la fecha actual con formato YYYY-MM-DD
     *
     * @function getDateNow 
     * @private
     * @memberof! module_index
     */
    function getDateNow() {
        _VERBOSE ? console.log("getDateNow") : _VERBOSE;

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = "0" + dd;
        }
        if (mm < 10) {
            mm = "0" + mm;
        }
        today = yyyy + "-" + mm + "-" + dd;

        return today;
    }


    /**
     * Función encargada de configurar las ligas que se usuarán para el ambiente
     * gráfico y el API.
     *
     * @function  startModule
     * @memberof! module_index
     *
     * @param {string} url_front - URL que donde se sirve el frontend 
     * @param {string} url_api - URL del api SNIB-middleware
     * @param {integer} tipo_modulo - Módulo que se está usando (0-nicho, 
     *                                1-comunidad, 2-index)
     * @param {boolean} verbose - Se activa mesnajes de debug
     */
    function startModule(front, api, tipo_modulo, verbose) {

        url_front = front;
        url_api = api;

        // _AMBIENTE = ambiente
        _VERBOSE = verbose;

        console.log("_VERBOSE: " + _VERBOSE);
        _VERBOSE ? console.log("URL front: " + url_front) : _VERBOSE;
        _VERBOSE ? console.log("URL api: " + url_api) : _VERBOSE;
        _VERBOSE ? console.log("startModule Index") : _VERBOSE;
        _tipo_modulo = tipo_modulo;

        // se guardan cookies para enviarlas a comunidad y nicho
        Cookies.set("url_front", url_front);
        Cookies.set("url_api", url_api);

        // var _url_trabajo = "http://species.conabio.gob.mx/niche?", 
        _url_nicho = url_front + "/geoportal_v0.1.html";
        _url_comunidad = url_front + "/comunidad_v0.1.html";
        _url_api = url_api;

        Cookies.set("url_nicho", _url_nicho);
        Cookies.set("url_comunidad", _url_comunidad);

        // Se cargan los archivos de idiomas y depsues son cargados los modulos subsecuentes
        // _VERBOSE ? console.log(this) : _VERBOSE
        _language_module_net = language_module();
        _language_module_net.startLanguageModule(this, _tipo_modulo);

    }


    /**
     * Se incializan los módulos de traducción y los componentes necesarios para 
     * el índice
     *
     * @function loadModules
     * @memberof! module_index
     */
    function loadModules() {
        _VERBOSE ? console.log("loadModules") : _VERBOSE;
        _iTrans = _language_module_net.getI18();
        _initializeComponents();
    }


    // retorna solamente un objeto con los miembros que son públicos.
    return {
        startModule: startModule,
        loadModules: loadModules
    };

})();


