/**
 * Módulo de internacionalización, utilizado para gestionar el idioma desplegado en nicho y comunidad ecológica.
 *
 * @namespace language_module
 */
var language_module = (function (verbose) {

    console.log("*** loading language_module... ***");

    var _language_selected;
    var _language_label_selected;
    var _first_load;

    var _map_module,
            _variable_module,
            _res_display_module,
            _table_module,
            _histogram_module;

    var _tipo_modulo;

    var _VERBOSE = verbose;


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

//        _VERBOSE ? console.log("localstoarge item language: " + localStorage.getItem("language")) : _VERBOSE;

        if (localStorage.getItem("language") === null) {
            _language_selected = 'en_EN';
            localStorage.language = _language_selected;
        } else {
            _language_selected = localStorage.getItem("language");
        }

//        _VERBOSE ? console.log("_language_selected: " + _language_selected) : _VERBOSE;


        $.i18n.properties({
            name: 'nicho',
            path: 'plugins/i18n/in/bundle/',
            mode: 'both',
            language: _language_selected,
            checkAvailableLanguages: true,
            async: true,
            encoding: "UTF-8",
            callback: function () {

//                _VERBOSE ? console.log("idiomas cargados") : _VERBOSE;
//                console.log("local language: " + localStorage.getItem("language"));

                if (localStorage.getItem("language") === null) {

//                    _VERBOSE ? console.log("undefined") : _VERBOSE;
                    localStorage.language = _language_selected;
                    _loadLabels(_first_load);

                } else {

//                    _VERBOSE ? console.log("language loaded") : _VERBOSE;
                    _language_selected = localStorage.getItem("language");
//                    _VERBOSE ? console.log(_language_selected) : _VERBOSE;
                    _loadLabels(_first_load);

                }

                _first_load = false;

                // carga los modulos siguientes una vez que se han cargado los archivos de idiomas
//                console.log("calling pede...");
                main_pede.loadModules();

            }
        });

        $('ul.dropdown-menu li a.idioma').click(function (e) {

            _language_selected = e.target.getAttribute("value");
            _language_label_selected = e.target.getAttribute("label");

            localStorage.language = _language_selected;

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
                callback: function () {

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
        _VERBOSE ? console.log("firstLoad: " + firstLoad) : _VERBOSE;


        // labels para nicho
        if (_tipo_modulo === 0) {

            $("#lb_titulo").text($.i18n.prop('lb_titulo'));
            $("#lb_sub_titulo").text($.i18n.prop('lb_sub_titulo'));
            $("#nicho_link").text($.i18n.prop('nicho_link'));
            $("#a_espanol").text($.i18n.prop('a_espanol'));
            $("#a_ingles").text($.i18n.prop('a_ingles'));

            $("#footprint_region").text($.i18n.prop('footprint_region') + ":");



            if (firstLoad) {
                $("#btn_idioma").text($.i18n.prop('btn_idioma') + " ");
            } else {
                // agregar casos si se agregan mas idiomas
                if (_language_selected == "es_ES") {
                    $("#btn_idioma").text($.i18n.prop('a_espanol') + " ");
                } else {
                    $("#btn_idioma").text($.i18n.prop('a_ingles') + " ");
                }

            }
            $("#btn_idioma").append('<span class="caret"></span>');

            $("#lb_especie").text($.i18n.prop('lb_especie'));

//            $("#nom_sp").attr("placeholder", $.i18n.prop('esp_name'));

            $("#lb_example").text($.i18n.prop('lb_example'));

            // $("#lb_restricciones").text($.i18n.prop('lb_restricciones'));
            $("#lb_resumen").text($.i18n.prop('lb_resumen'));

            $("#hd_resumen").text($.i18n.prop('hd_resumen'));
            $("#tlt_resumen").text($.i18n.prop('tlt_resumen'));

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

            $("#lb_mapa_res").text($.i18n.prop('lb_mapa_res') + ":");
            $("#lb_sp_list").text($.i18n.prop('lb_sp_list') + ":");



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
            $("#a_raster_fuente").text($.i18n.prop('a_raster'));
            $("#a_topo_fuente").text($.i18n.prop('a_topo'));

            $("#a_taxon_sumidero").text($.i18n.prop('a_taxon'));
            $("#a_raster_sumidero").text($.i18n.prop('a_raster'));
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

            $("#a_item_bio001").text($.i18n.prop('a_item_bio001'));
            $("#a_item_bio002").text($.i18n.prop('a_item_bio002'));
            $("#a_item_bio003").text($.i18n.prop('a_item_bio003'));
            $("#a_item_bio004").text($.i18n.prop('a_item_bio004'));
            $("#a_item_bio005").text($.i18n.prop('a_item_bio005'));
            $("#a_item_bio006").text($.i18n.prop('a_item_bio006'));
            $("#a_item_bio007").text($.i18n.prop('a_item_bio007'));
            $("#a_item_bio008").text($.i18n.prop('a_item_bio008'));
            $("#a_item_bio009").text($.i18n.prop('a_item_bio009'));
            $("#a_item_bio010").text($.i18n.prop('a_item_bio010'));
            $("#a_item_bio011").text($.i18n.prop('a_item_bio011'));
            $("#a_item_bio012").text($.i18n.prop('a_item_bio012'));
            $("#a_item_bio013").text($.i18n.prop('a_item_bio013'));
            $("#a_item_bio014").text($.i18n.prop('a_item_bio014'));
            $("#a_item_bio015").text($.i18n.prop('a_item_bio015'));
            $("#a_item_bio016").text($.i18n.prop('a_item_bio016'));
            $("#a_item_bio017").text($.i18n.prop('a_item_bio017'));
            $("#a_item_bio018").text($.i18n.prop('a_item_bio018'));
            $("#a_item_bio019").text($.i18n.prop('a_item_bio019'));

            $("#a_item_bio020").text($.i18n.prop('a_item_bio020'));
            $("#a_item_bio021").text($.i18n.prop('a_item_bio021'));
            $("#a_item_bio022").text($.i18n.prop('a_item_bio022'));
            $("#a_item_bio023").text($.i18n.prop('a_item_bio023'));
            $("#a_item_bio024").text($.i18n.prop('a_item_bio024'));
            $("#a_item_bio025").text($.i18n.prop('a_item_bio025'));
            $("#a_item_bio026").text($.i18n.prop('a_item_bio026'));
            $("#a_item_bio027").text($.i18n.prop('a_item_bio027'));
            $("#a_item_bio028").text($.i18n.prop('a_item_bio028'));
            $("#a_item_bio029").text($.i18n.prop('a_item_bio029'));
            $("#a_item_bio030").text($.i18n.prop('a_item_bio030'));
            $("#a_item_bio031").text($.i18n.prop('a_item_bio031'));
            $("#a_item_bio032").text($.i18n.prop('a_item_bio032'));
            $("#a_item_bio033").text($.i18n.prop('a_item_bio033'));
            $("#a_item_bio034").text($.i18n.prop('a_item_bio034'));
            $("#a_item_bio035").text($.i18n.prop('a_item_bio035'));
            $("#a_item_bio036").text($.i18n.prop('a_item_bio036'));
            $("#a_item_bio037").text($.i18n.prop('a_item_bio037'));
            $("#a_item_bio038").text($.i18n.prop('a_item_bio038'));
            $("#a_item_bio039").text($.i18n.prop('a_item_bio039'));
            $("#a_item_bio040").text($.i18n.prop('a_item_bio040'));
            $("#a_item_bio041").text($.i18n.prop('a_item_bio041'));
            $("#a_item_bio042").text($.i18n.prop('a_item_bio042'));
            $("#a_item_bio043").text($.i18n.prop('a_item_bio043'));
            $("#a_item_bio044").text($.i18n.prop('a_item_bio044'));
            $("#a_item_bio045").text($.i18n.prop('a_item_bio045'));
            $("#a_item_bio046").text($.i18n.prop('a_item_bio046'));
            $("#a_item_bio047").text($.i18n.prop('a_item_bio047'));
            $("#a_item_bio048").text($.i18n.prop('a_item_bio048'));
            $("#a_item_bio049").text($.i18n.prop('a_item_bio049'));
            $("#a_item_bio050").text($.i18n.prop('a_item_bio050'));
            $("#a_item_bio051").text($.i18n.prop('a_item_bio051'));
            $("#a_item_bio052").text($.i18n.prop('a_item_bio052'));
            $("#a_item_bio053").text($.i18n.prop('a_item_bio053'));
            $("#a_item_bio054").text($.i18n.prop('a_item_bio054'));
            $("#a_item_bio055").text($.i18n.prop('a_item_bio055'));
            $("#a_item_bio056").text($.i18n.prop('a_item_bio056'));
            $("#a_item_bio057").text($.i18n.prop('a_item_bio057'));
            $("#a_item_bio058").text($.i18n.prop('a_item_bio058'));
            $("#a_item_bio059").text($.i18n.prop('a_item_bio059'));
            $("#a_item_bio060").text($.i18n.prop('a_item_bio060'));
            $("#a_item_bio061").text($.i18n.prop('a_item_bio061'));






            $("#btn_variable_bioclim_time").text($.i18n.prop('btn_variable_bioclim_time') + " ");
            $("#btn_variable_bioclim_time").append('<span class="caret"></span>');

            $("#a_actual").text($.i18n.prop('a_actual'));
            $("#a_f50").text($.i18n.prop('a_f50'));
            $("#get_esc_ep").text($.i18n.prop('get_esc_ep'));
            $("#tuto_res").text($.i18n.prop('tuto_res'));

            $("#lb_resultados").text($.i18n.prop('lb_resultados'));

            $("#send_email_csv").text($.i18n.prop('send_email_csv'));
            $("#cancel_email_csv").text($.i18n.prop('cancel_email_csv'));
            $("#lb_modal_shp").text($.i18n.prop('lb_modal_shp'));
            $("#lb_des_modal_shp").text($.i18n.prop('lb_des_modal_shp'));
            $("#send_email_shp").text($.i18n.prop('send_email_shp'));
            $("#map_download").text($.i18n.prop('map_download'));
            $("#sp_download").text($.i18n.prop('sp_download'));
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

            $("#specie_next").text($.i18n.prop('label_next'));

            $("#params_next").text($.i18n.prop('params_next'));
            $("#map_next").text($.i18n.prop('map_next'));
            $("#hist_next").text($.i18n.prop('hist_next'));

            $("#btn_tutorial").text($.i18n.prop('btn_tutorial'));
            $("#btn_tuto_steps").text($.i18n.prop('btn_tuto_steps'));
            $("#show_gen").text($.i18n.prop('show_gen'));            
            

            _confLiveTutorialNiche();


        } else if (_tipo_modulo === 1) {

            $("#lb_titulo_net").text($.i18n.prop('lb_titulo_net'));
            $("#net_link").text($.i18n.prop('net_link'));
            $("#lb_fuente").text($.i18n.prop('lb_fuente'));
            $("#lb_sumidero").text($.i18n.prop('lb_sumidero'));
            $("#btn_topo").text($.i18n.prop('btn_topo'));

            $("#lb_mapa_res").text($.i18n.prop('lb_mapa_res') + ":");
            $("#lb_region_filter").text($.i18n.prop('lb_region_filter') + ":");

            // **** rep
            $("#lb_sub_titulo").text($.i18n.prop('lb_sub_titulo'));
            $("#a_espanol").text($.i18n.prop('a_espanol'));
            $("#a_ingles").text($.i18n.prop('a_ingles'));
            if (firstLoad) {
                $("#btn_idioma").text($.i18n.prop('btn_idioma') + " ");
            } else {
                // agregar casos si se agregan mas idiomas
                if (_language_selected == "es_ES") {
                    $("#btn_idioma").text($.i18n.prop('a_espanol') + " ");
                } else {
                    $("#btn_idioma").text($.i18n.prop('a_ingles') + " ");
                }

            }
            $("#btn_idioma").append('<span class="caret"></span>');


            $("#generaRed").attr("title", $.i18n.prop('lb_genera_red'));
            $("#limpiaRed").attr("title", $.i18n.prop('lb_limpia_red'));

            $("#title_barnet").text($.i18n.prop('titulo_hist_eps'));
            $("#lb_occ_min").text($.i18n.prop('lb_occ_min') + ":");

            $("#generaRed").text($.i18n.prop('generaRed'));

            $("#lb_modal_red").text($.i18n.prop('lb_modal_red'));
            $("#lb_des_modal_red").text($.i18n.prop('lb_des_modal_red'));
            $("#red_download").text($.i18n.prop('red_download'));
            $("#cancel_red_csv").text($.i18n.prop('cancel_red_csv'));

            $("#btn_tutorial").text($.i18n.prop('btn_tutorial'));
            $("#btn_tuto_steps").text($.i18n.prop('btn_tuto_steps'));
            $("#show_gen").text($.i18n.prop('show_gen'));

            _confLiveTutorialNet();

        }
        // index
        else {

//            _VERBOSE ? console.log("tipo_modulo: INDEX") : _VERBOSE;
//            _VERBOSE ? console.log($.i18n.prop('lb_title_index')) : _VERBOSE;
//            _VERBOSE ? console.log("lb_title_index: " + $("#lb_title_index").text()) : _VERBOSE;

            $("#lb_title_index").text($.i18n.prop('lb_title_index'));
            $("#lb_title_qs").text($.i18n.prop('lb_title_qs'));

            $("#a_modelo_nicho").text($.i18n.prop('a_modelo_nicho'));
            $("#a_modelo_comunidad").text($.i18n.prop('a_modelo_comunidad'));


            if (firstLoad) {
                $("#btn_idioma").text($.i18n.prop('btn_idioma') + " ");
            } else {
                // agregar casos si se agregan mas idiomas
                if (_language_selected == "es_ES") {
                    $("#btn_idioma").text($.i18n.prop('a_espanol') + " ");
                } else {
                    $("#btn_idioma").text($.i18n.prop('a_ingles') + " ");
                }

            }
            $("#btn_idioma").append('<span class="caret"></span>');


            $("#send_email_login").text($.i18n.prop('send_email_login'));
            $("#cancel_email_csv").text($.i18n.prop('cancel_email_csv'));

            $("#lb_modal_login").text($.i18n.prop('lb_modal_login'));
            $("#lb_des_modal_login").text($.i18n.prop('lb_des_modal_login'));

            $("#btn_redirect").text($.i18n.prop('btn_redirect'));





        }

    }

    function _confLiveTutorialNet() {

        $('#btn_tuto_steps.display-marker').on('click', function () {

//            console.log($("#a_taxon_fuente").parent().hasClass("active"));
//            console.log($("#a_raster_fuente").parent().hasClass("active"));
//            console.log($("#a_taxon_sumidero").parent().hasClass("active"));
//            console.log($("#a_raster_sumidero").parent().hasClass("active"));
            
            
            var item_tab, item_tree, group_btn, clean_btn;
            
            if ($("#a_taxon_fuente").parent().hasClass("active")) {
                item_tab = {
                    el: '#tuto_taxon_sp_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p22'),
                        content: $.i18n.prop('label_esp_p23')
                    }
                }
                item_tree = {
                    el: '#treeVariable_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p24'),
                        content: $.i18n.prop('label_esp_p25')
                    }
                }
                group_btn = {
                    el: '#add_group_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p26'),
                        content: $.i18n.prop('label_esp_p27')
                    }
                }
                clean_btn = {
                    el: '#clean_var_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p28'),
                        content: $.i18n.prop('label_esp_p29')
                    }
                }

            }

            if ($("#a_raster_fuente").parent().hasClass("active")) {
                item_tab = {
                    el: '#btn_bioclim_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p50'),
                        content: $.i18n.prop('label_esp_p51')
                    }

                }
                item_tree = {
                    el: '#treeVariableBioclim_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p52'),
                        content: $.i18n.prop('label_esp_p53')
                    }
                }
                group_btn = {
                    el: '#add_group_bioclim_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p26'),
                        content: $.i18n.prop('label_esp_p27')
                    }
                }
                clean_btn = {
                    el: '#clean_var_bioclim_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p28'),
                        content: $.i18n.prop('label_esp_p29')
                    }
                }

            }

            
            $.ptJs({
                autoStart: true,
                continueEnable: true,
                templateData: {
                    content: '',
                    title: $.i18n.prop('label_com_p1'),
                    'button-start': $.i18n.prop('button_start'),
                    'button-next': $.i18n.prop('button_next'),
                    'button-previous': $.i18n.prop('button_previous'),
                    'button-restart': $.i18n.prop('button_restart'),
                    'button-continue': $.i18n.prop('button_continue'),
                    'button-end': $.i18n.prop('button_end')
                },
                steps: [
                    {
                        el: document,
                        modal: true,
                        templateData: {
                            content: $.i18n.prop('label_com_p2'),
                            title: $.i18n.prop('label_com_p1')
                        }
                    },
                    {
                        el: '#div_seleccion_variables_fuente',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_com_p3'),
                            content: $.i18n.prop('label_com_p4')
                        }
                    },
                    {
                        el: '#div_seleccion_variables_sumidero',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_com_p5'),
                            content: $.i18n.prop('label_com_p6')
                        }
                    },
                    {
                        el: '#tuto_nav_tabs_fuente',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_com_p7'),
                            content: $.i18n.prop('label_com_p8')
                        }
                    },
                    item_tab,
                    item_tree,
                    group_btn,
                    clean_btn,
