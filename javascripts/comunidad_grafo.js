

// console.log(graphHeight);
// console.log(histHeight);
// var main_json;
// var svg_g;
var highlight_color = "#48D7D5";
var color = d3.scale.category10();
var force;
var indexVisibleNodes = [];
var ep_th = 0.2;
var allowedPoints;
var species_selected;
var geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#4F9F37",
    color: "#488336",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6
};
var customOptions ={
  'maxWidth': '500',
  'className' : 'custom'
}
var ID_STYLE_GENERATED = 0;
var tbl_decil = false;


var list;
var chart;
var graph;
var graphs;
var charts;

// este metodo debe ir en el modulo display de comunidad

function renderAll() {
    console.log("renderAll"); 
    graph.each(render);
    chart.each(render);
    list.each(render);
}

function render(method) {
    console.log("render");
    console.log(method);
    console.log(this);
  d3.select(this).call(method);

}

var toastr;

toastr.options = {
  "debug": false,
  "positionClass": "toast-bottom-left",
  "onclick": null,
  "fadeIn": 300,
  "fadeOut": 1000,
  "timeOut": 3000,
  "extendedTimeOut": 1000
}

var histHeight, group_eps_spname, group_eps_freq;

var nestByR = d3.nest()
            .key(function(d) { 
                return d.value });


function viewCreation(json){

    console.log("viewGeneration");

    var margin = {top: 5, right: 20, bottom: 30, left: 20};
    var width = ($("#hist").width()) - margin.left - margin.right;
    var height = histHeight - margin.top - margin.bottom;
    
    graphs = [
        epsilonGraph(json)
            // .dimension(dim_node_state)
            .group(group_eps_spname)
    ];


    // var x = d3.scale.linear()
    //     .domain([min_eps,max_eps])
    //     .rangeRound([margin.left, width - margin.left]);

    var x = d3.scale.ordinal()
      .rangeRoundBands([margin.left, width - margin.left], .1);

    // var cambio = d3.scale.quantile().domain([1,20]).range(final_array);

    charts = [
        barChart()
            // .dimension(dim_node_state)
            .group(group_eps_freq)
          .x(x)
    ];
    

    chart = d3.selectAll(".chart")
        .data(charts)
        .each(function(chart) {
            // console.log("each Chart"); 
            chart
                // .on("brush", renderAll)
                .on("brushend", renderAll); 
        });

    

    graph = d3.selectAll(".graph")
        .data(graphs)
        .each(function(graph) { 
            // console.log("each graph"); 
            graph
                // .on("brush", renderAll)
                .on("brushend", renderAll);
        });



    list = d3.selectAll(".list")
      .data([epsilonList]);

    

    // function renderAll() {

    //     console.log("renderAll"); 

    //     list.each(render);
    //     chart.each(render);
    //     graph.each(render);
    // }

    renderAll();

    /********************************************************************************************/




    /********************************************************************************************/

    function epsilonList(div) {

        console.log("epsilonList");

        var epsilonByGender = nestByR.entries(dim_eps_freq.top(Infinity));
        temp = [];

        epsilonByGender.forEach(function(bean, i) { 
            if( Math.abs( parseFloat( bean.values[0].value ) ) > ep_th ){
                temp.push(bean);
            }
        });
        epsilonByGender = temp;
        
        // console.log(epsilonByGender);


        div.each(function() {

            console.log("div each epsilonList");

            data_list = [];
            
            epsilonByGender.forEach(function(d){
                
                // item = d.values[0];
                d.values.forEach(function(val){

                    item_list = [];
                    item_list.push(json.nodes[val.source].label);
                    item_list.push(json.nodes[val.target].label);
                    item_list.push(val.value);
                    data_list.push(item_list)

                });
                
            })

            // console.log(data_list);

              if(tbl_decil != false){
                
                $('#relation-list').dataTable().fnClearTable();

                if(data_list.length == 0)
                    return;

                $('#relation-list').dataTable().fnAddData(data_list);
              }
              else{

                $('#relation-list').DataTable( {
                    "info" : false,
                    "bSort" : true,
                    "aoColumnDefs" : [{
                        "bSortable" : false,
                        "aTargets" : []
                      }],
                    "bFilter" : false,
                    "bLengthChange" : false,
                    "bPaginate" : true, // Pagination True
                    "processing" : true, // Pagination True
                    "pagingType" : 'simple_numbers',
                    data: data_list,
                    columns: [
                        { title: "Fuente" },
                        { title: "Sumidero" },
                        { title: "Epsilon" }
                    ]
                } );

              }

              tbl_decil = true;

            // var key_elements = d3.select(this).selectAll(".element")
            //     .data(epsilonByGender, function(d) { return d.key; });
            // // console.log(key_elements);

            // key_elements.enter().append("div")
            //     .attr("class", "element")
            //     .append("div")
            //     .attr("class", "order")
            //     .text(function(d) { return d.value });

            // //select similar elements an delete them in order to not have duplicates
            // key_elements.exit().remove();
            // // console.log(key_elements);

            // var eps_relations = key_elements.order().selectAll(".relation")
            //     .data( 
            //         // the first function parameter select the values from the (key value) dimension object, 
            //         // the second function select one elemt from the values object 
            //         function(d) { 
            //             // console.log(d)
            //             return d.values; }, 
            //         function(d) { 
            //             // console.log(d)
            //             return d; 
            //         });
            // // console.log(eps_relations)

            // var paramterRelationEnter = eps_relations.enter().append("div")
            //     .attr("class", "relation");

          
            // paramterRelationEnter.append("div")
            //   .attr("class", "origin")
            //   .text(function(d) { 
            //     // console.log(d)
            //     // console.log(json.nodes[d.source.index].label)
            //     return json.nodes[d.source].label; });
            //   // .text(function(d) { return json.nodes[d.source.index].label; });

            // paramterRelationEnter.append("div")
            //   .attr("class", "origin")
            //   .text(function(d) { 
            //     // console.log(json.nodes[d.target].label)
            //     return json.nodes[d.target].label; });

            // paramterRelationEnter.append("div")
            //   .attr("class", "origin")
            //   .text(function(d) { return d.value; });
          

            // eps_relations.exit().remove();
            // eps_relations.order();


        });
    }

    /********************************************************************************************/

}


