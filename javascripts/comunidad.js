var associativeArray = {};
var arrayLinks = [];
var json_nodes;

var s_filters;
var t_filters;

var value_vartree;
var field_vartree;
var parent_field_vartree;
var level_vartree;

var var_sel_array = [];
var var_sel_arraySumidero = [];

var arrayVarSelected = [];
var arrayVarSelectedSum1dero = [];

var arrayBioclimSelected = []
var arrayBioclimSelectedSumidero = []

var varfilter_selected_bio = [];
var varfilter_selected_abio = [];
var varfilter_selected_sumidero_bio = [];
var varfilter_selected_sumidero_abio = [];

var indexVisibleNodes = [];
var NUM_SECTIONS = 2;
var group_bio_selected = d3.map([]);
var group_bio_selected_sumidero = d3.map([]);
var group_abio_selected = d3.map([]);
var group_abio_selected_sumidero = d3.map([]);

// set this value to 0 when youre working local and 1 in production
var AMBIENTE = 0;
var url_trabajo = "";
var TESTING = false;
var idFilterGroup = 0;


var OSM_layer;
var grid_wms;
var species_layer;
var states_layer;
var markersLayer;
var map;
var baseMaps;
var overlayMaps;
var layer_control;
var arrayLayerStates = [];
var geojsonMouseOverStyle = {
    radius: 7,
    fillColor: "#CED122",
  color: "#8C8E3A",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.6
};
var geojsonStyleDefault = {
    radius: 7,
    fillColor: "#E2E613",
  color: "#ACAE36",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.6
};
var geojsonHighlightStyle = {
    radius: 7,
    fillColor: "#16EEDC",
  color: "#36AEA4",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.6
};



document.getElementById("tbl_hist_comunidad").style.display = "none";
document.getElementById("map_panel").style.display = "none";
document.getElementById("graph_map_comunidad").style.display = "none";


if (AMBIENTE == 1){
  root = "charlie/";
  url_trabajo = "http://geoportal.conabio.gob.mx/niche2?"
  url_nicho = "http://geoportal.conabio.gob.mx/charlie/geoportal_v0.1.html";
  url_comunidad = "http://geoportal.conabio.gob.mx/charlie/comunidad_v0.1.html";
  var url_geoserver = "http://geoportal.conabio.gob.mx:80/geoserver/cnb/wms?"
  var workspace = "cnb";
  
} 
else{
  root = "";
  url_trabajo = "http://localhost:3000/"
  url_nicho = "http://localhost:3000/geoportal_v0.1.html";
  url_comunidad = "http://localhost:3000/comunidad_v0.1.html";
  var url_geoserver = "http://localhost:8080/geoserver/conabio/wms?"
  var workspace = "conabio"
  
}


// $("#main_container").width(  $(window).width() * .90 );
// console.log("width: " +  $(window).width() * .98 );
// console.log("width: " + $("#main_container").width() );

var reino_campos = {
    "phylum": "phylumdivisionvalido",
    "clase": "clasevalida",
    "orden": "ordenvalido",
    "familia": "familiavalida",
    "genero": "generovalido",
    "especie": "epitetovalido"
};

var graphReady = 0;

