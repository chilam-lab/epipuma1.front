

/**
 * Módulo histograma, utilizado para crear y gestionar los histogramas en nicho ecológico y comunidad ecológica.
 *
 * @namespace histogram_module
 */
var histogram_module = (function (verbose) {

    var _VERBOSE = verbose;
    var _table_module_decil, _language_module_nicho, _display_module_nicho;
    var _highlight_color = "#48D7D5";
    var _iTrans;
    var _NUM_DECIL = 10;
    
    function setDisplayModule(displayModule) {
        _display_module_nicho = displayModule;
    }



    /**
     * Método setter del módulo table.
     *
     * @function setTableModule
     * @public
     * @memberof! histogram_module
     * 
     * @param {object} tableModule - Módulo table
     */
    function setTableModule(tableModule) {
        _table_module_decil = tableModule;
    }


    /**
     * Método setter del módulo de internacionalización.
     *
     * @function setLanguageModule
     * @public
     * @memberof! histogram_module
     * 
     * @param {object} languageModule - Módulo de internacionalización.
     */
    function setLanguageModule(languageModule) {
        _language_module_nicho = languageModule;
        _iTrans = _language_module_nicho.getI18();
    }

    /**
     * Éste método inicializa variables globales y componentes visuales que son necesarios para la creación de histogramas.
     *
     * @function _initilizeHistogram
     * @private
     * @memberof! histogram_module
     * 
     */
    function _initilizeHistogram() {

        _VERBOSE ? console.log("_initilizeHistogram") : _VERBOSE;

        $('#lb_header_info').text(_iTrans.prop('lb_index_hist_decil'));
        $('#lb_body_info').text(_iTrans.prop('lb_msg_graf_decil'));

    }
    
    function addTooltipBarChart(svg){
        
        // POPUP DE
        var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) {
                    
//                    console.log(d);

                    var var_group_label = "<strong>" + d.name + "</strong><br/>" +
                            "<strong>" + _iTrans.prop('lb_score_conjunto') + ":</strong> <span >" + parseFloat(d.avg).toFixed(2) + "</span><br/><br/>";
//                            "<strong>" + _iTrans.prop('lb_conformado') + ":</strong><br/><br/>";
//
//                    d.value.s.forEach(function (item, index) {
//                        
//                        if(d.name.p === "Total"){
//                            var_group_label += "<strong>" + _iTrans.prop('lb_grupo') + ":</strong> <span >" + d.name.s[index] + "</span><br/>" +
//                                "<strong>" + _iTrans.prop('tip_tbl_score') + ":</strong> <span >" + item + "</span><br/><br/>";
//                        }
//                        else{
//                            var_group_label += "<strong>" + _iTrans.prop('lb_grupo') + ":</strong> <span >" + d.name.s[index*10] + "</span><br/>" +
//                                "<strong>" + _iTrans.prop('tip_tbl_score') + ":</strong> <span >" + item + "</span><br/><br/>";
//                        }
//                        
//                    });

                    return  var_group_label;

                });

        svg.call(tip);
        
        return tip;
    }
    
    
    function groupDataByAtributte(json_decil){
        
        _VERBOSE ? console.log("groupDataByAtributte") : _VERBOSE;
        
        var verticalData = [];
        
        var size = json_decil.length;
        var num_decile = _NUM_DECIL;
        
        
        for(var i=0; i<num_decile; i++){
            
            for(var j=0; j<size; j++){
            
                var decil_item = json_decil[j].data[i];
//                console.log(decil_item);
                
                if(!verticalData[i]){
                    
                    verticalData.push({
                            decil: decil_item.decil,
                            value: [{ name: json_decil[j].gpo_name, avg:decil_item.avg, decil: decil_item.decil, children: json_decil[j].names  }]
                        });
                    
                }
                else{
                    
//                    console.log(verticalData[i]);
                    verticalData[i].value.push({ name: json_decil[j].gpo_name, avg:decil_item.avg, decil: decil_item.decil, children: json_decil[j].names });
                    
                }    

            }
            
        }
        
        console.log(verticalData);
        return verticalData;
        
    }


    /**
     * Éste método crea el histograma de score decil del sistema de nicho, genera la interacción de tooltips, genera la interacción con histogramas y genera un line chart cuando el proceso de validación esta activado. Además genera una tabla de información por decil.
     *
     * @function createMultipleBarChart
     * @public
     * @memberof! histogram_module
     * 
     * @param {array} json_decil - Array con el resultado de los grupos de vartiables seleccionados por decil
     * @param {array} array_recall - Contiene los resultados por grupo de variables por decil. Contiene verdaderos positivos, falsos negativos y recall. Este array solo es utilizado en el proceso de validación
     * @param {String} idComponent - Id del contenedor del histograma
     * @param {map} nameMap - Mapa de los grupos de variables seleccionados en el análisis de nicho ecológico
     */
    function createMultipleBarChart(json_decil, array_recall, idComponent, nameMap) {

        _VERBOSE ? console.log("createMultipleBarChart") : _VERBOSE;
        
        // LIMPIA EL AREA DONDE SE ENCUENTRA EL HISTOGRAMA
        $("#" + idComponent.id).empty();

        // OBTIENE EL ESPACIO NECESARIO PARA EL CONTENEDOR DEL HISTOGRAMA
        var margin = {top: 30, right: 40, bottom: 70, left: 40},
                width = $(".myScrollableBlockEpsilonDecil").width() - margin.left - margin.right;
        var height = $(".myScrollableBlockEpsilonDecil").height() - margin.top - margin.bottom - 15; // 10px del icono de info


        var x0 = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

        var x1 = d3.scale.ordinal();

        var y = d3.scale.linear()
                .range([height, 0]);

        var color_array = [];

        // variable que sirve para conocer el decil donde ya existen valores para generar la gráfica
        var value_decil_ready = 0;
        var length_names = 0;
        
        _VERBOSE ? console.log(json_decil) : _VERBOSE;
        

        for (value_decil_ready = 0; value_decil_ready < _NUM_DECIL; value_decil_ready++) {
            try {
                length_names = json_decil.length;
                break;
            } catch (e) {
                _VERBOSE ? console.log("sin valores decil: " + value_decil_ready) : _VERBOSE;
            }
        }

//        _VERBOSE ? console.log("value_decil_ready: " + value_decil_ready) : _VERBOSE;
//        _VERBOSE ? console.log("length_names: " + length_names) : _VERBOSE;


        for (i = 0; i < length_names; i++) {
            color_array.push(_randomColor());
        }
//         _VERBOSE ? console.log(color_array) : _VERBOSE;


        var color = d3.scale.ordinal()
                .range(color_array);

        var xAxis = d3.svg.axis()
                .scale(x0)
                .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(d3.format(".2s"));
        // .ticks(10);  


        var svg = d3.select("#" + idComponent.id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        svg.append("text")
                .attr("id", idComponent.legend)
                .attr("y", -22)
                .attr("x", width / 2 + 40)
                .attr("dy", ".71em")
                .style("font-size", "20px")
                .style("text-anchor", "end")
                .text(_iTrans.prop('titulo_hist_score_decil'));

        
        var tip = addTooltipBarChart(svg);
        

        // nameMap es mayor que 0 cuando se realiza el proceso de validación
        var ageNames = []; //nameMap.values();
        ageNames = json_decil.map(group => group.gpo_name)
//        if(ageNames.length > 1) ageNames.push("root");
        
//        _VERBOSE ? console.log(nameMap) : _VERBOSE;

//        _VERBOSE ? console.log(ageNames) : _VERBOSE;
        
        // CREADO DATA VERTICAL.
        // NOTA: LOS DATOS ANTES DE ESTE PUNTO ESTAN ALMACENADOS POR GRUPO DE VARIABLES, PARA GENERAR EL HISTOGRAMA
        // ES NECESARIO AGRUPAR POR DECIL LOS DIFERENTES GRUPOS DE VARIABLES 
        var verticalData = groupDataByAtributte(json_decil);

        // INICIA CONSTRUCCIÓN DEL HISTOGRAMA
        var deciles = verticalData.map(item => item.decil);
        
//        _VERBOSE ? console.log(deciles) : _VERBOSE;
        
        x0.domain(deciles);
        
//        _VERBOSE ? console.log(x0.rangeBand()) : _VERBOSE;
        
        x1.domain(ageNames)
                .rangeRoundBands([0, x0.rangeBand()]);
        
//        console.log(x0.rangeBand());
//        console.log(x0(10));
//        console.log(x1("root"));
        

                
        var totalmax_avg = d3.max(json_decil.map(function (d, index) {
            
            if (value_decil_ready <= index) {
                
                return d3.max(d.data, function (d) {
                    return parseFloat(d.avg)
                });
                
            }
            
        }));
        
//        console.log("totalmax_avg: " + totalmax_avg);

        var totalmin_avg = d3.min(json_decil.map(function (d, index) {
            
            if (value_decil_ready <= index) {
                
                return d3.min(d.data, function (d) {
                    return parseFloat(d.avg)
                });
                
            }
            
        }));
        
//        console.log("totalmin_avg: " + totalmin_avg);

        // que ocurre cuando min y max son iguales, no se esta generando la gráfica... cehcar validacion
        if (totalmax_avg === totalmin_avg) {
            if (totalmax_avg < 0) {
                totalmax_avg = 0;
            } else {
                totalmin_avg = 0;
            }
        }
        
        
        var totalmin_nice = Math.floor(totalmin_avg);
        var totalmax_nice = Math.ceil(totalmax_avg);
        var NEG_DECIL = 0;


        // TODO: analizar cuando son solo positovos, solo negativos o combinación
        // solo negativos
        if (totalmax_avg < 0 && totalmin_avg < 0) {
            NEG_DECIL = -1;
        }
        // combinado
        else if (totalmin_avg < 0) {
            NEG_DECIL = 0;
        }
        // solo positivos
        else {
            NEG_DECIL = 1;
        }

        // NOTA: En d3 el max de -0.12 y -0.86 es "-0.86", obtiene el minimo de los negativos
        var maxmin_avg = d3.max(json_decil.map(function (d, index) {
            
            if (value_decil_ready <= index) {
                return d3.max(d.data, function (d) {
                    if (d.avg < 0){
                        return d.avg;
                    }
                        
                });
            }
            
        }));

//        console.log("maxmin_avg: " + maxmin_avg);

        // si existen valores combinados el axis se divide de forma equitativa
        if (NEG_DECIL === 0) {

            if (Math.abs(totalmin_avg) < Math.abs(totalmax_avg)) {

                y.domain([-totalmax_avg, totalmax_avg])
                        .nice([totalmin_nice, totalmax_nice]);

            } else {

                y.domain([totalmin_avg, -totalmin_avg])
                        .nice([totalmin_nice, totalmax_nice]);

            }

        } else {

            y.domain([totalmin_avg, totalmax_avg])
                    .nice([totalmin_nice, totalmax_nice]);

        }

        var translate_axis = 0;
        
        // set the x axis in middle of the chart when there are negative values.
        // solo negativos
        if (NEG_DECIL === -1) {

            translate_axis = y(totalmax_avg); // valor de cero, ajusta en la parte superior del histograma
        }
        // combinado
        else if (NEG_DECIL === 0) {

            translate_axis = y(Math.max(0, maxmin_avg)); // ajusta en la parte superior del histograma
        }
        // solo positivos
        else {

            translate_axis = height; // valor maximos, ajusta en la parte inferior del histograma
        }


        // CREACIÓN DE EJES DEL HISTOGRAMA
        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + translate_axis + ")")
                .call(xAxis)
                .append("text")
                .attr("id", idComponent.xaxis)
                .attr("y", margin.bottom - 10)
                .attr("x", width / 2)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(_iTrans.prop('lb_xaxis_decil'));

        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("id", idComponent.yaxis)
                .attr("y", -10)
                .attr("x", margin.left - 40)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(_iTrans.prop('tip_tbl_score'));


        
        // CREACION DE BARRAS DEL HISTOGRAMA
        var state = svg.selectAll(".state")
                .data(verticalData)
                .enter().append("g")
                .attr("class", "state")
                .attr("transform", function (d) {
//                    console.log(d.decil);            
                    return "translate(" + x0(d.decil) + ",0)";
                });

        state.selectAll(".rect")
                .data(function (d) {
                    return d.value;
                })
                .enter().append("rect")
                .attr("class", "bar")
                .attr("width", x1.rangeBand())
                .attr("x", function (d) {
                    
//                    console.log(d.name)
//                    console.log(x1(d.name))
//                    console.log(x1.rangeBand())                    
                    return x1(d.name);
                })
                .attr("y", function (d) {

//                    _VERBOSE ? console.log("decil_nulo: " + d.decil_nulo) : _VERBOSE;

                    if (d.decil_nulo)
                        return y(0);

                    // locate the bars in the chart correctly when there are negative values.
                    if (NEG_DECIL === -1) {
                        
                        return y(totalmax_avg);
                    } else if (NEG_DECIL === 0) {
                        
                        return y(Math.max(0, d.avg));
                    } else {
                        
                        return y(d.avg);
                    }
                })
                .attr("height", function (d) {

                    _VERBOSE ? console.log("decil_nulo: " + d.decil_nulo) : _VERBOSE;
            
                    var val_h = d.decil_nulo ? 0 : d.avg;

                    // locate the bars in the chart correctly when there are negative values.
                    if (NEG_DECIL == -1) {

                        return Math.abs(y(val_h) - y(totalmax_avg))
                    } else if (NEG_DECIL == 0) {

                        return Math.abs(y(val_h) - y(0))
                    } else {

                        return height - y(val_h);
                    }
                })
                .style("fill", function (d) {

                    return color(d.name);
                })
                .style("opacity", 0.7)
                .on('mouseover', function (d) {

                    tip.show(d);

                })
                .on('mouseout', function (d) {

                    tip.hide(d);

                })
                .on("click", function (d) {
                    
                    console.log(d);

                    state.selectAll("rect.bar").each(function (bar, i) {
                        d3.select(this).style("stroke", "none");
                    });
                    d3.select(this).style("stroke", "black");
                    d3.select(this).style("stroke-width", 3);
                    
                    _display_module_nicho._configureStyleMap();
                    _display_module_nicho.loadDecilDataTable(d.decil, d.name, false, []);
                    
                });


        // CREACION DE LEYENDA INFOERIOR DEL HISTOGRAMA
        var yTextPadding = -5;

        state.selectAll(".rect")
                .data(function (d) {
                    return d.value;
                })
                .enter()
                .append("text")
                .style("font-size", "8px")
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("x", function (d) {
                    return x1(d.name) + 10;
                })
                .attr("y", function (d) {

                    if (d.decil_nulo)
                        return y(0) + yTextPadding;
                    
                    // locate the bars in the chart correctly when there are negative values.
                    if (NEG_DECIL === -1) {
                        return y(totalmax_avg) + yTextPadding;
                    } 
                    else if (NEG_DECIL === 0) {
                        return y(Math.max(0, d.avg)) + yTextPadding;
                    } 
                    else {
                        return y(d.avg) + yTextPadding;
                    }

                })
                .text(function (d) {
                    // // console.log(d);
                    // if( parseFloat(d.value.p) == 0.0)
                    // 	return "";
                    // else
                    return d.avg;
                });



        var legend = svg.selectAll(".legend")
                .data(ageNames.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d) {
                    return "translate(0," + (height + 20) + ")";
                });

        legend.append("rect")
                .attr("x", function (d, i) {
                    return (width - 18) - (i * 130);
                })
                .attr("y", 3)
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", function (d, i) {
//                    if (d.recall_nulo) {
//                        return "black";
//                    } 
//                    else {
//                        console.log(d)
//                        console.log(color(d))
                        return color(d);