var linkedByIndex = {};

function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
}


/********************************************************************************************/

function epsilonGraph(json) {

    console.log("epsilonGraph");

    var node, link_color, link;

    var focus_node = null, highlight_node = null;
    var highlight_trans = 0.1;


    var margin = {top: 5, right: 20, bottom: 30, left: 20};
    var width = ($("#hist").width()) - margin.left - margin.right;
    var height = histHeight - margin.top - margin.bottom;
    

    if (!epsilonGraph.id) {
        epsilonGraph.id = 0;
    }

    var id = epsilonGraph.id++, 
        brusher = d3.svg.brush(),
        xScale = d3.scale.linear().domain([0,width]).range([0,width]),
        yScale = d3.scale.linear().domain([0,height]).range([0, height]),
        dimension, group, round;


    
    

    function set_highlight(d){

        // console.log("set_highlight")

        // svg.style("cursor","pointer");

        if (focus_node !== null) 
            d = focus_node;

        highlight_node = d;

        if (highlight_color != "white"){

                node.style("stroke", function(o) {
                    return isConnected(d, o) ? highlight_color : "white";
                });

                link.style("stroke", function(o) {
                    return o.source.index == d.index || o.target.index == d.index ? highlight_color : link_color(o.value);
                });
        }
        // else{
        //     node.style("stroke", "white");
        //     link.style("stroke", function(o) {
        //         return link_color(o.value);
        //     });
        // }



    }


    function exit_highlight(){

        console.log("exit_highlight");
        
        highlight_node = null;
        
        if (focus_node === null){

            // svg.style("cursor","move");
            
            if (highlight_color!="white"){
                node.style("stroke", "white");

                link.style("stroke", function(o) {
                    return link_color(o.value);
                });
            }

        }
    }
    

    function graph(div) {

        // console.log("length: " + json.links.length)
        // console.log(json.links)
        console.log("graph");
        // d3.event.sourceEvent.stopPropagation();
        
        $("#graph").empty();

        // console.log(dim_node_state);
        // console.log(dim_node_state.top(10));

        var epsilonBySource = nestByR.entries(dim_node_state.top(Infinity));

        // console.log(dim_node_state.top(Infinity));
        // console.log(epsilonBySource);


        json_temp = []
        indexVisibleNodes = []
        nodes_related = {}

        epsilonBySource.forEach(function(bean, i) { 
            
            bean.values.forEach(function(val){

                if( Math.abs(val.value) > ep_th ){

                    json_temp.push( {"source":val.source, "target":val.target, "value":val.value} );
                    nodes_related[val.source] =  "val";
                    nodes_related[val.target] =  "val";

                }
                // else{
                //     console.log("ep_th less: " + bean.values[0].value);
                // }

            });

        });

        // console.log(json.links);
        // console.log(json_temp);
        json_temp.forEach(function(d) {
            linkedByIndex[d.source + "," + d.target] = true;
        });
        // console.log(linkedByIndex);




        for (var key in nodes_related) {
            indexVisibleNodes.push(parseInt(key));
        }
        
        console.log(indexVisibleNodes);


        div.each(function() {

            /*********************** init variables, and force object */
            
            var width = $("#graph").width(), height = graphHeight;
            var shiftKey, ctrlKey;
            var nodeGraph = json;
            var xScale = d3.scale.linear().domain([0,width]).range([0,width]);
            var yScale = d3.scale.linear().domain([0,height]).range([0, height]);

            force = d3.layout.force()
                .charge(-10)
                .linkDistance(width/5)
                .size([width, height]);


            /*********************** buttons that handle the graph*/

            d3.select("#graph")
                .append("div")
                .attr("id", "play-stop-button-holder")
                .attr("class", "div_btn stop_forces")
                    .append("button")
                    .attr("class", "btn btn-primary glyphicon glyphicon-stop")
                    .attr("id", "pararRed")
                    .attr("type", "button")
                    .attr("title", "Detener red")
                    .on("click", stop_nodes);

            d3.select("#graph")
                .append("div")
                .attr("id", "center_view_holder")
                .attr("class", "div_btn center")
                    .append("button")
                    .attr("class", "btn btn-primary glyphicon glyphicon-record")
                    .attr("id", "center_view_btn")
                    .attr("type", "button")
                    .attr("title", "Centrar red")
                    .on("click", center_view);

            d3.select("#graph")
                .append("div")
                .attr("id", "div_search_holder")
                .attr("class", "div_btn search_input")
                    .append("input")
                    .attr("class", "form-control")
                    .attr("id", "input_text_search")
                    .attr("type", "text")
                    .attr("placeholder", "Busca especie")
                    .on("input", search_node);


            d3.select("#graph")
                .append("div")
                .attr("id", "div_export_holder")
                .attr("class", "div_btn export_btn")
                    .append("button")
                    .attr("class", "btn btn-primary glyphicon glyphicon-download-alt")
                    .attr("id", "export_btn")
                    .attr("type", "button")
                    .attr("title", "Exporta red")
                    .on("click", export_graph);

            /*********************** selection of the graph container */

            var svg_g = d3.select("#graph")
                .attr("tabindex", 1)
                .on("keydown.brush", keydown)
                .on("keyup.brush", keyup)
                // .each(function() { this.focus(); })
            .append("svg")
                .attr("width", width)
                .attr("height", height);
            



            /*********************** adding the node toolptip to the graph container */

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                // .offset(function(d){
                //     console.log(d);
                //     return [d.x, d.y];
                // })
                .html(function(d) {

                  return  "<strong>Variable:</strong> <span >" + d.label + "</span><br/><br/>" +
                          "<strong>Ocurrencias:</strong> <span >" + d.occ + "</span>";
                });

            svg_g.call(tip);

            /*********************** creating the zoom object */

            var zoomer = d3.behavior.zoom().
                scaleExtent([0.1,10]).
                x(xScale).
                y(yScale).
                on("zoomstart", zoomstart).
                on("zoom", redraw);


            /*********************** functions for centering and zoomming the graph*/

            function center_view() {

                console.log("center_view");

                if (nodeGraph === null)
                    return;

                var nodes = nodeGraph.nodes;

                //no molecules, nothing to do
                if (nodes.length === 0)
                    return;

                // Get the bounding box
                min_x = d3.min(nodes.map(function(d) {return d.x;}));
                min_y = d3.min(nodes.map(function(d) {return d.y;}));

                max_x = d3.max(nodes.map(function(d) {return d.x;}));
                max_y = d3.max(nodes.map(function(d) {return d.y;}));


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
                 zoomer.translate([x_trans, y_trans ]);
                 zoomer.scale(min_ratio);

            };

            function zoomstart() {

              console.log("zoomstart");
              // console.log(e)

                node.each(function(d) {
                    d.selected = false;
                    d.previouslySelected = false;
                });
                node.classed("selected", false);

                // exit_highlight();
            }

            function redraw() {
                // console.log("redraw");

                // console.log(e)
                vis.attr("transform",
                         "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
            }


            /*********************** creating the brusher functionality */

            var spids_node_selected = [];

            brusher 
                .x(xScale)
                .y(yScale)
                .on("brushstart", function(d) {
                    
                    console.log("brushstart");

                    // console.log(d);
                    node.each(function(d) { 
                        d.previouslySelected = shiftKey && d.selected; });

                })
                .on("brush", function(e) {
                    
                    console.log("brush");

                    indexNodes = [];

                    var extent = d3.event.target.extent();

                    // nodes_selected = [];
                    index_selected_visible = [];

                    node.classed("selected", function(d) {
                        // console.log(d)
                        // console.log(d.previouslySelected ^ (extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]));
                        // if( d.previouslySelected ^ (extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]) != 0 ){

                        inside = extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]

                        indexNodes.push(d.previouslySelected ^ inside)

                        // if(inside)
                        //     d3.select(this).style("stroke", "black");

                        // }
                        
                        return d.selected = d.previouslySelected ^ inside;
                    });

                    // console.log(indexNodes);

                    /*********************** filtering by brush */
                    
                    // console.log(indexVisibleNodes);
                    // console.log(indexNodes);



                    indexNodes.forEach(function(d,i) {
                        // console.log(d,i);
                        if(d == 1 && ($.inArray( i, indexVisibleNodes) != -1) ){
                            // nodes_selected.push(json.nodes[i]);
                            index_selected_visible.push(i);
                        }
                    });
                    // console.log(nodes_selected);
                    // console.log(index_selected_visible);
                    spids_node_selected = [];

                    $.each(index_selected_visible, function(index,value){
                        // console.log(json.nodes[value]);
                        spids_node_selected.push(json.nodes[value].spid);
                    });

                    // console.log(spids_node_selected);



                    // link_selected = [];
                    // value_link_selected = [];
                    // json.links.forEach(function(d){
                    //     // console.log(d)
                    //     if( $.inArray( d.source, index_selected_visible) != -1 && $.inArray( d.target, index_selected_visible) != -1 ){
                    //         value_link_selected.push(d.value);
                    //         link_selected.push(d);
                    //         // console.log(d);
                    //     }
                    // });

                    // console.log(link_selected);
                    // console.log(value_link_selected);

                    // if(value_link_selected.length > 0){
                    //     dimension.filterExact(value_link_selected[0]);
                    // }

                    // dim_node_state.filterFunction(function(d) { 
                    //     // console.log(d);
                        
                    //     if( $.inArray( d.value, value_link_selected) != -1 ){
                    //         // console.log(extent);
                    //         // console.log(d);
                    //         return true; 
                    //     }
                    //     return false;
                        
                    // }); 


                })
                .on("brushend", function(e) {
                    
                    console.log("brushend...");
                    // dimension.filterAll();
                    showSpecieOcc(spids_node_selected);

                    d3.event.target.clear();
                    d3.select(this).call(d3.event.target);



                });

           
            /*********************** selection of the graph container */

            var svg_graph = svg_g.append('svg:g')
                    .call(zoomer);
                    // .call(brusher)


            console.log(width);
            console.log(graphHeight);

            svg_g.append("text")
                .attr("y", graphHeight - margin.bottom + 15)
                .attr("x", graphHeight - margin.left)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Mantén presionada la tecla 'shift' para seleccionar mas de un nodo");


            var rect = svg_graph.append('svg:rect')
                  .attr('width', width)
                  .attr('height', height)
                  .attr("class", "rect_pan")
                  .attr('fill', 'transparent')
                  //.attr('opacity', 0.5)
                  .attr('stroke', 'transparent')
                  .attr('stroke-width', 1)
                  //.attr("pointer-events", "all")
                  .attr("id", "zrect");

            // console.log("var brush");

            var brush = svg_graph.append("g")
                  .datum(function() { 
                        console.log("datum");

                        return {selected: false, previouslySelected: false}; 
                    })
                  .attr("class", "brush");

            brush.call(brusher)
                  .on("mousedown.brush", null)
                  .on("touchstart.brush", null) 
                  .on("touchmove.brush", null)
                  .on("touchend.brush", null); 

            brush.select('.background').style('cursor', 'auto');



            var vis = svg_graph.append("svg:g");

            vis.attr('fill', 'red')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('opacity', 1)
                .attr('id', 'vis')

            link = vis.append("g")
                .attr("class", "link")
                .selectAll("line");

            
            max_eps = d3.max(json.links, function(d) {return d.value;});
            min_eps = d3.min(json.links, function(d) {return d.value;});

            link_color = d3.scale.quantize().domain([-max_eps,max_eps]).range(colorbrewer.RdGy[11]);

            link = link.data(json_temp)
                .enter().append("line")
                .attr("class", "link")
                .attr("x1", function(d) { 
                    // console.log(d)
                    return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; })
                .style("stroke-width", 5)
                .style("stroke", function(d) { 
                    return link_color(d.value); 
                })
                .style("opacity", 1);


            force
                .nodes(json.nodes)
                .links(json_temp)
                .start();


            node = vis.append("g")
                .attr("class", "node")
                .selectAll("circle");


            node = node.data(json.nodes)
                .enter().append("circle")
                .attr("r", function(d) { return 5 + Math.pow(d.occ/Math.PI, 0.5); })
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", function(d) { 
                    console.log(d)
                    console.log(color(d.group))
                    return color(d.group); 
                })
                .style("visibility", function(d){
                  if( $.inArray( d.index, indexVisibleNodes) == -1){
                    d.visible = false;
                    return "hidden";}
                  else{
                    d.visible = true;
                    return "visible";
                    }
                })
                .on('mouseover', function(d){

                    d3.select(this).attr("r", function(d){
                        return 10 + Math.pow(d.occ/Math.PI, 0.5);
                    });

                    tip.show(d)
                
                })
                .on('mouseout', function(d){

                    d3.select(this).attr("r", function(d){
                        return 5 + Math.pow(d.occ/Math.PI, 0.5);
                    });

                    tip.hide(d)
                
                })
                .on("dblclick", function(d) { 
                    d3.event.stopPropagation();
                    d.fixed = !d.fixed;
                })
                .on("click", function(d) {

                    console.log("click");

                    if (d3.event.defaultPrevented) return;

                    console.log(d);

                    console.log("Manda petición especie");
                    species_selected = {"id":d.spid, "label": d.label}
                    showSpecieOcc([d.spid]);
                    
                    if (!shiftKey) {
                        node.classed("selected", function(p) { return p.selected =  p.previouslySelected = false; })
                    }

                    // set_highlight(d);

                    d3.select(this).classed("selected", d.selected = !d.previouslySelected);

                    // console.log(d.selected);





                    // if(d.type == 0){

                    //     console.log("Manda petición especie");
                    //     species_selected = {"id":d.spid, "label": d.label}
                        
                    //     try{
                    //         map.removeLayer(grid_wms);
                    //         layer_control.removeLayer(grid_wms);
                    //     }
                    //     catch (e) {
                    //         console.log("there's no layer grid_wms");
                    //     }

                    //     showSpecieOcc(d.spid, d.label);
                    // }
                    // else{

                    //     console.log("Manda petición clima");
                    //     try {
                    //         // map.removeLayer(markersLayer);
                    //         markersLayer.clearLayers();
                    //         layer_control.removeLayer(markersLayer);
                    //     } catch (e) {
                    //         console.log("primera vez");
                    //     }

                    //     showBioclimOcc(d.spid, d.label);

                    // }


                })


                .on("mouseup", function(d) {

                    // if (d.selected && shiftKey) d3.select(this).classed("selected", d.selected = false);

                })
                .call(d3.behavior.drag()
                      .on("dragstart", dragstarted)
                      .on("drag", dragged)
                      .on("dragend", dragended));




            /**********************************************/

            
            function dragstarted(d) {

                console.log("dragstarted");
                d3.event.sourceEvent.stopPropagation();

                if (!d.selected && !shiftKey) {
                    // if this node isn't selected, then we have to unselect every other node
                    node.classed("selected", function(p) { return p.selected =  p.previouslySelected = false; });
                }

                d3.select(this).classed("selected", function(p) { d.previouslySelected = d.selected; return d.selected = true; });

                node.filter(function(d) { return d.selected; })
                .each(function(d) { d.fixed |= 2; })

                // a[0] |= b -> a[0] = a[0] | b
            }

            function dragged(d) {
                console.log("dragged");
                
                node.filter(function(d) { return d.selected; })
                .each(function(d) { 
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;

                    d.px += d3.event.dx;
                    d.py += d3.event.dy;
                })

                force.resume();
            }


            function dragended(d) {
                console.log("dragended");

                //d3.select(self).classed("dragging", false);
                node.filter(function(d) { return d.selected; })
                .each(function(d) { d.fixed = true; })
                // ~2 == -(2 + 1) == -3

            }


            function keydown() {
                shiftKey = d3.event.shiftKey || d3.event.metaKey;
                ctrlKey = d3.event.ctrlKey;

                console.log('keydown');

                if (d3.event.keyCode == 67) {   //the 'c' key
                    center_view();
                }

                if (shiftKey) {
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

                console.log("keyup");

                shiftKey = d3.event.shiftKey || d3.event.metaKey;
                ctrlKey = d3.event.ctrlKey;

                brush.call(brusher)
                    .on("mousedown.brush", null)
                    .on("touchstart.brush", null)                                                                      
                    .on("touchmove.brush", null)                                                                       
                    .on("touchend.brush", null);                                                                       

                brush.select('.background').style('cursor', 'auto')
                svg_graph.call(zoomer);

                // console.log("keyup2");
            }

            /***********************************************/
            
            

            force.on("tick", function() {
              link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });

              // node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

              node.attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; });
            });

            // center_view();

            /***********************************************/


        });


    }

    graph.dimension = function(_) {

        // console.log("graph.dimension");
        // console.log(_);
        
        if (!arguments.length) 
            return dimension;

        dimension = _;
        return graph;
    };

    graph.group = function(_) {

        // console.log("graph.group");
        // console.log(_);

        if (!arguments.length) 
            return group;
        
        group = _;
        return graph;
    };

    // graph.filter = function(_) {

    //     console.log("graph.filter");
    //     console.log(_);

    //     if (_) {
    //         brush.extent(_);
    //         dimension.filterRange(_);
    //     } else {
    //         brush.clear();
    //         dimension.filterAll();
    //     }
    //     // brushDirty = true;
    //     return graph;
    // };


    return d3.rebind(graph, brusher, "on");
    
}