//                    {
//                        el: '#tuto_taxon_sp_fuente',
//                        position: {
//                            location: 'rm-b'
//                        },
//                        templateData: {
//                            title: $.i18n.prop('label_com_p9'),
//                            content: $.i18n.prop('label_com_p10')
//                        }
//                    },
//                    {
//                        el: '#treeVariable_fuente',
//                        position: {
//                            location: 'rm-b'
//                        },
//                        templateData: {
//                            title: $.i18n.prop('label_com_p11'),
//                            content: $.i18n.prop('label_com_p12')
//                        }
//                    },
//                    {
//                        el: '#add_group_fuente',
//                        position: {
//                            location: 'rm-t'
//                        },
//                        templateData: {
//                            title: $.i18n.prop('label_com_p13'),
//                            content: $.i18n.prop('label_com_p14')
//                        }
//                    },
//                    {
//                        el: '#clean_var_fuente',
//                        position: {
//                            location: 'rm-t'
//                        },
//                        templateData: {
//                            title: $.i18n.prop('label_com_p15'),
//                            content: $.i18n.prop('label_com_p16')
//                        }
//                    },
                    {
                        el: '#treeAddedPanel_fuente',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_com_p17'),
                            content: $.i18n.prop('label_com_p18')
                        }
                    },
                    {
                        el: '#div_seleccion_variables_sumidero',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_com_p19'),
                            content: $.i18n.prop('label_com_p20')
                        }
                    },
                    {
                        el: '#tuto_occ',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_com_p21'),
                            content: $.i18n.prop('label_com_p22')
                        }
                    },
                    {
                        el: '#tuto_resolution',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p5'),
                            content: $.i18n.prop('label_esp_p6')
                        }
                    },
                    {
                        el: '#tuto_region',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p54'),
                            content: $.i18n.prop('label_esp_p55')
                        }
                    },
                    {
                        el: '#generaRed',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_com_p21'),
                            content: $.i18n.prop('label_com_p23')
                        }
                    },
                    {
                        el: '#show_gen',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p44'),
                            content: $.i18n.prop('label_esp_p45') + '<br><img style="width:100%" alt="Responsive image" src="images/img_gen_link' + $.i18n.prop('url_image_link') + '.png">'
                        }
                    }

                ]
            });

        });

    }



    function _confLiveTutorialNiche() {

        _VERBOSE ? console.log("_confLiveTutorialNiche") : _VERBOSE;

        $('#btn_tuto_steps.display-marker').on('click', function () {

            _VERBOSE ? console.log("btn_tuto_steps") : _VERBOSE;


//            console.log($("#a_taxon_fuente").parent().hasClass("active"));
//            console.log($("#a_raster_fuente").parent().hasClass("active"));

            var item_tab, item_tree, group_btn, clean_btn;
            if ($("#a_taxon_fuente").parent().hasClass("active")) {
                item_tab = {
                    el: '#tuto_taxon_sp_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p22'),
                        content: $.i18n.prop('label_esp_p23')
                    }
                }
                item_tree = {
                    el: '#treeVariable_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p24'),
                        content: $.i18n.prop('label_esp_p25')
                    }
                }
                group_btn = {
                    el: '#add_group_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p26'),
                        content: $.i18n.prop('label_esp_p27')
                    }
                }
                clean_btn = {
                    el: '#clean_var_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p28'),
                        content: $.i18n.prop('label_esp_p29')
                    }
                }

            }

            if ($("#a_raster_fuente").parent().hasClass("active")) {
                item_tab = {
                    el: '#btn_bioclim_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p50'),
                        content: $.i18n.prop('label_esp_p51')
                    }

                }
                item_tree = {
                    el: '#treeVariableBioclim_fuente',
                    position: {
                        location: 'rm-b'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p52'),
                        content: $.i18n.prop('label_esp_p53')
                    }
                }
                group_btn = {
                    el: '#add_group_bioclim_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p26'),
                        content: $.i18n.prop('label_esp_p27')
                    }
                }
                clean_btn = {
                    el: '#clean_var_bioclim_fuente',
                    position: {
                        location: 'rm-t'
                    },
                    templateData: {
                        title: $.i18n.prop('label_esp_p28'),
                        content: $.i18n.prop('label_esp_p29')
                    }
                }

            }