//                    }

                })
                .style("opacity", 0.7);

        legend.append("text")
                .attr("x", function (d, i) {
                    return (width - 24) - (i * 130);
                })
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d) {
//                    console.log(d)
                    return d;
                });




       // Despliega grafica de resultados de validación
       // if ($("#chkValidation").is(':checked')) {

           var tip_recall = d3.tip()
                   .attr('class', 'd3-tip')
                   .offset([-10, 0])
                   .html(function (d) {
                       recall_values = "<strong>" + _iTrans.prop('lb_recall_avg') + ":</strong> <span >" + parseFloat(d.recall * 100).toFixed(2) + "%</span><br/><br/>" +
                               "<strong>" + _iTrans.prop('lb_vp_avg') + ":</strong> <span >" + parseFloat(d.vp).toFixed(2) + "</span><br/>" +
                               "<strong>" + _iTrans.prop('lb_fn_avg') + ":</strong> <span >" + parseFloat(d.fn).toFixed(2) + "</span><br/>";
                       // "<strong>CSS prom:</strong> <span >" + parseFloat(d.ausentes).toFixed(2) + "%</span><br/>"
                       return  recall_values;
                   });

           svg.call(tip_recall);


           var y_right = d3.scale.linear()
                   .range([translate_axis, 0]);

           y_right.domain([0, 1]);

           var yRightAxis = d3.svg.axis()
                   .scale(y_right)
                   .orient("right")
                   .ticks(5, "%");

           // ** si el label cambia, es necesario agregar id **
           svg.append("g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(" + width + " ,0)")
                   .call(yRightAxis)
                   .append("text")
                   .attr("y", -10)
                   .attr("x", margin.right - 40)
                   .attr("dy", ".71em")
                   .style("text-anchor", "end")
                   .text(_iTrans.prop('lb_recall'));


           // obtiene el numero de grupo analizados para generar la colección de elementos para desplegar el calculo de recall
           var array_recall = [];
           
           $.each(json_decil, function (index, item) {

               var item_recall = [];

                $.each(item.deciles, function (index, decil) {

                    var item_decil = {
                       "group_name": item.gpo_name,
                       "recall": decil.recall,
                       "vp": decil.vp,
                       "fn": decil.fn,
                       "decil": decil.decil,
                       "recall_nulo": decil.nulo
                    }

                    item_recall.push(item_decil);

                })

                array_recall.push(item_recall);

           });
               

           // adding recall line
           _VERBOSE ? console.log(array_recall) : _VERBOSE;

           $.each(array_recall, function (i, recall_item) {

               console.log(recall_item);

               var line = d3.svg.line()
                       .x(function (d) {
                           return x0(d.decil) + (x1.rangeBand() * (ageNames.length / 2));
                       })
                       .y(function (d) {
                           return y_right(d.recall);
                       });

//                console.log(line);

               svg.append("path")
                       .datum(recall_item)
                       .attr("class", "line")
                       .attr("d", line)
                       .style("stroke", function (d) {

                           // console.log(d);
                           // console.log("name: " + d[0].group_name);
                           // console.log("color: " + color(d[0].group_name));

                           return color(d[0].group_name);

                       })

               svg.selectAll("dot")
                       .data(recall_item)
                       .enter().append("circle")
                       .attr("class", "dot")
                       .attr("r", 3.5)
                       .attr("cx", function (d, i) {

//                            return x0(recall_item.length - i) + (x1.rangeBand() * (ageNames.length / 2));
                           return x0(d.decil) + (x1.rangeBand() * (ageNames.length / 2));


                       })
                       .attr("cy", function (d) {
                           return y_right(d.recall);
                       })
                       .on('mouseover', function (d) {

                           d3.select(this).attr("r", function (d) {
                               return 8 + Math.pow(d.recall / Math.PI, 0.5);
                           });
                           tip_recall.show(d)
                       })
                       .on('mouseout', function (d) {

                           d3.select(this).attr("r", function (d) {
                               return 3.5;
                           });
                           tip_recall.hide(d)
                       })
                       .style("stroke", function (d) {

                           // console.log(d);
                           // console.log("name: " + d.group_name);
                           // console.log("color: " + color(d.group_name));

                           return color(d.group_name);

                       })


           });

       // }


    }
    
    
    


    /**
     * Éste método crea el histograma de las ocurrencias que tiene la especie objetivo selecionada en el análisis de nicho ecológico.
     *
     * @function createBarChartFecha
     * @public
     * @memberof! histogram_module
     * 
     * @param {array} distinctPoints - Array con las ocurrencias que tiene la especie objetivo selecionada en el análisis de nicho ecológico.
     */
    function createBarChartFecha(distinctPoints) {

        var puntos_json = d3.map([]);

        $.each(distinctPoints, function (index, item) {

            var fecha_ano = item.aniocolecta === null || item.aniocolecta === "" || item.aniocolecta === 9999 ? 0 : parseInt(item.aniocolecta);

            if (puntos_json.has(fecha_ano)) {

                var item_colecta = puntos_json.get(fecha_ano);
                puntos_json.set(fecha_ano, {"fechacolecta": fecha_ano, "cantidad": (item_colecta.cantidad + 1)});

            } else {

                puntos_json.set(fecha_ano, {"fechacolecta": fecha_ano, "cantidad": 1});

            }

        });

        var colectas = puntos_json.values();
        var colectas_zero = [];
        var colectas_dif = [];
        $.each(colectas, function (index, item) {

            if (item.fechacolecta > 0) {
                colectas_dif.push(item);
            } else {
                colectas_zero.push(item);
            }

        })

        // VERIFICAR SI SE PUEDEN DESPLEGAR LOS REGISTROS SIN FECHA
        // if(colectas_zero.length == 0){
        // 	$("#lb_regfecha").text("0");
        // }
        // else{
        // 	$("#lb_regfecha").text(colectas_zero[0].cantidad);
        // }

        var max_fecha = d3.max(colectas_dif.map(function (d) {
            return d.fechacolecta;
        }));
        var min_fecha = d3.min(colectas_dif.map(function (d) {
            return d.fechacolecta;
        }));

        var NUM_BARS = d3.range(1, 11, 1);

        var rangofechas = d3.scale.quantize().domain([min_fecha, max_fecha]).range(NUM_BARS);

        var rango_fechas = d3.map([]);
        $.each(NUM_BARS, function (index, item) {

            var rango = parseInt(rangofechas.invertExtent(item)[0]) + " - " + parseInt(rangofechas.invertExtent(item)[1]);
            rango_fechas.set(item, {"fechas": rango, "cantidad": 0});

        })

        $.each(colectas_dif, function (index, item) {

            if (rango_fechas.has(rangofechas(item.fechacolecta))) {

                var it_temp = rango_fechas.get(rangofechas(item.fechacolecta));
                it_temp.cantidad = it_temp.cantidad + item.cantidad;

            }

        });


        var data = rango_fechas.values();

        $("#hist_fecha_container").empty();

        var margin = {top: 10, right: 10, bottom: 20, left: 30},
                width = $("#hist_fecha_container").width() - margin.left - margin.right,
                height = $("#hist_fecha_container").height() - margin.top - margin.bottom;


        var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
                .range([height, 0]);


        x.domain(data.map(function (d) {
            return d.fechas;
        }));
        y.domain([0, d3.max(data, function (d) {
                return d.cantidad;
            })]);


        var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(y)
                // .ticks(10)
                // .tickSize(-width, 0)
                .orient("left");



        var svg = d3.select("#hist_fecha_container").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 10])
                .html(function (d) {
                    return  "<strong>" + _iTrans.prop('hist_occ_fecha') + ":</strong> <span >" + d.fechas + "</span><br/>" +
                            "<strong>" + _iTrans.prop('hist_occ_registros') + ":</strong> <span >" + d.cantidad + "</span>";
                });
        svg.call(tip);



        svg.append("g")
                .attr("class", "xaxis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                // .text("Fecha colecta")
                .selectAll("text")
                .style("font-size", "0px")


        svg.append("g")
                .attr("class", "yaxis")
                .call(yAxis)
                // .ticks(5);
                // .text("Registros")
                .selectAll("text")
                .style("font-size", "8px")


        svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.fechas);
                })
                .attr("y", function (d) {
                    return y(d.cantidad);
                })
                .attr("height", function (d) {
                    return height - y(d.cantidad);
                })
                .attr("width", x.rangeBand())
                .on("mouseover", function (d) {
                    tip.show(d);
                })
                .on("mouseout", function (d) {
                    tip.hide(d);
                });


    }


    /**
     * Crea los histogramas de épsilon especie, score especie y score celda en el análisis de nicho ecológico.
     *
     * @function createBarChart
     * @public
     * @memberof! histogram_module
     * 
     * @param {String} idComponent - Id del contenedor del histograma
     * @param {array} data - Array con los resultados del histograma por especie y por celda en el análisis de nicho ecológico
     * @param {String} f_legend - Título del histograma
     */
    function createBarChart(idComponent, data, f_legend) {

        _VERBOSE ? console.log("createBarChart") : _VERBOSE;

        $("#" + idComponent.id).empty();
        // _VERBOSE ? console.log($(window).width()) : _VERBOSE;
        // _VERBOSE ? console.log($(".myScrollableBlockEpsilon").height()) : _VERBOSE;

        var margin = {top: 40, right: 40, bottom: 80, left: 40},
                width = $(".myScrollableBlockEpsilonSmallHist").width() - margin.left - margin.right,
                height = $(".myScrollableBlockEpsilonSmallHist").height() - margin.top - margin.bottom;

        // _VERBOSE ? console.log(width) : _VERBOSE;
        // _VERBOSE ? console.log(height) : _VERBOSE;

        var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
                .range([height, 0]);

        var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
        // .ticks(5);

        var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(10, "%");

        var svg = d3.select("#" + idComponent.id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
                .attr("id", idComponent.legend)
                .attr("y", -22)
                .attr("x", width / 2 + 60)
                .attr("dy", ".71em")
                .style("font-size", "20px")
                .style("text-anchor", "end")
                .text(f_legend);


        // svg.append("rect")
        //   	.attr("y", -22)
        //     	.attr("x", width/2 + 70)
        //     	.attr("width", "20px")
        //     	.attr("height", "20px")
        //     	.attr("fill", "#3B6A93")
        //     	.append("title")
        //     		.text("test")
        //     	.style("margin-left", "20px")
        // svg.append("text")
        //   	.attr("y", -8)
        //     	.attr("x", width/2 + 77)
        //     	.style("fontColor","white")
        //     	.style("fontWeight","bold")
        //   	.text("?")




        var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) {
                    return  "<strong>" + _iTrans.prop('lb_rango') + ":</strong> <span >" + d.title + "</span><br/><br/>" +
                            "<strong>" + _iTrans.prop('lb_frecuencia') + ":</strong> <span >" + parseInt(d.frequency * 100) + " %</span>";
                });

        svg.call(tip);


        x.domain(data.map(function (d) {
            return d.bcenter;
        }));

        max_freq = d3.max(data.map(function (d) {
            return parseFloat(d.frequency);
        }));
        // _VERBOSE ? console.log(max_freq) : _VERBOSE;

        y.domain([0, max_freq]);

        svg.append("g")
                .attr("class", "xaxis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("id", idComponent.xaxis)
                .style("text-anchor", "end")
                .style("font-size", "10px")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", function (d) {
                    return "rotate(-90)"
                });
        // .append("text")
        //   .attr("y", margin.bottom-10)
        //   .attr("x", width/2)
        //   .attr("dy", ".71em")
        //   .style("text-anchor", "end")
        //   .text(legend);

        svg.append("g")
                .attr("class", "yaxis")
                .call(yAxis)
                .append("text")
                .attr("id", idComponent.yaxis)
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(_iTrans.prop('lb_frecuencia'));

        svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.bcenter);
                })
                .attr("width", x.rangeBand())
                .attr("y", function (d) {
                    return y(parseFloat(d.frequency));
                })
                .attr("height", function (d) {
                    return height - y(parseFloat(d.frequency));
                })

                .on('mouseover', function (d) {
                    tip.show(d)
                })
                .on('mouseout', function (d) {
                    tip.hide(d)
                })


    }


    /**
     * Genera colores aleatorios para asignarlo al histograma de decil en el análisis de nicho ecológico.
     *
     * @function _randomColor
     * @private
     * @memberof! histogram_module
     * 
     */
    var _randomColor = (function () {
        var golden_ratio_conjugate = 0.618033988749895;
        var h = Math.random();

        var hslToRgb = function (h, s, l) {
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0)
                        t += 1;
                    if (t > 1)
                        t -= 1;
                    if (t < 1 / 6)
                        return p + (q - p) * 6 * t;
                    if (t < 1 / 2)
                        return q;
                    if (t < 2 / 3)
                        return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
        };

        return function () {
            h += golden_ratio_conjugate;
            h %= 1;
            return hslToRgb(h, 0.5, 0.60);
        };
    })();


    /**
     * Retorna un objeto de tipo Chart para generar el histograma en el anáisis de comunidad ecológica.
     *
     * @function createBarChartNet
     * @public
     * @memberof! histogram_module
     * 
     * @param {json} json - Json que contiene los nodos y los enlaces resultado del análisis de communidad ecológica
     * @param {object} display_obj - Referencia al controlador de comunidad ecológica
     */
    function createBarChartNet(json, display_obj) {

        _VERBOSE ? console.log("createBarChartNet") : _VERBOSE;

        var chart_array = [
            BarChart(json, display_obj)
                    .group(display_obj.group_eps_freq)
                    .x(display_obj.x)
        ];

        var chart_component = d3.selectAll(".chart")
                .data(chart_array)
                .each(function (chart) {
                    chart.on("brushend", display_obj.renderAll);
                });

        $("#lb_body_info").text(_iTrans.prop('lb_msg_hist_epsilon'));
        $('#lb_header_info').text(_iTrans.prop('titulo_hist_eps'));


        return chart_component;

    }


    /**
     * Clase tipo Chart para generar instacias que tienen interacción con el módulo de red.
     *
     * @function BarChart
     * @public
     * @memberof! histogram_module
     * 
     * @param {json} json - Json que contiene los nodos y los enlaces resultado del análisis de communidad ecológica
     * @param {object} display_obj - Referencia al controlador de comunidad ecológica
     */
    function BarChart(json, display_obj) {

        _VERBOSE ? console.log("BarChart") : _VERBOSE;

        _VERBOSE ? console.log(json) : _VERBOSE;


        var margin = {top: 5, right: 20, bottom: 55, left: 20};
        var width = $("#hist").width() - margin.left - margin.right;
        var height = $("#hist").height() - margin.top - margin.bottom;


        if (!BarChart.id)
            BarChart.id = 0;

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

        var id = BarChart.id++,
                brush = d3.svg.brush(),
                brushDirty, dimension, group, round;
        //margin = {top: 10, right: 10, bottom: 20, left: 10}
        var brushStart = 0;
        var brushEnd = display_obj.NUM_BEANS - 1;


        function chart(div) {

            _VERBOSE ? console.log(div) : _VERBOSE;

            height = y.range()[0];
            data = group.all();


            _VERBOSE ? console.log(data) : _VERBOSE;

            // it contains an array from 1 to 20, create key missing elements and set value to 0
            display_obj.epsilon_beans.forEach(function (d) {
                exists = false;
                $.each(data, function (index, value) {
                    if (d == value.key) {
                        exists = true;
                        return false;
                    }
                });
                if (exists == false) {
                    data.push({key: parseInt(d), value: 0});
                }
            });

            // Sort by price high to low
            data.sort(_sort_by('key', false, parseInt));
            _VERBOSE ? console.log(data) : _VERBOSE;

            $.each(data, function (index, value) {

                tvalue = value.value;

                if (tvalue != 0)
                    value.value = tvalue / all.reduceCount().value();

            });


            _VERBOSE ? console.log(display_obj.epsRange) : _VERBOSE;
            _VERBOSE ? console.log(epsRange) : _VERBOSE;


            x.domain(data.map(function (d) {
                avg = parseFloat((display_obj.epsRange.invertExtent(d.key)[0] + display_obj.epsRange.invertExtent(d.key)[1]) / 2).toFixed(2);
                return avg;
            }));



            y.domain([0, group.top(1)[0].value]);


            div.each(function () {

                _VERBOSE ? console.log("div.each chart") : _VERBOSE;

                var div = d3.select(this),
                        g = div.select("g");

                // Create the skeletal chart.
                if (g.empty()) {

                    _VERBOSE ? console.log("g.empty") : _VERBOSE;


                    g = div.append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // legend
                    g.append("text")
                            .attr("id", "title_barnet")
                            .attr("y", height + 40)
                            .attr("x", width / 2 + 60)
                            .attr("dy", ".71em")
                            .style("font-size", "12px")
                            .style("text-anchor", "end")
                            .text(_iTrans.prop('titulo_hist_eps'));




                    g.append("clipPath")
                            .attr("id", "clip-" + id)
                            .append("rect")
                            .attr("width", width)
                            .attr("height", height);

                    g.selectAll(".foreground.bar")
                            .attr("clip-path", "url(#clip-" + id + ")");

                    // **** Axis

                    g.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis)
                            .selectAll("text")
                            .style("text-anchor", "end")
                            .style("font-size", "10px")
                            .attr("dx", "-.8em")
                            .attr("dy", "-.55em")
                            .attr("transform", function (d) {
                                return "rotate(-90)"
                            });


                    g.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(" + margin.left + ",0)")
                            .call(yAxis)
                            .append("text")
                            .attr("id", 'yaxis_net')
                            .attr("transform", "rotate(-90)")
                            .attr("y", 6)
                            .attr("dy", ".71em")
                            .style("text-anchor", "end")
                            .text(_iTrans.prop('lb_frecuencia'));

                    // ** Adding bars

                    g.selectAll(".bar")
                            .data(data)
                            .enter().append("rect")
                            .attr("class", "bar")
                            .attr("x", function (d) {
                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                return x(parseFloat((display_obj.epsRange.invertExtent(d.key)[0] + display_obj.epsRange.invertExtent(d.key)[1]) / 2).toFixed(2));
                            })
                            .attr("width", x.rangeBand())
                            .attr("y", function (d) {
                                return y(parseFloat(d.value));
                            })
                            .attr("height", function (d) {
                                return height - y(parseFloat(d.value));
                            })
                            .attr("fill", function (d) {

                                left = display_obj.epsRange.invertExtent(d.key)[0]
                                right = display_obj.epsRange.invertExtent(d.key)[1]
                                if (left <= 0 && right > 0)
                                    min_val = 0;
                                else {
                                    min_val = Math.min(Math.abs(left), Math.abs(right));
                                }

                                if (display_obj.ep_th < min_val) {
                                    return d3.rgb(102, 184, 243);
                                    // return "steelblue";
                                } else {
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

            });



            function resizePath(d) {

                _VERBOSE ? console.log("resizePath") : _VERBOSE;
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


        } // function chart(div) closed


        brush.on("brush.chart", function (e) {

            _VERBOSE ? console.log("brush.chart") : _VERBOSE;

            // desactiva el bloqueo del número de enlaces a desplegar
            display_obj.hist_load = true


            var y = d3.scale.linear()
                    .domain([margin.left, width - margin.left])
                    .range([0, display_obj.NUM_BEANS]);


            b = brush.extent();
            // _VERBOSE ? console.log(b) : _VERBOSE;

            // d3.round(y(b[1], 0) for rounded values
            var localBrushStart = (brush.empty()) ? brushStart : y(b[0]),
                    localBrushEnd = (brush.empty()) ? brushEnd : y(b[1]);

            // Snap to rect edge
            d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(localBrushStart), y.invert(localBrushEnd)]));


            // Fade all years in the histogram not within the brush
            d3.selectAll("rect.bar").style("opacity", function (d, i) {
                // _VERBOSE ? console.log(d.key) : _VERBOSE;

                if (d.key < localBrushStart || d.key >= localBrushEnd || brush.empty()) {
                    return "0.4";
                } else {
                    return "1";
                }
            });

            // dimension.filterRange([localBrushStart,localBrushEnd]);

        });


        brush.on("brushend.chart", function () {

            _VERBOSE ? console.log("brushend.chart") : _VERBOSE;

            var y = d3.scale.linear()
                    .domain([margin.left, width - margin.left])
                    .range([0, display_obj.NUM_BEANS]);


            b = brush.extent();

            var localBrushStart = (brush.empty()) ? brushStart : y(b[0]),
                    localBrushEnd = (brush.empty()) ? brushEnd : y(b[1]);

            // Snap to rect edge
            d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(localBrushStart), y.invert(localBrushEnd)]));


            if (brush.empty()) {

                dim_eps_freq.filterAll();

                d3.selectAll("rect.bar").style("opacity", function (d, i) {
                    return "1";
                });

            } else {

                if (d3.round(localBrushStart, 0) == 0)
                    left_extent = 1
                else
                    left_extent = d3.round(localBrushStart, 0)
                if (d3.round(localBrushEnd, 0) == 21)
                    rigth_extent = 20
                else
                    rigth_extent = d3.round(localBrushEnd, 0)


                _VERBOSE ? console.log(display_obj.epsRange.invertExtent(left_extent)) : _VERBOSE;
                _VERBOSE ? console.log(display_obj.epsRange.invertExtent(rigth_extent)) : _VERBOSE;

                display_obj.dim_eps_freq.filterFunction(function (d) {
                    // _VERBOSE ? console.log(d) : _VERBOSE;

                    if (d > display_obj.epsRange.invertExtent(left_extent)[0] && d < display_obj.epsRange.invertExtent(rigth_extent)[1] + 0.1)
                        return true;

                });

                // Fade all years in the histogram not within the brush
                d3.selectAll("rect.bar").style("opacity", function (d, i) {
                    if (d.key < localBrushStart || d.key > localBrushEnd) {
                        return "0.4";
                    } else {
                        return "1";
                    }
                });

            }

            // d3.event.sourceEvent.stopPropagation();

        });



        // TODO: definir creación del brush
        chart.drawBrush = function() {

            console.log("chart.drawBrush")

            console.log("display_obj.hist_min_eps: " + display_obj.hist_min_eps)
            console.log("display_obj.hist_max_eps: " + display_obj.hist_max_eps)

            // var y = d3.scale.linear()
            //         .domain([margin.left, width - margin.left])
            //         .range([0, display_obj.NUM_BEANS]);


            // b = brush.extent();


            // var localBrushStart = (brush.empty()) ? brushStart : y(b[20]),
            //         localBrushEnd = (brush.empty()) ? brushEnd : y(b[35]);


            // // Snap to rect edge
            // // d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(display_obj.hist_min_eps), y.invert(display_obj.hist_max_eps)]));
            // // d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(21), y.invert(35)]));
            // d3.select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(localBrushStart), y.invert(localBrushEnd)]));


            // // Fade all years in the histogram not within the brush
            // d3.selectAll("rect.bar").style("opacity", function (d, i) {
            //     // _VERBOSE ? console.log(d.key) : _VERBOSE;

            //     if (d.key < localBrushStart || d.key >= localBrushEnd || brush.empty()) {
            //         return "0.4";
            //     } else {
            //         return "1";
            //     }
            // });

// otro metodo -----

            // brush.extent([display_obj.hist_min_eps, hist_max_eps])


            
            // // our year will this.innerText
            // // console.log(this.innerText)

            // // define our brush extent to be begin and end of the year
            // brush.extent([new Date(this.innerText + '-01-01'), new Date(this.innerText + '-12-31')])

            // // now draw the brush to match our extent
            // // use transition to slow it down so we can see what is happening
            // // remove transition so just d3.select(".brush") to just draw
            // brush(d3.select(".brush").transition());

            // // now fire the brushstart, brushmove, and brushend events
            // // remove transition so just d3.select(".brush") to just draw
            // brush.event(d3.select(".brush").transition().delay(1000))
          }

        chart.drawBrush()


        chart.margin = function (_) {

            _VERBOSE ? console.log("chart.margin") : _VERBOSE;

            if (!arguments.length)
                return margin;
            margin = _;
            return chart;
        };

        chart.x = function (_) {

            _VERBOSE ? console.log("chart.x") : _VERBOSE;

            if (!arguments.length)
                return x;

            x = _;

            xAxis.scale(x);
            brush.x(x);
            return chart;
        };

        chart.y = function (_) {

            _VERBOSE ? console.log("chart.y") : _VERBOSE;

            if (!arguments.length)
                return y;
            y = _;
            return chart;
        };

        chart.dimension = function (_) {

            _VERBOSE ? console.log("chart.dimension") : _VERBOSE;
            // _VERBOSE ? console.log(_) : _VERBOSE;

            if (!arguments.length)
                return dimension;
            dimension = _;
            return chart;
        };

        chart.filter = function (_) {

            _VERBOSE ? console.log("chart.filter") : _VERBOSE;

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

        chart.group = function (_) {

            _VERBOSE ? console.log("chart.group") : _VERBOSE;
            // _VERBOSE ? console.log(_) : _VERBOSE;

            if (!arguments.length)
                return group;
            group = _;
            return chart;
        };

        chart.round = function (_) {

            _VERBOSE ? console.log("chart.round") : _VERBOSE;

            if (!arguments.length)
                return round;
            round = _;
            return chart;
        };

        return d3.rebind(chart, brush, "on");
    }



    /**
     * Realiza el ordenamiento de un objeto tipo Json por un atributo específico.
     *
     * @function _sort_by
     * @private
     * @memberof! histogram_module
     * 
     * @param {String} field - Nombre del parámetro para hacer el ordenamiento
     * @param {boolean} reverse - Bandera para hacer el ordenameinto descendiente o ascendente
     * @param {function} primer - Función para realizar el ordenamiento
     */
    function _sort_by(field, reverse, primer) {

        var key = primer ?
                function (x) {
                    return primer(x[field])
                } :
                function (x) {
                    return x[field]
                };

        reverse = !reverse ? 1 : -1;

        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    }


    /**
     * Función que inicializa las variables necesarias para la creación de histogramas.
     *
     * @function startHistogramModule
     * @public
     * @memberof! histogram_module
     * 
     */
    function startHistogramModule() {
        _VERBOSE ? console.log("startHistogramModule") : _VERBOSE;
        _initilizeHistogram();
    }

    // Añadir los miembros públicos
    return{
        startHistogramModule: startHistogramModule,
        createMultipleBarChart: createMultipleBarChart,
        setTableModule: setTableModule,
        setLanguageModule: setLanguageModule,
        // updateLabels: updateLabels,
        createBarChart: createBarChart,
        createBarChartNet: createBarChartNet,
        createBarChartFecha: createBarChartFecha,
        setDisplayModule: setDisplayModule
    }


});