/********************************************************************************************/


/********************************************************************************************/


    function barChart() {

        console.log("barChart");

        var margin = {top: 5, right: 20, bottom: 30, left: 20};
        var width = ($("#hist").width()) - margin.left - margin.right;
        var height = histHeight - margin.top - margin.bottom;
        
    
        if (!barChart.id) 
            barChart.id = 0;

        var y = d3.scale.linear()
            .range([100, 0]);
            // .domain([0, max_eps]);

        var x = d3.scale.ordinal()
            .rangeRoundBands([margin.left, width - margin.left], .1);

        var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5, "%");

        var id = barChart.id++,
            brush = d3.svg.brush(),
            brushDirty, dimension, group, round;
            //margin = {top: 10, right: 10, bottom: 20, left: 10}
        var brushStart = 0;
        var brushEnd = NUM_BEANS-1;

        
        function chart(div) {

            // console.log("chart div method");
            // console.log(div)

            height = y.range()[0];
            data = group.all();
            // console.log(data);
            
            // it contains an array from 1 to 20, create key missing elements and set value to 0
            epsilon_beans.forEach(function(d){
                exists = false;
                $.each(data, function( index, value ) {
                    if(d == value.key){
                        exists = true;
                        return false;
                    }
                });
                if(exists == false){
                    data.push({key:parseInt(d), value:0});
                }
            });

            // console.log(data);
            
            // Sort by price high to low
            data.sort(sort_by('key', false, parseInt));
            console.log(data);

            // // data = sortResults(data,'key',true);
            // data = sortObjectByKey(data);
            // console.log(data);

            $.each(data, function( index, value ) {

                tvalue = value.value;
                // console.log("tvalue: " + tvalue);

                if(tvalue != 0)
                    value.value = tvalue / all.reduceCount().value();
                // console.log(all.reduceCount().value() )
                // console.log(all.reduceSum(function(fact) { return fact.value; }).value() )
                
            });

            // console.log(data);


            x.domain(data.map(function(d) { 
                // console.log( parseFloat( (epsRange.invertExtent(d.key)[0] + epsRange.invertExtent(d.key)[1])/2).toFixed(2));
                avg = parseFloat( (epsRange.invertExtent(d.key)[0] + epsRange.invertExtent(d.key)[1])/2).toFixed(2);
                // console.log(avg)
                return avg; 
            }));

            

            y.domain([0, group.top(1)[0].value]);


            div.each(function() {

                console.log("div.each chart");
                // console.log(this);
            
                var div = d3.select(this),
                    g = div.select("g");

                // Create the skeletal chart.
                if (g.empty()) {

                    console.log("g.empty");

                    g = div.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    g.append("clipPath")
                        .attr("id", "clip-" + id)
                    .append("rect")
                        .attr("width", width)
                        .attr("height", height);

                    // g.selectAll(".bar")
                    //     .data(["background", "foreground"])
                    //     .enter()
                    // .append("path")
                    //     .attr("class", function(d) { 
                    //         // console.log(d);
                    //       return d + " bar"; 
                    //     })
                    //     .datum(data);

                      
                    g.selectAll(".foreground.bar")
                        .attr("clip-path", "url(#clip-" + id + ")");

                    // **** Axis
                      
                    g.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                    .append("text")
                        .attr("y", margin.bottom-10)
                        .attr("x", width/2)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Epsilon");

                    g.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + margin.left + ",0)")
                      .call(yAxis)
                    .append("text")
                      .attr("transform", "rotate(-90)")
                      .attr("y", 6)
                      .attr("dy", ".71em")
                      .style("text-anchor", "end")
                      .text("Frecuencia");

                    // ** Adding bars

                    g.selectAll(".bar")
                        .data(data)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { 
                            // console.log(d);
                            return x(parseFloat((epsRange.invertExtent(d.key)[0] + epsRange.invertExtent(d.key)[1])/2).toFixed(2)); })
                        .attr("width", x.rangeBand())
                        .attr("y", function(d) { 
                            return y(parseFloat(d.value)); 
                        })
                        .attr("height", function(d) { 
                            return height - y(parseFloat(d.value)); 
                        })
                        .attr("fill", function(d){

                            left = epsRange.invertExtent(d.key)[0]
                            right = epsRange.invertExtent(d.key)[1]
                            if(left<=0 && right>0)
                                min_val = 0;
                            else{
                                min_val = Math.min( Math.abs(left), Math.abs(right));
                            }
                            // console.log("left: " + epsRange.invertExtent(d.key)[0])
                            // console.log("right: " + epsRange.invertExtent(d.key)[1])
                            // console.log("min_val: " + min_val)

                            if(ep_th < min_val){
                                return d3.rgb(102, 184, 243);
                                // return "steelblue";
                            }
                            else{
                                return d3.rgb(213, 215, 223);
                            }
                        });

                    // **** Initialize the brush component with pretty resize handles.
                      var gBrush = g.append("g")
                        .attr("class", "brush")
                        .call(brush);

                      gBrush.selectAll("rect")
                        .attr("height", height);
                      
                      gBrush.selectAll(".resize")
                        .append("path")
                        .attr("d", resizePath);


                }

                // Only redraw the brush if set externally.
                // if (brushDirty) {

                //     console.log("brushDirty");
                  
                //     brushDirty = false;
                //     g.selectAll(".brush").call(brush);
                //     div.select(".title a").style("display", brush.empty() ? "none" : null);
                  
                //     if (brush.empty()) {
                //         g.selectAll("#clip-" + id + " rect")
                //             .attr("x", 0)
                //             .attr("width", width);
                //     } 
                //     else {
                //         var extent = brush.extent();
                //         g.selectAll("#clip-" + id + " rect")
                //             .attr("x", x(extent[0]))
                //             .attr("width", x(extent[1]) - x(extent[0]));
                //     }

                // }

                // console.log("final div.each chart");
                // g.selectAll(".bar").attr("d", barPath);

            });

            

            function resizePath(d) {

                console.log("resizePath");
                // configure the values of the extent component, clips and shadow selection

                var e = +(d == "e"),
                    x = e ? 1 : -1,
                    y = height / 3;
                
                return "M" + (.5 * x) + "," + y
                    + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                    + "V" + (2 * y - 6)
                    + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                    + "Z"
                    + "M" + (2.5 * x) + "," + (y + 8)
                    + "V" + (2 * y - 8)
                    + "M" + (4.5 * x) + "," + (y + 8)
                    + "V" + (2 * y - 8);
            }

            // function barPath(groups) {
            //     // console.log("barPath");
            //     var path = [],
            //         i = -1,
            //         n = groups.length,
            //         d;
            //     while (++i < n) {
            //       d = groups[i];
            //       path.push("M", x(cambio(d.key)) + ",", height, "V", y(d.value), "h 35 V", height);
            //     }
            //     return path.join("");
            // }

        } // function chart(div) closed


        // brush.on("brushstart.chart", function() {
        //     var div = d3.select(this.parentNode.parentNode.parentNode);
        //     div.select(".title a").style("display", null);
        //     console.log("dimension START");

        // });

        


        brush.on("brush.chart", function(e) {

            console.log("brush.chart");

            var y = d3.scale.linear()
                .domain([margin.left, width - margin.left])
                .range([0, NUM_BEANS]);


            b = brush.extent();
            // console.log(b);

            // d3.round(y(b[1], 0) for rounded values
            var localBrushStart = (brush.empty()) ? brushStart : y(b[0]  ), 
                localBrushEnd = (brush.empty()) ? brushEnd : y(b[1] );

            // console.log(localBrushStart);
            // console.log(localBrushEnd);

            // Snap to rect edge
            d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(localBrushStart), y.invert(localBrushEnd)]));


            // Fade all years in the histogram not within the brush
            d3.selectAll("rect.bar").style("opacity", function(d, i) {
                // console.log(d.key);

                if(d.key < localBrushStart || d.key >= localBrushEnd || brush.empty()){
                    return "0.4";
                }
                else{
                    return "1";
                }
            });

            // dimension.filterRange([localBrushStart,localBrushEnd]);

        });


        brush.on("brushend.chart", function() {


            var y = d3.scale.linear()
                .domain([margin.left, width - margin.left])
                .range([0, NUM_BEANS]);


            b = brush.extent();
            console.log(b);

            var localBrushStart = (brush.empty()) ? brushStart : y(b[0]  ), 
                localBrushEnd = (brush.empty()) ? brushEnd : y(b[1] );


            // console.log(localBrushStart);
            // console.log(localBrushEnd);

            // Snap to rect edge
            d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(localBrushStart), y.invert(localBrushEnd)]));


            if(brush.empty()){
                
                dim_eps_freq.filterAll();

                d3.selectAll("rect.bar").style("opacity", function(d, i) {
                    return "1";
                });

            }
            else{

                 //[0] + epsRange.invertExtent(d.key)[1]
                // console.log(   d3.round(localBrushStart,0) );
                // console.log(   d3.round(localBrushEnd,0) );

                if( d3.round(localBrushStart,0) == 0)
                    left_extent = 1
                else
                    left_extent = d3.round(localBrushStart,0)
                if( d3.round(localBrushEnd,0) == 21)
                    rigth_extent = 20
                else
                    rigth_extent = d3.round(localBrushEnd,0)


                console.log( epsRange.invertExtent(  left_extent  ) );
                console.log( epsRange.invertExtent(  rigth_extent ) );

                // adding 0.1 to the rigth limit because filterRange discard equality
                // dimension.filterRange([epsRange.invertExtent( left_extent )[0], epsRange.invertExtent( rigth_extent )[1]+0.1 ]);

                dim_eps_freq.filterFunction(function(d){
                    // console.log(d);

                    if(d > epsRange.invertExtent( left_extent )[0] && d < epsRange.invertExtent( rigth_extent )[1]+0.1 )
                        return true;

                });

                // Fade all years in the histogram not within the brush
                d3.selectAll("rect.bar").style("opacity", function(d, i) {
                    if(d.key < localBrushStart || d.key > localBrushEnd){
                        return "0.4";
                    }
                    else{
                        return "1";
                    }
                });

                // d3.event.sourceEvent.stopPropagation();

            }

        });


        chart.margin = function(_) {

            console.log("chart.margin");

            if (!arguments.length) 
                return margin;
            margin = _;
            return chart;
        };

        chart.x = function(_) {

            console.log("chart.x");
            // console.log(_);

            if (!arguments.length) 
                return x;

            x = _;
          
            xAxis.scale(x);
            brush.x(x);
            return chart;
        };

        chart.y = function(_) {

            console.log("chart.y");

            if (!arguments.length) 
                return y;
            y = _;
            return chart;
        };

        chart.dimension = function(_) {

            console.log("chart.dimension");
            // console.log(_);

            if (!arguments.length) 
                return dimension;
            dimension = _;
            return chart;
        };

        chart.filter = function(_) {

            console.log("chart.filter");

            if (_) {
                brush.extent(_);
                dimension.filterRange(_);
            } else {
                brush.clear();
                dimension.filterAll();
            }
            brushDirty = true;
            return chart;
        };

        chart.group = function(_) {

            console.log("chart.group");
            // console.log(_);

            if (!arguments.length) 
                return group;
            group = _;
            return chart;
        };

        chart.round = function(_) {

            console.log("chart.round");

            if (!arguments.length) 
                return round;
            round = _;
            return chart;
        };

        return d3.rebind(chart, brush, "on");
    }

    /********************************************************************************************/