//            if($("a_taxon_fuente")){
//            }a_clima_fuente

            $.ptJs({
                autoStart: true,
                continueEnable: true,
                templateData: {
                    content: '',
                    title: $.i18n.prop('label_esp_p1'),
                    'button-start': $.i18n.prop('button_start'),
                    'button-next': $.i18n.prop('button_next'),
                    'button-previous': $.i18n.prop('button_previous'),
                    'button-restart': $.i18n.prop('button_restart'),
                    'button-continue': $.i18n.prop('button_continue'),
                    'button-end': $.i18n.prop('button_end')
                },
                steps: [
                    {
                        el: document,
                        modal: true,
                        templateData: {
                            content: $.i18n.prop('label_esp_p2'),
                            title: $.i18n.prop('label_esp_p1')
                        }
                    },
                    {
                        el: '#tuto_autocomplete',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p3'),
                            content: $.i18n.prop('label_esp_p4')
                        }
                    },
                    {
                        el: '#tuto_region',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p54'),
                            content: $.i18n.prop('label_esp_p55')
                        }
                    },
                    {
                        el: '#tuto_resolution',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p5'),
                            content: $.i18n.prop('label_esp_p6')
                        }
                    },
                    {
                        el: '#tuto_fil_fecha',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p7'),
                            content: $.i18n.prop('label_esp_p8')
                        }
                    },
                    {
                        el: '#tuto_reg_fecha',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p9'),
                            content: $.i18n.prop('label_esp_p10')
                        }
                    },
                    {
                        el: '#tuto_reg_fosil',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p11'),
                            content: $.i18n.prop('label_esp_p12')
                        }
                    },
                    {
                        el: '#tuto_histo_reg',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p13'),
                            content: $.i18n.prop('label_esp_p46')
                        }
                    },
                    {
                        el: '#reload_map',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p14'),
                            content: $.i18n.prop('label_esp_p15')
                        }
                    },
                    {
                        el: '#tuto_mapa_occ',
                        position: {
                            location: 'lt'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p16'),
                            content: $.i18n.prop('label_esp_p17') + '<br><img style="width:100%" alt="Responsive image" src="images/img_reg.png">'
                        }
                    },
                    {
                        el: '#tuto_variables',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p18'),
                            content: $.i18n.prop('label_esp_p19')
                        }
                    },
                    {
                        el: '#tuto_nav_tabs_fuente',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p20'),
                            content: $.i18n.prop('label_esp_p21')
                        }
                    },
                    item_tab,
                    item_tree,
                    group_btn,
                    clean_btn,
                    {
                        el: '#treeAddedPanel_fuente',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p30'),
                            content: $.i18n.prop('label_esp_p31')
                        }
                    },
                    {
                        el: '#tuto_params',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p32'),
                            content: $.i18n.prop('label_esp_p33')
                        }
                    },
