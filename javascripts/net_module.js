
/**
 * Módulo red, utilizado crear y gestionar la red que es generada del resultado del analísis de comunidad ecológica.
 *
 * @namespace net_module
 */
var net_module = (function(verbose, url_zacatuche, map_module_net, utils_module) {

    var _url_zacatuche = url_zacatuche;

    var _map_module_net = map_module_net;

    var _utils_module = utils_module


    var _VERBOSE = verbose;
    var _UMBRAL = 0.2;

    var _toastr = toastr;
    var iTrans;
    var _language_module_net;

    var _linkedByIndex = {};
    var _color = d3.scale.category10();
    var _highlight_color = "#B4FC00"; //"red"; //"#48D7D5";
    var _highlight_linked_color = "#04C4FE"; //"red"; //"#48D7D5";
    var _map_conected = d3.map([]);
    var _legend_groups = [];
    
    var _nodes_selected;
    var _nodes;
    var _REGION_SELECTED = 1



    /**
     * Método setter del módulo de internacionalización.
     *
     * @function setLanguageModule
     * @public
     * @memberof! net_module
     * 
     * @param {object} languageModule - Módulo de internacionalización
     */
    function setLanguageModule(languageModule) {
        _language_module_net = languageModule;
        _iTrans = _language_module_net.getI18();
    }

    function setUtilsModulo(languageModule) {
        _language_module_net = languageModule;
        _iTrans = _language_module_net.getI18();
    }


    /**
     * Método setter de las las leyendas de los grupos de variables.
     *
     * @function setLegendGroup
     * @public
     * @memberof! net_module
     * 
     * @param {array} legend_groups - Array con las leyendas de los grupos de variables seleccioandos en el analísis de comunidad ecológica.
     */
    function setLegendGroup(legend_groups) {
        _legend_groups = legend_groups;
    }


    /**
     * Éste método inicializa variables y componentes que son necesarios para la creación de la red y asigna a una variable global una instancia del módulo de lenguaje.
     *
     * @function _netConfigure
     * @private
     * @memberof! net_module
     * 
     * @param {object} languageModule - Módulo de internacionalización
     * @param {type} s_filters - Array con los grupos de variables source utlizados en el analísis de comunidad ecológica.
     * @param {type} t_filters - Array con los grupos de variables target utlizados en el analísis de comunidad ecológica.
     */
    function _netConfigure(language_module, s_filters, t_filters) {

        _VERBOSE ? console.log("_netConfigure") : _VERBOSE;

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


        //TODO: ajustar a nueva estructura
        $("#send_email").click(function(e) {

            // _VERBOSE ? console.log($("#email_address")) : _VERBOSE;
            _VERBOSE ? console.log($("#email_address")[0].validity["valid"]) : _VERBOSE;

            if ($("#email_address")[0].validity["valid"]) {

                email = $("#email_address").val();

                milliseconds = new Date().getTime();

                // d3.json(_url_trabajo + "t=" + milliseconds)
                d3.json(_url_zacatuche + "t=" + milliseconds)
                        .header("Content-Type", "application/json")
                        .post(
                                JSON.stringify({
                                    qtype: "getEdges",
                                    download: true,
                                    mail: email,
                                    s_tfilters: s_filters,
                                    t_tfilters: t_filters,
                                    ep_th: 0.0
                                }),
                                function(error, d) {
                                    $('#modalMail').modal('hide');

                                    if (error) {
                                        _VERBOSE ? console.log(error) : _VERBOSE;
                                        toastr.error("Error al enviar el archivo");
                                        throw error;
                                    }

                                    // _VERBOSE ? console.log(d) : _VERBOSE;
                                    _toastr.success("Archivo enviado por correo electrónico");
                                });


            }
            else {
                alert("Correo invalido")
            }

        });

        _language_module_net = language_module;
        _iTrans = _language_module_net.getI18();

    }




    /**
     * Éste método genera una instancia de la red.
     *
     * @function createNet
     * @public
     * @memberof! net_module
     * 
     * @param {json} json - Json que contiene los nodos y los enlaces resultado del análisis de communidad ecológica
     * @param {object} display_obj - Referencia al controlador de comunidad ecológica
     */
    function createNet(json, display_obj) {

        _VERBOSE ? console.log("createNet") : _VERBOSE;

        console.log(json);

        // si se desa agregar mas de una red añadir aqui
        var graph_array = [
            EpsilonGraph(json, display_obj).group(display_obj.group_eps_spname)
        ];

        var graph_component = d3.selectAll(".graph")
                .data(graph_array)
                .each(function(graph) {
                    // _VERBOSE ? console.log(display_obj.renderAll) : _VERBOSE;
                    graph.on("brushend", display_obj.renderAll);
                });

        return graph_component;


    }




    /**
     * Clase que genera instancias de tipo red así como interacción con el módulo de histograma y el modulo de tabla a través del controlador de comunidad ecológica.
     *
     * @function EpsilonGraph
     * @public
     * @memberof! net_module
     * 
     * @param {json} json - Json que contiene los nodos y los enlaces resultado del análisis de communidad ecológica
     * @param {object} display_obj - Referencia al controlador de comunidad ecológica
     */
    function EpsilonGraph(json, display_obj) {

        _VERBOSE ? console.log("EpsilonGraph") : _VERBOSE;
        _VERBOSE ? console.log(display_obj) : _VERBOSE;

        $("#graph").empty();
        $("#graph_controls").empty();

        // var focus_node = null, highlight_node = null;
        // var highlight_trans = 0.1;
        var margin = {top: 5, right: 20, bottom: 30, left: 20};
        // var width = $("#hist").width() - margin.left - margin.right;
        // var height = $("#hist").height() - margin.top - margin.bottom;

        var max_eps = d3.max(json.links, function(d) {
            return d.value;
        });
        var min_eps = d3.min(json.links, function(d) {
            return d.value;
        });
        var link_color = d3.scale.quantize().domain([-max_eps, max_eps]).range(colorbrewer.RdGy[11]);
        var shiftKey, ctrlKey;
        // var tip;
        // var svg_g;


        if (!EpsilonGraph.id) {
            EpsilonGraph.id = 0;
        }



        var id = EpsilonGraph.id++,
                brusher = d3.svg.brush(),
                // xScale = d3.scale.linear().domain([0,width]).range([0,width]),
                // yScale = d3.scale.linear().domain([0,height]).range([0, height]),
                dimension, group, round;


        var width = $("#graph").width(),
                height = $("#graph").height(); //height = graphHeight;


        var nodeGraph = json;
        var xScale = d3.scale.linear().domain([0, width]).range([0, width]);
        var yScale = d3.scale.linear().domain([0, height]).range([0, height]);






        var force = d3.layout.force()
                .size(100, 100)
                .charge(-100) // default: -30, carga del nodo, negativos es repulsion, positivos atraccion, 0 desactiva algoritmo
                .linkStrength(0.1)
                // .gravity(0.05) // default: 0.1, concentra lso puntos en el centro al aumentar su valor, 0 elimina la gravedad hacia le centro del layout
                .linkDistance(width / 5)
                // .chargeDistance(500) // asigna el maximo valor de carga
                // .linkStrength(function(d){
                // 	return rango_eps(d.value);
                // }) // establece la rigidez de los enlaces, rango: [0 - 1]
                // .friction(0.5)
                .size([width, height]);



        /*********************** adding the node toolptip to the graph container */
        // Define the div for the tooltip
        var div_tip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);



        /*********************** main container  */

        var svg_g = d3.select("#graph")
                .attr("tabindex", 1)
                // .attr("class", "brush_container")
                .on("keydown.brush", keydown)
                .on("keyup.brush", keyup)
                // .each(function() { this.focus(); })
                .append("svg")
                .attr("id", "svg_container")
                .attr("class", "svg_container")
                .attr("width", "100%")
                .attr("height", "100%")
        // .on("click",function(){
        //     console.log("click svg");
        //     d3.selectAll("g.node").selectAll("circle").attr("stroke","white");  
        //     d3.selectAll("g.node").selectAll("circle").attr("stroke-width",1);  
        // })


        // TODO: Verificar el ajsute en altura del mensaje de selección
        svg_g.append("text")
                .attr("x", 100)
                .attr("y", $("#graph").height() - margin.bottom - 45)
                .append('svg:tspan')
                .attr("id", "info_text_net")
                .attr("x", "4%")                
                .text(_iTrans.prop('lb_info_net'));
        
        svg_g.append("text")
                .attr("x", 100)
                .attr("y", $("#graph").height() - margin.bottom - 25)                
                .append('svg:tspan')
                .attr("id", "info_text_slider")
                .attr("x", "8%")
                .text(_iTrans.prop('lb_info_slider'));
                                
        svg_g.append("text")
                .attr("x", 100)
                .attr("y", $("#graph").height() - 10)
                .append('svg:tspan')
                .attr("id", "lb_info_slider_left")
                .attr("x", 10)
                .text(_iTrans.prop('lb_info_slider_left'));
        
        svg_g.append("text")
                .attr("x", 100)
                .attr("y", $("#graph").height() - 10)                
                .append('svg:tspan')
                .attr("id", "lb_info_slider_right")
                .attr("x", "29%")
                .text(_iTrans.prop('lb_info_slider_right'));
                
        d3.select("#graph")
                .append("div")
                .attr("id", "slider_charge")
                .attr("class", "slider_charge")




        $(function() {
            $("#slider_charge").slider({
                min: -200,
                max: 5,
                step: 1,
                value: -100,
                change: function(event, ui) {
                    _VERBOSE ? console.log(ui.value) : _VERBOSE;
                    force
                            .charge(ui.value)
                            .start();
                }
            });
        });

        $("#slider_charge .ui-slider-handle").text("ATR").width(30).height(20);


        // var legend_div  =  d3.select("#graph")
        //                         .append("div")
        //                         .attr("id", "legend_div")
        //                         .attr("class", "legend_div")


        //  var legend_svg = legend_div.append("svg")
        //                             .attr("id", "legend_svg")
        //                             .attr("class", "legend_svg");
        //                             // .attr("width", "100%")
        //                             // .attr("height", "100%");


        var legend = svg_g.selectAll(".legend")
                .data(_legend_groups)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(0," + 10 + ")";
                });

        legend.append("rect")
                .attr("x", function(d, i) {
                    return (width - 50) - (i * 120);
                })
                .attr("y", 3)
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", function(d, i) {
                    return _color(d.idgrp);
                })
                .style("opacity", 0.7);


        legend.append("text")
                .attr("x", function(d, i) {
                    return (width - 56) - (i * 120);
                })
                .attr("y", 15)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) {
                    if (d.side == 0) {
                        return "Src: " + d.label;
                    }
                    else {
                        return "Trg: " + d.label;
                    }

                });






        /*********************** zoomer  */


        var zoomer = d3.behavior.zoom().
                // scaleExtent([0.5, 2]).
                x(xScale).
                y(yScale).
                on("zoomstart", zoomstart).
                on("zoom", redraw);



        /* funciones zoomer  */

        // var redraw_done = false;


        function zoomstart() {

            _VERBOSE ? console.log("zoomstart") : _VERBOSE;

            // if(!redraw_done){
            d3.selectAll("g.node").selectAll("circle").attr("stroke", "white");
            d3.selectAll("g.node").selectAll("circle").attr("stroke-width", 1);
            // redraw_done  = false;
            // }


            node.each(function(d) {
                d.selected = false;
                d.previouslySelected = false;
            });
            node.classed("selected", false);

        }

        function redraw() {

            _VERBOSE ? console.log("redraw") : _VERBOSE;
            // redraw_done = true;

            vis.attr("transform",
                    "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");

        }

        var svg_graph = svg_g.append('svg:g')
                .attr("class", "zoomer_svg")
                .call(zoomer);
        // .call(brusher)



        /*********************** brusher  */

        var spids_node_selected = [];

        brusher
                .x(xScale)
                .y(yScale);


        /******************* contenedor secundario para sleccion de red */

        var brush = svg_graph.append("g")
                .datum(function() {
                    // _VERBOSE ? console.log("datum") : _VERBOSE;
                    return {selected: false, previouslySelected: false};
                })
                .attr("class", "brush");


        brush.call(brusher)
                .on("mousedown.brush", null)
                .on("touchstart.brush", null)
                .on("touchmove.brush", null)
                .on("touchend.brush", null);

        brush.select('.background').style('cursor', 'auto');



        /******************* contenedor secundario para nodos y enlaces */


        var vis = svg_graph.append("svg:g");

        vis.attr("id", "vis")
                .attr('fill', 'red')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('opacity', 1)
                .attr('id', 'vis');


        /******************* contenedor de enlaces */

        var link_group = vis.append("g")
                .attr("class", "link")
                .selectAll("line");

        /*** los enlaces se generan dinamicamente en la selección */

        /******************* contenedor de nodos */

        var node_group = vis.append("g")
                .attr("class", "node")
                .selectAll("circle");

        /*** funcionamiento de nodos */


        var node = node_group.data(json.nodes)
                .enter().append("circle")
                .attr("class", "node_item")
                .attr("r", function(d) {
                    return 5 + Math.pow(d.occ / Math.PI, 0.5);
                })
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                })
                .style("fill", function(d) {

                    return _color(d.group);

                })
                .on('mouseover', function(d) {

                    d3.select(this).attr("r", function(d) {
                        return 10 + Math.pow(d.occ / Math.PI, 0.5);
                    });

                    div_tip.transition()
                            .duration(200)
                            .style("opacity", .9);

                    var name_sp = ""

                    if(d.biotic){
                        name_sp = d.generovalido + " " + d.especieepiteto
                    }
                    else{
                        // console.log(d)

                        var label = d.label.replace(/[^a-zA-Z0-9]/g, "").replace(/ /g,'')

                        var range = d.tag.split(":")
                        var inf = parseFloat(range[0]).toFixed(2) * parseFloat(d.coeficiente)
                        var sup = parseFloat(range[1]).toFixed(2) * parseFloat(d.coeficiente)

                        name_sp = _iTrans.prop(label) + " " + inf + " " + d.unidad + " : " + sup + " " + d.unidad
                    }

                    div_tip.html(
                            "<strong>" + _iTrans.prop('lb_variable_name') + ":</strong> <span >" + name_sp + "</span><br/><br/>" +
                            "<strong>" + _iTrans.prop('lb_occ') + ":</strong> <span >" + d.occ + "</span>"
                            )
                            .style("left", (d3.event.pageX + 20) + "px")
                            .style("top", (d3.event.pageY - 38) + "px");

                })
                .on('mouseout', function(d) {

                    d3.select(this).attr("r", function(d) {
                        return 5 + Math.pow(d.occ / Math.PI, 0.5);
                    });

                    div_tip.transition()
                            .duration(500)
                            .style("opacity", 0);

                })
                .on("dblclick", function(d) {
                    d3.event.stopPropagation();
                    d.fixed = !d.fixed;
                })
                .on("click", function(d) {

                    _VERBOSE ? console.log("click") : _VERBOSE;

                    if (d3.event.defaultPrevented)
                        return;

                    // _VERBOSE ? console.log("Manda petición especie") : _VERBOSE;
                    species_selected = {"id": d.spid, "label": d.label}

                    _nodes_selected = [d];
                    _nodes = json.nodes;
                    loadGridComunidad();



                    if (!shiftKey) {
                        node.classed("selected", function(p) {
                            return p.selected = p.previouslySelected = false;
                        })
                    }

                    d3.select(this).classed("selected", d.selected = !d.previouslySelected);

                })
                .call(d3.behavior.drag()
                        .on("dragstart", dragstarted)
                        .on("drag", dragged)
                        .on("dragend", dragended));


        // asigna una posicion inicial en diagonal a los nodos, para que sea contante el numero de pasos para reacomodar la red
        //      	var n = json.nodes.length;
        // json.nodes.forEach(function(d, i) {
        //   d.x = d.y = width / n * i;
        // });



        /**********************************************/


        function dragstarted(d) {

            _VERBOSE ? console.log("dragstarted") : _VERBOSE;

            d3.event.sourceEvent.stopPropagation();

            if (!d.selected && !shiftKey) {
                // if this node isn't selected, then we have to unselect every other node
                node.classed("selected", function(p) {
                    return p.selected = p.previouslySelected = false;
                });
            }

            d3.select(this).classed("selected", function(p) {
                d.previouslySelected = d.selected;
                return d.selected = true;
            });

            node.filter(function(d) {
                return d.selected;
            })
                    .each(function(d) {
                        d.fixed |= 2;
                    })

            // a[0] |= b -> a[0] = a[0] | b
        }

        function dragged(d) {
            // _VERBOSE ? console.log("dragged") : _VERBOSE;

            node.filter(function(d) {
                return d.selected;
            })
                    .each(function(d) {
                        d.x += d3.event.dx;
                        d.y += d3.event.dy;

                        d.px += d3.event.dx;
                        d.py += d3.event.dy;
                    })

            force.resume();
        }


        function dragended(d) {

            _VERBOSE ? console.log("dragended") : _VERBOSE;

            //d3.select(self).classed("dragging", false);
            node.filter(function(d) {
                return d.selected;
            })
                    .each(function(d) {
                        d.fixed = true;
                    })
            // ~2 == -(2 + 1) == -3

        }


        function keydown() {

            shiftKey = d3.event.shiftKey || d3.event.metaKey;
            ctrlKey = d3.event.ctrlKey;

            _VERBOSE ? console.log('keydown') : _VERBOSE;

            if (d3.event.keyCode == 67) {   //the 'c' key
                _center_view();
            }

            if (shiftKey) {

                _VERBOSE ? console.log('shiftKey') : _VERBOSE;

                svg_graph.call(zoomer)
                        .on("mousedown.zoom", null)
                        .on("touchstart.zoom", null)
                        .on("touchmove.zoom", null)
                        .on("touchend.zoom", null);

                //svg_graph.on('zoom', null);                                                                     
                vis.selectAll('g.gnode')
                        .on('mousedown.drag', null);

                brush.select('.background').style('cursor', 'crosshair')
                brush.call(brusher);

            }

        }

        function keyup() {

            _VERBOSE ? console.log("keyup") : _VERBOSE;

            shiftKey = d3.event.shiftKey || d3.event.metaKey;
            ctrlKey = d3.event.ctrlKey;

            brush.call(brusher)
                    .on("mousedown.brush", null)
                    .on("touchstart.brush", null)
                    .on("touchmove.brush", null)
                    .on("touchend.brush", null);

            brush.select('.background').style('cursor', 'auto')
            svg_graph.call(zoomer);

            // _VERBOSE ? console.log("keyup2") : _VERBOSE;
        }

        /***************** controles */


        // Generación fuera de panel
        d3.select("#graph_controls")
                .append("div")
                .attr("id", "play-stop-button-holder")
                .attr("class", "div_btn stop_forces")
                .append("button")
                .attr("class", "btn btn-primary glyphicon glyphicon-stop")
                .attr("id", "pararRed")
                .attr("type", "button")
                .attr("title", _iTrans.prop('lb_detener_net'))
                .on("click", _stop_nodes);


        d3.select("#graph_controls")
                .append("div")
                .attr("id", "center_view_holder")
                .attr("class", "div_btn center")
                .append("button")
                .attr("class", "btn btn-primary glyphicon glyphicon-record")
                .attr("id", "center_view_btn")
                .attr("type", "button")
                .attr("title", _iTrans.prop('lb_centrar_net'))
                .on("click", _center_view);

        d3.select("#graph_controls")
                .append("div")
                .attr("id", "div_search_holder")
                .attr("class", "div_btn search_input")
                .append("input")
                .attr("class", "form-control")
                .attr("id", "input_text_search")
                .attr("type", "text")
                .attr("placeholder", _iTrans.prop('lb_buscar_sp'))
                .on("input", _search_node);


        d3.select("#graph_controls")
                .append("div")
                .attr("id", "div_export_holder")
                .attr("class", "div_btn export_btn")
                .append("button")
                .attr("class", "btn btn-primary glyphicon glyphicon-download-alt")
                .attr("id", "export_btn")
                .attr("type", "button")
                .attr("title", _iTrans.prop('lb_exportar_net'))
                .on("click", _export_graph);


        // ******* extración de código para que la red no sea regenerada, solo filtrada
        // evento llamado por render ****
        function graph(div) {

            _VERBOSE ? console.log("graph") : _VERBOSE;

            div.each(function() {

                _VERBOSE ? console.log("graph div.each") : _VERBOSE;

                /*********************** init variables, and force object */

                // console.log(display_obj.dim_node_state.top(Infinity));

                var epsilonBySource = display_obj.nestByR.entries(display_obj.dim_node_state.top(Infinity));
                var json_temp = []
                var indexVisibleNodes = []
                var nodes_related = d3.map([]);

                epsilonBySource.sort(_compare_desc)

                console.log(epsilonBySource);
                console.log("epsilonBySource: " + epsilonBySource.length);


                _linkedByIndex = {};

                var max_link = display_obj.max_num_link
                var link_counter = 0

                console.log("net_module max_link: " + max_link)
                console.log("net_module first_load: " + display_obj.hist_load)

                // console.log(epsilonBySource)



                epsilonBySource.forEach(function(bean, i) {

                    bean.values.forEach(function(val) {

                        if (Math.abs(val.value) > display_obj.ep_th) {

                            link_counter++
                            // console.log("link_counter: " + link_counter)

                            if(display_obj.hist_load || link_counter <= max_link){

                                // console.log("ADD element")
                                // display_obj.first_load = false

                                json_temp.push({"source": val.source, "target": val.target, "value": val.value});
                                nodes_related.set(val.source, parseInt(val.source));
                                nodes_related.set(val.target, parseInt(val.target));

                                _linkedByIndex[val.source + "," + val.target] = true;



                            }       


                        }



                    });

                });

                _VERBOSE ? console.log("json_temp: " + json_temp.length) : _VERBOSE;

                // obtiene el limite minimo del conjunto obtenido, para descartar lso valores seleccionados
                display_obj.net_limit_eps = d3.min(json_temp.map(function(d) {return parseFloat(d.value) }));
                // display_obj.net_max_eps = d3.max(json_temp.map(function(d) {return parseFloat(d.value) }));

                _VERBOSE ? console.log("net_limit_eps: " + display_obj.net_limit_eps) : _VERBOSE;
                // _VERBOSE ? console.log("net_max_eps: " + display_obj.net_max_eps) : _VERBOSE;


                // TODO: Enlazar al histograma para que se depsliegue el brush cuando hace la primera carga
                // if(display_obj.chart != null)
                //     display_obj.chart.drawBrush(min_eps, max_eps)
                                
                
                                


                _VERBOSE ? console.log(nodes_related.keys()) : _VERBOSE;

                for (var val in nodes_related.values()) {
                    indexVisibleNodes.push(val);
                }

                _VERBOSE ? console.log(indexVisibleNodes) : _VERBOSE;
                _VERBOSE ? console.log(epsilonBySource) : _VERBOSE;
                _VERBOSE ? console.log(json_temp) : _VERBOSE;
                // _VERBOSE ? console.log(d3.selectAll("g.node").selectAll("circle")) : _VERBOSE;


                d3.selectAll("g.node").selectAll("circle")
                        .each(function(d) {

                            d3.select(this).style("visibility", function(d) {

                                if (nodes_related.has((d.index).toString())) {
                                    d.visible = true;
                                    return "visible";
                                }
                                else {
                                    d.visible = false;
                                    return "hidden";
                                }
                            });

                        }
                        );


                $("line.link").remove();
                link = link_group.data(json_temp)
                        .enter().append("line")
                        .attr("class", "link")
                        .style("stroke-width", 5)
                        .style("stroke", function(d) {
                            return link_color(d.value);
                        })
                        .style("opacity", 1);


                // _VERBOSE ? console.log(force) : _VERBOSE;

                force
                        .nodes(json.nodes)
                        .links(json_temp)
                        .start();

                force.on("tick", function() {
                    link.attr("x1", function(d) {
                        return d.source.x;
                    })
                            .attr("y1", function(d) {
                                return d.source.y;
                            })
                            .attr("x2", function(d) {
                                return d.target.x;
                            })
                            .attr("y2", function(d) {
                                return d.target.y;
                            });

                    // node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                    node.attr('cx', function(d) {
                        return d.x;
                    }).attr('cy', function(d) {
                        return d.y;
                    });
                });

                for (var i = 0; i < json.nodes.length; ++i)
                    force.tick();

                force.resume();



                brusher
                        .on("brushstart", function(d) {

                            _VERBOSE ? console.log("brushstart") : _VERBOSE;
                            node.each(function(d) {
                                d.previouslySelected = shiftKey && d.selected;
                            });

                        })
                        .on("brush", function(e) {

                            _VERBOSE ? console.log("brush") : _VERBOSE;

                            indexNodes = [];
                            var extent = d3.event.target.extent();
                            index_selected_visible = [];

                            node.classed("selected", function(d) {

                                inside = extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]
                                indexNodes.push(d.previouslySelected ^ inside)
                                return d.selected = d.previouslySelected ^ inside;

                            });

                            // _VERBOSE ? console.log(indexNodes) : _VERBOSE;
                            // _VERBOSE ? console.log(indexNodes.length) : _VERBOSE;
                            // _VERBOSE ? console.log(nodes_related.keys()) : _VERBOSE;
                            // _VERBOSE ? console.log(nodes_related.keys().length) : _VERBOSE;


                            indexNodes.forEach(function(d, i) {
                                if (nodes_related.has(i.toString())) {
                                    if (nodes_related.get(i.toString()) && d == 1) {
                                        // _VERBOSE ? console.log(i) : _VERBOSE;
                                        // _VERBOSE ? console.log(d) : _VERBOSE;
                                        index_selected_visible.push(i);
                                    }
                                }
                            });
                            // _VERBOSE ? console.log(nodes_selected) : _VERBOSE;
                            // _VERBOSE ? console.log(index_selected_visible) : _VERBOSE;

                            spids_node_selected = [];
                            $.each(index_selected_visible, function(index, value) {
                                // spids_node_selected.push(json.nodes[value].spid);
                                spids_node_selected.push(json.nodes[value]);
                            });

                        })
                        .on("brushend", function(e) {

                            _VERBOSE ? console.log("brushend...") : _VERBOSE;
                            // _VERBOSE ? console.log(spids_node_selected) : _VERBOSE;

                            // if(spids_node_selected.length > 0)
                            _nodes_selected = spids_node_selected;
                            _nodes = json.nodes;
                            loadGridComunidad();

                            d3.event.target.clear();
                            d3.select(this).call(d3.event.target);

                        });

                // asigna el foco al zoomer
                brush.call(brusher)
                        .on("mousedown.brush", null)
                        .on("touchstart.brush", null)
                        .on("touchmove.brush", null)
                        .on("touchend.brush", null);

                brush.select('.background').style('cursor', 'auto')
                svg_graph.call(zoomer);


                // center_view();
                // force.stop();
                // _stop_nodes();



            });


        }


        // Activa el algoritmo de fuerzas entre los nodos que componen la red.
        function _start_nodes() {

            d3.selectAll("g.node").selectAll("circle")
                    .each(
                            function(d) {
                                d.fixed = false;
                            }
                    );
            force.start();

            d3.select("#iniciarRed")
                    .remove();

            d3.select("#play-stop-button-holder")
                    .append("button")
                    .attr("class", "btn btn-primary glyphicon glyphicon-stop")
                    .attr("id", "pararRed")
                    .attr("type", "button")
                    .attr("title", "Detener red")
                    .on("click", _stop_nodes);
        }

        // Detiene el algoritmo de fuerzas entre los nodos que componen la red.
        function _stop_nodes() {

            force.stop();

            d3.selectAll("g.node").selectAll("circle")
                    .each(
                            function(d) {
                                d.fixed = true;
                            }
                    );

            d3.select("#pararRed")
                    .remove();

            d3.select("#play-stop-button-holder")
                    .append("button")
                    .attr("class", "btn btn-primary glyphicon glyphicon-play")
                    .attr("id", "iniciarRed")
                    .attr("type", "button")
                    .attr("title", "Reiniciar red")
                    .on("click", _start_nodes);
        }




        // Resalta los nodos que coinciden con el nombre de la cadena introducida.
        function _search_node(d) {

            console.log(d)

            _clean_highlight();

            search_str = $("#input_text_search").val();

            if (search_str.length <= 2) {

                d3.selectAll("g.node").selectAll("circle")
                        .each(function(item) {

                            d3.select(this).attr("stroke", "white");
                            d3.select(this).attr("class", "no_path");
                            d3.select(this).style("stroke-dasharray", "none");

                            d3.select(this).attr("r", function(d) {
                                return 5 + Math.pow(d.occ / Math.PI, 0.5);
                            });
                            d3.select(this).style("stroke-width", 1);

                        });
                return;
            }


            // _map_conected = d3.map([]);                    
            // var nodes_selected = [];

            d3.selectAll("g.node").selectAll("circle")
                    .each(function(item) {

                        // console.log(item)

                        var label = item.biotic ? item.generovalido + " " + item.especieepiteto : _iTrans.prop("a_item_" + item.layer) + " (" + parseFloat(item.tag.split(":")[0]).toFixed(2) + " : " + parseFloat(item.tag.split(":")[1]).toFixed(2) + ")"

                        if (label.toLowerCase().startsWith(search_str.toLowerCase())) {

                            // _VERBOSE ? console.log(item.label + " " + item.index) : _VERBOSE;
                            // _VERBOSE ? console.log(highlight_color) : _VERBOSE;

                            // nodes_selected.push(item);

                            d3.select(this).attr("class", "path");

                            d3.select(this).attr("stroke", function() {
                                return _highlight_color;
                            });

                            d3.select(this).style("stroke-width", 4);
                            // d3.select(this).style("outline", 4);
                            d3.select(this).style("stroke-dasharray", ("200"));
                            d3.select(this).style("stroke-linecap", "round");

                            d3.select(this).attr("r", function(d) {
                                return 10 + Math.pow(d.occ / Math.PI, 0.5);
                            });
                        }
                        else {

                            d3.select(this).attr("stroke", "white");
                            d3.select(this).attr("class", "nopath");
                            // d3.select(this).style("stroke-dasharray", "none");

                            d3.select(this).attr("r", function(d) {
                                return 5 + Math.pow(d.occ / Math.PI, 0.5);
                            });
                            d3.select(this).style("stroke-width", 1);
                        }

                    });


            // $.each(nodes_selected, function(index, value_a){
            //     set_highlight(value_a);
            // });


        }

        // Despliega el control para descargar la red.
        function _export_graph() {

            _VERBOSE ? console.log("export_graph") : _VERBOSE;
            
            //TODO: Verficar por que en chrome no detecta el cambio
            $("#lb_modal_red").text(_iTrans.prop('lb_modal_red'));
            $("#lb_des_modal_red").text(_iTrans.prop('lb_des_modal_red'));
            $("#red_download").text(_iTrans.prop('red_download'));
            $("#cancel_red_csv").text(_iTrans.prop('cancel_red_csv'));
            
            $('#modalMail').modal('show');

        }

        // TODO: enlazar con la red que se genra de forma dinámica....
        function _center_view() {

            _VERBOSE ? console.log("_center_view") : _VERBOSE;

            if (nodeGraph === null)
                return;

            var nodes = nodeGraph.nodes;

            //no molecules, nothing to do
            if (nodes.length === 0)
                return;

            // Get the bounding box
            min_x = d3.min(nodes.map(function(d) {
                return d.x;
            }));
            min_y = d3.min(nodes.map(function(d) {
                return d.y;
            }));

            max_x = d3.max(nodes.map(function(d) {
                return d.x;
            }));
            max_y = d3.max(nodes.map(function(d) {
                return d.y;
            }));


            // The width and the height of the graph
            mol_width = max_x - min_x;
            mol_height = max_y - min_y;

            // how much larger the drawing area is than the width and the height
            width_ratio = width / mol_width;
            height_ratio = height / mol_height;

            // we need to fit it in both directions, so we scale according to
            // the direction in which we need to shrink the most
            min_ratio = Math.min(width_ratio, height_ratio) * 0.8;

            // the new dimensions of the molecule
            new_mol_width = mol_width * min_ratio;
            new_mol_height = mol_height * min_ratio;

            // translate so that it's in the center of the window
            x_trans = -(min_x) * min_ratio + (width - new_mol_width) / 2;
            y_trans = -(min_y) * min_ratio + (height - new_mol_height) / 2;


            // do the actual moving
            vis.attr("transform",
                    "translate(" + [x_trans, y_trans] + ")" + " scale(" + min_ratio + ")");


            // tell the zoomer what we did so that next we zoom, it uses the
            // transformation we entered here
            zoomer.translate([x_trans, y_trans]);
            zoomer.scale(min_ratio);

        }



        graph.dimension = function(_) {

            // _VERBOSE ? console.log("graph.dimension") : _VERBOSE;
            // _VERBOSE ? console.log(_) : _VERBOSE;

            if (!arguments.length)
                return dimension;

            dimension = _;
            return graph;
        };

        graph.group = function(_) {

            // _VERBOSE ? console.log("graph.group") : _VERBOSE;
            // _VERBOSE ? console.log(_) : _VERBOSE;

            if (!arguments.length)
                return group;

            group = _;
            return graph;
        };

        return d3.rebind(graph, brusher, "on");

    }


    /**
     * Éste método verifica si dos nodos se encuentran conectados a través del cálculo épsilon.
     *
     * @function _isConnected
     * @private
     * @memberof! net_module
     * 
     * @param {object} a - Nodo source
     * @param {object} b - Nodo target
     */
    function _isConnected(a, b) {
        return _linkedByIndex[a.index + "," + b.index] || _linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    /**
     * Éste método verifica si nu nodo tiene vecinos a través del cálculo épsilon.
     *
     * @function hasConnections
     * @private
     * @memberof! net_module
     * 
     * @param {object} a - Nodo source
     */
    function hasConnections(a) {
        for (var property in _linkedByIndex) {
            s = property.split(",");
            if ((s[0] == a.index || s[1] == a.index) && _linkedByIndex[property])
                return true;
        }
        return false;
    }


    /**
     * Éste método borra los componentes visuales e iniciliza parámetros para generar un nuevo análisis de comunidad ecológica.
     *
     * @function _clean_search
     * @private
     * @memberof! net_module
     * 
     */
    function _clean_search() {

        console.log("_clean_search");

        $("#input_text_search").val("");

        d3.selectAll("g.node").selectAll("circle")
                .each(function(item) {

                    d3.select(this).attr("stroke", "white");
                    d3.select(this).attr("class", "no_path");
                    d3.select(this).style("stroke-dasharray", "none");

                    d3.select(this).attr("r", function(d) {
                        return 5 + Math.pow(d.occ / Math.PI, 0.5);
                    });
                    d3.select(this).style("stroke-width", 1);

                });

    }



    /**
     * Éste método limpia los nodos que fueron resaltados al verificar los vecinos de un nodo.
     *
     * @function _clean_highlight
     * @private
     * @memberof! net_module
     * 
     */
    function _clean_highlight() {

        console.log("_clean_highlight");
        _map_conected = d3.map([]);
        d3.selectAll("g.node").selectAll("circle").attr("stroke", "white");
        d3.selectAll("g.node").selectAll("circle").style("stroke-width", 1);

    }


    /**
     * Éste método resalta los nodos vecinos de un nodo source.
     *
     * @function _set_highlight
     * @private
     * @memberof! net_module
     * 
     * @param {object} d - nodo source
     */
    function _set_highlight(d) {

        console.log("_set_highlight")

        // console.log(d)        

        d3.selectAll("g.node").selectAll("circle").attr("stroke", function(o) {

            // console.log(o)

            if ((_isConnected(d, o) && d.id != o.id) || _map_conected.has(o.id)) {


                _map_conected.set(o.id, true);
                return _highlight_linked_color;
            }
            else {
                return "white";
            }

        });

        d3.selectAll("g.node").selectAll("circle").style("stroke-width", function(o) {

            if ((_isConnected(d, o) && d.id != o.id) || _map_conected.has(o.id)) {

                // console.log("4");

                _map_conected.set(o.id, true);
                return 4;
            }
            else {
                return 1;
            }
        });

        // link.style("stroke", function(o) {
        //           return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);

    }
    
    function loadGridComunidad(){

        _VERBOSE ? console.log("loadGridComunidad") : _VERBOSE;
        
        // Actualemnte no existe proceso de validacion en comunidad
        var val_process = false;
        // Actualemnte no existe cambio de resolución en comunidad
        var grid_res = $("#grid_resolution").val();
        var footprint_region = _REGION_SELECTED //parseInt($("#footprint_region_select").val());
        
        _map_module_net.busca_especie_grupo([], footprint_region, val_process, grid_res, "redes");

        // function busca_especie_grupo(taxones, region = 1, val_process = false, grid_res = 16) {

    }




    /**
     * Éste método muestra las ocurrencias por celda del conjunto seleccionado en el mapa resultado del análisis de comunidad.
     *
     * @function showSpecieOcc
     * @public
     * @memberof! net_module
     * 
     */
    function showSpecieOcc() {

        _VERBOSE ? console.log("showSpecieOcc") : _VERBOSE;

        var nodes = [];
        var footprint_region = _REGION_SELECTED // parseInt($("#footprint_region_select").val());
        var grid_res = $("#grid_resolution").val();


        // console.log(_nodes_selected)

        $.each(_nodes_selected, function(index, value) {
            
            var node = {}

            node.biotic = value.biotic
            node.merge_vars = []

            var temp_var = {}
            
            if(value.biotic){
                temp_var.rank = "species"
                temp_var.value = value.generovalido + " " + value.especieepiteto    
            }
            else{
                temp_var.rank = "bid"
                temp_var.value = value.bid
            }
            node.merge_vars.push(temp_var)

            nodes.push(node);
        })

        // console.log(nodes)

        _map_conected = d3.map([]);
        _clean_search();

        $.each(_nodes_selected, function(index, value_a) {
            _set_highlight(value_a);
        });

        var sdata = {
            "nodes": nodes,
            "region": footprint_region,
            "grid_res": grid_res
        };

        console.log(sdata)
        
        $('#map').loading({
            stoppable: true
        });

        $.ajax({
            // url: _url_zacatuche + "/niche/especie/getCountGridid",
            url: _url_zacatuche + "/niche/especie/getGroupCountGridid",
            type: 'post',
            data: sdata,
            success: function(resp) {

                $('#map').loading('stop');
                // json = JSON.parse(json_file);

                var json = resp.data;
                _VERBOSE ? console.log(json) : _VERBOSE;

                var arg_gridid = [];
                var arg_count = [];

                $.each(json, function(index, item) {
                    arg_gridid.push(item.gridid);
                    arg_count.push(parseInt(item.conteo));
                });

                var max_eps = d3.max(arg_count);
                var min_eps = d3.min(arg_count);
                _VERBOSE ? console.log(max_eps) : _VERBOSE;
                _VERBOSE ? console.log(min_eps) : _VERBOSE;

                var link_color;

                if (max_eps === min_eps) {
                    link_color = d3.scale.quantize().domain([0, max_eps]).range(colorbrewer.YlOrRd[9]);
                }
                else {
                    link_color = d3.scale.quantize().domain([min_eps, max_eps]).range(colorbrewer.YlOrRd[9]);
                }

                _VERBOSE ? console.log(link_color(min_eps)) : _VERBOSE;
                _VERBOSE ? console.log(link_color(max_eps)) : _VERBOSE;



                // var dom = link_color.domain();
                // var l = (dom[1] - dom[0])/link_color.range().length;
                // var breaks = d3.range(0, link_color.range().length).map(function(i) { return i * l; });

                _map_module_net.colorizeFeaturesNet(arg_gridid, arg_count, link_color);

            },
            error: function(jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error configureStyleMap: " + textStatus) : _VERBOSE;
                // deleteStyle();
                $('#map').loading('stop');
            }

        });

    }
    
    
    
    function getGridNet2Export(nodes, links){
        
        _VERBOSE ? console.log("getGridNet2Export") : _VERBOSE;
        
        var date = new Date();
        var sufijo = "_Exp_"+date.getFullYear()+"_"+date.getMonth()+"_"+date.getDay()+"_"+date.getHours()+":"+date.getMinutes();
        $("#red_download").attr("download","net" + sufijo + ".csv");
        
//        nodes tienen index
//        enlaces tienen source & target & epsilon
        
        console.log(nodes);
        console.log(links);

        var grid_net_2export = "";
        
        for (var i = 0; i < links.length; i++) {
            
            var item = links[i];


            if(parseFloat(item.value)>=_UMBRAL || parseFloat(item.value)<=-_UMBRAL){


                
                // grid_net_2export += nodes[item.source].label + ","
                // grid_net_2export += nodes[item.target].label + ","
                grid_net_2export += nodes[item.source].generovalido + " " + nodes[item.source].especieepiteto + ","
                grid_net_2export += nodes[item.target].generovalido + " " + nodes[item.target].especieepiteto + ","
                grid_net_2export += parseFloat(item.value) 
                grid_net_2export += "\r\n"
                
            }

        }
        
//        console.log(grid_net_2export);
        return grid_net_2export;
        
        
        
    }


    function _compare(a, b) {
        if (parseFloat(a.key) < parseFloat(b.key))
            return -1;
        if (parseFloat(a.key) > parseFloat(b.key))
            return 1;
        return 0;
    }

    function _compare_desc(a, b) {

        // _VERBOSE ? console.log("_compare_desc") : _VERBOSE;

        if (parseFloat(a.key) > parseFloat(b.key))
            return -1;
        if (parseFloat(a.key) < parseFloat(b.key))
            return 1;
        return 0;
    }



    /**
     * Éste método realiza el llamado a la función que inicializa variables y componentes que son necesarios para la creación de la red.
     *
     * @function startNet
     * @public
     * @memberof! net_module
     * 
     * @param {object} languageModule - Módulo de internacionalización
     * @param {type} s_filters - Array con los grupos de variables source utlizados en el analísis de comunidad ecológica.
     * @param {type} t_filters - Array con los grupos de variables target utlizados en el analísis de comunidad ecológica.
     */
    function startNet(language_module, s_filters, t_filters) {

        _VERBOSE ? console.log("startNet") : _VERBOSE;

        _netConfigure(language_module, s_filters, t_filters);
    }

    return{
        startNet: startNet,
        createNet: createNet,
        setLanguageModule: setLanguageModule,
        setLegendGroup: setLegendGroup,
        showSpecieOcc: showSpecieOcc,
        getGridNet2Export: getGridNet2Export
    }

});