$("#centraRed").click(function(){
    console.log("centraRed");
    center_view();

});


function stop_nodes() {
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
        .on("click", start_nodes);      
}

function search_node(d){

    search_str = $("#input_text_search").val();
    
    if(search_str.length <= 2){

        d3.selectAll("g.node").selectAll("circle")
        .each(function(item) {
            
            d3.select(this).attr("stroke","white");
            d3.select(this).attr("r", function(d){
                return 5 + Math.pow(d.occ/Math.PI, 0.5);
            });

        });
        return;
    }
        
    // console.log($("#input_text_search").val());
    // console.log(main_json);
    // d3.selectAll('g.node')

    d3.selectAll("g.node").selectAll("circle")
    .each(function(item) {
        
        if(item.label.toLowerCase().startsWith(search_str.toLowerCase()) ){

            console.log(item.label + " " + item.index);
            // console.log(highlight_color);
            
            d3.select(this).attr("stroke", function(){
                return highlight_color;
            });
            d3.select(this).attr("r", function(d){
                return 10 + Math.pow(d.occ/Math.PI, 0.5);
            });
        }
        else{
            d3.select(this).attr("stroke","white");   
            d3.select(this).attr("r", function(d){
                return 5 + Math.pow(d.occ/Math.PI, 0.5);
            });
        }

    });


    // main_json.nodes.forEach(function(item,index){
    // });


    
}

