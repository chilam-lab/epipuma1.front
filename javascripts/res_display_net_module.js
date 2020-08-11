
/**
 * Controlador de los módulos utilizados en comunidad ecológica.
 *
 * @namespace res_display_net_module
 */
 var res_display_net_module = (function (verbose, url_zacatuche) {

     var _url_zacatuche = url_zacatuche;

     var _VERBOSE = verbose;

     var _TYPE_BIO = 0;

     var _variable_module_net, _language_module_net, _map_module_net, _net_module, _histogram_module_net, _table_module_net, _utils_module;
     var _footprint_region;

     var iTrans;

     var _subgroups;
     var _subgroups_s;
     var _subgroups_t;

     var _idFilterGroup;
     var _min_occ;
     var _grid_res;
     var _fossil;
     var _rangofechas;
     var _chkfecha;

     var _toastr = toastr;

     var _associativeArray, _arrayLinks, _json_nodes;

     var _TEST;

     var _first_map = true;

     var _tbl_net = false;

     var _ids_componentes_var;

     var _graph_component, _hist_component, _list_component;

     var _legend_groups = [];

     var _reino_campos = {
         "reino": "reinovalido",
         "kingdom": "reinovalido",
         "phylum": "phylumdivisionvalido",
         "clase": "clasevalida",
         "class": "clasevalida",
         "orden": "ordenvalido",
         "order": "ordenvalido",
         "familia": "familiavalida",
         "family": "familiavalida",
         "genero": "generovalido",
         "género": "generovalido",
         "genus": "generovalido",
         "especie": "especievalidabusqueda",
         "species": "especievalidabusqueda"
     };

     var map_abio = new Map()
     map_abio.set(1, "type");
     map_abio.set(2, "layer");
     map_abio.set(3, "bid");

     var map_taxon = new Map()
     map_taxon.set("reino", "kingdom");
     map_taxon.set("kingdom", "kingdom");
     map_taxon.set("phylum", "phylum");
     map_taxon.set("clase", "class");
     map_taxon.set("class", "class");
     map_taxon.set("orden", "order");
     map_taxon.set("order", "order");
     map_taxon.set("familia", "family");
     map_taxon.set("family", "family");
     map_taxon.set("genero", "genus");
     map_taxon.set("género", "genus");
     map_taxon.set("genus", "genus");
     map_taxon.set("especie", "species");
     map_taxon.set("species", "species");

     var group_level_biotic = "species";
     var group_level_abiotic = "bid";

     var map_link_dbtaxon = new Map()
     map_link_dbtaxon.set("reinovalido", "kingdom");
     map_link_dbtaxon.set("phylumdivisionvalido", "phylum");
     map_link_dbtaxon.set("clasevalida", "class");
     map_link_dbtaxon.set("ordenvalido", "order");
     map_link_dbtaxon.set("familiavalida", "family");
     map_link_dbtaxon.set("generovalido", "genus");
     map_link_dbtaxon.set("especieepiteto", "species");




    /**
     * Éste método enlaza las variables globales de los módulos inicializados de variable, lenguaje y mapa.
     *
     * @function _initilizeElementsForDisplay
     * @private
     * @memberof! res_display_net_module
     * 
     * @param {object} variable_module - Módulo variable
     * @param {object} language_module - Módulo internacionalización
     * @param {object} map_module - Módulo mapa
     * @param {array} ids_comp_variables - Array que contiene los identificadores de los componentes para seleccionar variables
     * @param {integer} tipo_modulo - Identificador de la plataforma que se esta utilizando 0 - nicho ecológico y 1 comunidad ecológica
     * @param {boolean} test - Bandera para trabajar con en modo de prueba o modo desarrollo. El modo prueba utiliza archivos locales para generar el análisis de comunidad ecológica
     */
     function _initilizeElementsForDisplay(variable_module, language_module, map_module, ids_comp_variables, tipo_modulo, test) {

         _VERBOSE ? console.log("_initilizeElementsForDisplay") : _VERBOSE;

        // para realizar pruebas de red sin realizar selección de variables
        _TEST = test;
        test_msg = "";
        test_msg = (_TEST) ? "*** Testing ***" : "*** Not Testing ***";
        _VERBOSE ? console.log(test_msg) : _VERBOSE;

        _idFilterGroup = 0;
        _tipo_modulo = tipo_modulo;
        _ids_componentes_var = ids_comp_variables;

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

        _language_module_net = language_module;
        _iTrans = _language_module_net.getI18();

        // _table_module_net = table_module;
        _variable_module_net = variable_module;
        _map_module_net = map_module;

        _utils_module = utils_module();
        _utils_module.startUtilsModule();

        var self = this;
        self.NUM_BEANS = 21;
        self.MAX_LINKS = 500;



        $("#red_download").click(function (e) {

            _VERBOSE ? console.log("red_download") : _VERBOSE;

            if (_json_nodes.length === 0) {
                $("#modalMail").modal("hide");
                return;
            }

            var net_info = _net_module.getGridNet2Export(_json_nodes, _arrayLinks);
            var encodedUri = encodeURI(net_info);
            this.href = "data:text/csv;charset=UTF-8," + encodedUri;

//            this.href = window.URL.createObjectURL(new Blob([JSON.stringify(net_info)], {type: 'text/csv;charset=utf-8;'}));
$("#modalMail").modal("hide");

});



        $('input[type="radio"]').on('change', function(e) {
            // console.log(e);
            
            var id_selected = $('input[type="radio"]:checked')[0].id;
            console.log(id_selected);


            var hist_radios = $('input[type="radio"]')
            hist_radios.each(function(){
                // console.log(this);

                if(id_selected !== this.id){

                    var div_parent = $("#"+this.id).parent().parent()
                    div_parent.removeClass("filter_container")
                    div_parent.find("input:text").prop('disabled',true)
                    
                }
                else{

                    var div_parent = $("#"+this.id).parent().parent()
                    div_parent.addClass("filter_container")
                    div_parent.find("input:text").prop('disabled',false)
                    
                    
                }

            })

            // $("#ep_izq").val(self.hist_min_eps)
            // $("#ep_der").val(self.hist_max_eps)
            // $("#ari_izq").val(0)
            // $("#ari_der").val(0)
            // $("#arip_izq").val(0)
            // $("#arip_der").val(0)


        });

        
    }


    /**
     * Éste método realiza un llamado a la función que inicializa las variables globales de los módulos necesarios para el análisis de comunidad ecológica
     *
     * @function startResNetDisplay
     * @public
     * @memberof! res_display_net_module
     * 
     * @param {object} variable_module - Módulo variable
     * @param {object} language_module - Módulo internacionalización
     * @param {object} map_module - Módulo mapa
     * @param {array} ids_comp_variables - Array que contiene los identificadores de los componentes para seleccionar variables
     * @param {integer} tipo_modulo - Identificador de la plataforma que se esta utilizando 0 - nicho ecológico y 1 comunidad ecológica
     * @param {boolean} test - Bandera para trabajar con en modo de prueba o modo desarrollo. El modo prueba utiliza archivos locales para generar el análisis de comunidad ecológica
     */
     function startResNetDisplay(variable_module, language_module, map_module, ids_comp_variables, tipo_modulo, test) {
         _VERBOSE ? console.log("startResNetDisplay") : _VERBOSE;
         _initilizeElementsForDisplay(variable_module, language_module, map_module, ids_comp_variables, tipo_modulo, test);
     }


    // no se utiliza
    function cleanLegendGroups() {

        console.log("cleanLegendGroups");

        _legend_groups = [];
        _idFilterGroup = 0;

    }


    /**
     * Éste método genera los filtros que son enviados al servidor basado en los conjuntos de variables source y target seleccionados.
     *
     * @function getFilters
     * @public
     * @memberof! res_display_net_module
     * 
     * @param {array} var_sel_array - Array con los grupos de variables seleccionados
     * @param {integer} grp_type - Identificador de la variable seleccionada
     */
     function getFilters(var_sel_array, grp_type) {

         _VERBOSE ? console.log("getFilters") : _VERBOSE;

         _subgroups = var_sel_array;
         var filters = [];
         var side = grp_type;

         _subgroups.forEach(function (grupo) {

             _VERBOSE ? console.log(grupo) : _VERBOSE;
             _idFilterGroup++;

            // se añade titulo para labels
            _legend_groups.push({"side": side, "tipo": grupo.type, "label": grupo.title, "idgrp": _idFilterGroup});

            var hasChildren = false;

            if (grupo.value.length > 1) {
                hasChildren = true;
            }


            grupo.value.forEach(function (item) {

                var itemGroup = item;
                _VERBOSE ? console.log(itemGroup) : _VERBOSE;


                // bioticos
                if (grupo.type == 0) {

                    var temp_item_field = itemGroup.label.toString().split(">>")[0].toLowerCase().trim();
                    var temp_item_value = itemGroup.label.toString().split(">>")[1].trim();
                    var temp_item_parent = itemGroup.parent ? itemGroup.parent : "";

//                    _VERBOSE ? console.log(_reino_campos[temp_item_field]) : _VERBOSE;

_VERBOSE ? console.log(temp_item_field) : _VERBOSE;
_VERBOSE ? console.log(temp_item_value) : _VERBOSE;
_VERBOSE ? console.log(temp_item_parent) : _VERBOSE;

filters.push({
    'biotic': true,
    'level': group_level_biotic,
    'rank': map_taxon.get(temp_item_field),
    'value': temp_item_value,
    'type': itemGroup.type,
                        // 'field': _reino_campos[temp_item_field],
                        // 'parent': temp_item_parent,
                        "fGroupId": _idFilterGroup,
                        "grp": grp_type
                                // 'level' : parseInt(itemGroup.level)
                            });

}
                // raster: bioclim, topo, elevacion y pendiente
                else {
                    // if the type is not equal to 4 the item contains the parameter level
                    temp_item_value = itemGroup.label.split(">>")[1].trim();
                    _VERBOSE ? console.log(temp_item_value) : _VERBOSE;

                    filters.push({
                        'biotic': false,
                        'level': group_level_abiotic,
                        'rank': map_abio.get(parseInt(itemGroup.level)),
                        'value': parseInt(itemGroup.level) !== 1 ? itemGroup.value : itemGroup.type,
                        'type': parseInt(itemGroup.type),
                        // 'level': parseInt(itemGroup.level),
                        // 'label': temp_item_value,
                        "fGroupId": _idFilterGroup,
                        "grp": grp_type
                    });

                }

            });

        });

         _VERBOSE ? console.log(filters) : _VERBOSE;

         return filters;

     }


    /**
     * Éste método obtiene las especies y los enlaces de las especies conectadas por epsilon. Además realiza el llamado a la función que construye la red a partir de estos datos
     *
     * @function createLinkNodes
     * @public
     * @memberof! res_display_net_module
     * 
     * @param {array} s_filters - Array con los grupos de variables seleccionados en source
     * @param {array} t_filters - Array con los grupos de variables seleccionados en target
     * @param {integer} min_occ - Número mínimo de ocurrencias de una variable en nj necesarias para ser considerada en el análisis de comunidad ecológica
     */
     function createLinkNodes(s_filters, t_filters, min_occ, grid_res_val, footprint_region, rango_fechas, chkFecha, chkFosil) {

         _VERBOSE ? console.log("createLinkNodes") : _VERBOSE;

        // obtinene e numero minimo de interaciones entre las especies
        _min_occ = min_occ;
        _grid_res = grid_res_val;
        _footprint_region = footprint_region;

        _fossil = chkFosil;
        _rangofechas = rango_fechas;
        _chkfecha = chkFecha;

        var lin_inf = _rangofechas ? _rangofechas[0] : undefined;
        var lin_sup = _rangofechas ? _rangofechas[1] : undefined;
        

        if (s_filters.length === 0 || t_filters.length === 0) {

            _toastr.warning(_iTrans.prop('lb_sin_filtros'));
            return;

        }


        d3.json(_url_zacatuche + "/niche/getTaxonsGroupNodes")
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify({
                source: s_filters,
                target: t_filters,
                min_occ: _min_occ,
                grid_res: _grid_res,
                footprint_region: _footprint_region,
                fosil: chkFosil,
                date: chkFecha,
                lim_inf: lin_inf,
                lim_sup: lin_sup

            }),
            function (error, resp) {

                if (error) {
                    console.log(error);
                    throw error;
                }

                var json = resp.data;

                console.log(json);

                _createNodeDictionary(json, s_filters, t_filters);


                // it ensures that the dictionary of nodes is created before the link list is recived.
                d3.json(_url_zacatuche + "/niche/getTaxonsGroupEdges")
                .header("Content-Type", "application/json")
                .post(
                    JSON.stringify({
                        source: s_filters,
                        target: t_filters,
                        min_occ: _min_occ,
                        grid_res: _grid_res,
                        footprint_region: _footprint_region,
                        fosil: chkFosil,
                        date: chkFecha,
                        lim_inf: lin_inf,
                        lim_sup: lin_sup

                    }),
                    function (error, resp) {

                        if (error)
                            throw error;

                        var json = resp.data;

                        console.log(json)

                        _createLinkDictionary(json);

                        console.log(_associativeArray)

                        console.log(_arrayLinks);

                        // if(_arrayLinks.length > 10000){
                        //   _toastr.warning("Numero de aristas exceden memoria del explorador, intente un relación mas pequeña");
                        //   return;
                        // }

                        // max_eps = d3.max(_arrayLinks.map(function (d) {
                        //     return d.value;
                        // }));
                        // min_eps = d3.min(_arrayLinks.map(function (d) {
                        //     return d.value;
                        // }));

                        _createGraph(_arrayLinks, s_filters, t_filters);

                    });

        });

        

    }



    /**
     * Éste método genera un arreglo asociativo de los nodos para llevar acabo la relación con el conjunto de enlaces.
     *
     * @function _createNodeDictionary
     * @private
     * @memberof! res_display_net_module
     * 
     * @param {array} json - Array con el conjunto de nodos que intervienen en el análisis de comunidad ecológica
     * @param {array} s_filters - Array con los grupos de variables seleccionados en source
     * @param {array} t_filters - Array con los grupos de variables seleccionados en target
     */
     function _createNodeDictionary(json, s_filters, t_filters) {

         _VERBOSE ? console.log("_createNodeDictionary") : _VERBOSE;

         _associativeArray = {};

         var map_node = d3.map([]);

         $.each(json, function (i, item) {

             var idsp = _utils_module.hashCode(
                //item.reinovalido +
              //item.phylumdivisionvalido + 
              //item.clasevalida + 
              //item.ordenvalido + 
              //item.familiavalida + 
              item.generovalido + 
              item.especieepiteto + 
              item.nombreinfra +
              //item.type + 
              //item.layer + 
              item.bid)

            // console.log(idsp)

            item["id"] = idsp

            map_node.set(idsp, item);
        });

        // each node id has an index, 87456 -> 1, 87457 -> 2, ...
        $.each(map_node.values(), function (i, item) {
            item["index"] = i;
            _associativeArray[item.id] = item;
        });

        // Saving nodes for future issues, and with index added.
        _json_nodes = map_node.values();

        // necesario para generar archivo para testing
        // _VERBOSE ? console.log(JSON.stringify(_json_nodes)) : _VERBOSE; 

        // funcion que asigna el color a los nodos
        
        _getColorFilterGroups(_json_nodes, s_filters, t_filters);

    }


    /**
     * Éste método conecta los nodos a través de los enlaces generados en el análisis de comunidad ecológica basándose en el arreglo asociativo generado por el método _createNodeDictionary.
     *
     * @function _createNodeDictionary
     * @private
     * @memberof! res_display_net_module
     * 
     * @param {array} json_file - Array con el conjunto de enlaces que intervienen en el análisis de comunidad ecológica
     */
     function _createLinkDictionary(json_file) {

         _VERBOSE ? console.log("_createLinkDictionary") : _VERBOSE;
         _arrayLinks = [];

        // replacing node id with the index of the node array
        $.each(json_file, function (i, item) {

            var idsource = _utils_module.hashCode(//item.reinovalido_s +
              //item.phylumdivisionvalido_s + 
              //item.clasevalida_s + 
              //item.ordenvalido_s + 
              //item.familiavalida_s + 
              item.generovalido_s + 
              item.especieepiteto_s + 
              item.nombreinfra_s +
              //item.type_s + 
              //item.layer_s + 
              item.bid_s)

            // console.log(idsource)

            var idtarget = _utils_module.hashCode(//item.reinovalido_t +
              //item.phylumdivisionvalido_t + 
              //item.clasevalida_t + 
              //item.ordenvalido_t + 
              //item.familiavalida_t + 
              item.generovalido_t + 
              item.especieepiteto_t + 
              item.nombreinfra_t +
              //item.type_t + 
              //item.layer_t + 
              item.bid_t)

            // console.log(idtarget)

            associativeLinkArray = {}
            associativeLinkArray[ "source" ] = _associativeArray[ idsource ].index;

            associativeLinkArray[ "nij" ] = json_file[i].nij;
            associativeLinkArray[ "nj" ] = json_file[i].nj;
            associativeLinkArray[ "ni" ] = json_file[i].ni;
            associativeLinkArray[ "n" ] = json_file[i].n;

            associativeLinkArray[ "source_node" ] = _associativeArray[ idsource ];

            associativeLinkArray[ "target" ] = _associativeArray[ idtarget ].index;
            associativeLinkArray[ "target_node" ] = _associativeArray[ idtarget ];
            associativeLinkArray[ "value" ] = json_file[i].value;
            associativeLinkArray[ "score" ] = json_file[i].score;

            _arrayLinks.push(associativeLinkArray);

        });

        // console.log(_arrayLinks);

    }


    /**
     * Éste método inicializa los módulos red, histograma y tabla para generar los componentes visuales, así como la conexión entre estos módulos para visualizar el resutlado del análisis de comunidad ecológica.
     *
     * @function _createGraph
     * @private
     * @memberof! res_display_net_module
     * 
     * @param {array} arrayTemp - Array con los enlaces resultantes del análisis de comunidad ecológica o con los filtros seleccinados utilizando crossfilter
     * @param {array} s_filters - Array con los grupos de variables seleccionados en source
     * @param {array} t_filters - Array con los grupos de variables seleccionados en target
     */
     function _createGraph(arrayTemp, s_filters, t_filters) {

         _VERBOSE ? console.log("_createGraph") : _VERBOSE;

         $("#graph").empty();
         $("#hist").empty();

        // document.getElementById("tbl_hist_comunidad").style.display = "inline";
        // document.getElementById("map_panel").style.display = "inline";
        // // document.getElementById("graph_map_comunidad").style.display = "inline";
        // document.getElementById("hist_map_comunidad").style.display = "inline";


        // se carga mapa, controles y grid
        if (_first_map) {
            _map_module_net.startMap(_language_module_net, _tipo_modulo, null);
            _first_map = false;
        }


        var json = {"nodes": _json_nodes, "links": arrayTemp};

        // verica que existan enlaces, reademás resuelve problema de genero vacio en queries
        if (arrayTemp.length == 0) {

            _VERBOSE ? console.log(json) : _VERBOSE;
            _toastr.warning(_iTrans.prop('lb_nolinks'));
            return;

        }

        _configFilters(json);

        _net_module = net_module(_VERBOSE, _url_zacatuche, _map_module_net, _utils_module);
        _net_module.startNet(_language_module_net, s_filters, t_filters);
        _net_module.setLanguageModule(_language_module_net);
        _net_module.setLanguageModule(_language_module_net);
        _net_module.setLegendGroup(_legend_groups);

        _graph_component = _net_module.createNet(json, this);
        // _graph_component = _net_module.createNetWebGL(json, this);

        _histogram_module_net = histogram_module(_VERBOSE);
        _histogram_module_net.setLanguageModule(_language_module_net);
        _histogram_module_net.startHistogramModule();
        _hist_component = _histogram_module_net.createBarChartNet(json, this);

        _table_module_net = table_module(_url_zacatuche);
        _table_module_net.startTableModule(_tbl_net);
        _table_module_net.setLanguageModule(_language_module_net);
        _list_component = _table_module_net.createListNet(json, this);

        _tbl_net = true;

        self.renderAll();

        var adjust = $(window).height() + 60;
        // _VERBOSE ? console.log("adjust: " + adjust) : _VERBOSE;
        $("html, body").animate({scrollTop: (adjust / 3)}, 1000);

        // Verificar si se desea agregar la interacción por selección de estados
        // loadStatesLayer();
        
        module_net.loadingsNet(0);
    }



    /**
     * Éste método inicializa una instancia de crossfilter y otras variables necesarias que son visibles en el módulo red, el módulo histograma y el módulo tabla.
     *
     * @function _configFilters
     * @private
     * @memberof! res_display_net_module
     * 
     * @param {array} json - Array con los nodos y enlaces resultantes del análisis de comunidad ecológica
     */
     function _configFilters(json) {

         _VERBOSE ? console.log("_configFilters") : _VERBOSE;

         self.hist_load = false

         self.max_num_link = self.MAX_LINKS

         self.nestByR = d3.nest().key(function (d) {
             return d.value
         });

         self.epsilon_beans = d3.range(1, self.NUM_BEANS, 1);

         // Se redefine ep_th para no descartar gran cantidad de valores no significativos
         self.ep_th = 1.0;

        console.log(json.links);
        // console.log(json.links.length);
        // console.log("min_eps: " + min_eps);
        // console.log("max_eps: " + max_eps);

        var newlinks = []
        var no_mean_lenght = 0

        _VERBOSE ? console.log("json.links: " + json.links.length) : _VERBOSE;

        

        // json.links.sort(function(a, b) {
        //     return parseFloat(b.value) - parseFloat(a.value) ;
        // });

        // var min_eps = d3.min(json.links.map(function (d) {
        //     return parseFloat(d.value);
        // }));
        // var max_eps = d3.max(json.links.map(function (d) {
        //     return parseFloat(d.value);
        // }));

        // console.log("json.links min_eps: " + min_eps);
        // console.log("json.links max_eps: " + max_eps);


        // filtrando los enlaces no significativos
        json.links.forEach(function(item) {
            if (Math.abs(parseFloat(item.value)) > self.ep_th) {
                newlinks.push(item)
            }
            else{
                no_mean_lenght++
            }
        })


        console.log(newlinks);
        console.log("newlinks: " + newlinks.length);
        console.log("no_mean_lenght: " + no_mean_lenght);

        self.no_mean = no_mean_lenght

        var min_eps = d3.min(newlinks.map(function (d) {
            return parseFloat(d.value);
        }));
        var max_eps = d3.max(newlinks.map(function (d) {
            return parseFloat(d.value);
        }));

        self.hist_min_eps = min_eps

        self.hist_max_eps = max_eps

        console.log("newlinks min_eps: " + min_eps);
        console.log("newlinks max_eps: " + max_eps);

        self.net_limit_eps = 0
        // self.net_max_eps = 0




        self.num_links = newlinks.length

        self.links = newlinks

        self.epsRange = d3.scale.quantile().domain([min_eps, max_eps]).range(epsilon_beans);

        // self.links_sp = crossfilter(json.links);
        self.links_sp = crossfilter(newlinks);

        self.all = links_sp.groupAll();

        self.dim_eps_freq = self.links_sp.dimension(function (d) {
            return parseFloat(d.value);
        });

        self.group_eps_freq = dim_eps_freq.group(function (d) {
            return self.epsRange(d);
        });

        self.dim_src = self.links_sp.dimension(function (d) {
            return d;
        });

        self.group_eps_spname = dim_src.group();

        self.dim_node_state = self.links_sp.dimension(function (d) {
            return d;
        });


        self.margin = {top: 5, right: 20, bottom: 30, left: 20};
        self.width = $("#hist").width() - self.margin.left - self.margin.right;
        self.height = $("#hist").height() - self.margin.top - self.margin.bottom;
        self.x = d3.scale.ordinal().rangeRoundBands([self.margin.left, self.width - self.margin.left], .1);

        

        self.chart = null

    }



    /**
     * Éste método actualiza la información del módulo red y del módulo tabla cuando ha ocurrido una selección del histograma.
     *
     * @function renderAll
     * @public
     * @memberof! res_display_net_module
     * 
     */
     self.renderAll = function () {

         _VERBOSE ? console.log("renderAll") : _VERBOSE;

         _graph_component.each(_render);
         _hist_component.each(_render);
         _list_component.each(_render);

     }


    /**
     * Éste método realizado un llamado a los métodos del módulo red, tabla e histograma para regenerar los componentes visuales.
     *
     * @function _configFilters
     * @private
     * @memberof! res_display_net_module
     * 
     * @param {object} method - Método que es necesario para regenerar la información de cada módulo
     */
     function _render(method) {

         _VERBOSE ? console.log("_render") : _VERBOSE;
         d3.select(this).call(method);

     }

    /**
     * Éste método asigna un índice a cada conjunto de variables seleccionado, tanto en source como en target.
     *
     * @function _getColorFilterGroups
     * @private
     * @memberof! res_display_net_module
     * 
     * @param {array} json - Json con nodos y enlaces resultante del análisis de comunidad ecológica
     * @param {array} s_filters - Array con los grupos de variables seleccionados en source
     * @param {array} t_filters - Array con los grupos de variables seleccionados en target
     */
     function _getColorFilterGroups(json, s_filters, t_filters) {

         _VERBOSE ? console.log("_getColorFilterGroups") : _VERBOSE;

         var filters = s_filters.concat(t_filters);
         _VERBOSE ? console.log(filters) : _VERBOSE;

         _VERBOSE ? console.log(json) : _VERBOSE;
       // _VERBOSE ? console.log(s_filters) : _VERBOSE;
       _VERBOSE ? console.log(filters) : _VERBOSE;


       // console.log(map_link_dbtaxon.get("clasevalida"))
       // console.log(map_link_dbtaxon.get("class"))
       // console.log(map_link_dbtaxon.has("clasevalida"))
       // console.log(map_link_dbtaxon.values())


       $.each(filters, function (i, item) {


           $.each(json, function (j, item) {

               switch (filters[i].rank) {

                   case map_link_dbtaxon.get("reinovalido"):
                   if (json[j].reinovalido == filters[i].value) {
                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 6;
                            // } else if (json[j].stage > 6) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 6;
                            // }
                        }
                        break;
                        case map_link_dbtaxon.get("phylumdivisionvalido"):
                        if (json[j].phylumdivisionvalido == filters[i].value) {
                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 5;
                            // } else if (json[j].stage > 5) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 5;
                            // }
                        }
                        break;
                        case map_link_dbtaxon.get("clasevalida"):

                        if (json[j].clasevalida == filters[i].value) {
                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 4;
                            // } else if (json[j].stage > 4) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 4;
                            // }
                        }
                        break;
                        case map_link_dbtaxon.get("ordenvalido"):
                        if (json[j].ordenvalido == filters[i].value) {
                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 3;
                            // } else if (json[j].stage > 3) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 3;
                            // }
                        }
                        break;
                        case map_link_dbtaxon.get("familiavalida"):
                        if (json[j].familiavalida == filters[i].value) {
                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 2;
                            // } else if (json[j].stage > 2) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 2;
                            // }
                        }
                        break;
                        case map_link_dbtaxon.get("generovalido"):
                        if (json[j].generovalido == filters[i].value) {

                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 1;
                            // } else if (json[j].stage > 1) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 1;
                            // }
                        }
                        break;

                        case map_link_dbtaxon.get("especieepiteto"):

                         //console.log("*** Entro!!!")

//                            if (json[j].label.split(" ")[1] == filters[i].value) {
    if ((json[j].generovalido + " " + json[j].especieepiteto) == filters[i].value) {
                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 0;
                            // } else if (json[j].stage > 0) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 0;
                            // }
                        }
                        break;

                        case "type":
                        if (parseInt(json[j].type) == filters[i].value) {

                            // _VERBOSE ? console.log(json_nodes[j].reinovalido) : _VERBOSE;
                            json[j].group = filters[i].fGroupId;
                            // json[j].stage = 2;


                        }
                        
                        break;

                        case "layer":
                        if (json[j].layer == filters[i].value) {

                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 1;
                            // } else if (json[j].stage > 1) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 1;
                            // }

                        }
                        // json[j].group = filters[i].fGroupId;
                        break;

                        case "bid":
                        if (json[j].bid == filters[i].value) {

                            // if (!json[j].group) {
                                json[j].group = filters[i].fGroupId;
                                // json[j].stage = 0;
                            // } else if (json[j].stage > 0) {
                            //     json[j].group = filters[i].fGroupId;
                            //     // json[j].stage = 0;
                            // }

                        }
                        // json[j].group = filters[i].fGroupId;
                        break;




                    }

                });

});

}


    /**
     * Éste método actualiza los labels del sistema cuando existe un cambio de lenguaje. Existen labels que no son regenerados ya que la información es obtenida por el servidor al momento de la carga.
     *
     * @function updateLabels
     * @public
     * @memberof! res_display_net_module
     * 
     */
     function updateLabels() {

         _VERBOSE ? console.log("updateLabels display net") : _VERBOSE;

         _ids_componentes_var.forEach(function (item, index) {

             $("#btn_variable_" + item).text($.i18n.prop('btn_variable') + " ");
             $("#btn_variable_" + item).append('<span class="caret"></span>');

             $("#btn_variable_bioclim_" + item).text($.i18n.prop('btn_variable_bioclim') + " ");
             $("#btn_variable_bioclim_" + item).append('<span class="caret"></span>');

             $("#btn_topo_" + item).text($.i18n.prop('btn_topo') + " ");
             $("#btn_topo_" + item).append('<span class="caret"></span>');

             $("#a_taxon_" + item).text($.i18n.prop('a_taxon'));
             $("#a_clima_" + item).text($.i18n.prop('a_clima'));
             $("#a_topo_" + item).text($.i18n.prop('a_topo'));


             $("#a_item_reino_" + item).text($.i18n.prop('a_item_reino'));
             $("#a_item_phylum_" + item).text($.i18n.prop('a_item_phylum'));
             $("#a_item_clase_" + item).text($.i18n.prop('a_item_clase'));
             $("#a_item_orden_" + item).text($.i18n.prop('a_item_orden'));
             $("#a_item_familia_" + item).text($.i18n.prop('a_item_familia'));
             $("#a_item_genero_" + item).text($.i18n.prop('a_item_genero'));

             $("#btn_variable_bioclim_time_" + item).text($.i18n.prop('btn_variable_bioclim_time') + " ");
             $("#btn_variable_bioclim_time_" + item).append('<span class="caret"></span>');

             $("#a_item_bio00_" + item).text($.i18n.prop('a_item_bio00'));
             $("#a_item_bio01_" + item).text($.i18n.prop('a_item_bio01'));
             $("#a_item_bio02_" + item).text($.i18n.prop('a_item_bio02'));
             $("#a_item_bio03_" + item).text($.i18n.prop('a_item_bio03'));
             $("#a_item_bio04_" + item).text($.i18n.prop('a_item_bio04'));
             $("#a_item_bio05_" + item).text($.i18n.prop('a_item_bio05'));
             $("#a_item_bio06_" + item).text($.i18n.prop('a_item_bio06'));
             $("#a_item_bio07_" + item).text($.i18n.prop('a_item_bio07'));
             $("#a_item_bio08_" + item).text($.i18n.prop('a_item_bio08'));
             $("#a_item_bio09_" + item).text($.i18n.prop('a_item_bio09'));
             $("#a_item_bio10_" + item).text($.i18n.prop('a_item_bio10'));
             $("#a_item_bio11_" + item).text($.i18n.prop('a_item_bio11'));
             $("#a_item_bio12_" + item).text($.i18n.prop('a_item_bio12'));
             $("#a_item_bio13_" + item).text($.i18n.prop('a_item_bio13'));
             $("#a_item_bio14_" + item).text($.i18n.prop('a_item_bio14'));
             $("#a_item_bio15_" + item).text($.i18n.prop('a_item_bio15'));
             $("#a_item_bio16_" + item).text($.i18n.prop('a_item_bio16'));
             $("#a_item_bio17_" + item).text($.i18n.prop('a_item_bio17'));
             $("#a_item_bio18_" + item).text($.i18n.prop('a_item_bio18'));
             $("#a_item_bio19_" + item).text($.i18n.prop('a_item_bio19'));

         })

         $("#yaxis_net").text($.i18n.prop('lb_frecuencia'));

         $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));

         $("#pararRed").attr("title", $.i18n.prop('lb_detener_net'));
         $("#center_view_btn").attr("title", $.i18n.prop('lb_centrar_net'));
         $("#input_text_search").attr("placeholder", $.i18n.prop('lb_buscar_sp'));
         $("#export_btn").attr("title", $.i18n.prop('lb_exportar_net'));

         $("#info_text_net").text($.i18n.prop('lb_info_net'));
         $("#info_text_slider").text($.i18n.prop('lb_info_slider'));
         $("#lb_info_slider_left").text($.i18n.prop('lb_info_slider_left'));
         $("#lb_info_slider_right").text($.i18n.prop('lb_info_slider_right'));

         $("#title_barnet").text($.i18n.prop('titulo_hist_eps'));

        // $("#lb_epsilon_hist_net").text($.i18n.prop('lb_epsilon_hist_net'));
        // $("#lb_epsilon_lizq_hist_net").text($.i18n.prop('lb_epsilon_lizq_hist_net'));
        // $("#lb_epsilon_lder_hist_net").text($.i18n.prop('lb_epsilon_lder_hist_net'));

        // $("#lb_arista_hist_net").text($.i18n.prop('lb_arista_hist_net'));
        // $("#lb_arista_lizq_hist_net").text($.i18n.prop('lb_arista_lizq_hist_net'));
        // $("#lb_arista_lder_hist_net").text($.i18n.prop('lb_arista_lder_hist_net'));

        // $("#lb_parista_hist_net").text($.i18n.prop('lb_parista_hist_net'));
        // $("#lb_parista_lizq_hist_net").text($.i18n.prop('lb_parista_lizq_hist_net'));
        // $("#lb_parista_lder_hist_net").text($.i18n.prop('lb_parista_lder_hist_net'));

        // $("#lb_hist_net_nosginificativo").text($.i18n.prop('lb_hist_net_nosginificativo'));
        // $("#lb_hist_net_visualizados").text($.i18n.prop('lb_hist_net_visualizados'));
        // $("#lb_hist_net_descartados").text($.i18n.prop('lb_hist_net_descartados'));


        // $("#csv_request").attr("title", $.i18n.prop('lb_descarga_tbl'));
        // $("#deletePointsButton").attr("title", $.i18n.prop('lb_borra_puntos'));

    }


    /**
     * Éste método inicia ejecuta el proceso de un análisis de nicho ecológico.
     *
     * @function callDisplayProcess
     * @public
     * @memberof! res_display_module
     * 
     */
     function callDisplayProcess(val_process) {

         console.log("callDisplayProcess COMUNIDAD");
         _net_module.showSpecieOcc();
     }



     return{
         startResNetDisplay: startResNetDisplay,
         getFilters: getFilters,
         createLinkNodes: createLinkNodes,
         renderAll: renderAll,
         updateLabels: updateLabels,
         callDisplayProcess: callDisplayProcess,
         cleanLegendGroups: cleanLegendGroups
     }

 });
