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


