
/***************************************************************** Layer creation */

/*var mapbox_layer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'charlee88.ciecbcon3000cs0lzic48y376',
    accessToken: 'pk.eyJ1IjoiY2hhcmxlZTg4IiwiYSI6ImZhMGJlOWM4NTRlN2Y5MzE5YzRjYjgyOTJhMTU5NjY4In0.L8PLvnefpI3dFO3KWAr2Iw'
});*/

mapquestLink = '<a href="http://www.mapquest.com//">MapQuest</a>';
mapquestPic = '<img src="http://developer.mapquest.com/content/osm/mq_logo.png">';

/*var mapquest_layer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', {
    attribution: 'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency. Tiles courtesy of '+mapquestLink+mapquestPic,
    maxZoom: 18,
    subdomains: '1234',
});*/

var OSM_layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

//var thunderforest_layer = new L.TileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png');
//var water_color_layer = new L.StamenTileLayer("watercolor");
var drawnItems = new L.FeatureGroup();

// delegaciones
// var estados_wms = L.tileLayer.wms("http://localhost:8080/geoserver/conabio/wms", {
//     layers: 'conabio:entidades_mexico',
//     format: 'image/png',
//     transparent: true,
//     version: '1.1.0',
//     attribution: "myattribution"
// });

var estados_wms = L.tileLayer.betterWms("http://localhost:8080/geoserver/conabio/wms", {
        layers: 'conabio:entidades_mexico',
        dataType: "jsonp",
        transparent: true,
        format: 'image/png'
      });




/***************************************************************** map switcher */

var map = L.map('map', {
    center: [23.5, -99],
    zoom: 5,
    layers: [OSM_layer, estados_wms, drawnItems]
});

/***************************************************************** layer switcher */

var baseMaps = {
    //"MapBox": mapbox_layer,
    //"OSM": OSM_layer,
    "Open Street Maps": OSM_layer
    //"MapBox": mapbox_layer

};
var overlayMaps = {
    "Selección": drawnItems,
    "Estados": estados_wms
};

L.control.layers(baseMaps,overlayMaps).addTo(map);


/***************************************************************** layer wfs */
//
// var owsrootUrl = 'http://localhost:8080/geoserver/conabio/ows';
//
// var defaultParameters = {
//     service : 'WFS',
//     version : '2.0',
//     request : 'GetFeature',
//     typeName : 'conabio:entidades_mexico',
//     outputFormat : 'text/javascript',
//     format_options : 'callback:getJson',
//     SrsName : 'EPSG:4326'
// };
// //
// var parameters = L.Util.extend(defaultParameters);
// var URL = owsrootUrl + L.Util.getParamString(parameters);
// var estados_wms = null;
//
// console.log("peticion");
// var ajax = $.ajax({
//     url : URL,
//     dataType : 'jsonp',
//     jsonpCallback : 'getJson',
//     success : function (response) {
//
//         estados_wms = L.geoJson(response, {
//             style: function (feature) {
//                 return {
//                     stroke: false,
//                     fillColor: 'FFFFFF',
//                     fillOpacity: 0
//                 };
//             }
//             ,
//             onEachFeature: function (feature, layer) {
//                 popupOptions = {maxWidth: 200};
//                 layer.bindPopup(feature.properties.nom_ent
//                     ,popupOptions);
//             }
//         });
//         overlayMaps["estados"] = estados_wms;
//
//         console.log(estados_wms);
//     },
//     error : function (error) {
//       console.log(error);
//     }
// });

/***************************************************************** custom controls */



/*
var ModifyPolygonControl =  L.Control.extend({

  options: {
    position: 'topleft'
  },

  onAdd: function (map) {

  	var span_icon = document.createElement('span');
	span_icon.setAttribute("class","glyphicon glyphicon-edit");
	span_icon.setAttribute("title","Edita poligono");

    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.appendChild(span_icon);
    container.style.backgroundColor = 'white';
    container.style.width = '25px';
    container.style.height = '25px';

    container.onclick = function(){
      console.log('buttonClicked');
    }

    return container;
  }
});

map.addControl(new ModifyPolygonControl());


var ClearPolygonControl =  L.Control.extend({

  options: {
    position: 'topleft'
  },

  onAdd: function (map) {

  	var span_icon = document.createElement('span');
	span_icon.setAttribute("class","glyphicon glyphicon-trash");
	span_icon.setAttribute("title","Borra poligonos");

    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.appendChild(span_icon);
    container.style.backgroundColor = 'white';
    container.style.width = '25px';
    container.style.height = '25px';

    container.onclick = function(){
      console.log('buttonClicked');
    }

    return container;
  }
});

map.addControl(new ClearPolygonControl());


var PanelDataControl =  L.Control.extend({

  options: {
    position: 'topleft'
  },

  onAdd: function (map) {

  	var span_icon = document.createElement('span');
	span_icon.setAttribute("class","glyphicon glyphicon-align-justify");
	span_icon.setAttribute("title","Despliega panel");

    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.appendChild(span_icon);
    container.style.backgroundColor = 'white';
    container.style.width = '25px';
    container.style.height = '25px';

    container.onclick = function(){
      console.log('buttonClicked');
    }

    return container;
  }
});

map.addControl(new PanelDataControl());
*/