var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}


$("#send_email").click(function(e){

  // console.log($("#email_address"));
  console.log($("#email_address")[0].validity["valid"]);

  if($("#email_address")[0].validity["valid"]){
    
    email = $("#email_address").val();
    console.log(email);
    console.log(s_filters)

    milliseconds = new Date().getTime();

    d3.json(url_trabajo + "t=" + milliseconds)
    .header("Content-Type", "application/json")
    .post(
      JSON.stringify({
        qtype: "getEdges", 
        download: true,
        mail:email,
        s_tfilters: s_filters, 
        t_tfilters: t_filters,
        ep_th: 0.0}),
      function (error, d){
        $('#modalMail').modal('hide');
          
        if (error){
          console.log(error);
          toastr.error("Error al enviar el archivo");
          throw error;  
        } 

        console.log(d);
        toastr.success("Archivo enviado por correo electrónico");
    });
    

  }
  else{
    alert("Correo invalido")  
  }

});

function export_graph(){

    console.log("export_graph");
    $('#modalMail').modal('show'); 

}



// function sortResults(json_array,prop, asc) {
    
//     json_array = json_array.sort(function(a, b) {
//         console.log(a);
//         console.log(a.key);
//         // console.log(a.value);
//         console.log(b);
//         console.log(b.key);

