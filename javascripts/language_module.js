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
    var _demo_config = demos.demos_en

    var _map_module,
            _variable_module,
            _res_display_module,
            _table_module,
            _histogram_module;

    var _tipo_modulo;

    var _VERBOSE = verbose;

    
    function setDemoUseCase(demo_config){
        _demo_config = demo_config
    }

    function _configDemoCases(demo_config = _demo_config){

        _VERBOSE ? console.log("_configDemoCases") : _VERBOSE;

        $("#list_demo_cases").empty();

        demo_config.forEach(function(demo,index){

            $("#list_demo_cases")
                .append('<li><button id="demo_'+index+'" class="btn btn-default btn-demo" type="button" >'+demo.title_demo+'</button></li><br/>');

        })

    }

    $("body").on('click','.btn-demo',function(){
        
        _VERBOSE ? console.log("prueba") : _VERBOSE;
        console.log(this.id);

        var index = this.id.split("_")[1];
        console.log("index: " + index);

        $('#modalDemo').modal('hide');

        _confLiveDemoNiche(index)

    });

     

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

        _language_selected = config.language

       _VERBOSE ? console.log("_language_selected: " + _language_selected) : _VERBOSE;


        $.i18n.properties({
            name: 'nicho',
            path: 'plugins/i18n/in/bundle/',
            mode: 'both',
            language: _language_selected,
            checkAvailableLanguages: true,
            async: true,
            encoding: "UTF-8",
            callback: function () {

                _language_selected = config.language
//                    _VERBOSE ? console.log(_language_selected) : _VERBOSE;
                _loadLabels(_first_load);
                
                _first_load = false;

                // carga los modulos siguientes una vez que se han cargado los archivos de idiomas
//                console.log("calling pede...");
                // _VERBOSE ? console.log(main_pede) : _VERBOSE
                main_pede.loadModules();

            }
        });

        $('ul.dropdown-menu li a.idioma').click(function (e) {

            _language_selected = e.target.getAttribute("value");
            _language_label_selected = e.target.getAttribute("label");

            config.language = _language_selected;

            _demo_config = {}
            
            if(_language_selected === "es_ES"){
                _demo_config = demos.demos_es
            }
            else{
                _demo_config = demos.demos_en
            }

            console.log(_demo_config)
            _configDemoCases(_demo_config)



            // localStorage.language = _language_selected;

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

        _configDemoCases();

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

    function setTableModule(table_module){
        _table_module = table_module
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


            $("#lb_params_variables").text($.i18n.prop('lb_params_variables'));



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

            $("#btnSchSp").prop("value", $.i18n.prop('btnSchSp'));

//            $("#nom_sp").attr("placeholder", $.i18n.prop('esp_name'));

            $("#lb_example").text($.i18n.prop('lb_example'));

            // $("#lb_restricciones").text($.i18n.prop('lb_restricciones'));
            $("#lb_resumen").text($.i18n.prop('lb_resumen'));

            $("#hd_resumen").text($.i18n.prop('hd_resumen'));
            $("#tlt_resumen").text($.i18n.prop('tlt_resumen'));

            $("#lb_construccion").text($.i18n.prop('lb_construccion'));
            $("#lb_validacion").text($.i18n.prop('lb_validacion') + ":");
            $("#lb_validacion_temp").text($.i18n.prop('lb_validacion_temp') + ":");


            $("#lb_apriori").text($.i18n.prop('lb_apriori') + ":");
            $("#lb_occ_min").text($.i18n.prop('lb_occ_min') + ":");
            $("#lb_fosil").text($.i18n.prop('lb_fosil') + ":");

            $("#lb_mapprob").text($.i18n.prop('lb_mapprob') + ":");

            $("#lb_reg_fecha").text($.i18n.prop('lb_reg_fecha') + ":");
            $("#lb_mapprob").text($.i18n.prop('lb_mapprob') + ":");

            $("#lb_range_fecha").text($.i18n.prop('lb_range_fecha') + ":");

            $("#reload_map").text($.i18n.prop('see_species') + "  ");
            $("#reload_map").append(" <i class='fa fa-arrow-right'></i>");

            $("#tab_resumen").text($.i18n.prop('tab_resumen'));
            $("#tab_variables").text($.i18n.prop('tab_variables'));
            $("#tab_filtros").text($.i18n.prop('tab_filtros'));

            $("#lb_mapa_res").text($.i18n.prop('lb_mapa_res') + ":");
            $("#lb_sp_list").text($.i18n.prop('lb_sp_list') + ":");



            $("#labelFecha").text($.i18n.prop('labelFecha', "1500", $.i18n.prop('val_actual')));


            $("#labelValidation").text($.i18n.prop('lb_no'));
            $("#labelValidationTemp").text($.i18n.prop('lb_no'));

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
            $("#a_item_especie_fuente").text($.i18n.prop('a_item_especie'));

            $("#a_item_reino_target").text($.i18n.prop('a_item_reino'));
            $("#a_item_phylum_target").text($.i18n.prop('a_item_phylum'));
            $("#a_item_clase_target").text($.i18n.prop('a_item_clase'));
            $("#a_item_orden_target").text($.i18n.prop('a_item_orden'));
            $("#a_item_familia_target").text($.i18n.prop('a_item_familia'));
            $("#a_item_genero_target").text($.i18n.prop('a_item_genero'));
            $("#a_item_especie_target").text($.i18n.prop('a_item_especie'));

            $("#a_item_reino_sumidero").text($.i18n.prop('a_item_reino'));
            $("#a_item_phylum_sumidero").text($.i18n.prop('a_item_phylum'));
            $("#a_item_clase_sumidero").text($.i18n.prop('a_item_clase'));
            $("#a_item_orden_sumidero").text($.i18n.prop('a_item_orden'));
            $("#a_item_familia_sumidero").text($.i18n.prop('a_item_familia'));
            $("#a_item_genero_sumidero").text($.i18n.prop('a_item_genero'));
            $("#a_item_especie_sumidero").text($.i18n.prop('a_item_especie'));


            $("#btn_variable_bioclim").text($.i18n.prop('btn_variable_bioclim') + " ");
            $("#btn_variable_bioclim").append('<span class="caret"></span>');

            // Tooltip variables analisis
            $("#tuto_val div:eq(2)").children("h5").text($.i18n.prop('label_esp_p34'));
            $("#tuto_val div:eq(2)").children("p").text($.i18n.prop('label_esp_p35'));
            
            $("#tuto_min_occ div:eq(2)").children("h5").text($.i18n.prop('label_esp_p36'));
            $("#tuto_min_occ div:eq(2)").children("p").text($.i18n.prop('label_esp_p37'));
            
            $("#tuto_apriori div:eq(2)").children("h5").text($.i18n.prop('label_esp_p38'));
            $("#tuto_apriori div:eq(2)").children("p").text($.i18n.prop('label_esp_p39'));
            
            $("#tuto_map_prob div:eq(2)").children("h5").text($.i18n.prop('label_esp_p40'));
            $("#tuto_map_prob div:eq(2)").children("p").text($.i18n.prop('label_esp_p41'));
            
            $("#tuto_fil_fecha div:eq(2)").children("h5").text($.i18n.prop('label_esp_p7'));
            $("#tuto_fil_fecha div:eq(2)").children("p").text($.i18n.prop('label_esp_p8'));
            
            $("#tuto_reg_fecha div:eq(2)").children("h5").text($.i18n.prop('label_esp_p9'));
            $("#tuto_reg_fecha div:eq(2)").children("p").text($.i18n.prop('label_esp_p10'));
            
            $("#tuto_reg_fosil div:eq(2)").children("h5").text($.i18n.prop('label_esp_p11'));
            $("#tuto_reg_fosil div:eq(2)").children("p").text($.i18n.prop('label_esp_p12'));

            $("#MeanDiurnalRangeMeanofmonthlymaxtempmintemp").text($.i18n.prop("MeanDiurnalRangeMeanofmonthlymaxtempmintemp"));
            $("#IsothermalityBIO2BIO7100").text($.i18n.prop("IsothermalityBIO2BIO7100"));
            $("#TemperatureSeasonalitystandarddeviation100").text($.i18n.prop("TemperatureSeasonalitystandarddeviation100"));
            $("#MaxTemperatureofWarmestMonth").text($.i18n.prop("MaxTemperatureofWarmestMonth"));
            $("#MinTemperatureofColdestMonth").text($.i18n.prop("MinTemperatureofColdestMonth"));
            $("#TemperatureAnnualRangeBIO5BIO6").text($.i18n.prop("TemperatureAnnualRangeBIO5BIO6"));
            $("#MeanTemperatureofWettestQuarter").text($.i18n.prop("MeanTemperatureofWettestQuarter"));
            $("#MeanTemperatureofDriestQuarter").text($.i18n.prop("MeanTemperatureofDriestQuarter"));
            $("#MeanTemperatureofWarmestQuarter").text($.i18n.prop("MeanTemperatureofWarmestQuarter"));
            $("#MeanTemperatureofColdestQuarter").text($.i18n.prop("MeanTemperatureofColdestQuarter"));
            $("#AnnualPrecipitation").text($.i18n.prop("AnnualPrecipitation"));
            $("#PrecipitationofWettestMonth").text($.i18n.prop("PrecipitationofWettestMonth"));
            $("#PrecipitationofDriestMonth").text($.i18n.prop("PrecipitationofDriestMonth"));
            $("#PrecipitationSeasonalityCoefficientofVariation").text($.i18n.prop("PrecipitationSeasonalityCoefficientofVariation"));
            $("#PrecipitationofWettestQuarter").text($.i18n.prop("PrecipitationofWettestQuarter"));
            $("#PrecipitationofDriestQuarter").text($.i18n.prop("PrecipitationofDriestQuarter"));
            $("#PrecipitationofWarmestQuarter").text($.i18n.prop("PrecipitationofWarmestQuarter"));
            $("#PrecipitationofColdestQuarter").text($.i18n.prop("PrecipitationofColdestQuarter"));
            $("#AnnualPotentialEvapotranspirationmmyear").text($.i18n.prop("AnnualPotentialEvapotranspirationmmyear"));
            $("#ThornthwaiteAridityIndex").text($.i18n.prop("ThornthwaiteAridityIndex"));
            $("#MetricofRelativeAetnessandAridity").text($.i18n.prop("MetricofRelativeAetnessandAridity"));
            $("#AverageTempofWarmestMonthC").text($.i18n.prop("AverageTempofWarmestMonthC"));
            $("#EmbergersPluviothermicQuotient").text($.i18n.prop("EmbergersPluviothermicQuotient"));
            $("#SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan0CMultipliedbyNumberofDays").text($.i18n.prop("SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan0CMultipliedbyNumberofDays"));
            $("#SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan5CMultipliedbyNumberofDays").text($.i18n.prop("SumofMeanMonthlyTemperatureforMonthswithMeanTemperatureGreaterthan5CMultipliedbyNumberofDays"));
            $("#MaxTempoftheColdestMonthC10").text($.i18n.prop("MaxTempoftheColdestMonthC10"));
            $("#MinTempoftheWarmestMonthC10").text($.i18n.prop("MinTempoftheWarmestMonthC10"));
            $("#CountoftheNumberofMonthswithMeanTempGreaterthan10Cmonths").text($.i18n.prop("CountoftheNumberofMonthswithMeanTempGreaterthan10Cmonths"));
            $("#MeanMonthlyPETofColdestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofColdestQuartermmmonth"));
            $("#MeanMonthlyPETofDriestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofDriestQuartermmmonth"));
            $("#MonthlyVariabilityinPotentialEvapotranspirationmmmonth").text($.i18n.prop("MonthlyVariabilityinPotentialEvapotranspirationmmmonth"));
            $("#MeanMonthlyPETofWarmestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofWarmestQuartermmmonth"));
            $("#MeanMonthlyPETofWettestQuartermmmonth").text($.i18n.prop("MeanMonthlyPETofWettestQuartermmmonth"));
            $("#CompensatedThermicityIndexC").text($.i18n.prop("CompensatedThermicityIndexC"));
            $("#TerrainRoughnessIndex").text($.i18n.prop("TerrainRoughnessIndex"));
            $("#SAGAGISTopographicWetnessIndex").text($.i18n.prop("SAGAGISTopographicWetnessIndex"));
            $("#MaximumSlopeinElevations").text($.i18n.prop("MaximumSlopeinElevations"));
            $("#Aspect").text($.i18n.prop("Aspect"));
            $("#CompoundTopographicIndexCTIlnFAtanslope").text($.i18n.prop("CompoundTopographicIndexCTIlnFAtanslope"));
            $("#FlowDirection").text($.i18n.prop("FlowDirection"));
            $("#FlowAccumulations").text($.i18n.prop("FlowAccumulations"));
            $("#DigitalelevationmodelGTOPO30").text($.i18n.prop("DigitalelevationmodelGTOPO30"));

            $("#num_records").text($.i18n.prop("num_records"));
            $("#score_celda").text($.i18n.prop("score_celda"));

            $("#lb_decil_legend").text($.i18n.prop("lb_decil_legend"));
            

            $("#hist_record").text($.i18n.prop('lb_reg_fecha') + ": ");

            $("#btn_variable_bioclim_time").text($.i18n.prop('btn_variable_bioclim_time') + " ");
            $("#btn_variable_bioclim_time").append('<span class="caret"></span>');

            $("#a_actual").text($.i18n.prop('a_actual'));
            $("#a_f50").text($.i18n.prop('a_f50'));
            $("#get_esc_ep").text($.i18n.prop('get_esc_ep'));
            $("#tuto_res").text($.i18n.prop('tuto_res'));

            $("#btn_decil").prop("value", $.i18n.prop('btn_decil'));


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


            


            if(_table_module){

                _table_module.createEspList()
                _table_module.createDecilList()

                // var table = $('#tdisplay').DataTable()
                // console.log(table)                
                // var title = table.columns(0).header()
                // console.log(title)

            }
            else{
                $('#example tr:eq(0) th:eq(0)').text($.i18n.prop('lb_decil'));
                $('#example tr:eq(0) th:eq(1)').text($.i18n.prop('lb_especie_tbl'));
                $('#example tr:eq(0) th:eq(2)').text($.i18n.prop('lb_epsilon'));
                $('#example tr:eq(0) th:eq(3)').text($.i18n.prop('tip_tbl_score'));
                $('#example tr:eq(0) th:eq(4)').text($.i18n.prop('lb_procentaje_occ'));

                $('#tdisplay tr:eq(0) th:eq(0)').text($.i18n.prop('lb_especie_tbl_eps'));    
                $('#tdisplay tr:eq(0) th:eq(1)').text($.i18n.prop('lb_nij'));
                $('#tdisplay tr:eq(0) th:eq(2)').text($.i18n.prop('lb_nj'));
                $('#tdisplay tr:eq(0) th:eq(3)').text($.i18n.prop('lb_ni'));
                $('#tdisplay tr:eq(0) th:eq(4)').text($.i18n.prop('lb_n'));
                $('#tdisplay tr:eq(0) th:eq(5)').text($.i18n.prop('lb_epsilon'));
                $('#tdisplay tr:eq(0) th:eq(6)').text($.i18n.prop('tip_tbl_score'));
                $('#tdisplay tr:eq(0) th:eq(7)').text($.i18n.prop('a_item_reino'));
                $('#tdisplay tr:eq(0) th:eq(8)').text($.i18n.prop('a_item_phylum'));
                $('#tdisplay tr:eq(0) th:eq(9)').text($.i18n.prop('a_item_clase'));
                $('#tdisplay tr:eq(0) th:eq(10)').text($.i18n.prop('a_item_orden'));
                $('#tdisplay tr:eq(0) th:eq(11)').text($.i18n.prop('a_item_familia'));
            }
            
            

            
            

            // $("#specie_next").text($.i18n.prop('label_next'));

            $("#params_next").text($.i18n.prop('params_next'));
            $("#map_next").text($.i18n.prop('map_next'));
            $("#hist_next").text($.i18n.prop('hist_next'));

            $("#btn_tutorial").text($.i18n.prop('btn_tutorial'));
            $("#btn_tuto_steps").text($.i18n.prop('btn_tuto_steps'));
            $("#show_gen").text($.i18n.prop('show_gen'));

            $("#btn_tuto_steps_result").text($.i18n.prop('btn_tuto_steps_result'));

            $("#btn_demo").text($.i18n.prop('caso_uso'));

            

            _confLiveTutorialNiche();
            _confLiveTutorialResultsNiche();
            // _confLiveDemoNiche();


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

            // $("#lb_range_fecha").text($.i18n.prop('lb_range_fecha_hist') + ":");
            
            $("#labelFecha").text($.i18n.prop('labelFecha', "1500", $.i18n.prop('val_actual')));

            $("#lb_epsilon_hist_net").text($.i18n.prop('lb_epsilon_hist_net'));
            $("#lb_epsilon_lizq_hist_net").text($.i18n.prop('lb_epsilon_lizq_hist_net'));
            $("#lb_epsilon_lder_hist_net").text($.i18n.prop('lb_epsilon_lder_hist_net'));

            $("#lb_arista_hist_net").text($.i18n.prop('lb_arista_hist_net'));
            $("#lb_arista_lizq_hist_net").text($.i18n.prop('lb_arista_lizq_hist_net'));
            $("#lb_arista_lder_hist_net").text($.i18n.prop('lb_arista_lder_hist_net'));

            $("#lb_parista_hist_net").text($.i18n.prop('lb_parista_hist_net'));
            $("#lb_parista_lizq_hist_net").text($.i18n.prop('lb_parista_lizq_hist_net'));
            $("#lb_parista_lder_hist_net").text($.i18n.prop('lb_parista_lder_hist_net'));

            $("#lb_hist_net_nosginificativo").text($.i18n.prop('lb_hist_net_nosginificativo'));
            $("#lb_hist_net_visualizados").text($.i18n.prop('lb_hist_net_visualizados'));
            $("#lb_hist_net_descartados").text($.i18n.prop('lb_hist_net_descartados'));



            $("#tbl_net_src").children("h5").text($.i18n.prop('lb_fuente_tbl'));
            $("#tbl_net_src").children("p").text($.i18n.prop('lb_msg_source'));
            $("#tbl_net_src").parent().children("span").text($.i18n.prop('lb_fuente_tbl'))
            $("#tbl_net_trg").children("h5").text($.i18n.prop('lb_sumidero_tbl'));
            $("#tbl_net_trg").children("p").text($.i18n.prop('lb_msg_target'));
            $("#tbl_net_trg").parent().children("span").text($.i18n.prop('lb_sumidero_tbl'))
            $("#tbl_net_nij").children("h5").text($.i18n.prop('lb_nij'));
            $("#tbl_net_nij").children("p").text($.i18n.prop('lb_msg_nij'));
            $("#tbl_net_nj").children("h5").text($.i18n.prop('lb_nj'));
            $("#tbl_net_nj").children("p").text($.i18n.prop('lb_msg_nj'));
            $("#tbl_net_ni").children("h5").text($.i18n.prop('lb_ni'));
            $("#tbl_net_ni").children("p").text($.i18n.prop('lb_msg_ni'));
            $("#tbl_net_n").children("h5").text($.i18n.prop('lb_n'));
            $("#tbl_net_n").children("p").text($.i18n.prop('lb_msg_n'));
            $("#tbl_net_eps").children("h5").text($.i18n.prop('lb_epsilon'));
            $("#tbl_net_eps").children("p").text($.i18n.prop('lb_msg_epsilon'));


            $("#labelFecha").text($.i18n.prop('labelFecha', "1500", $.i18n.prop('val_actual')));
            $("#lb_sfecha").text($.i18n.prop('lb_si'));
            $("#labelFosil").text($.i18n.prop('lb_si'));


            $("#lb_fosil").text($.i18n.prop('lb_fosil') + ":");
            $("#lb_reg_fecha").text($.i18n.prop('lb_reg_fecha') + ":");
            $("#lb_range_fecha").text($.i18n.prop('lb_range_fecha') + ":");

            $("#lb_net_legend").text($.i18n.prop("lb_net_legend"));


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

            $("#intro_species_nicho").text($.i18n.prop('intro_species_nicho'));


            $("#tl_nicho").text($.i18n.prop('tl_nicho'));
            $("#tl_comunidad").text($.i18n.prop('tl_comunidad'));
            $("#des_nicho").text($.i18n.prop('des_nicho'));
            $("#des_comunidad").text($.i18n.prop('des_comunidad'));
            $("#des_data").text($.i18n.prop('des_data'));
            $("#nicho_step1").text($.i18n.prop('nicho_step1'));

            $("#nicho_step1").text($.i18n.prop('nicho_step1'));
            $("#nicho_step2").text($.i18n.prop('nicho_step2'));
            $("#nicho_step3").text($.i18n.prop('nicho_step3'));
            
            $("#link_nicho").text($.i18n.prop('link_nicho'));
            $("#link_nicho").append(" <i class='fa fa-arrow-right'></i>");

            $("#link_redes").text($.i18n.prop('link_redes'));
            $("#link_redes").append(" <i class='fa fa-arrow-right'></i>");


            $("#comun_step1").text($.i18n.prop('comun_step1'));
            $("#comun_step2").text($.i18n.prop('comun_step2'));
            $("#comun_step3").text($.i18n.prop('comun_step3'));

            $("#tl_datos").text($.i18n.prop('tl_datos'));
            $("#hd_source").text($.i18n.prop('hd_source'));
            $("#hd_region").text($.i18n.prop('hd_region'));

            $("#hd_type").text($.i18n.prop('hd_type'));
            $("#hd_url").text($.i18n.prop('hd_url'));
            $("#hd_cite").text($.i18n.prop('hd_cite'));

            $("#firsttime_nicho").text($.i18n.prop('firsttime_nicho'));
            $("#firsttime_comu").text($.i18n.prop('firsttime_comu'));

            $("#hd_resource").text($.i18n.prop('hd_resource'));
            $("#dh_desc").text($.i18n.prop('dh_desc'));

            $("#tl_project").text($.i18n.prop('tl_project'));
            $("#des_project").text($.i18n.prop('des_project'));


        }

    }

    function _confLiveTutorialNet() {

        $('#btn_tuto_steps.display-marker').on('click', function () {            
            
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








    function _confLiveTutorialResultsNiche(){

        _VERBOSE ? console.log("_confLiveTutorialResultsNiche") : _VERBOSE;

        $('#btn_tuto_steps_result.display-marker').on('click', function () {

            _VERBOSE ? console.log("btn_tuto_steps_result") : _VERBOSE;


            $.ptJs({
                autoStart: true,
                continueEnable: true,
                templateData: {
                    content: '',
                    title: $.i18n.prop('label_esp_p50'),
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
                            content: $.i18n.prop('label_esp_p71'),
                            title: $.i18n.prop('label_esp_p70')
                        }
                    },
                     {
                        el: '#map',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p48'),
                            content: $.i18n.prop('label_esp_p49')
                        }
                    },
                    {
                        el: '#myScrollableBlockEpsilonDecil',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p72'),
                            content: $.i18n.prop('label_esp_p73')
                        }
                    },
                    {
                        el: '#div_example',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p74'),
                            content: $.i18n.prop('label_esp_p75')
                        }
                    },
                    {
                        el: '#histcontainer_row',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p76'),
                            content: $.i18n.prop('label_esp_p77')
                        }
                    },
                    {
                        el: '#treeAddedPanel',
                        position: {
                            location: 'cm'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p78'),
                            content: $.i18n.prop('label_esp_p79')
                        }
                    },

                    

                    

                    
                ]
            })



        });


    }


    function _confLiveDemoNiche(index) {

        _VERBOSE ? console.log("_confLiveDemoNiche") : _VERBOSE;

        console.log(index)
        console.log(_demo_config)
        console.log(_demo_config[index])

        var demo_params = _demo_config[index];        


        // $('#btn_demo.display-marker').on('click', function () {

            // _VERBOSE ? console.log("btn_tuto_steps") : _VERBOSE;



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
                            title: $.i18n.prop('caso_uso'),
                            content: $.i18n.prop('demo_intro', demo_params.target_name, demo_params.bio_covars_name)
                        }
                    },
                    {
                        el: '#tuto_region',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p54'),
                            content: $.i18n.prop('demo_intro_region', demo_params.region_name)
                        }
                    },
                    {
                        el: '#tuto_resolution',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p5'),
                            content: $.i18n.prop('demo_intro_resolucion', demo_params.resolution)
                        }
                    },
                    {
                        el: '#var_target',
                        position: {
                            location: 'rm-c'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_specie'),
                            content: $.i18n.prop('demo_intro_specie', demo_params.target_name, demo_params.target_sp)
                        }
                    },
                    {
                        el: '#treeVariable_target',
                        position: {
                            location: 'rm-c'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_tree'),
                            content: $.i18n.prop('demo_intro_tree')
                        }
                    },
                    {
                        el: '#add_group_target',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_addsp'),
                            content: $.i18n.prop('demo_intro_addsp') 
                        }
                    }, 
                    {
                        el: '#tuto_fil_fecha',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_rfecha'),
                            content: $.i18n.prop('demo_intro_rfecha', demo_params.target_name)
                        }
                    },
                    {
                        el: '#tuto_reg_fecha',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_sfecha'),
                            content: $.i18n.prop('demo_intro_sfecha')
                        }
                    },
                    {
                        el: '#tuto_reg_fosil',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_fosil'),
                            content: $.i18n.prop('demo_intro_fosil')
                        }
                    },
                    {
                        el: '#reload_map',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_ressp'),
                            content: $.i18n.prop('demo_intro_ressp')
                        }
                    },
                    {
                        el: '#tuto_mapa_occ',
                        position: {
                            location: 'lm'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_mapaocc'),
                            content: $.i18n.prop('demo_intro_mapaocc', demo_params.target_name, demo_params.resolution)
                        }
                    },
                    {
                        el: '#tuto_mapa_occ',
                        position: {
                            location: 'lm'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_mapacell'),
                            content: $.i18n.prop('demo_intro_mapacell')
                        }
                    },
                    {
                        el: '#tuto_mapa_occ',
                        position: {
                            location: 'lm'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_celldel'),
                            content: $.i18n.prop('demo_intro_celldel')
                        }
                    },
                    {
                        el: '#tuto_histo_reg',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p13'),
                            content: $.i18n.prop('label_esp_p46')
                        }
                    },
                    {
                        el: '#tuto_variables',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_covars'),
                            content: $.i18n.prop('demo_intro_covars')
                        }
                    },
                    {
                        el: '#tuto_nav_tabs_fuente',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_navs'),
                            content: $.i18n.prop('demo_intro_navs')
                        }
                    },



                    {
                        el: '#tab_content_fuente',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_groups'),
                            content: $.i18n.prop('demo_intro_groups', demo_params.bio_covars)
                        }
                    },


                    {
                        el: '#treeVariable_fuente',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p24'),
                            content: $.i18n.prop('demo_intro_tree2', demo_params.bio_covars, demo_params.bio_covars_name)
                        }
                    },  


                    {
                        el: '#add_group_fuente',
                        position: {
                            location: 'rm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p26'),
                            content: $.i18n.prop('label_esp_p27')
                        }
                    },

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
                            title: $.i18n.prop('demo_title_analisis'),
                            content: $.i18n.prop('demo_intro_analisis')
                        }
                    },

                   {
                       el: '#tuto_val',
                       position: {
                           location: 'lm-b'
                       },
                       templateData: {
                           title: $.i18n.prop('demo_title_val'),
                           content: $.i18n.prop('demo_intro_val')
                       }
                   },

                    {
                        el: '#tuto_min_occ',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_min'),
                            content: $.i18n.prop('demo_intro_min')
                        }
                    },
                   {
                       el: '#tuto_apriori',
                       position: {
                           location: 'lm-t'
                       },
                       templateData: {
                           title: $.i18n.prop('demo_title_apri'),
                           content: $.i18n.prop('demo_intro_apri')
                       }
                   },

                   {
                       el: '#tuto_map_prob',
                       position: {
                           location: 'lm-t'
                       },
                       templateData: {
                           title: $.i18n.prop('demo_title_prob'),
                           content: $.i18n.prop('demo_intro_prob')
                       }
                   },
                    {
                        el: '#get_esc_ep',
                        position: {
                            location: 'lm-t'
                        },
                        templateData: {
                            title: $.i18n.prop('demo_title_btnres'),
                            content: $.i18n.prop('demo_intro_btnres')
                        }
                    }, 


                    // comienza proyección de resultados

                    {
                        el: '#map',
                        position: {
                            location: 'lm-b-r'
                        },
                        templateData: {
                            title: $.i18n.prop('rmapa_title'),
                            content: $.i18n.prop('rmapa_descp', demo_params.rmapa)
                        }
                    },    


                    {
                        el: '#chartdiv_score_decil',
                        position: {
                            location: 'lm-b-r'
                        },
                        templateData: {
                            title: $.i18n.prop('rhist_decil_title'),
                            content: $.i18n.prop('rhist_decil_descp', demo_params.rhist_decil)
                        }
                    },


                    {
                        el: '#div_example',
                        position: {
                            location: 'lm-b-r'
                        },
                        templateData: {
                            title: $.i18n.prop('rtabla_decil_title'),
                            content: $.i18n.prop('rtabla_decil_descp', demo_params.rtabla_decil)
                        }
                    },  


                    {
                        el: '#hst_esp_eps',
                        position: {
                            location: 'lm-b-r'
                        },
                        templateData: {
                            title: $.i18n.prop('rhist_freeps_title'),
                            content: $.i18n.prop('rhist_freeps_descp', demo_params.rhist_freeps)
                        }
                    },  


                    {
                        el: '#hst_esp_scr',
                        position: {
                            location: 'lm-b-r'
                        },
                        templateData: {
                            title: $.i18n.prop('rhist_frescr_title'),
                            content: $.i18n.prop('rhist_frescr_descp', demo_params.rhist_frescr)
                        }
                    }, 

                    {
                        el: '#hst_cld_scr',
                        position: {
                            location: 'lm-b-r'
                        },
                        templateData: {
                            title: $.i18n.prop('rhist_celdascr_title'),
                            content: $.i18n.prop('rhist_celdascr_descp', demo_params.rhist_celdascr)
                        }
                    },  

                    {
                        el: '#treeAddedPanel',
                        position: {
                            location: 'lm-b-r'
                        },
                        templateData: {
                            title: $.i18n.prop('rtabla_epsscr_title'),
                            content: $.i18n.prop('rtabla_epsscr_descp', demo_params.rtabla_epsscr)
                        }
                    },   

                ]

            })


        // })


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
                            title: $.i18n.prop('label_esp_p1'),
                            content: $.i18n.prop('label_esp_p2')
                        }
                    },
                    // {
                    //     el: '#tuto_autocomplete',
                    //     position: {
                    //         location: 'rm-b'
                    //     },
                    //     templateData: {
                    //         title: $.i18n.prop('label_esp_p3'),
                    //         content: $.i18n.prop('label_esp_p4')
                    //     }
                    // },
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
                        el: '#var_target',
                        position: {
                            location: 'rm-b'
                        },
                        templateData: {
                            title: $.i18n.prop('label_esp_p80'),
                            content: $.i18n.prop('label_esp_p81')
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
                            content: $.i18n.prop('label_esp_p17') + '<br><img style="width:100%" alt="Responsive image" src="images/img_reg2.png">'
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
                    // item_tab,
                    // item_tree,
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
                   {
                       el: '#tuto_val',
                       position: {
                           location: 'lm-b'
                       },
                       templateData: {
                           title: $.i18n.prop('label_esp_p34'),
                           content: $.i18n.prop('label_esp_p35')
                       }
                   },
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
                   {
                       el: '#tuto_apriori',
                       position: {
                           location: 'lm-t'
                       },
                       templateData: {
                           title: $.i18n.prop('label_esp_p38'),
                           content: $.i18n.prop('label_esp_p39')
                       }
                   },
                   {
                       el: '#tuto_map_prob',
                       position: {
                           location: 'lm-t'
                       },
                       templateData: {
                           title: $.i18n.prop('label_esp_p40'),
                           content: $.i18n.prop('label_esp_p41')
                       }
                   },
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
        addModuleForLanguage: addModuleForLanguage,
        setTableModule: setTableModule,
        setDemoUseCase: setDemoUseCase
    }
});