//L.control.scale().addTo(map);
//L.control.fullscreen().addTo(map);

/*var mapbox_mini_layer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    minZoom: 0,
    maxZoom: 13,
    id: 'charlee88.ciecbcon3000cs0lzic48y376',
    accessToken: 'pk.eyJ1IjoiY2hhcmxlZTg4IiwiYSI6ImZhMGJlOWM4NTRlN2Y5MzE5YzRjYjgyOTJhMTU5NjY4In0.L8PLvnefpI3dFO3KWAr2Iw'
});*/
/*
var mapquest_mini_layer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', {
    attribution: 'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency. Tiles courtesy of '+mapquestLink+mapquestPic,
    minZoom: 0,
    maxZoom: 13,
    subdomains: '1234',
});
*/

// var OSM_mini_layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
//
// var miniMap = new L.Control.MiniMap(OSM_mini_layer, {
// 	toggleDisplay: true
// 	//position: 'bottomleft'
// }).addTo(map);

L.drawLocal.draw.toolbar.buttons.polygon = 'Selecciona región';
L.drawLocal.draw.toolbar.buttons.circle = 'Selecciona región';
L.drawLocal.draw.toolbar.buttons.rectangle = 'Selecciona región';
L.drawLocal.draw.toolbar.buttons.edit = 'Edita región';

var drawControl = new L.Control.Draw({
	position: 'topleft',
	draw: {
		polyline: false,
		polygon: {
			allowIntersection: false,
			showArea: true,
			drawError: {
				color: '#5B7CF4',
				timeout: 1000
			},
			shapeOptions: {
				color: '#5B7CF4'
			}
		},
		circle: {
			shapeOptions: {
				color: '#5B7CF4'
			}
		},
		marker: false,
		rectangle: {
			shapeOptions: {
				color: '#5B7CF4'
			}
		}
	},
	edit: {
		featureGroup: drawnItems,
		remove: true
	}
});


//drawControl.setDrawingOptions({ rectangle: { shapeOptions: { color: '#64D232' } } });

map.on('draw:created', function (e) {
	var type = e.layerType,
		layer = e.layer;

	if (type === 'marker') {
		layer.bindPopup('A popup!');
	}

	drawnItems.addLayer(layer);
});

map.on('draw:edited', function (e) {
	var layers = e.layers;
	var countOfEditedLayers = 0;
	layers.eachLayer(function(layer) {
		countOfEditedLayers++;
	});
	console.log("Edited " + countOfEditedLayers + " layers");
});

map.on('draw:edited', function (e){
	/*var layers = e.layers._layers;

	var latlngs
	var lng,
	lat,
	coords = [];

	for (var key in layers)
	{
		console.log(layers[key]);
		latlngs = layers[key].getLatLngs();
		break;
	}

	for (var i = 0; i < latlngs.length; i++)
	{
		latlngs[i]
		coords.push(latlngs[i].lng + " " + latlngs[i].lat);
		if (i === 0)
		{
			lng = latlngs[i].lng;
			lat = latlngs[i].lat;
		}
	};
	var wktext = "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))"
	console.log(wktext);*/

});


/* functions to handle the control panel ******************/

var carousel = $("#myCarousel")
carousel.carousel('pause');


$('#panel-tools').on('show.bs.collapse', function (e) {
  e.stopPropagation();
  console.log(e.currentTarget.id);
  console.log("ADD");
  map.addControl(drawControl);
});

$('#panel-tools').on('hide.bs.collapse', function (e) {
  e.stopPropagation();
  console.log(e.currentTarget.id);
  console.log("ADD");
  map.removeControl(drawControl);
});

$("#button_next").click(function(){

  if (document.getElementById("indicator1").classList.contains("active")) {
    console.log("entra1-2");
    $('#indicator1').removeClass('active');
    $('#indicator2').addClass('active');

  }
  else if (document.getElementById("indicator2").classList.contains("active")) {
    console.log("entra2-3");
    $('#indicator2').removeClass('active');
    $('#indicator3').addClass('active');
    //map.removeControl(drawControl);

  }
  else if (document.getElementById("indicator3").classList.contains("active")) {

    console.log("entra3");

  }

});


