
/**
 * Módulo variable, utilizado para crear y gestionar los selectores de grupos de variables en nicho ecológico y comunidad ecológica.
 *
 * @namespace variable_module
 */
var variable_module = (function (verbose, url_zacatuche) {

    var _url_zacatuche = url_zacatuche;
    var _VERBOSE = verbose;
    var _selectors_created = [];

    var _id;

    var _TYPE_BIO = 0,
        _TYPE_ABIO = 1,
        _TYPE_TERRESTRE = 2;

    var _TYPE_TAXON = 0,
        _TYPE_CLIMA = 0,
        _TYPE_TOPO = 1,
        _TYPE_ELEVACION = 2,
        _TYPE_PENDIENTE = 3,
        _TYPE_TOPO_RASTER = 5;

    var _BORRADO = 0,
            _AGREGADO = 1;

    var _language_module;
    var _iTrans;

    var _toastr = toastr;
    var _tipo_modulo;
    var _MODULO_COMUNIDAD = 1;
    
    var _available_variables = [];
    
    var _REGION_SELECTED = 1;



    /**
     * Método getter de los grupos de variables seleccionados
     *
     * @function getVarSelArray
     * @public
     * @memberof! table_module
     * 
     */
    function getVarSelArray() {
        return _var_sel_array;
    }


    /**
     * Método getter de los grupos de variables seleccionados
     *
     * @function getSelectorVaribles
     * @public
     * @memberof! table_module
     * 
     */
    function getSelectorVaribles() {
        return _selectors_created;
    }



    /**
     * Éste método realiza la creación del selector de variables. Actualmente genera un selector de grupos taxonómicos, variables climáticas y variables topográficas.
     *
     * @function VariableSelector
     * @public
     * @memberof! table_module
     * 
     * @param {String} parent - Id del contenedor del selector de variables
     * @param {String} id - Id del selector de variables
     * @param {String} title - Título del selector de variables desplegado en la parte superior
     */
    function VariableSelector(parent, id, title) {

        // se comentan variables topograficas por expansión de terreno
//        var tags = ['a_taxon', 'a_clima'];
        var tags = ['a_taxon', 'a_raster'];


        var sp_items = ['a_item_reino', 'a_item_phylum', 'a_item_clase', 'a_item_orden', 'a_item_familia', 'a_item_genero'];
        var sp_parent_field = ['reinovalido', 'phylumdivisionvalido', 'clasevalida', 'ordenvalido', 'familiavalida', 'generovalido'];
        var sp_data_field = ['phylumdivisionvalido', 'clasevalida', 'ordenvalido', 'familiavalida', 'generovalido', 'especievalidabusqueda'];
        var NUM_ABIO = 20;
        var NIVEL_REINO = 2
        var NIVEL_PHYLUM = 3
        var abio_time = ['a_actual', 'a_f50'];
        var topo_items = ['topidx', 'elevacion', 'pendiente'];


        var self = this;
        self.id = id;
        self.varfilter_selected;
        self.level_vartree;
        self.value_vartree;
        self.field_vartree;
        self.parent_field_vartree;
        self.type_time = 0;

        self.arrayVarSelected;
        self.groupvar_dataset = [];
        self.var_sel_array = [];

        self.last_event;
        self.arrayBioclimSelected = [];
        self.groupbioclimvar_dataset = [];

        self.groupDatasetTotal = [];

        self.arrayOtherSelected = [];
        self.groupothervar_dataset = [];


        // Evento generado cuando se selecciona un grupo de variables climáticas, realiza la carga del árbol de selección del grupo seleccionado.
        self.loadTreeVarRaster = function () {

            _VERBOSE ? console.log("self.loadTreeVarRaster") : _VERBOSE;
            
            var text_raster = _iTrans.prop('lb_raster');
            var var_selected = "root_bioclim";
            var level_root = 0;
            var level_vartree = 1;
            
//            console.log("val: " + $("#footprint_region_select").val());
//            console.log("_REGION_SELECTED: " + _REGION_SELECTED);
            
            
            _REGION_SELECTED = $("#footprint_region_select").val() !== null ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
//            console.log("REGION_SELECTED: " + _REGION_SELECTED);

            $.ajax({
                url: _url_zacatuche + "/niche/especie/getRasterVariables",
                dataType: "json",
                type: "post",
                data: {
                    "footprint_region": _REGION_SELECTED,
                    "level": level_root
                },
                success: function (resp) {

                    var data = resp.data;

                    $('#jstree_variables_bioclim_' + id).jstree("destroy").empty();

                    var tree_reinos = [{
                            "text": text_raster,
                            "id": var_selected,
                            attr: {"bid": var_selected, "parent": text_raster, "level": level_root, "type": _TYPE_CLIMA},
                            'state': {'opened': true, 'disabled' : true },
                            "icon": "plugins/jstree/dist/themes/default/throbber.gif"
                        }];

                    $("#jstree_variables_bioclim_" + id).jstree({
                        'plugins': ["wholerow", "checkbox"],
                        'core': {
                            'data': tree_reinos,
                            'themes': {
                                'name': 'proton',
                                'responsive': true
                            },
                            'check_callback': true
                        }
                    });


                    $("#jstree_variables_bioclim_" + id).on('changed.jstree', self.getChangeTreeVarRaster);
                    $('#jstree_variables_bioclim_' + id).on('open_node.jstree', self.getTreeVarRaster);

                    $("#jstree_variables_bioclim_" + id).on('loaded.jstree', function () {

                        var current_node = $('#jstree_variables_bioclim_' + id).jstree(true).get_node($("#" + var_selected));

                        for (var i = 0; i < data.length; i++) {

//                            console.log(data[i]);
                            var idNode = (data[i].fuente).replace(/ /g, '');
                            var default_son = level_vartree < 2 ? [{text: "cargando..."}] : [];

                            var newNode = {
                                id: idNode,
                                text: data[i].fuente,
                                icon: "plugins/jstree/images/dna.png",
                                attr: {"bid": idNode, "parent": text_raster, "level": level_vartree, "type": data[i].type},
                                state: {'opened': false},
                                "children": default_son
                            };

//                            console.log(newNode);
                            $('#jstree_variables_bioclim_' + id).jstree("create_node", current_node, newNode, 'last', false, false);
                        }

                        $("#jstree_variables_bioclim_" + id).jstree(true).set_icon(current_node.id, "./plugins/jstree/images/dna.png");

                    });

                }

            });

        }


        self.getTreeVarRaster = function (e, d) {

            _VERBOSE ? console.log("self.getTreeVarRaster") : _VERBOSE;
//            _VERBOSE ? console.log(d) : _VERBOSE;
//            _VERBOSE ? console.log("length: " + d.node.children.length) : _VERBOSE;
//            _VERBOSE ? console.log("indexOf: " + d.node.children[0].indexOf("bio") === 0) : _VERBOSE;

            if (d.node.children.length > 1 || d.node.children[0].indexOf("bio") === 0)
                return;

            var level_vartree = d.node.original.attr.level;
            var raster_type = d.node.original.attr.type;
            var current_id = d.node.original.attr.bid;
            var parent_name = d.node.original.attr.parent;

            var max_level = 3;

            $("#jstree_variables_bioclim_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/dist/themes/default/throbber.gif");
            _REGION_SELECTED = $("#footprint_region_select").val() !== null ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;

//            console.log("current_id: " + current_id);
//            console.log("level_vartree: " + level_vartree);
//            console.log("raster_type: " + raster_type);
//            console.log("parent_name: " + parent_name);
//            console.log("REGION_SELECTED: " + _REGION_SELECTED);

            $.ajax({
                url: _url_zacatuche + "/niche/especie/getRasterVariables",
                dataType: "json",
                type: "post",
                data: {
                    "level": level_vartree,
                    "field": current_id,
                    "type": raster_type,
                    "region": _REGION_SELECTED
                },
                success: function (resp) {

                    var data = resp.data;

                    var current_node = $('#jstree_variables_bioclim_' + id).jstree(true).get_node($("#" + current_id));
                    _VERBOSE ? console.log(current_node) : _VERBOSE;

                    level_vartree = level_vartree + 1;

                    for (var i = 0; i < data.length; i++) {

//                        console.log(data[i]);

                        var default_son = level_vartree < max_level ? [{text: "cargando..."}] : [];

                        var tag = "", min = "", max = "";

                        var newNode = {};

                        if (level_vartree > 2) {

                            if (data[i].type === 1 || data[i].type === 2) {

//                                console.log("Is worldclim");

                                if (data[i].label.indexOf("Precipita") === -1) {
                                    tag = String(data[i].tag).split(":")
                                    min = parseInt(tag[0].split(".")[0]) / 10 + " ºC";
                                    max = parseInt(tag[1].split(".")[0]) / 10 + " ºC";
                                } else {
                                    tag = String(data[i].tag).split(":")
                                    min = parseInt(tag[0].split(".")[0]) + " mm";
                                    max = parseInt(tag[1].split(".")[0]) + " mm";
                                }

                            } else {
                                tag = String(data[i].tag).split(":")
//                                console.log(tag[0] + " : " + tag[1]);
                                
                                min = parseFloat(tag[0]).toFixed(3);
                                max = parseFloat(tag[1]).toFixed(3);
                            }

                            var idNode = "";
                            if ($("#" + data[i].bid).length > 0) {
                                idNode = data[i].bid + "_" + Math.floor((Math.random() * 1000) + 1)
                            } else {
                                idNode = data[i].bid;
                            }

                            newNode = {
                                id: idNode,
                                text: min + " : " + max,
                                icon: "plugins/jstree/images/dna.png",
                                attr: {"bid": data[i].bid, "parent": data[i].layer, "level": level_vartree, "type": data[i].type},
                                state: {'opened': false},
                                "children": default_son
                            };

                        } 
                        else {
                            
                            
//                            console.log("label: " + _iTrans.prop("a_item_" + data[i].layer))
                            
                            newNode = {
                                id: (data[i].layer).replace(" ", ""),
                                text: raster_type !== 0  ? _iTrans.prop("a_item_" + data[i].layer) : data[i].label,
                                icon: "plugins/jstree/images/dna.png",
                                attr: {"bid": data[i].layer, "parent": data[i].fuente, "level": level_vartree, "type": data[i].type},
                                state: {'opened': false},
                                "children": default_son
                            };

                        }                        
                            
                        $('#jstree_variables_bioclim_' + id).jstree("create_node", current_node, newNode, 'last', false, false);
                        
                    }
                    

                    $("#jstree_variables_bioclim_" + id).jstree(true).delete_node(d.node.children[0]);
                    $("#jstree_variables_bioclim_" + id).jstree(true).set_icon(current_node.id, "./plugins/jstree/images/dna.png");

                }

            });


        }


        /****************************************************************************************** GENERACION DE PANEL */

        // $("#" + parent)
        // 	.addClass('tab_total');

        // titulo del selector de varibles
        var header_panel = $('<h3/>')
                .attr('id', title)
                .addClass('label_componenete sidebar-header')
                .text(_iTrans.prop(title))
                .appendTo($("#" + parent));

        // div contenedor del cuerpo de la sección grupo de variables
        var var_container = $('<div/>')
                .addClass('col-md-12 col-sm-12 col-xs-12 var_container')
                .appendTo($("#" + parent));

        // div contenedor de los selectores bioticos y abioticos
        var nav_selection = $('<div/>')
                .addClass('col-md-8 col-sm-12 col-xs-12 nav_selection')
                .appendTo(var_container);

        // div lateral izquierdo que almacena los grupos seleccionados de cada tab
        var tree_selection = $('<div/>')
                .attr('id', "treeAddedPanel_" + id)
                .addClass('col-md-4 col-sm-12 col-xs-12 myBlockVariableAdded')
                .appendTo(var_container);


        // contenedor de header tabs
        var nav_items = $('<ul/>')
                .attr("id", "tuto_nav_tabs_" + id)
                .addClass('nav nav-tabs nav-variables')
                .appendTo(nav_selection);

        // sea gregan los tabs disponibles
        $.each(tags, function (i) {
            var name_class = 'nav-variables';

            if (i == 0) {
                name_class = 'active nav-variables';
            }
            var li = $('<li/>')
                    .addClass(name_class)
                    .appendTo(nav_items)
                    .click(function (e) {
                        $('.nav-tabs a[href="' + e.target.getAttribute('href') + '"]').tab('show');
                        e.preventDefault();
                    });

            var aaa = $('<a/>')
                    .attr('id', tags[i] + "_" + id)
                    .attr('href', '#tab' + i + "_" + id)
                    .attr('data-toggle', 'tab' + i + "_" + id)
                    .text(_iTrans.prop(tags[i]))
                    .appendTo(li);
        });



        // div que alamcena el cuerpo de los tabs
        var tab_content = $('<div/>')
                .addClass('tab-content')
                .appendTo(nav_selection);






        // agregando contenido de cada tab
        $.each(tags, function (i) {

            if (i === 0) {
                // generando tab panel para variables taxonomicas
                _VERBOSE ? console.log(tags[i]) : _VERBOSE;

                // div del tab[i]_id
                var tab_pane = $('<div/>')
                        .attr('id', 'tab' + i + "_" + id)
                        .addClass('tab-pane active')
                        .appendTo(tab_content);

                // div que contiene el dropdown-button de tipos taxonomicos y textfiled para insertar valores
                var drop_item = $('<div/>')
                        .attr('id', 'tuto_taxon_sp_' + id)
                        .addClass('input-group dropdown_group')
                        .appendTo(tab_pane);

                var btn_div = $('<div/>')
                        .addClass('input-group-btn')
                        .appendTo(drop_item);

                var btn_sp = $('<button/>')
                        .attr('id', 'btn_variable' + "_" + id)
                        .attr('type', 'button')
                        .attr('data-toggle', 'dropdown')
                        .attr('aria-haspopup', 'true')
                        .attr('aria-expanded', 'false')
                        .text(_iTrans.prop('btn_variable') + " ")
                        .addClass('btn btn-primary dropdown-toggle')
                        .appendTo(btn_div);

                $('<span/>')
                        .addClass('caret')
                        .appendTo(btn_sp);

                var btn_items = $('<div/>')
                        .addClass('dropdown-menu')
                        .appendTo(btn_div);

                $.each(sp_items, function (i) {
                    var li = $('<li/>')
                            .click(function (e) {
                                // evento que guarda selección taxonomica.
                                _VERBOSE ? console.log("biotico") : _VERBOSE;
                                self.varfilter_selected = [e.target.getAttribute("data-field"), e.target.getAttribute("parent-field"), e.target.getAttribute("level-field")];
                                varfield = e.target.text;

                                _VERBOSE ? console.log(varfield) : _VERBOSE;
                                _VERBOSE ? console.log(self.varfilter_selected) : _VERBOSE;

                                $("#btn_variable" + "_" + id).text(varfield + " ");
                                $("#btn_variable" + "_" + id).append('<span class="caret"></span>');
                                $("#text_variable" + "_" + id).prop("disabled", false);
                                $("#text_variable" + "_" + id).val("");
                                e.preventDefault();
                            })
                            .appendTo(btn_items);

                    var aaa = $('<a/>')
                            .attr('id', sp_items[i] + "_" + id)
                            .attr('parent-field', sp_parent_field[i])
                            .attr('data-field', sp_data_field[i])
                            .attr('level-field', (i + 2)) // inicia en 2
                            .addClass('biotica')
                            .text(_iTrans.prop(sp_items[i]))
                            .appendTo(li);

                });

                var input_sp = $('<input/>')
                        .attr('id', 'text_variable' + "_" + id)
                        .attr('type', 'text')
                        .attr('aria-label', '...')
                        .prop("disabled", true)
                        .addClass('form-control')
                        .autocomplete({
                            source: function (request, response) {

                                _VERBOSE ? console.log(self) : _VERBOSE;
                                
                                _REGION_SELECTED = $("#footprint_region_select").val() !== null ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
//                                console.log("REGION_SELECTED: " + _REGION_SELECTED);

                                $.ajax({
                                    url: _url_zacatuche + "/niche/especie/getEntList",
                                    dataType: "json",
                                    type: "post",
                                    data: {
                                        searchStr: request.term,
                                        nivel: self.varfilter_selected[1],
                                        source: 0, // source para saber si viene de objetivo o el target
                                        footprint_region: _REGION_SELECTED
                                    },
                                    success: function (resp) {

                                        response($.map(resp.data, function (item) {

                                            _VERBOSE ? console.log(item) : _VERBOSE;

                                            return{
                                                label: item[self.varfilter_selected[1]],
                                                id: item[self.varfilter_selected[1]]
                                            };

                                        }));
                                    }

                                });

                            },
                            minLength: 2,
                            change: function (event, ui) {
                                if (!ui.item) {
                                    $("#text_variable" + "_" + id).val("");
                                }
                            },
                            select: function (event, ui) {

                                $('#jstree_variables_species_' + id).jstree("destroy").empty();
                                $('#jstree_variables_species_' + id).on('open_node.jstree', self.getTreeVar);
                                $("#jstree_variables_species_" + id).on('changed.jstree', self.getChangeTreeVar);
                                $("#jstree_variables_species_" + id).on('loaded.jstree', self.loadNodes);

                                self.value_vartree = ui.item.id;
                                self.field_vartree = self.varfilter_selected[0];
                                self.parent_field_vartree = self.varfilter_selected[1];
                                self.level_vartree = self.varfilter_selected[2];

                                _VERBOSE ? console.log("nivel") : _VERBOSE;
                                _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                                var tree_reinos = [{
                                        "text": self.value_vartree,
                                        "id": "root",
                                        "attr": {"nivel": self.level_vartree, "type": _TYPE_TAXON},
                                        'state': {'opened': true},
                                        "icon": "plugins/jstree/dist/themes/default/throbber.gif"
                                    }];

                                $('#jstree_variables_species_' + id).jstree({
                                    'plugins': ["wholerow", "checkbox"],
                                    'core': {
                                        'data': tree_reinos,
                                        'themes': {
                                            'name': 'proton',
                                            'responsive': true
                                        },
                                        'check_callback': true
                                    }
                                });

                            }

                        })
                        .appendTo(drop_item);

                // contendor de arbol y panel de seleccion
                var tree_nav_container = $('<div/>')
                        .addClass('row row3')
                        .appendTo(tab_pane);

                var div_tree = $('<div/>')
                        .attr('id', "treeVariable_" + id)
                        .addClass('myScrollableBlockVar')
                        .appendTo(tree_nav_container);

                var tree = $('<div/>')
                        .attr('id', "jstree_variables_species_" + id)
                        .appendTo(div_tree);

                // var tree_selection = $('<div/>')
                //   		.attr('id', "treeAddedPanel_" + id)
                //   		.addClass('myScrollableBlockVariableAdded')
                // 	.appendTo(tree_nav_container);


                var btn_add = $('<button/>')
                        .attr('id', 'add_group' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-plus pull-left')
                        .click(function (e) {

                            console.log(self.arrayVarSelected);

                            self.addOtherGroup('jstree_variables_species_' + id, self.arrayVarSelected, 'Bio', 'treeAddedPanel_' + id, _TYPE_BIO);
                            $('#jstree_variables_species_' + id).jstree("destroy").empty();
                            $('#jstree_variables_species_' + id).off('open_node.jstree', self.getTreeVar);
                            $("#jstree_variables_species_" + id).off('changed.jstree', self.getChangeTreeVar);
                            $("#jstree_variables_species_" + id).off('ready.jstree', self.loadNodes);
                            $("#text_variable" + "_" + id).val("");

                            e.preventDefault();
                        })
                        .appendTo(tab_pane);

                var btn_add = $('<button/>')
                        .attr('id', 'clean_var' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-trash pull-left')
                        .click(function (e) {

                            $("#text_variable" + "_" + id).val("");
                            $('#jstree_variables_species_' + id).off('open_node.jstree', self.getTreeVar);
                            $("#jstree_variables_species_" + id).off('changed.jstree', self.getChangeTreeVar);
                            $("#jstree_variables_species_" + id).off('ready.jstree', self.loadNodes);

                            self.arrayVarSelected = [];
                            // self.groupvar_dataset = [];
                            self.cleanVariables('jstree_variables_species_' + id, 'treeAddedPanel_' + id, _TYPE_BIO);

                            e.preventDefault();
                        })
                        .appendTo(tab_pane);



            }
            // tab de variables raster
            else if (i === 1) {

                // generando tab panel para variables climaticas
                _VERBOSE ? console.log(tags[i]) : _VERBOSE;

                var tab_pane = $('<div/>')
                        .attr('id', 'tab' + i + "_" + id)
                        .addClass('tab-pane')
                        .appendTo(tab_content);



                // contendor de arbol y panel de seleccion
                var tree_nav_container = $('<div/>')
                        .addClass('row row3')
                        .appendTo(tab_pane);

                var div_tree = $('<div/>')
                        .attr('id', "treeVariableBioclim_" + id)
                        .addClass('myScrollableBlockVar')
                        .appendTo(tree_nav_container);

                var tree = $('<div/>')
                        .attr('id', "jstree_variables_bioclim_" + id)
                        .appendTo(div_tree);




                var btn_add = $('<button/>')
                        .attr('id', 'add_group_bioclim' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-plus pull-left')
                        .click(function (e) {

                            self.addOtherGroup('jstree_variables_bioclim_' + id, self.arrayBioclimSelected, 'Raster', 'treeAddedPanel_' + id, _TYPE_ABIO);
                            e.preventDefault();

                        })
                        .appendTo(tab_pane);

                var btn_add = $('<button/>')
                        .attr('id', 'clean_var_bioclim' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-trash pull-left')
                        .click(function (e) {

                            self.arrayBioclimSelected = [];
                            // self.groupbioclimvar_dataset = [];
                            self.cleanVariables('jstree_variables_bioclim_' + id, 'treeAddedPanel_' + id, _TYPE_ABIO);
                            e.preventDefault();

                        })
                        .appendTo(tab_pane);


                // carga árbol de variables raster
                self.loadTreeVarRaster();

            }

        });



        // Es un evento generado cuando se realiza la carga del árbol de selección (jstree: https://www.jstree.com/) que contiene el selector de variables. 
        self.loadNodes = function () {

            _VERBOSE ? console.log("self.loadNodes") : _VERBOSE;

            // se incrementa level para  asignar el nivel adecuado a los hijos de la raiz
            // la funcion es llamda dos veces, por tantro se decidio utilizar el arreglo + 1, en lufar de utilzar la variable global "level_vartree"
            self.level_vartree = parseInt(self.varfilter_selected[2]) + 1;
//            _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;
//            _VERBOSE ? console.log(self.field_vartree) : _VERBOSE;
//            _VERBOSE ? console.log(self.value_vartree) : _VERBOSE;
            
            _REGION_SELECTED = $("#footprint_region_select").val() !== null ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
//            console.log("REGION_SELECTED: " + _REGION_SELECTED);


            $.ajax({
                url: _url_zacatuche + "/niche/especie/getVariables",
                dataType: "json",
                type: "post",
                data: {
                    "field": self.field_vartree,
                    "parentfield": self.parent_field_vartree,
                    "parentitem": self.value_vartree,
                    "footprint_region": _REGION_SELECTED
                },
                success: function (resp) {

                    data = resp.data;

                    var current_node = $('#jstree_variables_species_' + id).jstree(true).get_node($("#root"));

//                    console.log(current_node);

                    for (i = 0; i < data.length; i++) {

                        var idNode = "";

                        if ($("#" + data[i].name).length > 0) {
                            idNode = data[i].name + "_" + Math.floor((Math.random() * 1000) + 1)
                        } else {
                            idNode = data[i].name;
                        }

                        var default_son = self.level_vartree < 8 ? [{text: "cargando..."}] : [];
                        var label_taxon = self.level_vartree < 8 ? data[i].name + " (spp: " + data[i].spp + ")" : data[i].name;
                        // label_taxon = self.level_vartree == 8 ? self.value_vartree + " " + label_taxon : label_taxon;


                        // _VERBOSE ? console.log(self.parent_field_vartree) : _VERBOSE;
                        // _VERBOSE ? console.log(data[i].name) : _VERBOSE;

                        var newNode = {
                            id: idNode,
                            text: label_taxon, //data[i].name + " (spp: " + data[i].spp + ")", 
                            icon: "plugins/jstree/images/dna.png",
                            attr: {"nivel": self.level_vartree, "type": _TYPE_TAXON},
                            state: {'opened': false},
                            "children": default_son
                        };

                        $('#jstree_variables_species_' + id).jstree("create_node", current_node, newNode, 'last', false, false);

                    }

                    $("#jstree_variables_species_" + id).jstree(true).set_icon(current_node.id, "./plugins/jstree/images/dna.png");

                }

            });

        }


        // Evento generado cuando se realiza la acción de abrir una rama del árbol de selección, realiza la carga de los elementos que componen la rama a la cual se desea tener acceso.
        self.getTreeVar = function (e, d) {

            _VERBOSE ? console.log("self.getTreeVar") : _VERBOSE;

            _VERBOSE ? console.log(d.node.original.attr.nivel) : _VERBOSE;
            // _VERBOSE ? console.log(d.node.children) : _VERBOSE;

            if (d.node.children.length > 1)
                return;

            var next_field = "";
            var next_nivel = 0;
            var parent_field = "";

            $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/dist/themes/default/throbber.gif");


            if (d.node.original.attr.nivel == 2) {
                parent_field = "reinovalido"
                next_field = "phylumdivisionvalido";
                next_nivel = 3;
            } else if (d.node.original.attr.nivel == 3) {
                parent_field = "phylumdivisionvalido"
                next_field = "clasevalida";
                next_nivel = 4;
            } else if (d.node.original.attr.nivel == 4) {
                parent_field = "clasevalida"
                next_field = "ordenvalido";
                next_nivel = 5;
            } else if (d.node.original.attr.nivel == 5) {
                parent_field = "ordenvalido"
                next_field = "familiavalida";
                next_nivel = 6;
            } else if (d.node.original.attr.nivel == 6) {
                parent_field = "familiavalida"
                next_field = "generovalido";
                next_nivel = 7;
            } else if (d.node.original.attr.nivel == 7) {
                parent_field = "generovalido"
                next_field = "especievalidabusqueda";
                next_nivel = 8;
            } else {
                $("#jstree_variables_species_" + id).jstree(true).delete_node(d.node.children[0]);
                $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/images/dna.png");
                return;
            }

            _VERBOSE ? console.log(d.node.id) : _VERBOSE
            _VERBOSE ? console.log(d.node.text.split(" ")[0]) : _VERBOSE
            
            _REGION_SELECTED = $("#footprint_region_select").val() !== null ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
//            console.log("REGION_SELECTED: " + _REGION_SELECTED);

            $.ajax({
                url: _url_zacatuche + "/niche/especie/getVariables",
                dataType: "json",
                type: "post",
                data: {
                    "field": next_field,
                    "parentfield": parent_field,
                    "parentitem": d.node.text.split(" ")[0],
                    "footprint_region": _REGION_SELECTED
                },
                success: function (resp) {

                    data = resp.data;

                    for (i = 0; i < data.length; i++) {

                        var idNode = "";

                        if ($("#" + data[i].id).length > 0) {
                            // _VERBOSE ? console.log("id_existente") : _VERBOSE;

                            idNode = data[i].id + "_" + Math.floor((Math.random() * 1000) + 1)
                        } else {
                            // ._VERBOSE ? console.log("nuevo_id") : _VERBOSE;

                            idNode = data[i].id;
                        }

                        var default_son = next_nivel < 8 ? [{text: "cargando..."}] : [];
                        var label_taxon = next_nivel < 8 ? data[i].name + " (spp: " + data[i].spp + ")" : data[i].name;

                        var newNode = {
                            id: idNode,
                            text: label_taxon,
                            icon: "plugins/jstree/images/dna.png",
                            attr: {"nivel": next_nivel, "type": _TYPE_TAXON},
                            state: {'opened': false},
                            "children": default_son
                        };

                        $('#jstree_variables_species_' + id).jstree("create_node", d.node, newNode, 'last', false, false);

                    }

                    $("#jstree_variables_species_" + id).jstree(true).delete_node(d.node.children[0]);
                    $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/images/dna.png");

                }
            });

        };


        // Evento generado cuando cambia el estado de selección del árbol, almacena los elementos que fueron seleccionados del grupo de variables taxonómicas.
        self.getChangeTreeVar = function (e, data) {

            _VERBOSE ? console.log("self.getChangeTreeVar") : _VERBOSE;

            self.arrayVarSelected = [];

            if ($('#jstree_variables_species_' + id).jstree(true).get_top_selected().length > 0) {

                // _VERBOSE ? console.log("acceder node header del dom") : _VERBOSE;
                var headers_selected = $('#jstree_variables_species_' + id).jstree(true).get_top_selected().length;

                for (i = 0; i < headers_selected; i++) {

                    var node_temp = $('#jstree_variables_species_' + id).jstree(true).get_node($('#jstree_variables_species_' + id).jstree(true).get_top_selected()[i]).original;
                    var level = "";

                    if (node_temp.attr.nivel == 2)
                        level = _iTrans.prop('a_item_reino');
                    else if (node_temp.attr.nivel == 3)
                        level = _iTrans.prop('a_item_phylum');
                    else if (node_temp.attr.nivel == 4)
                        level = _iTrans.prop('a_item_clase');
                    else if (node_temp.attr.nivel == 5)
                        level = _iTrans.prop('a_item_orden');
                    else if (node_temp.attr.nivel == 6)
                        level = _iTrans.prop('a_item_familia');
                    else if (node_temp.attr.nivel == 7)
                        level = _iTrans.prop('a_item_genero');
                    else if (node_temp.attr.nivel == 8)
                        level = _iTrans.prop('a_item_especie');


                    _VERBOSE ? console.log("level: " + level) : _VERBOSE;

                    var parent_node = $('#jstree_variables_species_' + id).jstree(true).get_node($('#jstree_variables_species_' + id).jstree(true).get_parent($('#jstree_variables_species_' + id).jstree(true).get_top_selected()[i])).original;

                    _VERBOSE ? console.log(parent_node) : _VERBOSE;
                    _VERBOSE ? console.log(node_temp) : _VERBOSE;

                    if (parent_node) {

                        self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});

//                        if (node_temp.attr.nivel == 8) {
//                            
//                            self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});
//                            
//                        }
//                        else {
//
//                            self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});
//                        }

                    } else {

                        self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type});

                    }

                }

            }

            _VERBOSE ? console.log(self.arrayVarSelected) : _VERBOSE;

        };

        // Evento generado cuando cambia el estado de selección del árbol, almacena los elementos que fueron seleccionados del grupo de variables climáticas.
        self.getChangeTreeVarRaster = function (e, data) {

            _VERBOSE ? console.log("self.getChangeTreeVarRaster") : _VERBOSE;

            self.arrayBioclimSelected = [];

            if ($('#jstree_variables_bioclim_' + id).jstree(true).get_top_selected().length > 0) {

                var headers_selected = $('#jstree_variables_bioclim_' + id).jstree(true).get_top_selected().length;

                for (i = 0; i < headers_selected; i++) {
                    var node_temp = $('#jstree_variables_bioclim_' + id).jstree(true).get_node($('#jstree_variables_bioclim_' + id).jstree(true).get_top_selected()[i]).original;

                    _VERBOSE ? console.log(node_temp) : _VERBOSE;

                    self.arrayBioclimSelected.push({label: node_temp.text, id: node_temp.attr.bid, parent: node_temp.attr.parent, level: node_temp.attr.level, type: node_temp.attr.type});
                }

            }

        };



        self.isKingdomLevel = function (arraySelected) {

            _VERBOSE ? console.log("self.isKingdomLevel") : _VERBOSE;
            var isKingdomLevel = false;

            arraySelected.forEach(function (item, index) {
                _VERBOSE ? console.log("numlevel: " + item.numlevel) : _VERBOSE;

                if (parseInt(item.numlevel) <= NIVEL_PHYLUM) {

                    _VERBOSE ? console.log("NIVEL_PHYLUM O REINO") : _VERBOSE;
                    isKingdomLevel = true
                    return true;

                }

            });

            return isKingdomLevel;
        }

        // Realiza la verificación si un grupo ya ha sido añadido previamente para eliminar duplicidad.
        // El cambio de idioma no es identificado para las variables que nos son bioticas.
        // TODO: Hacer reemplazo de label por value cuando son abioticas (type != 4)
        self.existsGroup = function (arraySelected) {

            _VERBOSE ? console.log("self.existsGroup") : _VERBOSE;

            var arg_labels = arraySelected.map(function (d) {
                _VERBOSE ? console.log(d) : _VERBOSE;
                return d.label.split(" ")[0];
            });
            // _VERBOSE ? console.log(arg_labels) : _VERBOSE;

            var new_element = true;

            $.each(self.var_sel_array, function (index, item_sel) {

                if (item_sel.value.length == arg_labels.length) {

                    var value_labels = item_sel.value.map(function (val) {
                        return val.label.split(" >> ")[1];
                    });
                    // _VERBOSE ? console.log(value_labels) : _VERBOSE;

                    if (self.isSubset(arg_labels, value_labels)) {

                        new_element = false;
                        return false;

                    }

                }

            });

            return new_element;

        }



        self.addUIItem = function (groupDatasetTotal) {

            _VERBOSE ? console.log("self.addUIItem") : _VERBOSE;
            _VERBOSE ? console.log(self.id) : _VERBOSE;
            console.log(groupDatasetTotal);

            self.groupDatasetTotal = groupDatasetTotal;

            // these lines are because when one new elements is added, the previuos elements were duplicated. So the collection is clean and reloaded again
            $("#treeAddedPanel_" + self.id).empty();
            $.each(self.groupDatasetTotal, function (i, item) {
                item.close = true;
                item.elements = item.value;
            });


            _VERBOSE ? console.log(self.groupDatasetTotal) : _VERBOSE;



            var div_item = d3.select("#treeAddedPanel_" + self.id).selectAll("div")
                    .data(self.groupDatasetTotal)
                    .enter()
                    .append("div")
                    .attr("class", "row_var_item")
                    .attr("items", function (d) {
                        // _VERBOSE ? console.log(d) : _VERBOSE
                        return d.elements;

                    })
                    .text(function (d) {
                        return d.title
                    })
                    .on('click', function (d) {

                        if (d.close) {

                            d.close = false;
                            d3.select(this).selectAll("div")
                                    .data(d.elements)
                                    .enter()
                                    .append("div")
                                    .attr("class", "cell_item")
                                    .text(function (t) {
                                        return t.label;
                                    })
                                    .style("text-align", "left");


                        } else {

                            d.close = true;
                            d3.selectAll(this).remove();
                            $(this).text(d.title);
                            $(this).css("text-align", "left");

                            d3.select(this).append("button")
                                    .attr("width", "10px")
                                    .attr("height", "10px")
                                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                                    .on("click", function () {
                                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                                        d3.select(this.parentNode).remove();
                                        var gpo_deleted;

                                        $.each(self.groupDatasetTotal, function (index, obj) {
                                            if (obj.groupid == d.groupid) {
                                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                                return false;
                                            }
                                        })
                                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                                        self.updateVarSelArray(gpo_deleted, _BORRADO);

                                    });

                        }
                    })
                    .append("button")
                    .attr("width", "10px")
                    .attr("height", "10px")
                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                    .on("click", function (d) {
                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                        d3.select(this.parentNode).remove();
                        var gpo_deleted;

                        $.each(self.groupDatasetTotal, function (index, obj) {
                            if (obj.groupid == d.groupid) {
                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                return false;
                            }
                        })
                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                        self.updateVarSelArray(gpo_deleted, _BORRADO);

                    });

        }

        // Evento que es generado cuando se desea agregar un grupo seleccionado previamente, realiza la adición del grupo seleccionado al conjunto de variables con las cuales se realizan los cálculos de épsilon y score en ambos sistemas
        self.addOtherGroup = function (idTree, arraySelected, gpoName, idDivContainer, typeVar) {

            _VERBOSE ? console.log("self.addOtherGroup") : _VERBOSE;

//            console.log(idTree);
//            console.log(arraySelected);
//            console.log(gpoName);
//            console.log(idDivContainer);
//            console.log(typeVar);

            if (arraySelected.length == 0)
                return;

            // Solo aplica el nivel a redes
            // if(_tipo_modulo == _MODULO_COMUNIDAD){
            var nivel_reino = self.isKingdomLevel(arraySelected);
            if (nivel_reino) {
                _toastr.warning(_iTrans.prop('lb_nivel_reino'));
                return;
            }
            _VERBOSE ? console.log(nivel_reino) : _VERBOSE;
            // }

            var new_element = self.existsGroup(arraySelected);
            _VERBOSE ? console.log(new_element) : _VERBOSE;

            if (!new_element) {
                _VERBOSE ? console.log(self.var_sel_array) : _VERBOSE;
                _toastr.warning(_iTrans.prop('lb_existente'));
                return;
            }

            var maxGroup = 0;

            if (self.groupDatasetTotal.length > 0)
                maxGroup = d3.max(self.groupDatasetTotal.map(function (d) {
                    return d.groupid;
                }));

            var subgroup = [];


            _VERBOSE ? console.log(arraySelected) : _VERBOSE;

            for (i = 0; i < arraySelected.length; i++) {

                // se elimita el spp del label cuando es tipo BIO
                if (typeVar == _TYPE_BIO) {
                    var label_taxon = arraySelected[i].numlevel == 8 ? arraySelected[i].label : arraySelected[i].label.split(" ")[0]
                    subgroup.push({label: arraySelected[i].level + " >> " + label_taxon, level: arraySelected[i].numlevel, type: arraySelected[i].type});
                } else {
                    subgroup.push({value: arraySelected[i].id, label: arraySelected[i].parent + " >> " + arraySelected[i].label, level: arraySelected[i].level, type: arraySelected[i].type});
                }

            }

            groupid = maxGroup + 1;

            var temp_grupo = {title: "Gpo " + gpoName + " " + groupid, elements: subgroup, groupid: groupid, close: true, type: typeVar};
            self.groupDatasetTotal.push(temp_grupo);


            // these lines are because when one new elements is added, the previuos elements were duplicated. So the collection is clean and reloaded again
            $("#" + idDivContainer).empty();
            $.each(self.groupDatasetTotal, function (i, item) {
                item.close = true;
            });

            _VERBOSE ? console.log(self.groupDatasetTotal) : _VERBOSE;

            var div_item = d3.select("#" + idDivContainer).selectAll("div")
                    .data(self.groupDatasetTotal)
                    .enter()
                    .append("div")
                    .attr("class", "row_var_item")
                    .attr("items", function (d) {
                        // _VERBOSE ? console.log(d) : _VERBOSE
                        return d.elements;
                    })
                    .text(function (d) {
                        return d.title
                    })
                    .on('click', function (d) {

                        if (d.close) {

                            d.close = false;
                            d3.select(this).selectAll("div")
                                    .data(d.elements)
                                    .enter()
                                    .append("div")
                                    .attr("class", "cell_item")
                                    .text(function (t) {
                                        return t.label;
                                    })
                                    .style("text-align", "left");


                        } else {

                            d.close = true;
                            d3.selectAll(this).remove();
                            $(this).text(d.title);
                            $(this).css("text-align", "left");

                            d3.select(this).append("button")
                                    .attr("width", "10px")
                                    .attr("height", "10px")
                                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                                    .on("click", function () {
                                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                                        d3.select(this.parentNode).remove();
                                        var gpo_deleted;

                                        $.each(self.groupDatasetTotal, function (index, obj) {
                                            if (obj.groupid == d.groupid) {
                                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                                return false;
                                            }
                                        })
                                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                                        self.updateVarSelArray(gpo_deleted, _BORRADO);

                                    });

                        }
                    })
                    .append("button")
                    .attr("width", "10px")
                    .attr("height", "10px")
                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                    .on("click", function (d) {
                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                        d3.select(this.parentNode).remove();
                        var gpo_deleted;

                        $.each(self.groupDatasetTotal, function (index, obj) {
                            if (obj.groupid == d.groupid) {
                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                return false;
                            }
                        })
                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                        self.updateVarSelArray(gpo_deleted, _BORRADO);

                    });


            if (typeVar == _TYPE_TERRESTRE || typeVar == _TYPE_ABIO) {
                $('#' + idTree + _id).jstree(true).deselect_all();
            } else {
                $('#' + idTree + _id).jstree("destroy").empty();
            }

            // se envia solo el elemento agregado
            self.updateVarSelArray(temp_grupo, _AGREGADO);

        }

        // Verifica que un grupo previamente seleccionado no sea subgrupo de otro grupo por añadir y viceversa.
        self.isSubset = function (set1, set2) {
            return set1.every(function (val) {
                return set2.indexOf(val) >= 0;
            });
        }

        // Realiza la actualización del grupo final con el cual se realizan los cálculos de épsilon y score.
        self.updateVarSelArray = function (item, operacion) {
            // item - llega en forma de array, por tanto para obtener su valor se accede al primer valor
            if (operacion == _BORRADO) {

                _VERBOSE ? console.log("elemento borrado") : _VERBOSE;

                $.each(self.var_sel_array, function (index, gpo_var) {

                    if (item[0].groupid == gpo_var.groupid && item[0].type == gpo_var.type) {
                        _VERBOSE ? console.log("borrado") : _VERBOSE;
                        self.var_sel_array.splice(index, 1);
                        return false;
                    }

                });

            } else if (operacion == _AGREGADO) {

                _VERBOSE ? console.log("elemento añadido") : _VERBOSE;
                self.var_sel_array.push({"value": item.elements, "type": item.type, "groupid": item.groupid, "title": item.title});

            }


            _VERBOSE ? console.log(self.var_sel_array) : _VERBOSE;
            _VERBOSE ? console.log(self.var_sel_array.length) : _VERBOSE;

        }

        // Elimina las variables previamente agregadas al grupo final con el cual se realizan los cálculos de épsilon y score.
        self.cleanVariables = function (idTree, idDivContainer, typeVar) {

            _VERBOSE ? console.log("self.cleanVariables") : _VERBOSE;

            $('#' + idDivContainer).empty();

            if (typeVar == _TYPE_TERRESTRE || typeVar == _TYPE_ABIO) {
                $('#' + idTree + _id).jstree(true).deselect_all();
            } else {
                $('#' + idTree + _id).jstree("destroy").empty();
            }

            self.var_sel_array = [];
            self.groupDatasetTotal = [];

            // for(i = 0; i < self.var_sel_array.length; i++){
            //     if (self.var_sel_array[i].type == typeVar){
            //       	self.var_sel_array.splice(i, 1);
            //       	i = i-1;
            //     }
            // }

        }

        //  Retorna el grupo final con el cual se realizan los cálculos de épsilon y score.
        self.getVarSelArray = function () {

            _VERBOSE ? console.log("self.getVarSelArray") : _VERBOSE;
            _VERBOSE ? console.log(self.var_sel_array) : _VERBOSE;

            return self.var_sel_array;
        }

        //  Asigna el grupo final con el cual se realizan los cálculos de épsilon y score.
        self.setVarSelArray = function (var_sel_array) {

            _VERBOSE ? console.log("self.setVarSelArray") : _VERBOSE;

            self.var_sel_array = var_sel_array;
        }

        self.getTimeBioclim = function () {

            _VERBOSE ? console.log("self.getTimeBioclim") : _VERBOSE;
            return self.type_time;
        }

    }

    function loadAvailableLayers() {

        _VERBOSE ? console.log("loadAvailableLayers") : _VERBOSE;

        $.ajax({
            url: _url_zacatuche + "/niche/especie/getAvailableVariables",
            dataType: "json",
            type: "post",
            data: {},
            success: function (resp) {

                if (resp.ok === true) {
                    
                    console.log(data);
                    var data = resp.data;
                    _available_variables = data;

                } else {

                }

            }

        });


    }


    /**
     * Éste método llama a la creación del selector de variables.
     *
     * @function createSelectorComponent
     * @public
     * @memberof! table_module
     * 
     * @param {String} parent - Id del contenedor del selector de variables
     * @param {String} id - Id del selector de variables
     * @param {String} title - Título del selector de variables desplegado en la parte superior
     */
    function createSelectorComponent(parent, id, title) {

        _VERBOSE ? console.log("createSelectorComponent") : _VERBOSE;

        var variable_selector = new VariableSelector(parent, id, title);

        _selectors_created.push(variable_selector);
        return variable_selector;

//        loadAvailableLayers(parent, id, title);

    }


    /**
     * Éste método incializa el módulo de internacionalización que esta relacionado con el selector de variables.
     *
     * @function _initializeVarComponents
     * @private
     * @memberof! table_module
     * 
     * @param {object} language_module - Módulo de internacionalización
     * @param {integer} tipo_modulo - Tipo de módulo donde serán asignados los selectores de variables, nicho o comunidad ecológica  
     */
    function _initializeVarComponents(language_module, tipo_modulo) {

        _VERBOSE ? console.log("_initializeVarComponents variables") : _VERBOSE;

        _selectors_created = [];

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

        _language_module = language_module;
        _iTrans = _language_module.getI18();
        _tipo_modulo = tipo_modulo;

        loadAvailableLayers();

    }


    /**
     * Éste método realiza el llamado a la función que inicializa las variables necesarias para la creación del selector de variables.
     *
     * @function startVar
     * @public
     * @memberof! table_module
     * 
     * @param {String} id - Id del selector de variables
     * @param {object} language_module - Módulo de internacionalización
     * @param {integer} tipo_modulo - Tipo de módulo donde serán asignados los selectores de variables, nicho o comunidad ecológica  
     */
    function startVar(id, language_module, tipo_modulo) {
        _VERBOSE ? console.log("startVar") : _VERBOSE;

        _id = "" + id;
        if (id === 0)
            _id = "";
        _VERBOSE ? console.log("_id: " + _id) : _VERBOSE;

        _initializeVarComponents(language_module, tipo_modulo);
    }

    return{
        startVar: startVar,
        getVarSelArray: getVarSelArray,
        createSelectorComponent: createSelectorComponent,
        getSelectorVaribles: getSelectorVaribles

    }

});