//                    {
//                        el: '#tuto_val',
//                        position: {
//                            location: 'rm-t'
//                        },
//                        templateData: {
//                            title: $.i18n.prop('label_esp_p34'),
//                            content: $.i18n.prop('label_esp_p35')
//                        }
//                    },
                    {
                        el: '#tuto_min_occ',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p36'),
                            content: $.i18n.prop('label_esp_p37')
                        }
                    },
//                    {
//                        el: '#tuto_apriori',
//                        position: {
//                            location: 'lm-t'
//                        },
//                        templateData: {
//                            title: $.i18n.prop('label_esp_p38'),
//                            content: $.i18n.prop('label_esp_p39')
//                        }
//                    },
//                    {
//                        el: '#tuto_map_prob',
//                        position: {
//                            location: 'lm-t'
//                        },
//                        templateData: {
//                            title: $.i18n.prop('label_esp_p40'),
//                            content: $.i18n.prop('label_esp_p41')
//                        }
//                    },
                    {
                        el: '#get_esc_ep',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p42'),
                            content: $.i18n.prop('label_esp_p43')
                        }
                    },
                    {
                        el: '#show_gen',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p44'),
                            content: $.i18n.prop('label_esp_p45') + '<br><img style="width:100%" alt="Responsive image" src="images/img_gen_link' + $.i18n.prop('url_image_link') + '.png">'
                        }
                    }

                ]
            });
        });


        $("#tuto_res.display-marker").on('click', function () {
            $.ptJs({
                autoStart: true,
                continueEnable: true,
                templateData: {
                    content: '',
                    title: $.i18n.prop('label_esp_res_p1')
                },
                steps: [
                    {
                        el: document,
                        modal: true,
                        templateData: {
                            content: $.i18n.prop('label_esp_res_p2'),
                            title: $.i18n.prop('label_esp_res_p1')
                        }
                    },
                    {
                        el: '#map',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_res_p3'),
                            content: $.i18n.prop('label_esp_res_p4')
                        }
                    },
                    {
                        el: '#myScrollableBlockEpsilonDecil',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_res_p5'),
                            content: $.i18n.prop('label_esp_res_p6')
                        }
                    },
                    {
                        el: '#div_example',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_res_p7'),
                            content: $.i18n.prop('label_esp_res_p8')
                        }
                    },
                    {
                        el: '#hst_esp_eps',
                        position: {
                            location: 'rm-c'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_res_p9'),
                            content: $.i18n.prop('label_esp_res_p10')
                        }
                    },
                    {
                        el: '#hst_esp_scr',
                        position: {
                            location: 'rm-c'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_res_p11'),
                            content: $.i18n.prop('label_esp_res_p12')
                        }
                    },
                    {
                        el: '#hst_cld_scr',
                        position: {
                            location: 'lm-c'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_res_p13'),
                            content: $.i18n.prop('label_esp_res_p14')
                        }
                    },
                    {
                        el: '#treeAddedPanel',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_res_p15'),
                            content: $.i18n.prop('label_esp_res_p16')
                        }
                    }



                ]
            });
        });

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