$("#button_previous").click(function(){

  if (document.getElementById("indicator1").classList.contains("active")) {
    console.log("first indicator");

  }
  else if (document.getElementById("indicator2").classList.contains("active")) {
    console.log("entra2-1");
    $('#indicator2').removeClass('active');
    $('#indicator1').addClass('active');
    //map.removeControl(drawControl);

  }
  else if (document.getElementById("indicator3").classList.contains("active")) {
    console.log("entra3-2");
    $('#indicator3').removeClass('active');
    $('#indicator2').addClass('active');

  }

});

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}


$("#nom_sp").autocomplete({
	source : function (request, response){
    console.log(request);
    console.log(response);

		$.ajax({
			// url : "http://geoportal.conabio.gob.mx/snib?",
      url : "http://localhost:3000/autocomplete",
			dataType : "json",
      type: "post",
			data :{
				searchStr : request.term,
				qtype : 'getEntList',
				limit : 30,
				start : 0,
				field : 'nom_sp'
			},
			success : function (data){
        console.log(data);
				response($.map(data, function (item){
						return{
							label : item.ent.nom_sp,
							id : item.ent.spid,
							abbrev : item.ent.nom_sp
						};
					})
        );
			}
		});
	},
	minLength : 2,
	change : function (event, ui){
		if (!ui.item){
			$("#nom_sp").val("");
		}
	},
	select : function (event, ui){
		/*$('#state_id').val(ui.item.id);
		$('#abbrev').val(ui.item.abbrev);
		$('#spid').val(ui.item.id);
		$('#enviar').prop("disabled", false);*/
	}
});

$('#jstree-estados').jstree({
       'plugins': ["wholerow", "checkbox"],
       'core': {
           'data': [{
                   "text": "Wholerow with checkboxes",
                   "children": [{
                       "text": "initially selected",
                       "state": {
                           "selected": true
                       }
                   }, {
                       "text": "custom icon URL",
                       "icon": "./assets/images/tree_icon.png"
                   }, {
                       "text": "initially open",
                       "state": {
                           "opened": true
                       },
                       "children": ["Another node"]
                   }, {
                       "text": "custom icon class",
                       "icon": "glyphicon glyphicon-leaf"
                   }]
               },
               "And wholerow selection"
           ],
           'themes': {
               'name': 'proton',
               'responsive': true
           }
       }
   });

   $('#jstree-variables').jstree({
          'plugins': ["wholerow", "checkbox"],
          'core': {
              'data': [{
                      "text": "Wholerow with checkboxes",
                      "children": [{
                          "text": "initially selected",
                          "state": {
                              "selected": true
                          }
                      }, {
                          "text": "custom icon URL",
                          "icon": "./assets/images/tree_icon.png"
                      }, {
                          "text": "initially open",
                          "state": {
                              "opened": true
                          },
                          "children": ["Another node"]
                      }, {
                          "text": "custom icon class",
                          "icon": "glyphicon glyphicon-leaf"
                      }]
                  },
                  "And wholerow selection"
              ],
              'themes': {
                  'name': 'proton',
                  'responsive': true
              }
          }
      });



/*
var PanelTaxonControl =  L.Control.extend({

  options: {
    position: 'bottomleft'
  },

  onAdd: function (map) {

  	var container = L.DomUtil.create('div', 'panel-primary');
  	var header_panel = L.DomUtil.create('div', 'panel-heading', container);
  	header_panel.innerHTML = "Atributos";
  	var body_panel = L.DomUtil.create('div', 'panel-body', container);



  	var reino_input = L.DomUtil.create('input', 'form-control', body_panel);
  	reino_input.id = "reino_input";
  	reino_input.type = "text";
  	reino_input.placeholder = "Introduce reino";
  	var phylum_input = L.DomUtil.create('input', 'form-control', body_panel);
  	phylum_input.type = "text";
  	phylum_input.placeholder = "Introduce phylum";
  	var clase_input = L.DomUtil.create('input', 'form-control', body_panel);
  	clase_input.type = "text";
  	clase_input.placeholder = "Introduce clase";
  	var orden_input = L.DomUtil.create('input', 'form-control', body_panel);
  	orden_input.type = "text";
  	orden_input.placeholder = "Introduce orden";
  	var familia_input = L.DomUtil.create('input', 'form-control', body_panel);
  	familia_input.type = "text";
  	familia_input.placeholder = "Introduce familia";
  	var genero_input = L.DomUtil.create('input', 'form-control', body_panel);
  	genero_input.type = "text";
  	genero_input.placeholder = "Introduce genero";
  	var genero_input = L.DomUtil.create('input', 'leaflet-control btn btn-primary', body_panel);
  	genero_input.type = "button";
  	genero_input.value = "Buscar";


    return container;
  }
});

map.addControl(new PanelTaxonControl());

*/
