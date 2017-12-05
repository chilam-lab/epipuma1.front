/**
 * Módulo de internacionalización, utilizado para gestionar el idioma desplegado en nicho y comunidad ecológica.
 *
 * @namespace language_module
 */
var language_module = (function(verbose) {

    var _language_selected;
    var _language_label_selected;
    var _first_load;

    var _map_module,
            _variable_module,
            _res_display_module,
            _table_module,
            _histogram_module;

    var _tipo_modulo;

    var _VERBOSE = verbose


    /**
     * Éste método inicializa las variables necesarias para el proceso de internacionalización y realiza la carga de los archivos de idiomas.
     *
     * @function _initilizeElementsForLanguage
     * @private
     * @memberof! language_module
     * 
     * @param {object} main_pede - Referencia al controlador de nicho o communidad ecológica
     * @param {integer} tipo_modulo - Tipo de controlador para enlazar el módulo de internacionalización
     */
    function _initilizeElementsForLanguage(main_pede, tipo_modulo) {

        _VERBOSE ? console.log("_initilizeElementsForLanguage") : _VERBOSE;

        _tipo_modulo = tipo_modulo;
        _first_load = true;
        
        
        if (Cookies.get("language") === undefined) {
            _language_selected = 'es_MX';
            Cookies.set("language", _language_selected);
        }
        else{
            _language_selected = Cookies.get("language");
        }
        
        _VERBOSE ? console.log("_language_selected: " + _language_selected) : _VERBOSE;
        

        $.i18n.properties({
            name: 'nicho',
            path: 'plugins/i18n/in/bundle/',
            mode: 'both',
            language: _language_selected,
            checkAvailableLanguages: true,
            async: true,
            encoding: "UTF-8",
            callback: function() {

                _VERBOSE ? console.log("idiomas cargados") : _VERBOSE;


                if (Cookies.get("language") === undefined) {

                    _VERBOSE ? console.log("undefined") : _VERBOSE;
                    Cookies.set("language", _language_selected);
                    _loadLabels(_first_load);
                    
                }
                else {

                    _VERBOSE ? console.log("language loaded") : _VERBOSE;
                    _language_selected = Cookies.get("language");
                    _VERBOSE ? console.log(_language_selected) : _VERBOSE;
                    _loadLabels(_first_load);

                }
                
                _first_load = false;


                // carga los modulos siguientes una vez que se han cargado los archivos de idiomas
                main_pede.loadModules();

            }
        });

        $('ul.dropdown-menu li a.idioma').click(function(e) {

            _language_selected = e.target.getAttribute("value");
            _language_label_selected = e.target.getAttribute("label");
            
            Cookies.set("language", _language_selected);

            _VERBOSE ? console.log("value: " + _language_selected) : _VERBOSE;
            _VERBOSE ? console.log("label: " + _language_label_selected) : _VERBOSE;

            $("#btn_idioma").attr("value", _language_selected);

            $.i18n.properties({
                name: 'nicho',
                path: 'plugins/i18n/in/bundle/',
                mode: 'both',
                language: _language_selected,
                checkAvailableLanguages: true,
                async: true,
                callback: function() {

                    _loadLabels(_first_load);
                    _updateLanguageModules(_first_load);

                }
            });

            e.preventDefault();
        });

    }


    /**
     * Método getter del módulo de internacionalización.
     *
     * @function getI18
     * @public
     * @memberof! net_module
     * 
     */
    function getI18() {
        return $.i18n;
    }



    /**
     * Éste método actualiza los labels de los controladores de nicho, comunidad y del módulo variable.
     *
     * @function _updateLanguageModules
     * @private
     * @memberof! language_module
     * 
     * @param {boolean} first_load - Bandera que indica si es la primera carga del módulo de internacionalización
     */
    function _updateLanguageModules(first_load) {
        
        _VERBOSE ? console.log("_updateLanguageModules") : _VERBOSE;
        _VERBOSE ? console.log("first_load: " + first_load) : _VERBOSE;

        if (first_load)
            return;

        if (_tipo_modulo !== 2) {
            
            _res_display_module.updateLabels();
            _map_module.updateLabels();
            
        }

    }


    /**
     * Éste método asigna a variables globales instancias de los módulos de histograma, mapa y controladores de nicho y comunidad ecológica.
     *
     * @function addModuleForLanguage
     * @public
     * @memberof! language_module
     * 
     * @param {object} res_display_module - Controlador de nicho ecológico
     * @param {object} histogram_module - Módulo histograma
     * @param {object} map_module - Módulo mapa
     * @param {object} variable_module - Módulo variable
     */
    function addModuleForLanguage(res_display_module, histogram_module, map_module, variable_module) {

        _VERBOSE ? console.log("addModuleForLanguage") : _VERBOSE;

        _map_module = map_module;

        _variable_module = variable_module;

        _res_display_module = res_display_module;

        // para red no es necesario
        _histogram_module = histogram_module;

    }


    /**
     * Éste método realiza la actualización de los labels de los elementos visuales de de nicho y comunidad ecológica.
     *
     * @function _loadLabels
     * @private
     * @memberof! language_module
     * 
     * @param {boolean} first_load - Bandera que indica si es la primera carga del módulo de internacionalización
     */
    function _loadLabels(firstLoad) {

        _VERBOSE ? console.log("_loadLabels") : _VERBOSE;
        _VERBOSE ? console.log("tipo_modulo: " + _tipo_modulo) : _VERBOSE;

        // labels para nicho
        if (_tipo_modulo == 0) {

            $("#lb_titulo").text($.i18n.prop('lb_titulo'));
            $("#lb_sub_titulo").text($.i18n.prop('lb_sub_titulo'));
            $("#nicho_link").text($.i18n.prop('nicho_link'));
            $("#a_espanol").text($.i18n.prop('a_espanol'));
            $("#a_ingles").text($.i18n.prop('a_ingles'));

            if (firstLoad) {
                $("#btn_idioma").text($.i18n.prop('btn_idioma') + " ");
            }
            else {
                // agregar casos si se agregan mas idiomas
                if (_language_selected == "es_MX") {
                    $("#btn_idioma").text($.i18n.prop('a_espanol') + " ");
                }
                else {
                    $("#btn_idioma").text($.i18n.prop('a_ingles') + " ");
                }

            }
            $("#btn_idioma").append('<span class="caret"></span>');

            $("#lb_especie").text($.i18n.prop('lb_especie'));
            
//            $("#nom_sp").attr("placeholder", $.i18n.prop('esp_name'));
            
            $("#lb_example").text($.i18n.prop('lb_example'));

            // $("#lb_restricciones").text($.i18n.prop('lb_restricciones'));
            $("#lb_resumen").text($.i18n.prop('lb_resumen'));

            $("#lb_construccion").text($.i18n.prop('lb_construccion'));
            $("#lb_validacion").text($.i18n.prop('lb_validacion') + ":");
            
            
            $("#lb_apriori").text($.i18n.prop('lb_apriori') + ":");
            $("#lb_occ_min").text($.i18n.prop('lb_occ_min') + ":");
            $("#lb_fosil").text($.i18n.prop('lb_fosil') + ":");
            
            $("#lb_mapprob").text($.i18n.prop('lb_mapprob') + ":");
            
            $("#lb_reg_fecha").text($.i18n.prop('lb_reg_fecha') + ":");
            $("#lb_mapprob").text($.i18n.prop('lb_mapprob') + ":");
            
            $("#lb_range_fecha").text($.i18n.prop('lb_range_fecha') + ":");
            
            $("#reload_map").text($.i18n.prop('reload_map'));
            
            $("#tab_resumen").text($.i18n.prop('tab_resumen'));
            $("#tab_variables").text($.i18n.prop('tab_variables'));
            $("#tab_filtros").text($.i18n.prop('tab_filtros'));
            
            $("#lb_mapa_res").text($.i18n.prop('lb_mapa_res')+ ":");
            $("#lb_sp_list").text($.i18n.prop('lb_sp_list')+ ":");
            
            
            
            $("#labelFecha").text($.i18n.prop('labelFecha', "1500", $.i18n.prop('val_actual')));
            
            
            $("#labelValidation").text($.i18n.prop('lb_no'));
            $("#lb_sfecha").text($.i18n.prop('lb_si'));
            $("#labelFosil").text($.i18n.prop('lb_si'));
            
            $("#lb_panel_region").text($.i18n.prop('lb_panel_region'));
            $("#lb_seccion_region").text($.i18n.prop('lb_seccion_region'));
            $("#lb_estados").text($.i18n.prop('lb_estados'));
            $("#lb_ecos").text($.i18n.prop('lb_ecos'));
            $("#lb_seccion_tools").text($.i18n.prop('lb_seccion_tools'));
            $("#lb_tools_ayuda").text($.i18n.prop('lb_tools_ayuda'));
            $("#lb_panel_variables").text($.i18n.prop('lb_panel_variables'));
            $("#a_taxon_fuente").text($.i18n.prop('a_taxon'));
            $("#a_clima_fuente").text($.i18n.prop('a_clima'));
            $("#a_topo_fuente").text($.i18n.prop('a_topo'));
            
            $("#a_taxon_sumidero").text($.i18n.prop('a_taxon'));
            $("#a_clima_sumidero").text($.i18n.prop('a_clima'));
            $("#a_topo_sumidero").text($.i18n.prop('a_topo'));


            $("#btn_variable_fuente").text($.i18n.prop('btn_variable') + " ");
            $("#btn_variable_fuente").append('<span class="caret"></span>');
            
            $("#btn_variable_sumidero").text($.i18n.prop('btn_variable') + " ");
            $("#btn_variable_sumidero").append('<span class="caret"></span>');


            $("#lb_occ").text($.i18n.prop('lb_occ') + ":");
            $("#lb_occ_celda").text($.i18n.prop('lb_occ_celda') + ":");

            $("#lb_sum_reino").text($.i18n.prop('a_item_reino') + ":");
            $("#lb_sum_phylum").text($.i18n.prop('a_item_phylum') + ":");
            $("#lb_sum_clase").text($.i18n.prop('a_item_clase') + ":");
            $("#lb_sum_orden").text($.i18n.prop('a_item_orden') + ":");
            $("#lb_sum_familia").text($.i18n.prop('a_item_familia') + ":");
            $("#lb_sum_genero").text($.i18n.prop('a_item_genero') + ":");
            $("#lb_sum_especie").text($.i18n.prop('a_item_especie') + ":");


            $("#a_item_reino_fuente").text($.i18n.prop('a_item_reino'));
            $("#a_item_phylum_fuente").text($.i18n.prop('a_item_phylum'));
            $("#a_item_clase_fuente").text($.i18n.prop('a_item_clase'));
            $("#a_item_orden_fuente").text($.i18n.prop('a_item_orden'));
            $("#a_item_familia_fuente").text($.i18n.prop('a_item_familia'));
            $("#a_item_genero_fuente").text($.i18n.prop('a_item_genero'));
            
            $("#a_item_reino_sumidero").text($.i18n.prop('a_item_reino'));
            $("#a_item_phylum_sumidero").text($.i18n.prop('a_item_phylum'));
            $("#a_item_clase_sumidero").text($.i18n.prop('a_item_clase'));
            $("#a_item_orden_sumidero").text($.i18n.prop('a_item_orden'));
            $("#a_item_familia_sumidero").text($.i18n.prop('a_item_familia'));
            $("#a_item_genero_sumidero").text($.i18n.prop('a_item_genero'));
            

            $("#btn_variable_bioclim").text($.i18n.prop('btn_variable_bioclim') + " ");
            $("#btn_variable_bioclim").append('<span class="caret"></span>');

            $("#a_item_bio00").text($.i18n.prop('a_item_bio00'));
            $("#a_item_bio01").text($.i18n.prop('a_item_bio01'));
            $("#a_item_bio02").text($.i18n.prop('a_item_bio02'));
            $("#a_item_bio03").text($.i18n.prop('a_item_bio03'));
            $("#a_item_bio04").text($.i18n.prop('a_item_bio04'));
            $("#a_item_bio05").text($.i18n.prop('a_item_bio05'));
            $("#a_item_bio06").text($.i18n.prop('a_item_bio06'));
            $("#a_item_bio07").text($.i18n.prop('a_item_bio07'));
            $("#a_item_bio08").text($.i18n.prop('a_item_bio08'));
            $("#a_item_bio09").text($.i18n.prop('a_item_bio09'));
            $("#a_item_bio10").text($.i18n.prop('a_item_bio10'));
            $("#a_item_bio11").text($.i18n.prop('a_item_bio11'));
            $("#a_item_bio12").text($.i18n.prop('a_item_bio12'));
            $("#a_item_bio13").text($.i18n.prop('a_item_bio13'));
            $("#a_item_bio14").text($.i18n.prop('a_item_bio14'));
            $("#a_item_bio15").text($.i18n.prop('a_item_bio15'));
            $("#a_item_bio16").text($.i18n.prop('a_item_bio16'));
            $("#a_item_bio17").text($.i18n.prop('a_item_bio17'));
            $("#a_item_bio18").text($.i18n.prop('a_item_bio18'));
            $("#a_item_bio19").text($.i18n.prop('a_item_bio19'));

            $("#btn_variable_bioclim_time").text($.i18n.prop('btn_variable_bioclim_time') + " ");
            $("#btn_variable_bioclim_time").append('<span class="caret"></span>');

            $("#a_actual").text($.i18n.prop('a_actual'));
            $("#a_f50").text($.i18n.prop('a_f50'));
            $("#get_esc_ep").text($.i18n.prop('get_esc_ep'));
            $("#lb_resultados").text($.i18n.prop('lb_resultados'));

            $("#send_email_csv").text($.i18n.prop('send_email_csv'));
            $("#cancel_email_csv").text($.i18n.prop('cancel_email_csv'));
            $("#lb_modal_shp").text($.i18n.prop('lb_modal_shp'));
            $("#lb_des_modal_shp").text($.i18n.prop('lb_des_modal_shp'));
            $("#send_email_shp").text($.i18n.prop('send_email_shp'));
            $("#cancel_email_shp").text($.i18n.prop('cancel_email_shp'));
            $("#lb_modal_csv").text($.i18n.prop('lb_modal_csv'));
            $("#csv_request").attr("title", $.i18n.prop('lb_descarga_tbl'));


            $("#lb_des_modal_csv").text($.i18n.prop('lb_des_modal_csv'));
            $("#email_address").attr("placeholder", $.i18n.prop('email_address'));
            $("#email_address_shp").attr("placeholder", $.i18n.prop('email_address_shp'));


            // actualiza los titulos de las tablas
            $('#example tr:eq(0) th:eq(0)').text($.i18n.prop('lb_decil'));
            $('#example tr:eq(0) th:eq(1)').text($.i18n.prop('lb_especie_tbl'));
            $('#example tr:eq(0) th:eq(2)').text($.i18n.prop('lb_epsilon'));
            $('#example tr:eq(0) th:eq(3)').text($.i18n.prop('tip_tbl_score'));
            $('#example tr:eq(0) th:eq(4)').text($.i18n.prop('lb_procentaje_occ'));


            $('#tdisplay tr:eq(0) th:eq(0)').text($.i18n.prop('lb_genero_tbl'));
            $('#tdisplay tr:eq(0) th:eq(1)').text($.i18n.prop('lb_especie_tbl'));
            // $('#tdisplay tr:eq(0) th:eq(2)').text($.i18n.prop('lb_raster'));
            // $('#tdisplay tr:eq(0) th:eq(3)').text($.i18n.prop('lb_rango'));
            $('#tdisplay tr:eq(0) th:eq(2)').text($.i18n.prop('lb_nij'));
            $('#tdisplay tr:eq(0) th:eq(3)').text($.i18n.prop('lb_nj'));
            $('#tdisplay tr:eq(0) th:eq(4)').text($.i18n.prop('lb_ni'));
            $('#tdisplay tr:eq(0) th:eq(5)').text($.i18n.prop('lb_n'));
            $('#tdisplay tr:eq(0) th:eq(6)').text($.i18n.prop('lb_epsilon'));
            $('#tdisplay tr:eq(0) th:eq(7)').text($.i18n.prop('tip_tbl_score'));
            $('#tdisplay tr:eq(0) th:eq(8)').text($.i18n.prop('a_item_reino'));
            $('#tdisplay tr:eq(0) th:eq(0)').text($.i18n.prop('a_item_phylum'));
            $('#tdisplay tr:eq(0) th:eq(10)').text($.i18n.prop('a_item_clase'));
            $('#tdisplay tr:eq(0) th:eq(11)').text($.i18n.prop('a_item_orden'));
            $('#tdisplay tr:eq(0) th:eq(12)').text($.i18n.prop('a_item_familia'));


        }
        else if (_tipo_modulo == 1) {

            $("#lb_titulo_net").text($.i18n.prop('lb_titulo_net'));
            $("#net_link").text($.i18n.prop('net_link'));
            $("#lb_fuente").text($.i18n.prop('lb_fuente'));
            $("#lb_sumidero").text($.i18n.prop('lb_sumidero'));
            $("#btn_topo").text($.i18n.prop('btn_topo'));



            // **** rep
            $("#lb_sub_titulo").text($.i18n.prop('lb_sub_titulo'));
            $("#a_espanol").text($.i18n.prop('a_espanol'));
            $("#a_ingles").text($.i18n.prop('a_ingles'));
            if (firstLoad) {
                $("#btn_idioma").text($.i18n.prop('btn_idioma') + " ");
            }
            else {
                // agregar casos si se agregan mas idiomas
                if (_language_selected == "es_MX") {
                    $("#btn_idioma").text($.i18n.prop('a_espanol') + " ");
                }
                else {
                    $("#btn_idioma").text($.i18n.prop('a_ingles') + " ");
                }

            }
            $("#btn_idioma").append('<span class="caret"></span>');


            $("#generaRed").attr("title", $.i18n.prop('lb_genera_red'));
            $("#limpiaRed").attr("title", $.i18n.prop('lb_limpia_red'));

            $("#title_barnet").text($.i18n.prop('titulo_hist_eps'));
            $("#lb_occ_min").text($.i18n.prop('lb_occ_min') + ":");
            
            $("#generaRed").text($.i18n.prop('generaRed'));

        }
        // index
        else {


            $("#lb_title_index").text($.i18n.prop('lb_title_index'));
            $("#lb_title_qs").text($.i18n.prop('lb_title_qs'));

            $("#a_modelo_nicho").text($.i18n.prop('a_modelo_nicho'));
            $("#a_modelo_comunidad").text($.i18n.prop('a_modelo_comunidad'));


            if (firstLoad) {
                $("#btn_idioma").text($.i18n.prop('btn_idioma') + " ");
            }
            else {
                // agregar casos si se agregan mas idiomas
                if (_language_selected == "es_MX") {
                    $("#btn_idioma").text($.i18n.prop('a_espanol') + " ");
                }
                else {
                    $("#btn_idioma").text($.i18n.prop('a_ingles') + " ");
                }

            }
            $("#btn_idioma").append('<span class="caret"></span>');


            $("#send_email_login").text($.i18n.prop('send_email_login'));
            $("#cancel_email_csv").text($.i18n.prop('cancel_email_csv'));

            $("#lb_modal_login").text($.i18n.prop('lb_modal_login'));
            $("#lb_des_modal_login").text($.i18n.prop('lb_des_modal_login'));


        }

    }


    /**
     * Éste método realiza el llmado a la función que inicializa las variables necesarias para el proceso de internacionalización.
     *
     * @function startLanguageModule
     * @private
     * @memberof! language_module
     * 
     * @param {object} main_pede - Referencia al controlador de nicho o communidad ecológica
     * @param {integer} tipo_modulo - Tipo de controlador para enlazar el módulo de internacionalización
     */
    function startLanguageModule(main_pede, tipo_modulo) {

        _VERBOSE ? console.log("startLanguageModule") : _VERBOSE;

        _initilizeElementsForLanguage(main_pede, tipo_modulo);

    }

    return{
        startLanguageModule: startLanguageModule,
        getI18: getI18,
        addModuleForLanguage: addModuleForLanguage

    }
});