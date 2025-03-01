/**
 * Éste módulo es el encargado de la gestión de los componentes de nicho ecológico.
 *
 * @namespace module_nicho
 */



var module_nicho = (function() {

    var _TEST = false;
    var MOD_NICHO = 0;
    var _VERBOSE = true;
    var _REGION_SELECTED;
    var _REGION_TEXT_SELECTED;

    // actualizar este arreglo si cambian los ids de las secciones
    var _SCROLL_SECTIONS = ["section0", "section1", "map", "myScrollableBlockEpsilonDecil", "histcontainer_row"];
    var _SCROLL_INDEX = 0;


    var _tipo_modulo = MOD_NICHO;

    var _map_module_nicho,
        _variable_module_nicho,
        _res_display_module_nicho,
        _region_module_nicho,
        _table_module,
        _histogram_module_nicho,
        _language_module_nicho,
        _module_toast;

    var _componente_fuente;

    var _url_front, _url_api, _url_nicho;

    var _url_geoserver = "http://geoportal.conabio.gob.mx:80/geoserver/cnb/wms?",
        _workspace = "cnb";

    var _iTrans;

    const _ACGetEntList = new AbortController();
    const signal = _ACGetEntList.signal;

    var _getEntListInProcess = false;

    var groupSpSelection = [];

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

    var _taxones = [];



    /**
     * Enlaza la funcionalidad de los componentes visuales de las secciones de nicho ecológico.
     *
     * @function _initializeComponents
     * @private
     * @memberof! module_nicho
     */
    function _initializeComponents() {

        _VERBOSE ? console.log("_initializeComponents") : _VERBOSE;



        $("#lb_do_apriori").text(_iTrans.prop('lb_no'));
        $("#lb_mapa_prob").text(_iTrans.prop('lb_no'));
        // CAMBIOS EPIPUMA
        var diccionario_conceptos = [{}]
        var list_modifiers = [];
        var flag_modifiers = false;
        self.arrayVarSelected = [{}];
        sessionStorage.setItem("selectedData", JSON.stringify(self.arrayVarSelected));
        sessionStorage.setItem("modifiers_flag", "false");
        sessionStorage.setItem("modifiers", "");
        sessionStorage.setItem("covar", "");
        sessionStorage.setItem("flag_target_added", "false")
        sessionStorage.setItem("count_anlys", 0)
        sessionStorage.setItem("light_traffic", "");
        sessionStorage.setItem("res_modif", "");
        sessionStorage.setItem("modif_pop", "");
        sessionStorage.setItem("modelo_test", "");
        sessionStorage.setItem("covars_selected_menu", "[]")
        sessionStorage.setItem("covars_selected_menu_raster", "[]")
        sessionStorage.setItem("selectedData2", "[]")
        sessionStorage.setItem("liminf_first",  "")
        sessionStorage.setItem("limsup_first",  "")
        sessionStorage.setItem("liminf",  "")
        sessionStorage.setItem("limsup",  "")



        // Definicion Fuciones

        const recharge_map = () => {
          let ref_val = $("#modifiersSelect")[0].value;
          if(ref_val=="mod_default"){
            console.log("sin modifcador zoom")
          }else{
            $("#targetVariableButton").click();
            sessionStorage.setItem("zoom_counter","1");
            $(".toast-info").remove()
          }
        }
        const delete_loading_banner = () => {
          console.log("deleting banner3");
          try {

            document.getElementById("hst_esp_eps_loading-overlay").style.position="absoulte"
            document.getElementById("hst_esp_scr_loading-overlay").style.position="absoulte"
            document.getElementById("hst_cld_scr_loading-overlay").style.position="absoulte"
            document.getElementById("hst_cld_scr_loading-overlay").style.top="10000px"
            document.getElementById("hst_esp_scr_loading-overlay").style.top="10000px"
            document.getElementById("hst_esp_eps_loading-overlay").style.top="10000px"


          } catch (e) {
            console.log(e,"banner has been deleted")
          }
        }
        const generatePredictiveDescriptiveToggleSwith = (clase, clase_texto, texto) => {
            let div = document.createElement("div");
            div.setAttribute("id", "id_toggle");
            let lab = document.createElement("label");
            lab.setAttribute("class", clase);
            let inpt = document.createElement("input");
            inpt.setAttribute("type", "checkbox");
            inpt.setAttribute("id", "pred_des_control");
            let sp = document.createElement("span");
            sp.setAttribute("class", "slider round");
            let p = document.createElement("p");
            p.setAttribute("class", clase_texto);
            let textnode = document.createTextNode(texto);
            p.appendChild(textnode);
            lab.appendChild(p);
            lab.appendChild(inpt);
            lab.appendChild(sp);
            div.appendChild(lab);
            document.getElementById("tuto_fil_fecha").appendChild(div);

        };
        const generateNewFlow = () => {
            sessionStorage.setItem("light_traffic", "");
            $('select option[value="model_default"]').attr("selected", true);
            $("#modelSelect").change(function() {
                $('select option[value="var_default"]').attr("selected", true);
                //$("#date_timepicker_start_val").attr("disabled", "disabled")

            })
            $("#targetVariableSelect").change(function() {
                let var_obj = $(this).val();
                let data = {};
                switch (var_obj) {
                    case "COVID-19 Confirmado":
                        data = {
                            "target_taxons": [{
                                "taxon_rank": "species",
                                "value": "COVID-19 CONFIRMADO"
                            }]
                        }
                        break;
                    case "COVID-19 Negativo":
                        data = {
                            "target_taxons": [

                                {
                                    "taxon_rank": "species",
                                    "value": "COVID-19 FALLECIDO"
                                }
                            ]
                        }
                        break;
                    case "COVID-19 Pruebas":
                        data = {
                            "target_taxons": [{
                                    "taxon_rank": "species",
                                    "value": "COVID-19 CONFIRMADO"
                                },
                                {
                                    "taxon_rank": "species",
                                    "value": "COVID-19 NEGATIVO"
                                }
                            ]
                        }
                        break;

                    default:
                        break;
                }
                console.log(data);
                $.ajax({
                    url: _url_api + "/niche/especie/getModifiersByTarget",
                    data: data,
                    dataType: "json",
                    type: "post",
                    success: function(resp) {
                        console.log(resp);
                        let modif = resp["modifiers"];
                        var select = document.getElementById("modifiersSelect");
                        $('select option[value="mod_default"]').attr("selected", true);
                        try {
                            let actual_modifiers =
                                $(".modif_opt").remove();
                        } catch (error) {
                            console.log("no mdifiers")
                        }

                        for (let index = 0; index < modif.length; index++) {
                          if(modif[index]["label"] == "Prevalencia"){
                            modif[index]["label"] = "Positividad"
                          }
                            console.log(modif[index]["label"])
                            console.log(modif[index]["modifier"])
                            var opt = document.createElement('option');
                            opt.setAttribute("class", "modif_opt")
                            opt.value = modif[index]["modifier"];
                            opt.innerHTML = modif[index]["label"];
                            select.appendChild(opt);
                        };
                        let model_enfo = $("#modelSelect").val();
                        console.log(model_enfo);
                        // if (model_enfo == "Predictivo") {
                        $("#modifiersSelect").change(function() {
                            $('select option[value="enf_default"]').attr("selected", true);
                        });
                        $("#enfoqueSelect").change(function() {
                            $("#targetVariableButton").css("visibility", "visible")
                            let enfoque = $("#enfoqueSelect").val();
                            if (enfoque == "Mejoramiento") {
                                sessionStorage.setItem("light_traffic", "green");
                            } else if (enfoque == "Empeoramiento") {
                                sessionStorage.setItem("light_traffic", "red");
                            } else {
                                sessionStorage.setItem("light_traffic", "star");
                            }

                        });
                        // } else {

                        // }

                    }
                });
            });
        };
        const dateRange = (startDate, endDate) => {
            var start = startDate.split('-');
            var end = endDate.split('-');
            var startYear = parseInt(start[0]);
            var endYear = parseInt(end[0]);
            var dates = [];
            var dates2 = []

            for (var i = startYear; i <= endYear; i++) {
                var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
                var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
                for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
                    var month = j + 1;
                    var displayMonth = month < 10 ? '0' + month : month;
                    dates.push([i, displayMonth, '01'].join('-'));
                }
            }
            for (let index = 0; index < dates.length; index++) {
                a = dates[index].split("-");
                b = a[0] + "-" + a[1]
                dates2.push(b)

            }

            return dates2.reverse();
        };
        const addOptionsSelect = (id, fechas) => {
            var select = document.getElementById(id);
            for (let index = 0; index < fechas.length; index++) {
                var opt = document.createElement('option');
                if (fechas[index] == parsedTodayDate.match(/....-../g)[0]) {
                    opt.value = fechas[index] + parsedTodayDate.match(/-..$/g)[0];
                    opt.innerHTML = "Siguientes 30 días";
                    select.appendChild(opt);
                } else {
                    opt.value = fechas[index] + "-15";
                    opt.innerHTML = fechas[index];
                    select.appendChild(opt);
                }
            }
            $("#date_timepicker_start")[0].value = "";
        };
        const fix_tar_var_without_mod_tags = () => {
            let enfoque = JSON.stringify(sessionStorage.getItem("light_traffic"));
            var focus_switch;
            console.log(enfoque)
            switch (enfoque) {
                case '"green"':
                    focus_switch = ("Enfoque: Mejoramiento");
                    break;
                case '"red"':
                    focus_switch = ("Enfoque: Empeoramiento");
                    break;
                case '"star"':
                    focus_switch = ("Enfoque: Estrella");
                    break;
            }
            try {
                let original_text = $(".cell_item")[0].innerText;
                let original_text_2 = original_text.split("Especie >>")[1];
                $(".cell_item")[0].innerText = original_text_2 + " >> " + focus_switch;
                let a = $(".row_var_item")[0].innerHTML;
                if (a[0] == "G") {
                    let b = a.split("Gpo Bio 1");
                    let c = "Variable Objetivo" + b[1]
                    $(".row_var_item")[0].innerHTML = c
                }
            } catch (error) {
                console.log("minimizado");
                $(".row_var_item")[0].innerHTML = "Variable Objetivo<button width=\"10px\" height=\"10px\" class=\"btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var\"></button>"
            }
        };
        const fix_tar_var_with_mod_tags = () => {
            let obj_fix = {}
            sessionStorage.setItem("modifiers_flag", "true");
            for (let index = 0; index < list_modifiers.length; index++) {
                obj_fix[list_modifiers[index]] = list_modifiers[index][0];
            }
            console.log(obj_fix)
            //sessionStorage.setItem("modifiers", JSON.stringify(obj_fix))
            let modifier_value = JSON.parse(sessionStorage.getItem("modifiers"));
            let texto = Object.values(modifier_value);
            let text_switch
            let texto2 = (texto[0])
            console.log(texto2)
            switch (texto2) {
                case "prevalence":
                    text_switch = "Prevalencia";
                    break;
                case "incidence":
                    text_switch = "Incidencia";
                    break;
                case "lethality":
                    text_switch = "Letalidad";
                    break;
                case "negativity":
                    text_switch = "Negatividad";
                    break;
                default:
                    text_switch = "Casos";
                    break;
            }
            let enfoque = JSON.stringify(sessionStorage.getItem("light_traffic"));
            var focus_switch;
            console.log(enfoque)
            switch (enfoque) {
                case '"green"':
                    focus_switch = ("Enfoque: Mejoramiento");
                    break;
                case '"red"':
                    focus_switch = ("Enfoque: Empeoramiento");
                    break;
                case '"star"':
                    focus_switch = ("Enfoque: Estrella");
                    break;
            }

            console.log(focus_switch)

            let modifier_text = "Modificador: " +
                text_switch
            try {
                let original_text = $(".cell_item")[0].innerText;
                let original_text_2 = original_text.split("Especie >>")[1];
                $(".cell_item")[0].innerText = original_text_2 + " >> " + modifier_text + " >> " + focus_switch;
                let a = $(".row_var_item")[0].innerHTML;
                if (a[0] == "G") {
                    let b = a.split("Gpo Bio 1");
                    let c = "Variable Objetivo" + b[1]
                    $(".row_var_item")[0].innerHTML = c
                }
            } catch (error) {
                console.log("minimizado");
                //$(".row_var_item")[0].innerHTML = "Variable Objetivo<button width=\"10px\" height=\"10px\" class=\"btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var\"></button>"
            }
        };
        const fixed_covar_tags = (title) => {
            console.log("fixed_covar_tags")
            let node, node2;

            try {
                console.log(title);
                let number = title.split("Covariable")[1][1];
                for (let index = 0; index < $(".cell_item").length; index++) {
                    let a = $(".cell_item")[index]["parentNode"]["textContent"];
                    if (a.includes("COVID")) {
                        console.log("variable objetivo no entra a este analisis")
                    } else {
                        let b = a.split("Covariable");
                        let c = b[1][1]
                        if (number == c) {
                            node = $(".cell_item")[index];
                        }
                    }

                }
                for (let index = 0; index < $(".row_var_item").length; index++) {
                    let d = $(".row_var_item")[index].innerText;
                    let e = d.replace(/[^\d.]/g, '');
                    let f = parseInt(e);
                    let g = title.replace(/[^\d.]/g, '');
                    let h = parseInt(g)
                    console.log(h, f)
                    console.log(h == f)
                    if (g == f) {
                        node2 = $(".row_var_item")[index];
                    }
                }
                let original_text_covar = node.innerText;
                console.log(node)
                if ((original_text_covar[0] == "R") || (original_text_covar[0] == "G")) {
                    let original_text_2_covar = original_text_covar.split(">> ")[1];
                    node.innerText = original_text_2_covar;
                }
                let ab = node2.innerHTML;
                if (ab[0] == "G") {
                    let bb = ab.split("Gpo Bio 1");
                    let cb = title + bb[1]
                    node2.innerHTML = cb
                }

            } catch {
                for (let index = 0; index < $(".row_var_item").length; index++) {
                    let d = $(".row_var_item")[index].innerText;
                    let e = d.replace(/[^\d.]/g, '');
                    let f = parseInt(e);
                    let g = title.replace(/[^\d.]/g, '');
                    let h = parseInt(g)
                    console.log(h, f)
                    console.log(h == f)
                    if (g == f) {
                        node2 = $(".row_var_item")[index];
                    }
                }
                console.log("covar minimizada");
                console.log(node2);
                let final_name = "Covariable " + title.split(" ")[2];
                let final_html = final_name + "<button width=\"10px\" height=\"10px\" class=\"btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var\"></button>";
                console.log(final_html);
                node2.innerHTML = final_html;
            }


        };
        $('#modifiersSelect').on('change', function() {
          var modifierSelected = {}
          var value = this.value
          modifierSelected[value] = value
          sessionStorage.setItem("modifiers", JSON.stringify(modifierSelected))
          value == "Sin Modificador" ? sessionStorage.setItem("modifiers_flag", JSON.stringify(false)) : sessionStorage.setItem("modifiers_flag", JSON.stringify(true))
        });
        $('#modelSelect').on('change', function() {
          var model = $("#modelSelect").val()
          if(model == 'Perfilado') {
            $("#pred_des_control")[0].checked = false
          }
          if(model == 'Predictivo') {
            $("#pred_des_control")[0].checked = true
          }
          toogle_predictive_profiling();
        });
        $('#enfoqueSelect').on('change', function() {
          var value = ""
          switch (this.value) {
            case "Mejoramiento":
              value = "green"
              break;
            case "Empeoramiento":
              value = "red"
                break;
            case "Estrella":
              value = "star"
                  break;
          }
         sessionStorage.setItem("light_traffic", JSON.stringify(value))
        });

        const create_fixed_covars_three = () => {
            var tree_reinos = [{
                "text": "Grupos de Interes",
                "id": "root_covar",
                "attr": { "nivel": "root", "type": 0 },
                'state': { 'opened': true },
                "icon": "plugins/jstree/images/dna.png",
            }];

            self.covar_raiz = $('#jstree_variables_species_fuente').jstree({
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
            var default_son = [{
                text: "cargando..."
            }];
            $('#jstree_variables_species_fuente').on('open_node.jstree', function(e, d) {
                let id = "fuente"
                _VERBOSE ? console.log("self.getTreeVar") : _VERBOSE;

                _VERBOSE ? console.log(d.node.original.attr.nivel) : _VERBOSE;
                _VERBOSE ? console.log(d.node.children) : _VERBOSE;
                hiddingLoadingNodesInJsTree()
                  
                


                if (d.node.children.length > 1) {
                    console.log("No se encontraron datos debajo de este nivel")
                    return;
                }

                var next_field = "";
                var next_nivel = 0;
                var parent_field = "";

                $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/dist/themes/default/throbber.gif");
                console.log(d.node.original.attr.nivel);
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
                    next_field = "especieepiteto";
                    next_nivel = 8;
                } else {
                    $('#jstree_variables_species_' + id).tooltip('hide');
                    $("#jstree_variables_species_" + id).jstree(true).delete_node(d.node.children[0]);
                    $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/images/dna.png");
                    return;
                }

                _VERBOSE ? console.log(d.node.id) : _VERBOSE
                _VERBOSE ? console.log(d.node.text) : _VERBOSE

                var text_val = d.node.text
                var regex = / \(spp: \d*\)/gi;

                // elimina el (spp: N) del valir para realizar la busqueda de manera correcta
                var label_value = text_val.replace(regex, '');
                _VERBOSE ? console.log(label_value) : _VERBOSE

                _REGION_SELECTED = ($("#footprint_region_select").val() !== null && $("#footprint_region_select").val() !== undefined) ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
                _GRID_RES = $("#grid_resolution").val();

                console.log("REGION_SELECTED: " + _REGION_SELECTED);
                console.log("_GRID_RES: " + _GRID_RES);

                $.ajax({
                    url: _url_api + "/niche/especie/getVariables",
                    dataType: "json",
                    type: "post",
                    data: {
                        "field": next_field,
                        "parentfield": parent_field,
                        // "parentitem": d.node.text.split(" ")[0],
                        "parentitem": label_value,
                        "footprint_region": _REGION_SELECTED,
                        "grid_res": _GRID_RES
                    },
                    success: function(resp) {
                        console.log(resp);
                        data = resp.data;

                        $('ul').tooltip('hide');
                        $('li').tooltip('hide');
                        $('li').removeAttr("title");
                        $('li').removeAttr("data-original-title");
                        $('#jstree_variables_species_' + id).removeAttr("data-original-title");
                        $('#jstree_variables_species_' + id).removeAttr("title");
                        for (i = 0; i < data.length; i++) {
                            var label_taxon = next_nivel < 8 ? data[i].name + " (spp: " + data[i].spp + ")" : data[i].name;
                            var idNode = "";
                            var name_variable_to_lowercase = label_taxon.toLowerCase()
                            var name_variable_without_accents = name_variable_to_lowercase.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            var name_variable_without_spaces = name_variable_without_accents.split(/\s|%|:|[(]|[)]/)
                            var name_variable = name_variable_without_spaces.join("-")
                            console.log("name_variable: " + name_variable)

                            if ($("#" + data[i].id).length > 0) {
                                // _VERBOSE ? console.log("id_existente") : _VERBOSE;

                                idNode = data[i].id.replace(" ", "") + "_" + Math.floor((Math.random() * 1000) + 1)
                            } else {
                                // ._VERBOSE ? console.log("nuevo_id") : _VERBOSE;

                                idNode = data[i].id;
                            }

                            var default_son = next_nivel < 8 ? [{ text: "cargando..." }] : [];

                            var newNode = {
                                id: idNode,
                                text: label_taxon,
                                icon: "plugins/jstree/images/dna.png",
                                attr: { "nivel": next_nivel, "type": 0 },
                                state: { 'opened': false },
                                "children": default_son
                            };

                            if (data[i].description + '' !== 'undefined') {
                                newNode['li_attr'] = { "title": data[i].description + ' ' + data[i].name.split(' ')[1], "id": name_variable };
                            }
                            newNode['li_attr'] = {"id": name_variable}

                            $('#jstree_variables_species_' + id).jstree("create_node", d.node, newNode, 'last', false, false);

                        }
                        $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/images/dna.png");
                        $("#jstree_variables_species_" + id).prop('title', data[0].description);
                        $("#jstree_variables_species_" + id).tooltip();

                        $('li').tooltip();
                        $('ul').tooltip();
                        hiddingLoadingNodesInJsTree()
                    }
                });
                
            });

            $("#jstree_variables_species_fuente").on('loaded.jstree', function() {
                console.log("primerArbolCovar");
                console.log($("#root_covar"));
                var newNode = {
                    id: "demograficos",
                    text: "Demográficos",
                    icon: "plugins/jstree/images/dna.png",
                    attr: {
                        "nivel": 2,
                        "type": 0
                    },
                    state: { 'opened': false },
                    "children": default_son
                };
                var newNode2 = {
                    id: "pobreza",
                    text: "Pobreza",
                    icon: "plugins/jstree/images/dna.png",
                    attr: {
                        "nivel": 2,
                        "type": 0
                    },
                    state: { 'opened': false },
                    "children": default_son
                };
                var newNode3 = {
                    id: "movilidad",
                    text: "Movilidad",
                    icon: "plugins/jstree/images/dna.png",
                    attr: {
                        "nivel": 2,
                        "type": 0
                    },
                    state: { 'opened': false },
                    "children": default_son
                };
                var newNode4 = {
                    id: "vulnerabilidad",
                    text: "Vulnerabilidad",
                    icon: "plugins/jstree/images/dna.png",
                    attr: {
                        "nivel": 7,
                        "type": 0
                    },
                    state: { 'opened': false },
                    "children": default_son
                };
                var current_node = $('#jstree_variables_species_fuente').jstree(true).get_node($("#root_covar"));
                console.log(current_node)
                $('#jstree_variables_species_fuente').jstree("create_node", current_node, newNode, 'last', false, false);
                $('#jstree_variables_species_fuente').jstree("create_node", current_node, newNode2, 'last', false, false);
                $('#jstree_variables_species_fuente').jstree("create_node", current_node, newNode3, 'last', false, false);
                $('#jstree_variables_species_fuente').jstree("create_node", current_node, newNode4, 'last', false, false);

                setTimeout(function() {
                    console.log("loaded fixed covars")
                    var parsed_data = ""
                    $(".jstree-anchor")[1].click()
                    $(".jstree-anchor")[1].click()

                }, 1500)

            });
        };
        const toogle_predictive_profiling = () => {
            let status = $("#pred_des_control")[0].checked;
            console.log(status);
            if (status == false) {
              //$("#lb_range_fecha")[0].innerText = "Periodo de Validación";
              document.getElementById('date_timepicker_start_val').id = 'date_timepicker_start';
              setTimeout(function() {
                  $("#date_timepicker_start").removeAttr("disabled");
              }, 550);
              $(".col-lg-12").css("margin-top", "-1%");
            } else {
              //$("#lb_range_fecha")[0].innerText = "Periodo de Validación";
              document.getElementById('date_timepicker_start').id = 'date_timepicker_start_val';
              $(".col-lg-12").css("margin-top", "-40%");
              setTimeout(function() {
                  $("#date_timepicker_start_val").removeAttr("disabled");
              }, 550);
            }
        };
        const hide_selected_covars = (covar) => {
          var covar_list = JSON.parse(sessionStorage.getItem("covars_selected_menu"))
          if(covar[0].id == "root_covar"){
            covar_list = ["#demograficos","#pobreza","#movilidad","#vulnerabilidad"]
            for (let index = 0; index < covar_list.length; index++) {
              $(covar_list[index]).css("position", "absolute");
              $(covar_list[index]).css("visibility", "hidden");
            }
          } else {
            for (let index = 0; index < covar.length; index++) {
                let covar_selected = "#" + covar[index].id;
                covar_list.push(covar_selected);
                $(covar_selected).css("position", "absolute");
                $(covar_selected).css("visibility", "hidden");
            }
          }
          sessionStorage.setItem("covars_selected_menu", JSON.stringify(covar_list));
        };
        const unhide_selected_covars = () => {
                let covar_list = JSON.parse(sessionStorage.getItem("covars_selected_menu"));
                for (let index = 0; index < covar_list.length; index++) {
                    let covar_selected_2 = covar_list[index];
                    $(covar_selected_2).css("position", "relative");
                    $(covar_selected_2).css("visibility", "visible");
                    //$(covar_selected_2)[0].children[2].children[0].click()
                }

            }
            //Termina Modularización Funciones
            // Implementación Funciones
            //Cambios ESTATICOS
        $("#tuto_taxon_sp_target").remove();
        $("#tuto_nav_tabs_target").css("margin-bottom", "4px");
        $("#btn_variable_fuente").remove()
        $("#text_variable_fuente").remove()
        $("#tuto_nav_tabs_fuente").css("margin-bottom", "4px");
        $("#jstree_variables_species_target").remove();
        $("#tuto_fil_fecha").css("position", "absolute");
        $("#tuto_fil_fecha").css("top", "22%");
        $("#tuto_fil_fecha").css("margin-left", "5%");
        $("#tuto_nav_tabs_target").remove();
        $("#add_group_target").css("position", "absolute");
        $("#add_group_target").css("top", "86%");
        $("#add_group_target").css("margin-left", "16%");
        $("#add_group_target").css("visibility", "hidden");
        $("#treeAddedPanel_target").css("visibility", "hidden");
        $("#treeVariable_target").css("visibility", "hidden");
        $("#clean_var_target").css("visibility", "hidden");
        $("#reload_map").css("visibility", "hidden");
        $("#tuto_params").css("visibility", "hidden");
        $("#myScrollableBlockEpsilonDecil").css("position", "relative");
        $("#myScrollableBlockEpsilonDecil").css("top", "-62%");


        ////MAP ZOOM ISSUE
        $(".leaflet-control-zoom-in").click(function(){
          recharge_map();
        });
        $(".leaflet-control-zoom-out").click(function(){
          recharge_map();
        });




        //////NEW FLOW
        generateNewFlow();
        ///BOTON CONFIRMAR MODELO
        $("#targetVariableButton").click(function() {
          sessionStorage.setItem("zoom_counter","0");

          ///// SELECCION VARIABLES EN FLUJO NUEVO
          let obj_var = $("#targetVariableSelect").val();
          let modif = $("#modifiersSelect").val();
          let model = $("#modelSelect").val();
          let enfoqueSelect = $("#enfoqueSelect").val();
          if ($("#pred_des_control")[0].checked) {
            var date_timepicker_start = $("#date_timepicker_start_val").val();

          } else {
            var date_timepicker_start = $("#date_timepicker_start").val();
          }
          ////VALIDACION ANTES DE MANDAR LA PETICION
          if(obj_var && modif && model && enfoqueSelect && date_timepicker_start){
            /////SELECCION  MODELO
            if (model == 'Predictivo') {
                _module_toast.showToast_BottomCenter(_iTrans.prop('Proceso de Validación Activado'), "info");
                sessionStorage.setItem("modelo_test", "predictivo");
                if ($("#pred_des_control")[0].checked == false) {
                  $("#pred_des_control").click()
                }
            } else {
                console.log("Perfilado");
                if ($("#pred_des_control")[0].checked == true) {
                  document.getElementById('date_timepicker_start_val').id = 'date_timepicker_start';
                  setTimeout(function() {
                      $("#date_timepicker_start").removeAttr("disabled");
                  }, 550)
                }
                $(".col-lg-12").css("margin-top", "-1%");
                $("#pred_des_control")[0].checked = false;
                sessionStorage.setItem("modelo_test", "perfilado");

            }
            ///// SELECCION MODIFICADORES
            if (modif == "Sin Modificador") {
                console.log("Sin Modificador")
                flag_modifiers = false;
                sessionStorage.setItem("modifiers_flag", false);
            } else {
                flag_modifiers = true;
                console.log(flag_modifiers);
                list_modifiers.push([modif]);
                _module_toast.showToast_BottomCenter(_iTrans.prop('Modelo con Modificadores Seleccionado'), "info");

            }
            if (obj_var == "COVID-19 Confirmado") {
                var selected_var = [{
                    label: "COVID-19 CONFIRMADO",
                    level: "Especie",
                    numlevel: 8,
                    parent: "COVID-19",
                    type: 0,
                }];
            } else if (obj_var == "COVID-19 Negativo") {
                var selected_var = [{
                    label: "COVID-19 FALLECIDO",
                    level: "Especie",
                    numlevel: 8,
                    parent: "COVID-19",
                    type: 0,
                }];
            } else if (obj_var == "COVID-19 Pruebas") {
                var selected_var = [{
                        label: "COVID-19 CONFIRMADO",
                        level: "Especie",
                        numlevel: 8,
                        parent: "COVID-19",
                        type: 0,
                    },
                    {
                        label: "COVID-19 NEGATIVO",
                        level: "Especie",
                        numlevel: 8,
                        parent: "COVID-19",
                        type: 0,
                    }
                ];
            };
            ////PASANDO VARIABLES A SESSION STORAGE Y RESETEANDO ELEMENTOS
            console.log(selected_var);
            sessionStorage.setItem("selectedData", JSON.stringify(selected_var));
            $("#add_group_target").css("visibility", "visible");
            $("#add_group_target").click();
            $("#add_group_target").css("visibility", "hidden");
            $("#tuto_fil_fecha").css("top", "17%");
            ////CCHECK FOR $("#chkValidationTemp").is(':checked')
            var modelo2 = sessionStorage.getItem("modelo_test")
            if (modelo2 == "predictivo") {
                $("#chkValidationTemp").attr('checked', true);
            } else {
                $("#chkValidationTemp").attr('checked', false);
            }
            $("#reload_map").click();
          } else {
            model ? "" : alert("Por Favor Seleccione el Tipo")
            obj_var ? "" : alert("Por Favor Seleccione la Variable Objetivo")
            modif ? "" : alert("Por Favor Seleccione el Modificador")
            enfoqueSelect ? "" : alert("Por Favor Seleccione el Enfoque")
            date_timepicker_start ? "" : alert("Por Favor Seleccione Periodo")
          }

        });


        /// DATE  MONTHS ONLY
        let todayDate = new Date();
        let parsedTodayDate = String(todayDate.getFullYear() + "-" + (Number((todayDate.getMonth() + 1)) < 10 ? "0" + (todayDate.getMonth() + 1) : (todayDate.getMonth() + 1)) + "-" + (Number(todayDate.getDate()) < 10 ? "0" + todayDate.getDate() : todayDate.getDate()));
        var fechas = dateRange("2020-01-01", "2023-03-31");
        addOptionsSelect("date_timepicker_start", fechas);

        //PREDICTIVO/DESCRIPTIVO
        setTimeout(function() {
            generatePredictiveDescriptiveToggleSwith("switch", "texto_switch", "Quiero Crear un Modelo Predictivo");
            ////NEW NEW FLOW
            document.getElementsByClassName("slider round")[0].hidden = true;
            $(".texto_switch").remove();
            /////
            $(".switch").css("margin-top", "-35%");
            $("#pred_des_control")[0].checked = false;
            $(".texto_switch").css("margin-left", "105%");
            $(".texto_switch").css("width", "875%");
            $("#tuto_val").css("position", "absolute");
            $("#tuto_val").css("top", "500px");
            $("#tuto_val").css("visibility", "hidden");


            $("#pred_des_control").click(function() {

                setTimeout(function() {
                    toogle_predictive_profiling();
                }, 500);


            });
            //CSS
            $("#id_toggle").css("position", "absolute");
            $("#id_toggle").css("top", "400%");
        }, 1000)

        setTimeout(function() {
            create_fixed_covars_three();
        }, 1000)

        /////

        ////////////////////////////



        // Boton Agregar Variable Objetivo
        $("#add_group_target").click(function() {;
            sessionStorage.setItem("flag_target_added", "true");
            //Manejo del arbol de variables
            let variables_seleccionadas = JSON.parse(sessionStorage.getItem("selectedData"));
            let covars_list = ["COVID-19 CONFIRMADO", "COVID-19 FALLECIDO", "COVID-19 NEGATIVO", "COVID-19 SOSPECHOSO"];
            if (variables_seleccionadas[0]["label"] == "COVID-19") {
                for (let index = 0; index < covars_list.length; index++) {
                    let etiqueta = "#" + covars_list[index].replace(/\s/g, "");
                    $(etiqueta).remove()
                }
            }
            for (let index = 0; index < variables_seleccionadas.length; index++) {
                let etiqueta = "#" + variables_seleccionadas[index]["label"].replace(/\s/g, "");
                $(etiqueta).remove()

            }
            console.log(flag_modifiers)
                //Manejo de Modificadores
                //Eliminar grupo modificadores
            if (flag_modifiers) {
                ///VAR OBJ CON MODIF
                $(".row_var_item").click()
                fix_tar_var_with_mod_tags();
                setTimeout(function() {
                    $(".row_var_item").click(function() {
                        fix_tar_var_with_mod_tags();
                    });
                }, 1000)

            } else {
                ///VAR OBJ SIN MODIF
                $(".row_var_item").click();
                fix_tar_var_without_mod_tags();


                setTimeout(function() {
                    $(".row_var_item").click(function() {
                        fix_tar_var_without_mod_tags();
                    });
                }, 1000)

            }
        });

        // Boton Borrar Variable Objetivo
        $("#clean_var_target").click(function() {
            //getFixedData("target", data_target);
            sessionStorage.setItem("flag_target_added", "false")
            flag_modifiers = false;
            sessionStorage.setItem("modelo_test", "")
            sessionStorage.setItem("modifiers", "");
            sessionStorage.setItem("selectedData", JSON.stringify([{}]))
            sessionStorage.setItem("flag_target_added", false)
            sessionStorage.setItem("modifiers_flag", false);
            sessionStorage.setItem("covar", "");
            sessionStorage.setItem("light_traffic", "")
            $("#tuto_fil_fecha").css("top", "21%");
            $("#root_covar").jstree().enable_node("root_covar")
            try {
                document.getElementById('date_timepicker_start_val').id = 'date_timepicker_start';
            } catch {
                console.log("Bug boton basura")
            }
            //list_modifiers.length = 0;
            //let count = sessionStorage.getItem("count_anlys");
            // if (count == 1) {
            //     location.reload();
            // }
            // if (self.arrayVarSelected.length == 0) {
            //     console.log("No species selected");
            //     _module_toast.showToast_BottomCenter(_iTrans.prop('msg_noespecies_selected'), "warning");
            //     return;
            // }
        });
        ////Boton Agregar Covariables
        $("#add_group_fuente").click(function() {
            let data_session = JSON.parse(sessionStorage.getItem("selectedData"));
            let getSelectedData = $("#root_covar").jstree().get_top_checked(true)
            if(getSelectedData.length == 0) {
              return;
            } else {
              if (!(data_session[0]["label"].includes("COVID"))) {
                  hide_selected_covars(getSelectedData);
              }
              setTimeout(function() {
                  $(".row_var_item").click(function() {
                      let element = $(this);
                      let a = element[0].innerHTML;
                      let b = a.split("<b")[0];
                      console.log(element);
                      console.log(element[0].textContent);
                      //let data_session = JSON.parse(sessionStorage.getItem("selectedData"));
                      //if (!(data_session[0]["label"].includes("COVID"))) {
                          //fixed_covar_tags(b);
                      //}
                  });
              }, 1000);
            }
            $("#root_covar").jstree().uncheck_all(true)
        });
        ////Boton Agregar Covariables Raster
        $("#add_group_bioclim_fuente").click(function() {
          let getSelectedDataRaster= JSON.parse(sessionStorage.getItem("covars_selected_menu_raster"));
          if(getSelectedDataRaster.length == 0) {
            return;
          } else {
            for (let index = 0; index < getSelectedDataRaster.length; index++) {
              $(getSelectedDataRaster[index]).css("position", "absolute");
                $(getSelectedDataRaster[index]).css("visibility", "hidden");
            }
          }
        });
        // Boton Borrar Variable Objetivo
        $("#clean_var_fuente").click(function() {
            sessionStorage.setItem("selectedData", JSON.stringify([{}]))
            sessionStorage.setItem("selectedData2", JSON.stringify([]))
            unhide_selected_covars();
            $('#jstree_variables_species_fuente').jstree().deselect_all()
        })
        // Boton Borrar Variable Objetivo Raster
        $("#clean_var_bioclim_fuente").click(function() {
          var all_covars_selected = JSON.parse(sessionStorage.getItem("covars_selected_menu_raster"))
          for (let index = 0; index < all_covars_selected.length; index++) {
            $(all_covars_selected[index]).css("position", "relative");
            $(all_covars_selected[index]).css("visibility", "visible");
          }
          sessionStorage.setItem("covars_selected_menu_raster","[]")
      })
        $("#reload_map").click(function() {
            sessionStorage.setItem("covar", "")
        });
        $("#get_esc_ep").click(function() {
            sessionStorage.setItem("count_anlys", 1)
            setTimeout(function(){
              delete_loading_banner();
            },800)

        });
        $("#add_group_fuente").click(function() {
           // sessionStorage.setItem("covar", "")
        })

        /// Acaban cambios EpiPuma


        function forceNumeric() {
            var $input = $(this);
            $input.val($input.val().replace(/[^\d]+/g, ''));
        }


        $('body').on('propertychange input', 'input[type="number"]', forceNumeric);


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#pred_des_control").click(function(event) {

            console.log("cambia validacion temporal");

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#labelValidationTemp").text("Si");

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_act'), "info");
                $("#date_timepicker_start_val").removeAttr('disabled');

            } else {

                $("#labelValidationTemp").text("No");

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_des'), "info");
                $("#date_timepicker_start_val").attr("disabled", "disabled")

            }

        });


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkValidation").click(function(event) {

            console.log("cambia validacion");

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#labelValidation").text("Si");

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_act'), "info");

            } else {

                $("#labelValidation").text("No");
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_validacion_des'), "info");

            }

        });


        // checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
        $("#chkMinOcc").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#occ_number").prop("disabled", false);

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_act'), "info");

            } else {

                $("#occ_number").prop("disabled", true);

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_minocc_des'), "info");

            }

        });


        $("#chkFosil").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {

                $("#labelFosil").text("Si");

                _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_act'), "info");

            } else {

                $("#labelFosil").text("No");

                _regenMessage();

                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_fosil_des'), "info");

            }

        });


        // checkbox que se activa cuando se desea tomar en cuanta un minimo de ocurrencias
        $("#chkFecha").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#sliderFecha").slider("enable");

                $("#lb_sfecha").text(_iTrans.prop('lb_si'));

                _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha'), "info");

            } else {

                $("#lb_sfecha").text(_iTrans.prop('lb_no'));

                _regenMessage();
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_chkfecha_des'), "info");

            }

        });


        $("#footprint_region_select").change(function(e) {

            console.log("Cambiando a " + parseInt($("#footprint_region_select").val()));

            _REGION_SELECTED = parseInt($("#footprint_region_select").val());
            _REGION_TEXT_SELECTED = $("#footprint_region_select option:selected").text();
            _map_module_nicho.changeRegionView(_REGION_SELECTED);

            _regenMessage();

        });


        $("#grid_resolution").change(function(e) {

            _VERBOSE ? console.log("Cambia grid resolución") : _VERBOSE;
            // No es necesario regenerar resultados
            _regenMessage();

        });


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkApriori").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#lb_do_apriori").text(_iTrans.prop('lb_si'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_apriori_act'), "info");

            } else {
                $("#lb_do_apriori").text(_iTrans.prop('lb_no'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_apriori_desc'), "info");
            }

        });


        // checkbox que se activa cuando se desea realizar el proceso de validación. (Proceso de validación todavia no implementado)
        $("#chkMapaProb").click(function(event) {

            var $this = $(this);

            if ($this.is(':checked')) {
                $("#lb_mapa_prob").text(_iTrans.prop('lb_si'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_mapprob_act'), "info");

            } else {
                $("#lb_mapa_prob").text(_iTrans.prop('lb_no'));
                _module_toast.showToast_BottomCenter(_iTrans.prop('lb_status_mapprob_des'), "info");
            }

        });


        // deshabilita controles temporales
        $("#chkFecha").prop('disabled', false);


        // $("#sliderFecha").slider({
        //     disabled: false
        // });


        $("#nicho_link").click(function() {
            window.location.replace(_url_front + "/comunidad_v0.1.html");
        });

        $("#btn_tutorial").click(function() {
            window.open(_url_front + "/docs/tutorial.pdf");
        });

        _SCROLL_INDEX = 0;

        $("#specie_next").click(function() {

            if (_SCROLL_INDEX >= _SCROLL_SECTIONS.length - 1)
                return;

            _SCROLL_INDEX = _SCROLL_INDEX + 1;

            // console.log(_SCROLL_SECTIONS[_SCROLL_INDEX])

            $('html, body').animate({
                scrollTop: $("#" + _SCROLL_SECTIONS[_SCROLL_INDEX]).offset().top - 40
            }, 1000);



        });
        setTimeout(function() {
            $("#histcontainer_row").hide()
        }, 1000)


        $("#specie_before").click(function() {

            if (_SCROLL_INDEX == 0)
                return;

            _SCROLL_INDEX = _SCROLL_INDEX - 1;

            // console.log(_SCROLL_SECTIONS[_SCROLL_INDEX])

            $('html, body').animate({
                scrollTop: $("#" + _SCROLL_SECTIONS[_SCROLL_INDEX]).offset().top - 40
            }, 1000);



        });


        $('.ct-sliderPop-close').on('click', function() {
            $('.sliderPop').hide();
            $('.ct-sliderPop-container').removeClass('open');
            $('.sliderPop').removeClass('flexslider');
            $('.sliderPop .ct-sliderPop-container').removeClass('slides');
        });


        $("#reload_map").click(function() {

            _VERBOSE ? console.log("reload_map") : _VERBOSE;

            var region = _REGION_SELECTED;

            var groupDatasetTotal = _componente_target.getGroupDatasetTotal()

            console.log(groupDatasetTotal)

            if (groupDatasetTotal.length == 0) {
                console.log("No species selected");
                _module_toast.showToast_BottomCenter(_iTrans.prop('msg_noespecies_selected'), "warning");
                return;
            }

            _taxones = [];

            $.each(groupDatasetTotal, function(index_i, grupo) {

                console.log(grupo);

                $.each(grupo.elements, function(index_j, sp_grupo) {


                    var array_sp = sp_grupo.label.split(">>");

                    var temp_item = {};

                    temp_item["taxon_rank"] = map_taxon.get(array_sp[0].trim().toLowerCase());
                    temp_item["value"] = array_sp[1].trim();
                    temp_item["title"] = grupo.title;
                    temp_item["nivel"] = parseInt(sp_grupo.level); //0:root, 1:reino, etc...
                    _taxones.push(temp_item);
                })

            })

            console.log(_taxones);

            var val_process = $("#chkValidation").is(':checked');
            var val_process_temp = $("#pred_des_control").is(':checked');

            var grid_res = $("#grid_resolution").val();
            var footprint_region = parseInt($("#footprint_region_select").val());

            // _map_module_nicho.loadD3GridMX(val_process, grid_res, footprint_region, _taxones);

            _map_module_nicho.busca_especie_grupo(_taxones, footprint_region, val_process, grid_res);


        });


        $("#show_gen").click(function(e) {

            _VERBOSE ? console.log("show_gen") : _VERBOSE;

            var subgroups = _componente_fuente.getVarSelArray();
            var subgroups_target = _componente_target.getVarSelArray();

            var data_link = {};

            data_link.tipo = "nicho"

            // data_link.taxones = _taxones;
            data_link.sfilters = subgroups_target;

            data_link.val_process = $("#chkValidation").is(":checked");
            data_link.val_process_temp = $("#pred_des_control").is(":checked");
            data_link.idtabla = data_link.val_process === true ? _res_display_module_nicho.getValidationTable() : "no_table";
            data_link.mapa_prob = $("#chkMapaProb").is(":checked");
            data_link.fossil = $("#chkFosil").is(":checked");
            data_link.apriori = $("#chkApriori").is(':checked');

            data_link.lim_inf = $("#date_timepicker_start").val()

            data_link.lim_inf_valtemp = $("#date_timepicker_start_val").val()



            data_link.min_occ = $("#chkMinOcc").is(':checked') === true ? parseInt($("#occ_number").val()) : 0;

            // Se comenta para cambio a covid19
            // data_link.grid_res = parseInt($("#grid_resolution").val());
            data_link.grid_res = $("#grid_resolution").val();
            data_link.footprint_region = $("#footprint_region_select").val();

            data_link.discardedFilterids = _map_module_nicho.get_discardedPoints().values().map(function(value) {
                return value.feature.properties.gridid
            });
            // console.log(data_link.discardedFilterids);

            data_link.tfilters = subgroups;

            console.log(data_link);
            _getLinkToken(data_link);

        });


        $("#accept_link").click(function() {

            $("#modalRegenera").modal("hide");
            document.execCommand("copy");
            console.log('se copia url con toker');
        });


        $('#modalRegenera').on('shown.bs.modal', function(e) {

            $('#modalRegenera input[type="text"]')[0].select();

        });



        $("#area_search")
            .autocomplete({
                source: function(request, response) {

                    console.log("source")

                    _REGION_SELECTED = ($("#footprint_region_select").val() !== null && $("#footprint_region_select").val() !== undefined) ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
                    _GRID_RES = $("#grid_resolution").val();

                    console.log("REGION_SELECTED: " + _REGION_SELECTED);
                    console.log("_GRID_RES: " + _GRID_RES);
                    console.log("Term: " + request.term);

                    $.ajax({
                        url: _url_api + "/niche/especie/getStateMunList",
                        dataType: "json",
                        type: "post",
                        data: {
                            searchStr: request.term,
                            footprint_region: _REGION_SELECTED,
                            grid_res: _GRID_RES
                        },
                        success: function(resp) {

                            response($.map(resp.data, function(item) {

                                _VERBOSE ? console.log(item) : _VERBOSE;
                                var value = _GRID_RES == "mun" ? item.entidad + " " + item.municipio : item.entidad

                                return {
                                    label: value,
                                    id: item.gridid
                                };

                            }));
                        }

                    });

                },
                minLength: 2,
                change: function(event, ui) {
                    // console.log("change")
                },
                select: function(event, ui) {
                    console.log(ui.item);
                    console.log(ui.item.id);
                    // console.log(parseInt(ui.id));

                    _map_module_nicho.updateStateMunLayer()
                    _map_module_nicho.colorizeFeaturesSelectedStateMun([parseInt(ui.item.id)])
                }

            })




        _genLinkURL();
    }


    function _regenMessage() {

        if ($("#reload_map").hasClass("btn-primary") && _map_module_nicho.get_specieTarget()) {

            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_values'), "warning");
            $("#reload_map").addClass('btn-success').removeClass('btn-primary');
            // _cleanTutorialButtons();

        }

    }

    function _cleanTutorialButtons() {

        // $("#specie_next").hide("slow");
        // $("#params_next").hide("slow");
        // $("#map_next").hide("slow");
        // $("#hist_next").hide("slow");

    }

    /**
     * Realiza el envio de los parámetros seleccionados de un análisis de nicho para generar un token de recuperación.
     *
     * @function _getLinkToken
     * @private
     * @memberof! module_nicho
     *
     * @param {String} data_link - Cadena que contiene los parametros selecicoandos por el usuario en el análisis.
     *
     */
    function _getLinkToken(data_link) {

        console.log("_getLinkToken");
        console.log(data_link)

        $.ajax({
            url: _url_api + "/niche/especie/getToken",
            type: 'post',
            data: data_link,
            dataType: "json",
            success: function(resp) {

                var cadena_ini = _url_nicho + '#link/?';
                var tokenlink = resp.data[0].token;

                console.log("token: " + tokenlink);

                $("#modalRegenera").modal();
                $("#lb_enlace").val(cadena_ini + "token=" + tokenlink);

            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });

    }


    /**
     * Consulta los parámetros utilizados en el análisis del token contenido en la URL y despliega la configuración en la UI.
     *
     * @function _getValuesFromToken
     * @private
     * @memberof! module_nicho
     *
     * @param {String} token - token relacionado a un conjunto de paramétros utilizados en un análisis de nicho.
     *
     */
    function _getValuesFromToken(token) {

        console.log("_getValuesFromToken");
        console.log("token: " + token);


        $.ajax({
            url: _url_api + "/niche/especie/getValuesFromToken",
            type: 'post',
            data: {
                token: token,
                tipo: 'nicho'
            },
            dataType: "json",
            success: function(resp) {

                console.log(resp);


                if (resp.data.length === 0) {
                    _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_link'), "error");
                    return
                }

                var all_data = resp.data[0].parametros;
                _json_config = _parseURL("?" + all_data);

                // var sp_data = JSON.parse(_json_config.sp_data);

                var chkVal = _json_config.chkVal ? _json_config.chkVal === "true" : false;

                var chkVal = _json_config.chkVal ? _json_config.chkVal === "true" : false;

                var chkValTemp = _json_config.chkValTemp ? _json_config.chkValTemp === "true" : false;

                var chkPrb = _json_config.chkPrb ? _json_config.chkPrb === "true" : false;

                var chkFosil = _json_config.chkFosil ? _json_config.chkFosil === "true" : false;

                var chkApr = _json_config.chkApr ? _json_config.chkApr === "true" : false;

                var chkFec = _json_config.chkFec ? _json_config.chkFec === "true" : false;

                var chkOcc = _json_config.chkOcc ? parseInt(_json_config.chkOcc) : undefined;

                var minFec = _json_config.minFec ? _json_config.minFec : undefined;

                var maxFec = _json_config.maxFec ? _json_config.maxFec : undefined;

                var minFecVal = _json_config.minFecVal ? _json_config.minFecVal : undefined;

                var maxFecVal = _json_config.maxFecVal ? _json_config.maxFecVal : undefined;



                // var gridRes = _json_config.gridRes ? parseInt(_json_config.gridRes) : 16;
                var gridRes = _json_config.gridRes ? _json_config.gridRes : "state";

                console.log("gridRes: " + gridRes);

                var region = _json_config.region ? parseInt(_json_config.region) : 1;

                // var rango_fechas = minFec != undefined && maxFec != undefined ? [minFec, maxFec] : undefined;

                // recover deleted items
                var num_dpoints = parseInt(_json_config.num_dpoints);
                var map_dPoints = d3.map([]);
                for (i = 0; i < num_dpoints; i++) {
                    var item = JSON.parse(_json_config["deleteditem[" + i + "]"]);
                    map_dPoints.set(item.feature.properties.gridid, item);
                }
                console.log(map_dPoints.values());

                var num_sfilters = parseInt(_json_config.num_sfilters);
                var sfilters = [];
                for (i = 0; i < num_sfilters; i++) {
                    var item = _json_config["sfilters[" + i + "]"];
                    sfilters.push(JSON.parse(_json_config["sfilters[" + i + "]"]));
                }


                var num_filters = parseInt(_json_config.num_filters);
                var filters = [];
                for (i = 0; i < num_filters; i++) {
                    var item = _json_config["tfilters[" + i + "]"];
                    filters.push(JSON.parse(_json_config["tfilters[" + i + "]"]));
                }

                // _procesaValoresEnlace(sfilters, filters, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas, chkFosil, gridRes, region, map_dPoints, chkValTemp);
                _procesaValoresEnlace(sfilters, filters, chkVal, chkPrb, chkApr, chkFec, chkOcc, minFec, maxFec, minFecVal, maxFecVal, chkFosil, gridRes, region, map_dPoints, chkValTemp);
                $("#show_gen").css('visibility', 'hidden');



            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });


    }


    /**
     * Parsea una URL a un JSON.
     *
     * @function _parseURL
     * @private
     * @memberof! module_nicho
     *
     * @param {string} url - URL en formato cadena para ser parseado.
     *
     */
    function _parseURL(url) {
        //        console.log(url);

        var regex = /[?&]([^=#]+)=([^&#]*)/g,
            url = url,
            params = {},
            match;
        while (match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        return params;
    }


    /**
     * Procesa la URL insertada en el explorador para iniciar el proceso de parseo y obtención de parámetros.
     *
     * @function _genLinkURL
     * @private
     * @memberof! module_nicho
     *
     */
    function _genLinkURL() {

        _VERBOSE ? console.log("_genLinkURL") : _VERBOSE;
        if (_json_config == undefined) {
            return;
        }

        var token = _json_config.token;
        _getValuesFromToken(token);

    }



    //    No utilizado
    function getQuerystring2(path, key, default_) {

        _VERBOSE ? console.log("getQuerystring2") : _VERBOSE;

        if (default_ == null) {
            default_ = "";
        }

        var search = unescape(path);

        if (search == "") {
            return default_;
        }

        search = search.substr(1);
        var params = search.split("&");

        for (var i = 0; i < params.length; i++) {

            var pairs = params[i].split("=");
            if (pairs[0] == key) {
                return pairs[1];
            }

        }

        return default_;
    }



    /**
     * Asigna los valores obtenidos de la URL y configura los componentes visuales para regenerar los resultados.
     *
     * @function _procesaValoresEnlace
     * @private
     * @memberof! module_nicho
     *
     * @param {json} sp_data - JSON con la información de la especie objetivo
     * @param {json} subgroups - JSON  con el grupo de variables seleccionado
     * @param {boleano} chkVal - Bandera si esta activado el proceso de validación
     * @param {boleano} chkPrb - Bandera si esta activado el mapa de probabilidad
     * @param {boleano} chkApr - Bandera si esta activado el cálculo con a priori
     * @param {boleano} chkFec - Bandera si esta activado el cálculo con registros sin fecha
     * @param {integer} chkOcc - Número mínimo de ocurrencias en nj para ser considerado en los cálculos
     * @param {array} rango_fechas - Rango de fecha para realizar los cálculos
     * @param {integer} gridRes - Resolución de la malla para ser considerado en los cálculos
     */
    // function _procesaValoresEnlace(subgroups_target, subgroups, chkVal, chkPrb, chkApr, chkFec, chkOcc, rango_fechas, chkFosil, gridRes, region, map_dPoints, chkValTemp) {
    function _procesaValoresEnlace(subgroups_target, subgroups, chkVal, chkPrb, chkApr, chkFec, chkOcc, minFec, maxFec, minFecVal, maxFecVal, chkFosil, gridRes, region, map_dPoints, chkValTemp) {

        _VERBOSE ? console.log("_procesaValoresEnlace") : _VERBOSE;

        console.log("Region : " + region);
        var idreg = ["Estados"]; // Módulo por desarrollar

        if (chkFec) {
            $("#chkFecha").prop('checked', true);
            $("#lb_sfecha").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkFecha").prop('checked', false);
            $("#lb_sfecha").text(_iTrans.prop('lb_no'));
        }

        if (chkVal) {
            $("#chkValidation").prop('checked', true);
            $("#labelValidation").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkValidation").prop('checked', false);
            $("#labelValidation").text(_iTrans.prop('lb_no'));
        }

        if (chkValTemp) {
            $("#pred_des_control").prop('checked', true);
            $("#labelValidationTemp").text(_iTrans.prop('lb_si'));
        } else {
            $("#pred_des_control").prop('checked', false);
            $("#labelValidationTemp").text(_iTrans.prop('lb_no'));
        }

        if (chkPrb) {
            $("#chkMapaProb").prop('checked', true);
            $("#lb_mapa_prob").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkMapaProb").prop('checked', false);
            $("#lb_mapa_prob").text(_iTrans.prop('lb_no'));
        }


        if (chkFosil) {
            $("#chkFosil").prop('checked', true);
            $("#labelFosil").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkFosil").prop('checked', false);
            $("#labelFosil").text(_iTrans.prop('lb_no'));
        }

        if (chkApr) {
            $("#chkApriori").prop('checked', true);
            $("#lb_do_apriori").text(_iTrans.prop('lb_si'));
        } else {
            $("#chkApriori").prop('checked', false);
            $("#lb_do_apriori").text(_iTrans.prop('lb_no'));
        }

        if (chkOcc) {
            $("#chkMinOcc").prop('checked', true);
            $("#occ_number").prop("disabled", false);
            $("#occ_number").val(chkOcc);

        } else {
            $("#chkMinOcc").prop('checked', false);
            $("#occ_number").prop("disabled", true);
            $("#occ_number").val(chkOcc);
        }


        $("#date_timepicker_start").val(minFec);

        $("#date_timepicker_start_val").val(minFecVal);


        $('#grid_resolution option[value=' + gridRes + ']').attr('selected', 'selected');

        $('#footprint_region_select option[value=' + region + ']').attr('selected', 'selected');

        console.log(subgroups_target)
        console.log(subgroups)

        _componente_target.setVarSelArray(subgroups_target);

        _taxones = [];

        $.each(subgroups_target, function(index_i, grupo) {

            console.log(grupo);

            $.each(grupo.value, function(index_j, sp_grupo) {

                var array_sp = sp_grupo.label.split(">>");

                var temp_item = {};

                temp_item["taxon_rank"] = map_taxon.get(array_sp[0].trim().toLowerCase());
                temp_item["value"] = array_sp[1].trim();
                temp_item["title"] = grupo.title;
                temp_item["nivel"] = parseInt(sp_grupo.level); //0:root, 1:reino, etc...
                _taxones.push(temp_item);

            })

        })

        console.log(_taxones)
        console.log(gridRes)

        _map_module_nicho.loadD3GridMX(chkVal, gridRes, region, _taxones);

        _componente_fuente.addUIItem(subgroups.slice());

        _res_display_module_nicho.set_idReg(idreg);

        _componente_fuente.setVarSelArray(subgroups);

        _componente_target.addUIItem(subgroups_target.slice());

        _res_display_module_nicho.set_subGroups(subgroups);


        if (subgroups.length == 0) {
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "warning");
        } else {
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_gen_link'), "info");
        }


    }


    // se ejecutan los modulos necesarios para iniciar el proceso de obteción de epsilon y score y visualización de tablas, histogramas y mapa
    $("#get_esc_ep").click(function() {

        _VERBOSE ? console.log("get_esc_ep") : _VERBOSE;
        var num_items = 0,
            spid, idreg, subgroups, sp_target;

        // $("#specie_next").css('visibility', 'hidden');

        $("#show_gen").css('visibility', 'visible');
        $("#btn_tuto_steps_result").css('visibility', 'visible');

        // _cleanTutorialButtons();


        if (_taxones.length === 0) {
            // no se ha seleccionado especie objetivo
            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_especie'), "error");
            return;
        }

        // spid = _map_module_nicho.get_specieTarget().spid;

        // _VERBOSE ? console.log(spid) : _VERBOSE;

        // agregar validación para estados
        idreg = _region_module_nicho.getRegionSelected();

        _res_display_module_nicho.set_idReg(idreg);



        subgroups = _componente_fuente.getVarSelArray();

        // sp_target_group = _componente_target.getTaxones();

        // console.log(sp_target_group)

        _res_display_module_nicho.set_taxones(_taxones);



        var type_time = _componente_fuente.getTimeBioclim();

        _res_display_module_nicho.set_subGroups(subgroups);

        _res_display_module_nicho.set_typeBioclim(type_time);


        if (subgroups.length > 0) {

            // // asegura que si el grupo de variables seleccionado tiene mas de un grupo taxonomico agregue el total
            // subgroups.forEach(function (grupo) {

            //     if (grupo.value.length > 1) {
            //         grupo.value.forEach(function (item) {
            //             num_items++;
            //         });
            //     }

            // });

            // // asegura que si existe mas de un grupo de variables, se calcule el total  de todos los grupos
            // if (subgroups.length > 1) {
            //     num_items++;
            // }

        } else {

            $("#show_gen").css('visibility', 'hidden');
            $("#btn_tuto_steps_result").css('visibility', 'hidden');
            $("#tuto_res").css('visibility', 'hidden');
            // $("#params_next").css('visibility', 'hidden');

            // _cleanTutorialButtons();

            _module_toast.showToast_BottomCenter(_iTrans.prop('lb_error_variable'), "error");
            return;
        }



        if (idreg[0] === "Estados" || idreg[0] === "Ecoregiones") {


            console.log(_map_module_nicho.get_discardedPoints());

            _res_display_module_nicho.set_discardedPoints(_map_module_nicho.get_discardedPoints());
            _res_display_module_nicho.set_discardedCellFilter(_map_module_nicho.get_discardedCellFilter());
            _res_display_module_nicho.set_allowedCells(_map_module_nicho.get_allowedCells());


            var val_process = $("#chkValidation").is(':checked');
            var val_process_temp = $("#pred_des_control").is(':checked');
            var min_occ = $("#chkMinOcc").is(':checked');
            var mapa_prob = $("#chkMapaProb").is(':checked');
            var grid_res = $("#grid_resolution").val();
            var footprint_region = parseInt($("#footprint_region_select").val());
            let todayDate = new Date();
            let todayDateToNextThirtyDays = String(todayDate.getFullYear() + "-" + (Number((todayDate.getMonth() + 1)) < 10 ? "0" + (todayDate.getMonth() + 1) : (todayDate.getMonth() + 1)) + "-" + (Number(todayDate.getDate()) < 10 ? "0" + todayDate.getDate() : todayDate.getDate()));

            console.log("grid_res: " + grid_res);
            console.log("footprint_region: " + footprint_region);

            var fossil = $("#chkFosil").is(':checked');

            var state_model = $("#pred_des_control")[0].checked;

            if (state_model) {
                var liminf_initial = $("#date_timepicker_start_val").val();

            } else {
                var liminf_initial = $("#date_timepicker_start").val();
            }
            if (liminf_initial == todayDateToNextThirtyDays) {
                var todayDatePlusThirtyDays = new Date(todayDate.setDate(todayDate.getDate() + 30))
                let parsedTodayDatePlusThirtyDays = String(todayDatePlusThirtyDays.getFullYear() + "-" + (Number((todayDatePlusThirtyDays.getMonth() + 1)) < 10 ? "0" + (todayDatePlusThirtyDays.getMonth() + 1) : (todayDatePlusThirtyDays.getMonth() + 1)) + "-" + (Number(todayDatePlusThirtyDays.getDate()) < 10 ? "0" + todayDatePlusThirtyDays.getDate() : todayDatePlusThirtyDays.getDate()));
                var liminf = todayDateToNextThirtyDays;
                var limsup = parsedTodayDatePlusThirtyDays;

            } else {
                var liminf_splited = liminf_initial.split("-");
                var month = liminf_splited[1]
                var endMonthDay = "";
                switch (month) {
                    case "01":
                        endMonthDay = "31";
                        break;
                    case "02":
                        endMonthDay = "28";
                        break;
                    case "03":
                        endMonthDay = "31";
                        break;
                    case "05":
                        endMonthDay = "31";
                        break;
                    case "07":
                        endMonthDay = "31";
                        break;
                    case "08":
                        endMonthDay = "31";
                        break;
                    case "10":
                        endMonthDay = "31";
                        break;
                    case "12":
                        endMonthDay = "31";
                        break;

                    default:
                        endMonthDay = "30";

                        break;
                }


                var liminf_splited = liminf_initial.split("-");
                var liminf = liminf_splited[0] + "-" + liminf_splited[1] + "-01";
                var limsup = liminf_splited[0] + "-" + liminf_splited[1] + "-" + endMonthDay;
                console.log("liminf: " + liminf)
                console.log("limsup: " + limsup)
            }

            var rango_fechas = []
            if (liminf == "" || limsup == "") {
                rango_fechas = undefined;
            } else {
                rango_fechas.push(liminf)
                rango_fechas.push(limsup)
            }

            // var rango_fechas = $("#sliderFecha").slider("values");
            // if (rango_fechas[0] == $("#sliderFecha").slider("option", "min") && rango_fechas[1] == $("#sliderFecha").slider("option", "max")) {
            //     rango_fechas = undefined;
            // }

            var chkFecha = $("#chkFecha").is(':checked');

            //            slider_value = val_process ? $("#sliderValidation").slider("value") : 0;
            var slider_value = val_process ? true : false;




            // Falta agregar la condición makesense.
            // Cuando se realiza una consulta por region seleccioanda se verica que la especie objetivo se encuentre dentro de esta area
            _res_display_module_nicho.refreshData(num_items, val_process, slider_value, min_occ, mapa_prob, rango_fechas, chkFecha, fossil, grid_res, footprint_region, val_process_temp);

        }


    });


    /**
     * Inicializa las variables globales del modulo nicho e inicializa el modulo de internacionalización.
     *
     * @function startModule
     * @public
     * @memberof! module_nicho
     *
     * @param {string} tipo_modulo - Identificador del módulo 0 para nicho y 1 para comunidad
     * @param {string} verbose - Bandera para desplegar modo verbose
     */
    function startModule(verbose) {

        _VERBOSE = verbose;
        _VERBOSE ? console.log("startModule") : _VERBOSE;


        _VERBOSE ? console.log("before language_module NICHO") : _VERBOSE;
        // Se cargan los archivos de idiomas y depsues son cargados los modulos subsecuentes
        _language_module_nicho = language_module(_VERBOSE);
        _language_module_nicho.startLanguageModule(this, _tipo_modulo);

    }


    /**
     * Método llamado después de que el módulo de internacionalización es configurado correctamente. Se inicializa el controlador y los módulos de mapa, tabla, histograma, región y variable.
     *
     * @function loadModules
     * @public
     * @memberof! module_nicho
     *
     */
    function loadModules() {

        _VERBOSE ? console.log("loadModules") : _VERBOSE;

        _module_toast = toast_module(_VERBOSE);
        _module_toast.startToast();


        _iTrans = _language_module_nicho.getI18();

        _histogram_module_nicho = histogram_module(_VERBOSE);
        _histogram_module_nicho.setLanguageModule(_language_module_nicho);
        _histogram_module_nicho.startHistogramModule();


        _map_module_nicho = map_module(_url_geoserver, _workspace, _VERBOSE, _url_api);
        _map_module_nicho.startMap(_language_module_nicho, _tipo_modulo, _histogram_module_nicho);

        _table_module = table_module(_VERBOSE);
        _table_module.startTableModule();


        _language_module_nicho.setTableModule(_table_module)


        _res_display_module_nicho = res_display_module(_VERBOSE, _url_api);

        _map_module_nicho.setDisplayModule(_res_display_module_nicho);

        _histogram_module_nicho.setDisplayModule(_res_display_module_nicho);



        // un id es enviado para diferenciar el componente del grupo de variables en caso de que sea mas de uno (caso comunidad)
        _variable_module_nicho = variable_module(_VERBOSE, _url_api);
        _variable_module_nicho.startVar(0, _language_module_nicho, _tipo_modulo, _map_module_nicho);


        var ids_comp_variables = ['fuente', 'target'];
        _componente_fuente = _variable_module_nicho.createSelectorComponent("variables", ids_comp_variables[0], "lb_panel_variables");

        // _componente_target = _variable_module_nicho.createSelectorComponent("var_target", ids_comp_variables[1], "", false, true, true, 4);
        _componente_target = _variable_module_nicho.createSelectorComponent("var_target", ids_comp_variables[1], "", false, true, true);

        // enlazando los modulos que tienen interacción en los procesos
        _res_display_module_nicho.startResDisplay(_map_module_nicho, _histogram_module_nicho, _table_module, _language_module_nicho, ids_comp_variables);




        // se envia url con direccion a servidor zacatuche
        _region_module_nicho = region_module(_url_api, _VERBOSE);
        _region_module_nicho.startRegion(_map_module_nicho, _language_module_nicho);

        _language_module_nicho.addModuleForLanguage(_res_display_module_nicho, _histogram_module_nicho, _map_module_nicho, _variable_module_nicho);

        _initializeComponents();

    }


    /**
     * Método setter para la variable que almacena la URL del servidor.
     *
     * @function setUrlApi
     * @public
     * @memberof! module_nicho
     *
     * @param {string} url_api - URL del servidor
     */
    function setUrlApi(url_api) {
        _url_api = url_api
    }

    /**
     * Método setter para la variable que almacena la URL del cliente.
     *
     * @function setUrlFront
     * @public
     * @memberof! module_nicho
     *
     * @param {string} url_front - URL del cliente
     */
    function setUrlFront(url_front) {
        _url_front = url_front
    }

    /**
     * Método setter para la variable que almacena la URL de nicho ecológico.
     *
     * @function setUrlNicho
     * @public
     * @memberof! module_nicho
     *
     * @param {string} url_nicho - URL del cliente en nicho ecológico
     */
    function setUrlNicho(url_nicho) {
        _url_nicho = url_nicho;
    }

    // retorna solamente un objeto con los miembros que son públicos.
    return {
        startModule: startModule,
        loadModules: loadModules,
        setUrlApi: setUrlApi,
        setUrlFront: setUrlFront,
        setUrlNicho: setUrlNicho
    };


})();


$(document).ready(function() {

    console.log(config.url_front)
    console.log(config.url_api)
    console.log(config.url_nicho)
    console.log(config.url_comunidad)

    // localStorage.setItem("url_front", config.url_front);
    // localStorage.setItem("url_api", config.url_api);
    // localStorage.setItem("url_nicho", config.url_nicho);
    // localStorage.setItem("url_comunidad", config.url_comunidad);
    // localStorage.setItem("verbose", _VERBOSE);

    module_nicho.setUrlFront(config.url_front);
    module_nicho.setUrlApi(config.url_api);
    module_nicho.setUrlNicho(config.url_nicho);
    module_nicho.startModule(config.verbose);

});
function hiddingLoadingNodesInJsTree() {
  let getAllNodes = $('#demograficos').jstree(true).get_json('#', { flat: true });
  let loadingNodes = getAllNodes.filter(node=> node.text == "cargando...")
  loadingNodes.map(node => {
    $("#"+ node.id).css("position", "absolute");
    $("#"+ node.id).css("visibility", "hidden");
  })
}