//         if (asc) return (parseInt(a.key) > parseInt(b.key));
//         else return (  parseInt(b.key) > parseInt(a.key));
//     });
//     // console.log("json_array");
//     // console.log(json_array);

//     return json_array;
// }

// function sortObjectByKey(obj){

//     var keys = [];
//     var sorted_obj = [];

//     for(i=0; i<obj.length; i++){
//         keys.push(parseInt( obj[i].key));
//     }

//     // sort keys
//     keys.sort(function(a,b){
//         console.log(a)
//         console.log(b)
//         console.log('')
//         if (a > b) return true;
//         else return false;
//     });
//     console.log(keys);

//     // // create new array based on Sorted Keys
//     // jQuery.each(keys, function(i, key){
//     //     sorted_obj.push({key:obj[key]});
//     // });

//     return obj;
// };


function start_nodes() {
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
        .on("click", stop_nodes);        
}

function getEpsilonFrequencies(json){

    console.log("getEpsilonFrequencies");
    // console.log(json.links);

    var epsilon = [];
    var epsilon_beans = d3.range(NUM_BEANS);
    var beanFreqDictionary = {};

    // console.log(epsilon_beans);
    
    min_eps = d3.min(json.links.map(function(d) {return d.value;}));
    max_eps = d3.max(json.links.map(function(d) {return d.value;}));

    var epsRange = d3.scale.quantile().domain([min_eps, max_eps]).range(epsilon_beans);
    // console.log(epsRange.quantiles());


    epsilon_beans.forEach(function(bean, i) { 
        
        if (bean  == epsilon_beans[0]){
            // console.log("rango lbean: " + min_eps + " rbean: " + epsRange.quantiles()[bean])
            beanFreqDictionary[bean] =  {"val":0, "lbean":min_eps,"rbean":epsRange.quantiles()[bean]};
        }
            
        else if (bean  == epsilon_beans[epsilon_beans.length-1]){
            // console.log("rango lbean: " + epsRange.quantiles()[bean-1] + " rbean: " + max_eps)
            beanFreqDictionary[bean] =  {"val":0, "lbean":epsRange.quantiles()[bean-1],"rbean":max_eps};
        }
            
        else{
            // console.log("rango lbean: " + epsRange.quantiles()[bean-1] + " rbean: " + epsRange.quantiles()[bean])
            beanFreqDictionary[bean] =  {"val":0, "lbean":epsRange.quantiles()[bean-1],"rbean":epsRange.quantiles()[bean]};
        }    

    });

    // console.log("initial bean dictionary: ");
    // console.log(beanFreqDictionary);

    json.links.forEach(function(d){
        
        bean = epsRange(d.value);
        // console.log("value: " + d.value)
        // console.log("bean: " + bean)
        
        obj = beanFreqDictionary[bean];
        val = obj.val;
        // console.log(obj.val);

        if (bean  == epsilon_beans[0]){
            // console.log("rango lbean: " + min_eps + " rbean: " + epsRange.quantiles()[bean])
            beanFreqDictionary[bean] =  {"val":val+1, "lbean":min_eps,"rbean":epsRange.quantiles()[bean]};
        }
            
        else if (bean  == epsilon_beans[epsilon_beans.length-1]){
            // console.log("rango lbean: " + epsRange.quantiles()[bean-1] + " rbean: " + max_eps)
            beanFreqDictionary[bean] =  {"val":val+1, "lbean":epsRange.quantiles()[bean-1],"rbean":max_eps};
        }
            
        else{
            // console.log("rango lbean: " + epsRange.quantiles()[bean-1] + " rbean: " + epsRange.quantiles()[bean])
            beanFreqDictionary[bean] =  {"val":val+1, "lbean":epsRange.quantiles()[bean-1],"rbean":epsRange.quantiles()[bean]};
        }
              
        
    });

    // console.log(beanFreqDictionary);

    
    for (var key in beanFreqDictionary) {
         // console.log(key + " " + beanFreqDictionary[key]);
         epsilon.push(beanFreqDictionary[key]);
    }

    // console.log(epsilon)
    return epsilon;

}