var data_bio = [{
    "text": "Bioclim",
    "id": "rootbio",
    attr: { "bid": "Bioclim", "parent": "Bioclim", "level": 0 },
    'state' : {'opened' : true},
    "icon": "assets/images/dna.png", 
    "children": [
      {
        "text": "Temperatura media anual",
        "id": "bio01",
        attr: { "bid": "bio01", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Rango medio diurno",
        "id": "bio02",
        attr: { "bid": "bio02", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Forma Isotérmica",
        "id": "bio03",
        attr: { "bid": "bio03", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Temperatura estacional",
        "id": "bio04",
        attr: { "bid": "bio04", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Temperatura máxima del mes mas caliente",
        "id": "bio05",
        attr: { "bid": "bio05", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Temperatura mínima de mes mas frio",
        "id": "bio06",
        attr: { "bid": "bio06", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Rango anual de temperatura",
        "id": "bio07",
        attr: { "bid": "bio07", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Temperatura media del trimestre mas húmedo",
        "id": "bio08",
        attr: { "bid": "bio08", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Temperatura media del trimestre mas seco",
        "id": "bio09",
        attr: { "bid": "bio09", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Temperatura media del trimestre mas caliente",
        "id": "bio10",
        attr: { "bid": "bio10", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Temperatura media del trimestre mas frio",
        "id": "bio11",
        attr: { "bid": "bio11", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación anual",
        "id": "bio12",
        attr: { "bid": "bio12", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación del mes mas húmedo",
        "id": "bio13",
        attr: { "bid": "bio13", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación del mes mas seco",
        "id": "bio14",
        attr: { "bid": "bio14", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación estacional",
        "id": "bio15",
        attr: { "bid": "bio15", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación del trimestre mas húmedo",
        "id": "bio16",
        attr: { "bid": "bio16", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación del trimestre mas seco",
        "id": "bio17",
        attr: { "bid": "bio17", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación del trimestre mas caliente",
        "id": "bio18",
        attr: { "bid": "bio18", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      },
      {
        "text": "Precipitación del trimestre mas frio",
        "id": "bio19",
        attr: { "bid": "bio19", "parent": "Bioclim", "level": 1 },
        'state' : {'opened' : true},
        "icon": "assets/images/dna.png"
      }
    ]
   }
 ];


$("#nicho_link").click(function(){
  window.location.replace(url_nicho);
});


/****************************************************************************************** Interface interaction */


/********************************************************************** jstree - specie - fuente*/

$('ul.dropdown-menu li a.biotica').click(function (e) {

    // console.log(e.target.getAttribute("data-field"));
    // console.log(e.target.getAttribute("level-field"));
    console.log("biotico");

    varfilter_selected_bio = [e.target.getAttribute("data-field"), e.target.getAttribute("parent-field"), e.target.getAttribute("level-field")];
    varfield = e.target.text;

    $("#btn_variable").text(varfield);
    $("#btn_variable").append('<span class="caret"></span>');
    $("#text_variable").prop("disabled", false);
    $("#text_variable").val("");

    e.preventDefault();

});


$("#text_variable").autocomplete({

  source : function (request, response){

      
    $.ajax({

      url: url_trabajo,
      dataType : "json",
          type: "post",
      data :
      {
        searchStr : request.term,
        qtype : 'getEntList',
        limit : 30,
        start : 0,
        field : varfilter_selected_bio[1],
        superfield : '',
        superfieldvalue : ''
      },
      success : function (data){

        response($.map(data, function (item){

          // console.log(item.ent);

            return{
              label : item.ent[varfilter_selected_bio[1]],
              id : item.ent[varfilter_selected_bio[1]],
            };

          })

        );

      }

    });

  },
  minLength : 2,
  change : function (event, ui){
    if (!ui.item){
      $("#text_variable").val("");
    }
  },
  select : function (event, ui){

    console.log("selected element");
    

    // console.log($("#btn_variable").text());
    // tree_states = [];
    $('#jstree-variables').jstree("destroy").empty();

    $('#jstree-variables').on('open_node.jstree', getTreeVar);
    $("#jstree-variables").on('changed.jstree',getChangeTreeVar);
    $("#jstree-variables").on('loaded.jstree',loadNodes);


    // console.log("listeners:");
    // console.log( $("#jstree-variables") );
    
    // $.each($("#jstree-variables").data("events"), function(i, event) {
      
    //   $.each(event, function(j, h) {
    //     // alert(h.handler);
    //     console.log(h.handler);
    //   });
        
    // });
    // $('#col_variable').empty();
    // cleanNonSelectedVariables();

    value_vartree = ui.item.id;
    field_vartree = varfilter_selected_bio[0];
    parent_field_vartree = varfilter_selected_bio[1];
    level_vartree = varfilter_selected_bio[2];

    console.log("nivel");
    console.log(level_vartree);

    // cargaArbolVariablesTax(ui.item.id, varfilter_selected[0], varfilter_selected[1], varfilter_selected[2]);

    var tree_reinos = [{
      "text": value_vartree,
      "id": "root",
      "attr": { "nivel": level_vartree },
      'state' : {'opened' : true},
      "icon": "assets/dist/themes/default/throbber.gif"
    }];

    $("#jstree-variables").jstree({
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
});


var getChangeTreeVar = function(e, data){

  console.log("tree change");
  arrayVarSelected = [];

  if ($('#jstree-variables').jstree(true).get_top_selected().length > 0){

    var headers_selected = $('#jstree-variables').jstree(true).get_top_selected().length;
    
    for(i=0; i<headers_selected; i++){

      var  node_temp = $('#jstree-variables').jstree(true).get_node( $('#jstree-variables').jstree(true).get_top_selected()[i] ).original;
      var level = "";

      console.log(  $('#jstree-variables').jstree(true).get_node( $('#jstree-variables').jstree(true).get_top_selected()[i] ) );
      var parent_node = $('#jstree-variables').jstree(true).get_node( $('#jstree-variables').jstree(true).get_parent(  $('#jstree-variables').jstree(true).get_top_selected()[i] ) ).original; 

      
      if(node_temp.attr.nivel == 2) level = "Reino";
        else if(node_temp.attr.nivel == 3) level = "Phylum";
          else if(node_temp.attr.nivel == 4) level = "Clase";
            else if(node_temp.attr.nivel == 5) level = "Orden";
              else if(node_temp.attr.nivel == 6) level = "Familia";
                else if(node_temp.attr.nivel == 7) level = "Genero";
                  else if(node_temp.attr.nivel == 8) level = "Especie";


      // if(node_temp.attr.nivel == 8){
      //     console.log(node_temp);
      //     console.log(parent_node);
      //     arrayVarSelected.push({label: parent_node.text + " " + node_temp.text, level: level, numlevel: node_temp.attr.nivel });
      // }
      // else{
      //     arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel });  
      // }



      if(parent_node){

        console.log( parent_node.text  );
        arrayVarSelected.push({label: node_temp.text, id: node_temp.text, level: level, parent: parent_node.text});

      }
      else{
        // si parent node es vacio y nivel el 7 (genero), quiere decir que solo se tienen un hijo
        // console.log( node_temp.attr.nivel  );
        // $('#jstree-variables').jstree(true).get_node( $('#jstree-variables').jstree(true).get_parent(  $('#jstree-variables').jstree(true).get_top_selected()[i] ) ).original; 
        // console.log( $('#jstree-variables').jstree(true).get_children_dom(  $('#jstree-variables').jstree(true).get_top_selected()[i]  )  );

        arrayVarSelected.push({label: node_temp.text, id: node_temp.text, level: level});
        
      }
      
      
    }

    console.log("arrayVarSelected: ")
    console.log(arrayVarSelected);

  }

};


var getTreeVar = function(e, d){

  console.log("tree open");

  console.log(d.node.original.attr.nivel);
  // console.log(d.node.children);

  if(d.node.children.length > 1) return;
  
  var next_field = "";
  var next_nivel = 0;

  $("#jstree-variables").jstree(true).set_icon(d.node.id, "./assets/dist/themes/default/throbber.gif");


  if(d.node.original.attr.nivel==2){
    parent_field = "reinovalido"
    next_field = "phylumdivisionvalido";
    next_nivel = 3;
  }
  else if(d.node.original.attr.nivel==3){
    parent_field = "phylumdivisionvalido"
    next_field = "clasevalida";
    next_nivel = 4;
  }
  else if(d.node.original.attr.nivel==4){
    parent_field = "clasevalida"
    next_field = "ordenvalido";
    next_nivel = 5;
  }
  else if(d.node.original.attr.nivel==5){
    parent_field = "ordenvalido"
    next_field = "familiavalida";
    next_nivel = 6;
  }
  else if(d.node.original.attr.nivel==6){
    parent_field = "familiavalida"
    next_field = "generovalido";
    next_nivel = 7;
  }
  else if(d.node.original.attr.nivel==7){
    parent_field = "generovalido"
    next_field = "epitetovalido";
    next_nivel = 8;
  }
  else{
    $("#jstree-variables").jstree(true).delete_node(d.node.children[0]);
    $("#jstree-variables").jstree(true).set_icon(d.node.id, "./assets/images/dna.png");
    return;
  }

  $.ajax({

      url: url_trabajo,
      dataType : "json",
      type: "post",
      data: {
        "qtype" : "getVariables",
        "field" : next_field,
        "parentfield": parent_field,
        "parentitem" : d.node.text
      },
      success : function (data){
       
        console.log(data);
        // console.log(d.node.id);
        // console.log(d.node.text);

        for(i=0; i<data.length; i++){

          var idNode = "";

          if($("#" + data[i].id).length > 0) {
            // console.log("id_existente");

            idNode = data[i].id + "_" + Math.floor((Math.random() * 1000) + 1)
          }
          else{
            // .console.log("nuevo_id");

            idNode = data[i].id;
          }

          var default_son = next_nivel < 8 ? [{text: "cargando..."}] : [];

          var newNode = { 
              id:idNode, 
              text:data[i].name, 
              icon: "assets/images/dna.png", 
              attr: { "nivel": next_nivel },
              state: {'opened' : false},
              "children": default_son
            };

          $('#jstree-variables').jstree("create_node", d.node, newNode, 'last', false, false);

        }

        // $("#jstree-variables").jstree(true).set_state ({"selected": false});
        $("#jstree-variables").jstree(true).delete_node(d.node.children[0]);
        $("#jstree-variables").jstree(true).set_icon(d.node.id, "./assets/images/dna.png");
        // return;

    }
  }); 

};


var loadNodes = function(e, d){

  console.log("tree ready");

    // se incrementa level para  asignar el nivel adecuado a los hijos de la raiz
    // la funcion es llamda dos veces, por tantro se decidio utilizar el arreglo + 1, en lufar de utilzar la variable global "level_vartree"
    level_vartree = parseInt(varfilter_selected_bio[2]) + 1;
    console.log(level_vartree);

    $.ajax({

      url: url_trabajo,
      dataType : "json",
      type: "post",
      data: {
        "qtype" : "getVariables",
        "field" : field_vartree,
        "parentfield": parent_field_vartree,
        "parentitem" : value_vartree
      },
      success : function (data){

        var  current_node = $('#jstree-variables').jstree(true).get_node($("#root"));
        
        // console.log(current_node);
        // console.log(data);
        // console.log(d.node.id);
        // console.log(d.node.text);

        // console.log("adding nodes");

        for(i=0; i<data.length; i++){

          var idNode = "";

          if($("#" + data[i].name).length > 0) {
            // console.log("id_existente");

            idNode = data[i].name + "_" + Math.floor((Math.random() * 1000) + 1)
          }
          else{
            // .console.log("nuevo_id");

            idNode = data[i].name;
          }

          var default_son = level_vartree < 8 ? [{text: "cargando..."}] : [];

          // console.log(idNode);

          var newNode = { 
              id:idNode, 
              text:data[i].name, 
              icon: "assets/images/dna.png", 
              attr: { "nivel": level_vartree },
              state: {'opened' : false},
              "children": default_son
            };

            // console.log(newNode);
            // console.log("");

          $('#jstree-variables').jstree("create_node", current_node, newNode, 'last', false, false);

        }

        $("#jstree-variables").jstree(true).set_icon(current_node.id, "./assets/images/dna.png");

    }
  }); 

}


$("#add_group").click(function(){

  console.log("agregar variables");

  if(arrayVarSelected.length == 0)
      return;

  $.each(arrayVarSelected, function(index,item){
      // console.log(item);
      group_bio_selected.set(item.level + "-" + item.id, {id: item.level + "-" + item.id, value: item.level + " >> " + item.label, level: item.level, parent: item.parent})
  })
  console.log(group_bio_selected.values())

  updateVarSelArray(group_bio_selected.values(), var_sel_array)
  
  // añadir div para separar texto del botton de borrar

  $("#treeAddedPanel").empty();
  var div_item = d3.select("#treeAddedPanel").selectAll("row_var_item")
    .data(group_bio_selected.values())
    .enter()
  .append("div")
    .attr("class", "row_var_item")
    .attr("id",function(d){ return d.id})

  div_item
  .append("div")
    .attr("class", "text_var_item")
    .text(function(d){ 
      console.log(d.value)
      return d.value
    })

  div_item
  .append("button")
      .attr("class","btn btn-danger glyphicon glyphicon-remove btn_item_var pull-right")
      .on("click",function(d){
            // console.log("remove item");
            d3.select(this.parentNode).remove();

            $.each(group_bio_selected.values(), function(index,obj){
                  if(obj.id == d.id){
                      console.log(d);
                      group_bio_selected.remove(obj.id);
                      return false;
                  }
              }) 
              updateVarSelArray(group_bio_selected.values(), var_sel_array);
              console.log(group_bio_selected.values());
      });

  $('#jstree-variables').jstree("destroy").empty();
  $('#jstree-variables').off('open_node.jstree', getTreeVar);
  $("#jstree-variables").off('changed.jstree',getChangeTreeVar);
  $("#jstree-variables").off('ready.jstree',loadNodes);
  $('#col_variable').empty();
  $("#text_variable").val("");

});

function updateVarSelArray(groupvar_dataset, sel_array){

    console.log("updateVarSelArray");

    for(i = 0; i < sel_array.length; i++){
      if (sel_array[i].type == 0){
        sel_array.splice(i, 1);
        i = i-1;
      }
    }

    $.each(groupvar_dataset,function(index,item){
      if(item.level == "Especie"){
          sel_array.push( { "value" : item.value ,  "type": 0, "parent":item.parent });  
        }
        else{
          sel_array.push( { "value" : item.value ,  "type": 0 });  
        }
    })

    console.log(sel_array);

}


$("#clean_var").click(function(){

  arrayVarSelected = [];
  group_bio_selected = d3.map([]);

  $('#col_variable').empty();
  $('#treeAddedPanel').empty();

  $("#text_variable").val("");
  $('#jstree-variables').jstree("destroy").empty();

  $('#jstree-variables').off('open_node.jstree', getTreeVar);
  $("#jstree-variables").off('changed.jstree',getChangeTreeVar);
  $("#jstree-variables").off('ready.jstree',loadNodes);


  for(i = 0; i < var_sel_array.length; i++){ 
    if (var_sel_array[i].type == 0){
      var_sel_array.splice(i, 1);
      i = i-1;
    }
  }
  

});



/********************************************************************** jstree - bioclim - fuente */


$('ul.dropdown-menu li a.abiotica').click(function (e) {

    // console.log(e.target.getAttribute("data-field"));
    // console.log(e.target.getAttribute("level-field"));
    // console.log(e);

    varfilter_selected_abio = e.target.getAttribute("data-field");
    varfield = e.target.text;

    console.log("abiotico");

    $("#btn_variable_bioclim").text(varfield);
    $("#btn_variable_bioclim").append('<span class="caret"></span>');
    $("#text_variable_bioclim").prop("disabled", false);
    $("#text_variable_bioclim").val("");


    // console.log(e.target.attributes['level-field'].nodeValue);
    // console.log(e.target.attributes[0].nodeValue);
    
    if(parseInt(e.target.attributes['level-field'].nodeValue) == 0){

          // console.log("Bioclim");
          // console.log(e.target.text);

          $('#jstree-variables-bioclim').jstree("destroy").empty();
          $("#jstree-variables-bioclim").jstree({
             'plugins': ["wholerow", "checkbox"],
             'core': {
                 'data': data_bio,
                 'themes': {
                     'name': 'proton',
                     'responsive': true
                 },
                 'check_callback': true
             }
          });

          $("#jstree-variables-bioclim").on('loaded.jstree',function(){
            $("#jstree-variables-bioclim").on('changed.jstree',getChangeTreeVarBioclim);
          });

          

    }
    else{

          // console.log("Otro");
          // console.log(e.target.text);

          // arrayBioclimSelected = [];
          // $('#col_variable_added-bioclim').empty();
          $.ajax({

              url: url_trabajo,
              dataType : "json",
              type: "post",
              data: {
                "qtype" : "getVariablesBioclim",
                "field" : varfilter_selected_abio
              },
              success : function (data){

                // console.log(data);
                $('#jstree-variables-bioclim').jstree("destroy").empty();

                var tree_reinos = [{
                  "text": varfield,
                  "id": varfilter_selected_abio,
                  attr: { "bid": varfilter_selected_abio, "parent": varfield, "level": 1 },
                  'state' : {'opened' : true},
                  "icon": "assets/dist/themes/default/throbber.gif"
                }];

                $("#jstree-variables-bioclim").jstree({
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

                $("#jstree-variables-bioclim").on('changed.jstree',getChangeTreeVarBioclim);

                $("#jstree-variables-bioclim").on('loaded.jstree',function(){

                    var  current_node = $('#jstree-variables-bioclim').jstree(true).get_node($("#"+varfilter_selected_abio));
                    console.log(current_node);

                    for(i=0; i<data.length; i++){

                        var idNode = "";
                        if($("#" + data[i].bid).length > 0) {
                          // console.log("id_existente");
                          idNode = data[i].bid + "_" + Math.floor((Math.random() * 1000) + 1)
                        }
                        else{
                          // .console.log("nuevo_id");
                          idNode = data[i].bid;
                        }

                        var default_son = level_vartree < 8 ? [{text: "cargando..."}] : [];

                        tag = String(data[i].tag).split(":")
                        min = tag[0].split(".")[0]
                        max = tag[1].split(".")[0]

                        var newNode = { 
                            id:idNode, 
                            text: min + " : " + max, 
                            icon: "assets/images/dna.png", 
                            attr: { "bid": data[i].bid, "parent": varfield, "level": 2 },
                            state: {'opened' : false},
                            "children": default_son
                          };

                        $('#jstree-variables-bioclim').jstree("create_node", current_node, newNode, 'last', false, false);
                    }

                    $("#jstree-variables-bioclim").jstree(true).set_icon(current_node.id, "./assets/images/dna.png");

                });

            }

          });

      
    }
    e.preventDefault();

});

var getChangeTreeVarBioclim = function(e, data){

    console.log("tree bioclim change");
    arrayBioclimSelected = [];
    
    if ($('#jstree-variables-bioclim').jstree(true).get_top_selected().length > 0){

        // console.log("acceder node header del dom");
        var headers_selected = $('#jstree-variables-bioclim').jstree(true).get_top_selected().length;
        
        for(i=0; i<headers_selected; i++){
          // TAMBIEN ASI PUEDE SER RESUELTO EL TEMA DE NO RECARGAR NUEVAMENTE EL ARBOL CUANDO ES CONTRAIDO!!!!!!!!!!
          var  node_temp = $('#jstree-variables-bioclim').jstree(true).get_node($('#jstree-variables-bioclim').jstree(true).get_top_selected()[i]).original;
          // console.log(node_temp);
          arrayBioclimSelected.push({label: node_temp.text, id: node_temp.attr.bid, parent: node_temp.attr.parent, level: node_temp.attr.level});
        }
    }

};

$("#add_group_bioclim").click(function(){

  console.log("agregar variables bioclim");
  console.log(arrayBioclimSelected);
  
  if(arrayBioclimSelected.length == 0)
    return;

  $.each(arrayBioclimSelected, function(index,item){
      // console.log(item);
      group_abio_selected.set(item.level +"-"+item.id, {id:item.id, value: item.parent + " >> " + item.label, level: item.level})
  })
  // console.log(group_abio_selected.values())

  updateAbioVarSelArray(group_abio_selected.values(), var_sel_array);

  $("#treeAddedPanelBioclim").empty();
  var div_item = d3.select("#treeAddedPanelBioclim").selectAll("row_var_item_bio")
    .data(group_abio_selected.values())
    .enter()
  .append("div")
    .attr("class", "row_var_item_bio")
    .attr("id",function(d){ return d.id})

  div_item
  .append("div")
    .attr("class", "text_var_item")
    .text(function(d){ 
      // console.log(d.value)
      return d.value
    })

  div_item
  .append("button")
      .attr("class","btn btn-danger glyphicon glyphicon-remove btn_item_var_bio pull-right")
      .on("click",function(d){
            // console.log("remove item");
            d3.select(this.parentNode).remove();

            $.each(group_abio_selected.values(), function(index,obj){
                  if(obj.id == d.id){
                      console.log(d);
                      group_abio_selected.remove(obj.level+"-"+obj.id);
                      return false;
                  }
              }) 
              updateAbioVarSelArray(group_abio_selected.values(), var_sel_array);
              console.log(group_abio_selected.values());
      });

  $('#jstree-variables-bioclim').jstree("destroy").empty();
    
   

});


function updateAbioVarSelArray(groupvar_dataset, sel_array){

    console.log("updateAbioVarSelArray");

    for(i = 0; i < sel_array.length; i++){
      if (sel_array[i].type == 1){
        sel_array.splice(i, 1);
        i = i-1;
      }
    }

    $.each(groupvar_dataset,function(index,item){
      sel_array.push( { "value" : item.id , "level" : item.level, "type" : 1 } );
    })

    console.log(sel_array);

}





$("#clean_var_bioclim").click(function(){

  arrayBioclimSelected = [];
  group_abio_selected = d3.map([]);

  $('#treeAddedPanelBioclim').empty();
  $('#jstree-variables-bioclim').jstree("destroy").empty();
  // $("#jstree-variables").on('changed.jstree',getChangeTreeVar);
  // $("#jstree-variables").on('ready.jstree',loadNodes);


  for(i = 0; i < var_sel_array.length; i++){
    if (var_sel_array[i].type == 1){
      var_sel_array.splice(i, 1);
      i = i-1;
    }
  }

  
});


/********************************************************************** jstree - specie - sumidero */


$('ul.dropdown-menu li a.biotica_sumidero').click(function (e) {

    // console.log(e.target.getAttribute("data-field"));
    // console.log(e.target.getAttribute("level-field"));
    console.log("biotico sumidero");

    varfilter_selected_sumidero_bio = [e.target.getAttribute("data-field"), e.target.getAttribute("parent-field"), e.target.getAttribute("level-field")];
    varfield = e.target.text;

    $("#btn_variable_sumidero").text(varfield);
    $("#btn_variable_sumidero").append('<span class="caret"></span>');
    $("#text_variable_sumidero").prop("disabled", false);
    $("#text_variable_sumidero").val("");

    e.preventDefault();

});


$("#text_variable_sumidero").autocomplete({

  source : function (request, response){
    $.ajax({

      url: url_trabajo,
      dataType : "json",
          type: "post",
      data :
      {
        searchStr : request.term,
        qtype : 'getEntList',
        limit : 30,
        start : 0,
        field : varfilter_selected_sumidero_bio[1],
        superfield : '',
        superfieldvalue : ''
      },
      success : function (data){

        response($.map(data, function (item){

          console.log(item.ent);

            return{
              label : item.ent[varfilter_selected_sumidero_bio[1]],
              id : item.ent[varfilter_selected_sumidero_bio[1]],
            };

          })

        );

      }

    });

  },
  minLength : 2,
  change : function (event, ui){
    if (!ui.item){
      $("#text_variable_sumidero").val("");
    }
  },
  select : function (event, ui){

    // console.log(ui);
    // console.log($("#btn_variable").text());
    // tree_states = [];
    $('#jstree-variables_sumidero').jstree("destroy").empty();
    $('#jstree-variables_sumidero').on('open_node.jstree', getTreeVarSumidero);
    $("#jstree-variables_sumidero").on('changed.jstree',getChangeTreeVarSumidero);
    $("#jstree-variables_sumidero").on('loaded.jstree',loadNodesSumidero);
    // $('#col_variable').empty();
    // cleanNonSelectedVariables();

    value_vartree = ui.item.id;
    field_vartree = varfilter_selected_sumidero_bio[0];
    parent_field_vartree = varfilter_selected_sumidero_bio[1];
    level_vartree = varfilter_selected_sumidero_bio[2];

    console.log("nivel");
    console.log(level_vartree);

    // cargaArbolVariablesTax(ui.item.id, varfilter_selected[0], varfilter_selected[1], varfilter_selected[2]);

    var tree_reinos = [{
      "text": value_vartree,
      "id": "root",
      "attr": { "nivel": level_vartree },
      'state' : {'opened' : true},
      "icon": "assets/dist/themes/default/throbber.gif"
    }];

    $("#jstree-variables_sumidero").jstree({
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
});


var getChangeTreeVarSumidero = function(e, data){

  console.log("tree change");
  arrayVarSelectedSumidero = [];

  if ($('#jstree-variables_sumidero').jstree(true).get_top_selected().length > 0){

    var headers_selected = $('#jstree-variables_sumidero').jstree(true).get_top_selected().length;
    
    for(i=0; i<headers_selected; i++){

      var  node_temp = $('#jstree-variables_sumidero').jstree(true).get_node($('#jstree-variables_sumidero').jstree(true).get_top_selected()[i]).original;
      var level = "";

      console.log(  $('#jstree-variables_sumidero').jstree(true).get_node( $('#jstree-variables_sumidero').jstree(true).get_top_selected()[i] ) );
      var parent_node = $('#jstree-variables_sumidero').jstree(true).get_node( $('#jstree-variables_sumidero').jstree(true).get_parent(  $('#jstree-variables_sumidero').jstree(true).get_top_selected()[i] ) ).original; 


      if(node_temp.attr.nivel == 2) level = "Reino";
        else if(node_temp.attr.nivel == 3) level = "Phylum";
          else if(node_temp.attr.nivel == 4) level = "Clase";
            else if(node_temp.attr.nivel == 5) level = "Orden";
              else if(node_temp.attr.nivel == 6) level = "Familia";
                else if(node_temp.attr.nivel == 7) level = "Genero";
                  else if(node_temp.attr.nivel == 8) level = "Especie";


      if(parent_node){
        console.log( parent_node.text  );
        arrayVarSelectedSumidero.push({label: node_temp.text, id: node_temp.text, level: level, parent: parent_node.text});
      }else{
        arrayVarSelectedSumidero.push({label: node_temp.text, id: node_temp.text, level: level});
      }
      // arrayVarSelectedSumidero.push({label: node_temp.text, id: node_temp.text, level: level});
      
    }

    console.log("arrayVarSelectedSumidero: ")
    console.log(arrayVarSelectedSumidero);

  }

};




var getTreeVarSumidero = function(e, d){

  console.log("tree open");

  console.log(d.node.original.attr.nivel);
  // console.log(d.node.children);

  if(d.node.children.length > 1) return;
  
  var next_field = "";
  var next_nivel = 0;

  $("#jstree-variables_sumidero").jstree(true).set_icon(d.node.id, "./assets/dist/themes/default/throbber.gif");


  if(d.node.original.attr.nivel==2){
    parent_field = "reinovalido"
    next_field = "phylumdivisionvalido";
    next_nivel = 3;
  }
  else if(d.node.original.attr.nivel==3){
    parent_field = "phylumdivisionvalido"
    next_field = "clasevalida";
    next_nivel = 4;
  }
  else if(d.node.original.attr.nivel==4){
    parent_field = "clasevalida"
    next_field = "ordenvalido";
    next_nivel = 5;
  }
  else if(d.node.original.attr.nivel==5){
    parent_field = "ordenvalido"
    next_field = "familiavalida";
    next_nivel = 6;
  }
  else if(d.node.original.attr.nivel==6){
    parent_field = "familiavalida"
    next_field = "generovalido";
    next_nivel = 7;
  }
  else if(d.node.original.attr.nivel==7){
    parent_field = "generovalido"
    next_field = "epitetovalido";
    next_nivel = 8;
  }
  else{
    $("#jstree-variables_sumidero").jstree(true).delete_node(d.node.children[0]);
    $("#jstree-variables_sumidero").jstree(true).set_icon(d.node.id, "./assets/images/dna.png");
    return;
  }

  $.ajax({

      url: url_trabajo,
      dataType : "json",
      type: "post",
      data: {
        "qtype" : "getVariables",
        "field" : next_field,
        "parentfield": parent_field,
        "parentitem" : d.node.text
      },
      success : function (data){
       
        // console.log(data);
        // console.log(d.node.id);
        // console.log(d.node.text);

        for(i=0; i<data.length; i++){

          var idNode = "";

          if($("#" + data[i].id).length > 0) {
            // console.log("id_existente");

            idNode = data[i].id + "_" + Math.floor((Math.random() * 1000) + 1)
          }
          else{
            // .console.log("nuevo_id");

            idNode = data[i].id;
          }

          var default_son = next_nivel < 8 ? [{text: "cargando..."}] : [];

          var newNode = { 
              id:idNode, 
              text:data[i].name, 
              icon: "assets/images/dna.png", 
              attr: { "nivel": next_nivel },
              state: {'opened' : false},
              "children": default_son
            };

          $('#jstree-variables_sumidero').jstree("create_node", d.node, newNode, 'last', false, false);

        }

        // $("#jstree-variables").jstree(true).set_state ({"selected": false});
        $("#jstree-variables_sumidero").jstree(true).delete_node(d.node.children[0]);
        $("#jstree-variables_sumidero").jstree(true).set_icon(d.node.id, "./assets/images/dna.png");
        // return;

    }
  }); 

};


var loadNodesSumidero = function(e, d){

  console.log("tree ready");

    // se incrementa level para  asignar el nivel adecuado a los hijos de la raiz
    // la funcion es llamda dos veces, por tantro se decidio utilizar el arreglo + 1, en lufar de utilzar la variable global "level_vartree"
    level_vartree = parseInt(varfilter_selected_sumidero_bio[2]) + 1;
    console.log(level_vartree);

    $.ajax({

      url: url_trabajo,
      dataType : "json",
      type: "post",
      data: {
        "qtype" : "getVariables",
        "field" : field_vartree,
        "parentfield": parent_field_vartree,
        "parentitem" : value_vartree
      },
      success : function (data){

        var  current_node = $('#jstree-variables_sumidero').jstree(true).get_node($("#root"));
        
        // console.log(current_node);
        // console.log(data);
        // console.log(d.node.id);
        // console.log(d.node.text);

        // console.log("adding nodes");

        for(i=0; i<data.length; i++){

          var idNode = "";

          if($("#" + data[i].name).length > 0) {
            // console.log("id_existente");

            idNode = data[i].name + "_" + Math.floor((Math.random() * 1000) + 1)
          }
          else{
            // .console.log("nuevo_id");

            idNode = data[i].name;
          }

          var default_son = level_vartree < 8 ? [{text: "cargando..."}] : [];

          // console.log(idNode);

          var newNode = { 
              id:idNode, 
              text:data[i].name, 
              icon: "assets/images/dna.png", 
              attr: { "nivel": level_vartree },
              state: {'opened' : false},
              "children": default_son
            };

            // console.log(newNode);
            // console.log("");

          $('#jstree-variables_sumidero').jstree("create_node", current_node, newNode, 'last', false, false);

        }

        $("#jstree-variables_sumidero").jstree(true).set_icon(current_node.id, "./assets/images/dna.png");

    }
  }); 

}


$("#add_group_sumidero").click(function(){

  console.log("agregar variables");
  console.log(arrayVarSelectedSumidero.length);

  if(arrayVarSelectedSumidero.length == 0)
      return;


  $.each(arrayVarSelectedSumidero, function(index,item){
      // console.log(item);
      group_bio_selected_sumidero.set(item.level + "-" + item.id, {id: item.level + "-" + item.id, value: item.level + " >> " + item.label, level: item.level, parent: item.parent})
  })
  console.log(group_bio_selected_sumidero.values())

  updateVarSelArray(group_bio_selected_sumidero.values(), var_sel_arraySumidero)
  


  $("#treeAddedPanelSumidero").empty();
  var div_item = d3.select("#treeAddedPanelSumidero").selectAll("row_var_item")
    .data(group_bio_selected_sumidero.values())
    .enter()
  .append("div")
    .attr("class", "row_var_item")
    .attr("id",function(d){ return d.id})

  div_item
  .append("div")
    .attr("class", "text_var_item")
    .text(function(d){ 
      // console.log(d.value)
      return d.value
    })

  div_item
  .append("button")
      .attr("class","btn btn-danger glyphicon glyphicon-remove btn_item_var pull-right")
      .on("click",function(d){
            // console.log("remove item");
            d3.select(this.parentNode).remove();

            $.each(group_bio_selected_sumidero.values(), function(index,obj){
                  if(obj.id == d.id){
                      console.log(d);
                      group_bio_selected_sumidero.remove(obj.id);
                      return false;
                  }
              }) 
              updateVarSelArray(group_bio_selected_sumidero.values(), var_sel_arraySumidero);
              console.log(group_bio_selected_sumidero.values());
      });


  $('#jstree-variables_sumidero').jstree("destroy").empty();
  $('#jstree-variables_sumidero').off('open_node.jstree', getTreeVarSumidero);
  $("#jstree-variables_sumidero").off('changed.jstree',getChangeTreeVarSumidero);
  $("#jstree-variables_sumidero").off('ready.jstree',loadNodesSumidero);
  // $('#col_variable_').empty();
  $("#text_variable_sumidero").val("");

});


$("#clean_var_sumidero").click(function(){

  arrayVarSelectedSumidero = [];
  group_bio_selected_sumidero = d3.map([]);

  // $('#col_variable').empty();
  $('#treeAddedPanelSumidero').empty();
  $("#text_variable_sumidero").val("");
  $('#jstree-variables_sumidero').jstree("destroy").empty();
  $('#jstree-variables_sumidero').off('open_node.jstree', getTreeVarSumidero);
  $("#jstree-variables_sumidero").off('changed.jstree',getChangeTreeVarSumidero);
  $("#jstree-variables_sumidero").off('ready.jstree',loadNodesSumidero);


  for(i = 0; i < var_sel_arraySumidero.length; i++){ 
    if (var_sel_arraySumidero[i].type == 0){
      var_sel_arraySumidero.splice(i, 1);
      i = i-1;
    }
  }
  

});





/****************************************************************************************** sumidero bioblim */





$('ul.dropdown-menu li a.abiotica_sumidero').click(function (e) {

    // console.log(e.target.getAttribute("data-field"));
    // console.log(e.target.getAttribute("level-field"));
    // console.log(e);

    varfilter_selected_sumidero_abio = e.target.getAttribute("data-field");
    varfield = e.target.text;

    console.log("abiotico");

    $("#btn_variable_bioclim_sumidero").text(varfield);
    $("#btn_variable_bioclim_sumidero").append('<span class="caret"></span>');
    $("#text_variable_bioclim_sumidero").prop("disabled", false);
    $("#text_variable_bioclim_sumidero").val("");


    // console.log(e.target.attributes['level-field'].nodeValue);
    // console.log(e.target.attributes[0].nodeValue);
    
    if(parseInt(e.target.attributes['level-field'].nodeValue) == 0){

          // console.log("Bioclim");
          // console.log(e.target.text);

          $('#jstree-variables-bioclim_sumidero').jstree("destroy").empty();
          $("#jstree-variables-bioclim_sumidero").jstree({
             'plugins': ["wholerow", "checkbox"],
             'core': {
                 'data': data_bio,
                 'themes': {
                     'name': 'proton',
                     'responsive': true
                 },
                 'check_callback': true
             }
          });

          $("#jstree-variables-bioclim_sumidero").on('loaded.jstree',function(){
            $("#jstree-variables-bioclim_sumidero").on('changed.jstree',getChangeTreeVarBioclimSumidero);
          });

          

    }
    else{

          // console.log("Otro");
          // console.log(e.target.text);

          // arrayBioclimSelected = [];
          // $('#col_variable_added-bioclim').empty();
          $.ajax({

              url: url_trabajo,
              dataType : "json",
              type: "post",
              data: {
                "qtype" : "getVariablesBioclim",
                "field" : varfilter_selected_sumidero_abio
              },
              success : function (data){

                // console.log(data);
                $('#jstree-variables-bioclim_sumidero').jstree("destroy").empty();

                var tree_reinos = [{
                  "text": varfield,
                  "id": varfilter_selected_sumidero_abio,
                  attr: { "bid": varfilter_selected_sumidero_abio, "parent": varfield, "level": 1 },
                  'state' : {'opened' : true},
                  "icon": "assets/dist/themes/default/throbber.gif"
                }];

                $("#jstree-variables-bioclim_sumidero").jstree({
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

                $("#jstree-variables-bioclim_sumidero").on('changed.jstree',getChangeTreeVarBioclimSumidero);

                $("#jstree-variables-bioclim_sumidero").on('loaded.jstree',function(){

                    var  current_node = $('#jstree-variables-bioclim_sumidero').jstree(true).get_node($("#"+varfilter_selected_sumidero_abio));
                    console.log(current_node);

                    for(i=0; i<data.length; i++){

                        var idNode = "";
                        if($("#" + data[i].bid).length > 0) {
                          // console.log("id_existente");
                          idNode = data[i].bid + "_" + Math.floor((Math.random() * 1000) + 1)
                        }
                        else{
                          // .console.log("nuevo_id");
                          idNode = data[i].bid;
                        }

                        var default_son = level_vartree < 8 ? [{text: "cargando..."}] : [];

                        tag = String(data[i].tag).split(":")
                        min = tag[0].split(".")[0]
                        max = tag[1].split(".")[0]

                        var newNode = { 
                            id:idNode, 
                            text: min + " : " + max, 
                            icon: "assets/images/dna.png", 
                            attr: { "bid": data[i].bid, "parent": varfield, "level": 2 },
                            state: {'opened' : false},
                            "children": default_son
                          };

                        $('#jstree-variables-bioclim_sumidero').jstree("create_node", current_node, newNode, 'last', false, false);
                    }

                    $("#jstree-variables-bioclim_sumidero").jstree(true).set_icon(current_node.id, "./assets/images/dna.png");

                });

            }

          });

      
    }
    e.preventDefault();

});

var getChangeTreeVarBioclimSumidero = function(e, data){

    console.log("tree bioclim change");
    arrayBioclimSelectedSumidero = [];
    
    if ($('#jstree-variables-bioclim_sumidero').jstree(true).get_top_selected().length > 0){

        // console.log("acceder node header del dom");
        var headers_selected = $('#jstree-variables-bioclim_sumidero').jstree(true).get_top_selected().length;
        
        for(i=0; i<headers_selected; i++){
          // TAMBIEN ASI PUEDE SER RESUELTO EL TEMA DE NO RECARGAR NUEVAMENTE EL ARBOL CUANDO ES CONTRAIDO!!!!!!!!!!
          var  node_temp = $('#jstree-variables-bioclim_sumidero').jstree(true).get_node($('#jstree-variables-bioclim_sumidero').jstree(true).get_top_selected()[i]).original;
          // console.log(node_temp);
          arrayBioclimSelectedSumidero.push({label: node_temp.text, id: node_temp.attr.bid, parent: node_temp.attr.parent, level: node_temp.attr.level});
        }
    }

};

$("#add_group_bioclim_sumidero").click(function(){

    console.log("agregar variables bioclim");
    console.log(arrayBioclimSelectedSumidero);
    
    if(arrayBioclimSelectedSumidero.length == 0)
      return;


    $.each(arrayBioclimSelectedSumidero, function(index,item){
        // console.log(item);
        group_abio_selected_sumidero.set(item.level +"-"+item.id, {id:item.id, value: item.parent + " >> " + item.label, level: item.level})
    })

    updateAbioVarSelArray(group_abio_selected_sumidero.values(), var_sel_arraySumidero);

    $("#treeAddedPanelBioclimSumidero").empty();
    var div_item = d3.select("#treeAddedPanelBioclimSumidero").selectAll("row_var_item_bio")
      .data(group_abio_selected_sumidero.values())
      .enter()
    .append("div")
      .attr("class", "row_var_item_bio")
      .attr("id",function(d){ return d.id})

    div_item
    .append("div")
      .attr("class", "text_var_item")
      .text(function(d){ 
        // console.log(d.value)
        return d.value
      })

    div_item
    .append("button")
        .attr("class","btn btn-danger glyphicon glyphicon-remove btn_item_var_bio pull-right")
        .on("click",function(d){
              // console.log("remove item");
              d3.select(this.parentNode).remove();

              $.each(group_abio_selected_sumidero.values(), function(index,obj){
                    if(obj.id == d.id){
                        console.log(d);
                        group_abio_selected_sumidero.remove(obj.level+"-"+obj.id);
                        return false;
                    }
                }) 
                updateAbioVarSelArray(group_abio_selected_sumidero.values(), var_sel_arraySumidero);
                console.log(group_abio_selected_sumidero.values());
        });

    $('#jstree-variables-bioclim_sumidero').jstree("destroy").empty();

});


$("#clean_var_bioclim_sumidero").click(function(){

  arrayBioclimSelectedSumidero = [];
  group_abio_selected_sumidero = d3.map([]);

  $('#treeAddedPanelBioclimSumidero').empty();
  $('#jstree-variables-bioclim_sumidero').jstree("destroy").empty();
  // $("#jstree-variables").on('changed.jstree',getChangeTreeVar);
  // $("#jstree-variables").on('ready.jstree',loadNodes);


  for(i = 0; i < var_sel_arraySumidero.length; i++){
    if (var_sel_arraySumidero[i].type == 1){
      var_sel_arraySumidero.splice(i, 1);
      i = i-1;
    }
  }

  
});





/****************************************************************************************** D3 */

function getSourcetfilters(){


  // console.log(var_sel_array);
  filters = []

  for (i=0; i<var_sel_array.length; i++){

    itemGroup = var_sel_array[i];
    console.log(itemGroup);
    idFilterGroup++;
    console.log(idFilterGroup);

    if(itemGroup.type == 0){

      temp_item_field = itemGroup.value.toString().split(">>")[0].toLowerCase().trim();
      temp_item_value = itemGroup.value.toString().split(">>")[1].trim();
      // add parent text when exists
      temp_item_parent = itemGroup.parent ? itemGroup.parent : "";

      console.log(temp_item_parent);
      console.log(reino_campos[temp_item_field]);

      filters.push({
          'field' : reino_campos[temp_item_field],
          'value' : temp_item_value,
          'type'  : itemGroup.type,
          'parent': temp_item_parent,
          "fGroupId" : idFilterGroup,
          "grp" : 1
        });

    }
    else{
      filters.push({
          'value' : itemGroup.value,
          'type'  : itemGroup.type,
          'level' : parseInt(itemGroup.level),
          "fGroupId" : idFilterGroup,
          "grp" : 1
        });
    }
  }

  console.log("source: ")
  console.log(filters)

  return filters


}


function getTargetfilters(){


  // console.log(var_sel_array);
  filters = [];

  for (i=0; i<var_sel_arraySumidero.length; i++){

    itemGroup = var_sel_arraySumidero[i];
    console.log(itemGroup);
    idFilterGroup++;
    console.log(idFilterGroup);

    if(itemGroup.type == 0){

      temp_item_field = itemGroup.value.toString().split(">>")[0].toLowerCase().trim();
      temp_item_value = itemGroup.value.toString().split(">>")[1].trim();
      temp_item_parent = itemGroup.parent ? itemGroup.parent : "";

      console.log(reino_campos[temp_item_field]);

      filters.push({
          'field' : reino_campos[temp_item_field],
          'value' : temp_item_value,
          'type'  : itemGroup.type,
          'parent': temp_item_parent,
          "fGroupId" : idFilterGroup,
          "grp" : 2
        });

    }
    else{
      filters.push({
          'value' : itemGroup.value,
          'type'  : itemGroup.type,
          'level' : parseInt(itemGroup.level),
          "fGroupId" : idFilterGroup,
          "grp" : 2
        });
    }
  }

  console.log("target: ")
  console.log(filters)

  return filters


}



$("#generaRed").click(function(e){

  idFilterGroup = 0;
  
  // var url_trabajo = 
  // console.log(url_trabajo);

  s_filters = getSourcetfilters()
  t_filters = getTargetfilters()

  // console.log(s_filters);
  // console.log(t_filters);

  // for testing
  if (TESTING){
    getGraph(true,"");
    // getGraph(false,"");
    return
  }
  
  if(s_filters.length == 0 || t_filters.length == 0)
    return


  milliseconds = new Date().getTime();
  
  d3.json(url_trabajo + "t=" + milliseconds)
      .header("Content-Type", "application/json")
      .post(
        JSON.stringify({
          qtype: "getNodes", 
          s_tfilters: s_filters, 
          t_tfilters: t_filters}),
        function (error, d){
          if (error) throw error;
          
          getGraph(true, d, s_filters, t_filters);

          // it ensures that the dictionary of nodes is created before the link list is recived.
          d3.json(url_trabajo + "t=" + milliseconds)
            .header("Content-Type", "application/json")
            .post(
              JSON.stringify({
                qtype: "getEdges", 
                s_tfilters: s_filters, 
                t_tfilters: t_filters,
                ep_th: 0.0}),
              function (error, d){
                if (error) throw error;

                getGraph(false,d, s_filters, t_filters);});

        });

  

})



// links works by the index of the array, for that reason 
// we need a dictionary to create a relation between node and index
function createNodeDictionary(json, s_filters, t_filters){

  console.log("createNodeDictionary");  

  associativeArray = {};

  map_node = d3.map([]);

  $.each(json, function(i,item){
      
      // if(map_node.has(item.spid))
      //   item["change"] = true;
      // else
      //   item["part"] = false;
      
      map_node.set(item.spid, item);
  });
  
  // each node id has an index, 87456 -> 1, 87457 -> 2, ...
  $.each(map_node.values(), function(i,item){
    item["index"] = i;
    associativeArray[item.spid] =  item;
  });

  // Saving nodes for future issues, and with index added.
  json_nodes = map_node.values();

  // console.log(associativeArray);
  // console.log(json);

  getColorFilterGroups(map_node.values(), s_filters, t_filters);

}


function createLinkDictionary(json_file){

  console.log("createLinkDictionary");
  arrayLinks = [];

  // console.log(json_nodes);
  // console.log(associativeArray);
  // console.log(json_file);

  // replacing node id with the index of the node array
  $.each(json_file, function(i,item){

    // console.log(json_file[i]);
    // console.log(json_file[i].target);
    // console.log(associativeArray);

    associativeLinkArray = {}
    associativeLinkArray[ "source" ] = associativeArray[ json_file[i].source ].index;
    associativeLinkArray[ "source_node" ] = associativeArray[ json_file[i].source ];

    associativeLinkArray[ "target" ] = associativeArray[ json_file[i].target ].index;
    associativeLinkArray[ "target_node" ] = associativeArray[ json_file[i].target ];
    associativeLinkArray[ "value" ] = json_file[i].value;

    arrayLinks.push(associativeLinkArray);

  });

  // console.log(JSON.stringify(arrayLinks));
  // console.log(arrayLinks);
}

function getColorFilterGroups(json, s_filters, t_filters){

  console.log("getColorFilterGroups");
  
  var filters = s_filters.concat(t_filters);
  console.log(json);
  console.log(s_filters);
  console.log(t_filters);

  // return;
  
  $.each(filters, function(i,item){
    
    if(filters[i].type == 0){

      $.each(json, function(j,item){

        // console.log(filters[i].field);

        switch(filters[i].field){

          case "reinovalido":
            if(json[j].reinovalido == filters[i].value){
              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 6;
              }
              else if(json[j].stage > 6){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 6;
              }
            }
            break;
          case "phylumdivisionvalido":
            if(json[j].phylumdivisionvalido == filters[i].value){
              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 5;
              }
              else if(json[j].stage > 5){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 5;
              }
            }
            break;
          case "clasevalida":
            if(json[j].clasevalida == filters[i].value){
              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 4;
              }
              else if(json[j].stage > 4){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 4;
              }
            }
            break;
          case "ordenvalido":
            if(json[j].ordenvalido == filters[i].value){
              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 3;
              }
              else if(json[j].stage > 3){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 3;
              }
            }
            break;
          case "familiavalida":
            if(json[j].familiavalida == filters[i].value){
              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 2;
              }
              else if(json[j].stage > 2){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 2;
              }
            }
            break;
          case "generovalido":
            if(json[j].generovalido == filters[i].value){
              
              if(!json[j].group){
                json[j].group = filters[i].fGroupId;
                json[j].stage = 1;
              }
              else if(json[j].stage > 1){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 1;
              }   
            }
            break;

          case "epitetovalido":
            
            if(json[j].label.split(" ")[1] == filters[i].value){
              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 0;
              }
              else if(json[j].stage > 0){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 0;
              }
            }
            break;
        
        }
      
      });
  
    }
    else{

      // console.log(filters[i].value);
      // console.log(filters[i].type);

      $.each(json, function(j,item){

        if(json[j].reinovalido == "Animalia" || json[j].reinovalido == "Plantae" || json[j].reinovalido == "Fungi"
          || json[j].reinovalido == "Prokaryotae" || json[j].reinovalido == "Protoctista")
          return true;

        switch(filters[i].level){

          case 0:
            // console.log(json_nodes[j].reinovalido);
            json[j].group = filters[i].fGroupId;
            json[j].stage = 2;

            break;

          case 1:
            if(json[j].reinovalido == filters[i].value){
              
              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 1;
              }
              else if(json[j].stage > 1){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 1;
              }

            }
              // json[j].group = filters[i].fGroupId;
            break;

          case 2:
            if(json[j].spid == filters[i].value){

              if(!json[j].group){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 0;
              }
              else if(json[j].stage > 0){
                  json[j].group = filters[i].fGroupId;
                  json[j].stage = 0;
              }

            }
              // json[j].group = filters[i].fGroupId;
            break;
        
        }
      
      });

    }
  
  });

}


function nodeFilter(epsilon){

  console.log("nodeFilter");
  // console.log(arrayLinks);
  // console.log(epsilon.length)
  
  arrayTemp = [];
  indexVisibleNodes = [];

  for(i = 0; i < arrayLinks.length; i++){

    if(arrayLinks[i].value > epsilon){

      // if(!by_component){
      //   indexVisibleNodes.push(arrayLinks[i].source);
      //   indexVisibleNodes.push(arrayLinks[i].target);
      // }
      // else{
        indexVisibleNodes.push(arrayLinks[i].source_node.index);
        indexVisibleNodes.push(arrayLinks[i].target_node.index); 
      // }

      arrayLinks[i].source = arrayLinks[i].source_node.index;
      arrayLinks[i].target = arrayLinks[i].target_node.index;

      arrayTemp.push(arrayLinks[i]);
    }
  }

  return arrayTemp;

}



function getGraph(is_node, json, s_filters, t_filters){



  if (TESTING){

    // static files used to test the changes, it's in order to avoid input values each time that some features are changed.
    d3.json("/javascripts/nodes_mammalia.json", function(error, json_file) {
    // d3.json("/javascripts/nodes_mammalia_amphibia.json", function(error, json_file) {
      // if (error) return console.warn(error);
      json_nodes = json_file;

      d3.json("javascripts/links_mammalia.json", function(error, json_temp) {
      // d3.json("javascripts/links_mammalia_amphibia.json", function(error, json_temp) {
        // if (error) return console.warn(error);
        arrayLinks = json_temp;
        // console.log(json_nodes);
        // console.log(arrayLinks);
        arrayTemp = [];
        // arrayVisibleNodes = [];
        createGraph(arrayTemp);

      });

    });
    
  }
  else{

    // node function is first executed
    if(is_node){

      createNodeDictionary(json, s_filters, t_filters);
    
    }else{

      createLinkDictionary(json);  

      // if(arrayLinks.length > 10000){
      //   alert("Numero de aristas exceden memoria del explorador, intente un relación mas pequeña");
      //   return;
      // }
      
      max_eps = d3.max(arrayLinks.map(function(d) {return d.value;}));
      min_eps = d3.min(arrayLinks.map(function(d) {return d.value;}));
      // console.log(min_eps);

      // var arrayTemp = getVisibleNodes([min_eps,max_eps], true);
      // arrayTemp = arrayLinkVisible[0];
      // arrayVisibleNodes = arrayLinkVisible[1];
      // createGraph(arrayTemp, arrayVisibleNodes);
      createGraph(arrayLinks);

    }

  }

}




function getVisibleNodes(epsilonArray, firstLoad){

  console.log("getVisibleNodes");
  console.log(epsilonArray);


  if(firstLoad == true){
    max_eps = d3.max(epsilonArray, function(d) {return d;});
    min_eps = d3.min(epsilonArray, function(d) {return d;});
  }
  else{
    min_eps = d3.min(epsilonArray.map(function(d) {return d.lbean;}));
    max_eps = d3.max(epsilonArray.map(function(d) {return d.rbean;}));
  }

  console.log(max_eps);
  console.log(min_eps);
  // console.log(arrayLinks);

  arrayTemp = [];
  indexVisibleNodes = [];


  for(i = 0; i < arrayLinks.length; i++){

    if(firstLoad == true && arrayLinks[i].value >= min_eps){

      // existen elemntos repetidos en este arraglo, ya que un nodo puede tener mas de dos conexiones
      // indexVisibleNodes.push(arrayLinks[i].source_node.index);
      // indexVisibleNodes.push(arrayLinks[i].target_node.index); 


      // Esta operacion se esta repitiendo, esa asignando el index cuando fue asignado previemnte!!!!!!
      arrayLinks[i].source = arrayLinks[i].source_node.index;
      arrayLinks[i].target = arrayLinks[i].target_node.index;
      arrayTemp.push(arrayLinks[i]);

    }
    else if(arrayLinks[i].value > max_eps || arrayLinks[i].value < min_eps){

      
      // indexVisibleNodes.push(arrayLinks[i].source_node.index);
      // indexVisibleNodes.push(arrayLinks[i].target_node.index); 

      arrayLinks[i].source = arrayLinks[i].source_node.index;
      arrayLinks[i].target = arrayLinks[i].target_node.index;

      arrayTemp.push(arrayLinks[i]);
    }

  }

  // console.log(arrayTemp);

  // return [arrayTemp, indexVisibleNodes];
  return arrayTemp;

}

var graphHeight;
var histHeight;
var mapHeight;
var current_node_estado = d3.range(1,33,1);

var NUM_BEANS = 21;
var epsilon_beans;
var epsRange;

var links_sp;
var dim_eps_freq;
var group_eps_freq;
var dim_node_state;
var dim_src;
var group_eps_spname;
var nestByR;
var nestBySrc;


function loadMap(json){


  /********************************************************************************************/

  nestByR = d3.nest()
        .key(function(d) { 
            return d.value });

  nestBySrc = d3.nest()
        .key(function(d) { 
            return d.source });

  epsilon_beans = d3.range(1,NUM_BEANS,1);
    // console.log(epsilon_beans);

    var min_eps = d3.min(json.links.map(function(d) {return parseFloat(d.value);}));
    var max_eps = d3.max(json.links.map(function(d) {return parseFloat(d.value);}));
    // console.log(min_eps);
    // console.log(max_eps);

  epsRange = d3.scale.quantile().domain([min_eps, max_eps]).range(epsilon_beans);
    // domain_array = epsRange.quantiles();
    // console.log(domain_array);

  console.log("dim_node_state CROSSFILTER");

  links_sp = crossfilter(json.links),

    all = links_sp.groupAll(),
    
    dim_eps_freq = links_sp.dimension(function(d) { 
      return parseFloat(d.value); 
    }),

    group_eps_freq = dim_eps_freq.group(function(d) { 
        return epsRange(d);
    }),

    dim_src = links_sp.dimension(function(d) { 
      return d; 
    }),

    group_eps_spname = dim_src.group(),

    dim_node_state = links_sp.dimension(function(d) { 
        return d;  
    });

  /********************************************************************************************/


  if(map){
    // remove layers!!
    return;
  }

  mapHeight = $(window).height() * .65;
  graphHeight = $(window).height() * .651;
  histHeight = $(window).height() * .10;



  $("#map").height(mapHeight);

  document.getElementById("map_panel").style.display = "inline";
  document.getElementById("graph_map_comunidad").style.display = "inline";


  OSM_layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

  // milliseconds = new Date().getTime();
  // url = url_geoserver + "t=" + milliseconds;
  // espacio_capa = workspace + ":sp_grid_terrestre";
  // grid_wms = L.tileLayer.betterWms(url, {
  //         layers: espacio_capa,
  //         crossDomain: true,
  //         // dataType: "jsonp",
  //         transparent: true,
  //         format: 'image/png'
  //       });

  map = L.map('map', {
      center: [23.5, -101],
      zoom: 5,
      layers: [
        OSM_layer
        // , grid_wms
        ]
  });
  map.scrollWheelZoom.disable();

  baseMaps = {"Open Street Maps": OSM_layer};
  overlayMaps = {/*"Malla": grid_wms*/};
  layer_control = L.control.layers(baseMaps,overlayMaps).addTo(map);

  // it loads the D3 grid in EPGS:4326 projection (it needs update when the zoom it's made)
  loadD3Grid();
  
}

function loadD3Grid(){

  console.log("loadD3Grid");

  // var svg = d3.select(map.getPanes().overlayPane).append("svg"),
  //     g = svg.append("g")
  //       .attr("class", "leaflet-zoom-hide")
  //       .style("fill", "none");


  // // map._initPathRoot();
  // // var svg = d3.select("#map").select("svg"),
  // //     g = svg.append("g")
  // //       .attr("class", "map_grid")
  // //       // .attr("width", $("#map").width())
  // //       // .attr("height", $("#map").height())
  // //       .style("fill", "none");


  // d3.json(grid_geojson, function (json) {

  //     // console.log(json.features);

  //     var transform = d3.geo.transform({point: projectPoint}),
  //         path = d3.geo.path().projection(transform);

  //     var feature = g.selectAll("path")
  //         .data(json.features)
  //       .enter().append("path");

  //     map.on("viewreset", reset);
  //     reset();

  //     // Reposition the SVG to cover the features.
  //     function reset() {
  //       var bounds = path.bounds(json),
  //           topLeft = bounds[0],
  //           bottomRight = bounds[1];

  //       svg.attr("width", bottomRight[0] - topLeft[0])
  //           .attr("height", bottomRight[1] - topLeft[1])
  //           .style("left", topLeft[0] + "px")
  //           .style("top", topLeft[1] + "px");

  //       g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

  //       feature.attr("d", path)
  //             .style("stroke", "steelblue");
  //     }

  //     // Use Leaflet to implement a D3 geometric transformation.
  //     function projectPoint(x, y) {
  //       var point = map.latLngToLayerPoint(new L.LatLng(y, x));
  //       this.stream.point(point.x, point.y);
  //     }


  //     // create geo.path object, set the projection to merator bring it to the svg-viewport
  //     // var path = d3.geo.path()
  //     //     .projection(
  //     //         // d3.geo.transverseMercator()
  //     //         d3.geo.mercator()
  //     //         // .scale(2100)
  //     //         .scale(1287)
  //     //         .translate([2565, 875])
  //     //       );

      
  //     //draw svg lines of the boundries
  //     // g.append("g")
  //     //     .attr("class", "map_grid")
  //     // g.selectAll("path")
  //     //     .data(json.features)
  //     //     .enter()
  //     //     .append("path")
  //     //     .attr("d", path)
  //     //     .style("fill", "none")
  //     //     .style("stroke-width", 1)
  //     //     .style("stroke", "steelblue");

  // });

  $.ajax({
    url: url_trabajo,
    type : 'post',
    dataType : "json",
    data : {
      "qtype" : "getGridGeoJson",
    },
    success : function (json){

      var svg = d3.select(map.getPanes().overlayPane).append("svg"),
          g = svg.append("g")
            .attr("id","grid_item")
            .attr("class", "leaflet-zoom-hide")
            .style("fill", "none");


      var transform = d3.geo.transform({point: projectPoint}),
          path = d3.geo.path().projection(transform);

      var feature = g.selectAll("path")
          .data(json.features)
        .enter().append("path");

      map.on("viewreset", reset);
      
      reset();

      // Reposition the SVG to cover the features.
      function reset() {

        var bounds = path.bounds(json),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", path)
              .attr("id",function(d){
                return d.properties.gridid;
              })
              // .style("stroke", "black")
              .style("stroke", "none");

      }

      // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }

    },
    error : function (){
      alert("Existe un error en la conexión con el servidor, intente mas tarde");
    }

  });

}

function loadStatesLayer(){

  console.log("loadStatesLayer");

  if(states_layer)
    return;

  $.ajax({
    url: url_trabajo,
    type : 'post',
    dataType : "json",
    data : {
      "qtype" : "getStates",
    },
    success : function (d){

      // console.log(d);
      console.log("JSON recibido");
      
      try {
        states_layer.clearLayers();
        layer_control.removeLayer(states_layer);
      } catch (e) {
        console.log("primera vez");
      }

      var states_polygons = [];
      
      for(i=0; i<d.length; i++){

        // polygons array
        states_polygons.push({ "type": "Feature",
                    "properties": {
                        "name" : d[i].name,
                        "cve" : d[i].cve
                      },
                              "geometry": JSON.parse(d[i].json_geom)
                            });

        
      }

      console.log("construyendo mapa");

      results = setupStatesLayer(states_polygons, arrayLayerStates, 'jstree-estados');
      states_layer = results[0];
      arrayLayerStates = results[1];
      states_layer.addTo(map);
      layer_control.addOverlay(states_layer, "Estados");

    },
    error : function (){
      alert("Existe un error en la conexión con el servidor, intente mas tarde");
    }

  });

};


function setupStatesLayer(polygons, array_items, id_div){

  console.log("setupStatesLayer");

  // console.log(species_points);
  var geojsonFeature =  { "type": "FeatureCollection",
    "features": polygons};

  layer_temp = L.geoJson(geojsonFeature, {
      style: geojsonStyleDefault,
      
      onEachFeature: function (feature, layer) {

          layer.on("mouseover", function (e) {
            layer.setStyle(geojsonMouseOverStyle);
          });

          layer.on("mouseout", function (e) {
              layer.setStyle(geojsonStyleDefault); 
          });

          layer.on("click", function (e) {
            // actualiza seleccion y deselección de elementos
            

            for(i=0; i<array_items.length; i++){

                if (array_items[i].cve == feature.properties.cve){

                    if(array_items[i].selected == true){


                        array_items[i].layer.setStyle(geojsonStyleDefault);
                        array_items[i].layer.on("mouseout", function (e) {
                                          layer.setStyle(geojsonStyleDefault); 
                                      });
                        array_items[i].layer.on("mouseover", function (e) {
                                        layer.setStyle(geojsonMouseOverStyle);
                                      });
                        array_items[i].selected = false;

                        
                    }
                    else{
                        
                        array_items[i].layer.setStyle(geojsonHighlightStyle);
                        array_items[i].layer.off('mouseout');
                        array_items[i].layer.off('mouseover');
                        array_items[i].selected = true; 
                      
                    }

                    break;
                  }
              }

              current_node_estado = [];
              array_items.forEach(function(item){
                if(item.selected)
                  current_node_estado.push(item.cve);
                  // console.log(item.cve);
              });
              if (current_node_estado.length == 0){
                current_node_estado = d3.range(1,33,1);
              }

              dim_node_state.filterFunction(function(d) { 
                  // console.log(d);
                  exists = false;
                  $.each(d.target_node.arg_estados, function( index, value ) {
                      if($.inArray(value, current_node_estado) != -1){
                        exists = true;
                        return false;
                      }
                  });

                  if(exists){
                    // console.log(current_node_estado);
                    // console.log(d.target_node.label);
                    // console.log(d.target_node.arg_estados);
                    // console.log(d.source_node.arg_estados);
                    // console.log(d.target_node.arg_estados);
                    return true; 
                  }
                  // else{
                  //   // console.log("false");
                  //   return false
                  // }
              });

              renderAll();


          });

          array_items.push({
            "layer"   : layer,
            "cve"   : feature.properties.cve,
            "selected"  : false
          });

          

      }
  });

return [layer_temp, array_items];

}


function createGraph(arrayTemp){

  console.log("createGraph");
  
  $("#graph").empty();
  $("#hist").empty();
  
  if(TESTING){
    var json = {"nodes":json_nodes, "links":arrayLinks};
  }
  else{
    var json = {"nodes":json_nodes, "links":arrayTemp};  
  }

  // console.log(json.links);
  // selectableForceDirectedGraph(json, arrayVisibleNodes);
  // createEpsilonHistrogram(json);

  document.getElementById("tbl_hist_comunidad").style.display = "inline";
  
  // it needs a warranty that the states layer is added before a node selection happen
  // console.log(json);

  loadMap(json);
  viewCreation(json);
  loadStatesLayer();
  adjust = $(window).height() - 40;
  console.log("adjust: " + adjust);
  $("html, body").animate({ scrollTop: ( adjust / NUM_SECTIONS ) }, 1000);

  
}

$("#limpiaRed").click(function (){

  console.log("limpia red");
  $("#graph").empty();
  $("#hist").empty();

});