function hasKeySetTo(obj,key,value){

    return obj.hasOwnProperty(key) && obj[key]==value;
}


/****************************************************************************************** Get species */

function showSpecieOcc(spids){

  // species_selected = {id: 47930, label:'Lynx rufus'};
  // console.log(species_selected.id);
  // console.log(species_selected.label);


  console.log("showSpecieOcc");
  console.log(spids);
    // milliseconds = new Date().getTime();

    // if(ID_STYLE_GENERATED == 0){
    //     console.log("sin sld creado")
    //     ID_STYLE_GENERATED = milliseconds;
    // }
    // else{
    //     deleteStyle();
    //     ID_STYLE_GENERATED = milliseconds;
    // }

    var sdata = {
      'qtype' : 'getCountGridid',
      "spids"    : spids
    };

    $.ajax({

          url : url_trabajo,
          type : 'post',
          data : sdata,
          // dataType : "json",
          success : function (json_file){

            json = JSON.parse(json_file);
            // console.log(json);
            arg_gridid = [];
            arg_count = [];

            $.each(json,function(index, item){
                arg_gridid.push(item.gridid);
                arg_count.push(item.cont);
            });

            max_eps = d3.max(arg_count);
            min_eps = 0; // d3.min(arg_count);
            // console.log(max_eps);
            // console.log(min_eps);

            // if(max_eps == min_eps){
            //     link_color = d3.scale.quantize().domain([min_eps, max_eps+1]).range(colorbrewer.Reds[7]);
            // }
            // else{
            link_color = d3.scale.quantize().domain([min_eps, max_eps]).range(colorbrewer.YlOrRd[9]);
            // }
                
            // console.log(link_color(min_eps));
            // console.log(link_color(max_eps));

            g = d3.select("#grid_item");
            feature = g.selectAll("path");
            
            feature.each(function(d,i){
                
                if(i==0)
                    console.log(d);

                // d3.select(this).style("stroke", "black")
                d3.select(this).style("fill", function(){

                    index_grid = arg_gridid.indexOf(d.properties.gridid);
                    
                    if( index_grid != -1){

                        // console.log(index_grid);
                        // console.log(arg_count[index_grid]);
                        // console.log(link_color(arg_count[index_grid]));

                        // if(max_eps == min_eps){
                        //     return link_color(max_eps+1);
                        // }
                        // else{
                        return link_color(arg_count[index_grid]);    
                        // }

                    }
                        
                    else{
                        return link_color(min_eps);
                    }

                });

            })

          },
          error: function( jqXHR ,  textStatus,  errorThrown ){
            console.log("error configureStyleMap: " + textStatus);
            // deleteStyle();

          }
    });

}

