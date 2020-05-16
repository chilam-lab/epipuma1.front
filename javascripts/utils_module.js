var utils_module = (function (verbose) {

    var _VERBOSE = verbose;
    var buckets = 20;
    var deciles = 10;
    var _TYPE_BIO = 0;


    function processDataForFreqSpecie(data) {

        var min_eps = d3.min(data.map(function (d) {
            return parseFloat(d.epsilon);
        }));
        // debug("min_eps: " + min_eps)
        var max_eps = d3.max(data.map(function (d) {
            return parseFloat(d.epsilon);
        }));
        // debug("max_eps: " + max_eps)

        var min_scr = d3.min(data.map(function (d) {
            return parseFloat(d.score);
        }));
        // debug("min_scr: " + min_scr)  
        var max_scr = d3.max(data.map(function (d) {
            return parseFloat(d.score);
        }));
        // debug("max_scr: " + max_scr)


        var beans = d3.range(1, buckets + 1, 1);

//        var epsRange = d3.scaleQuantile().domain([min_eps, max_eps]).range(beans);
//        var scrRange = d3.scaleQuantile().domain([min_scr, max_scr]).range(beans);
        var epsRange = d3.scale.quantile().domain([min_eps, max_eps]).range(beans);
        var scrRange = d3.scale.quantile().domain([min_scr, max_scr]).range(beans);

        // debug("epsRange: " + epsRange.invertExtent(1))

        var cross_species = crossfilter(data)
        cross_species.groupAll();

        var eps_dimension = cross_species.dimension(function (d) {
            return parseFloat(d.epsilon);
        });
        var scr_dimension = cross_species.dimension(function (d) {
            return parseFloat(d.score);
        });

        var groupByEpsilon = eps_dimension.group(function (d) {
            // debug("epsRange: " + epsRange(d))
            return epsRange(d)
        });

        var groupByScore = scr_dimension.group(function (d) {
            return scrRange(d)
        });

        var data_eps = groupByEpsilon.top(Infinity);
        data_eps.sort(_compare);
        // debug(data_eps);

        var data_scr = groupByScore.top(Infinity);
        data_scr.sort(_compare);
        // debug(data_scr);

        var data_freq = [];

        data_freq = generateFrequencyBeans(data_eps, epsRange, "_epsilon", data_freq, buckets);
        data_freq = generateFrequencyBeans(data_scr, scrRange, "_score", data_freq, buckets);

        // debug(data_freq);

        return data_freq;
    }
    

    function processDataForFreqCell(data) {

        var min_scr = d3.min(data.map(function (d) {
            return parseFloat(d.tscore);
        }));
        // debug("min_score: " + min_scr)
        var max_scr = d3.max(data.map(function (d) {
            return parseFloat(d.tscore);
        }));
        // debug("min_score: " + max_scr)

        var beans = d3.range(1, buckets + 1, 1);

//        var scrRange = d3.scaleQuantile().domain([min_scr, max_scr]).range(beans);
        var scrRange = d3.scale.quantile().domain([min_scr, max_scr]).range(beans);

        var cross_score = crossfilter(data)
        cross_score.groupAll();

        var scr_dimension = cross_score.dimension(function (d) {
            return parseFloat(d.tscore);
        });

        var groupByScoreCell = scr_dimension.group(function (d) {
            return scrRange(d)
        });

        var score_cell_data = groupByScoreCell.top(Infinity);
        score_cell_data.sort(_compare);
        
//        console.log(score_cell_data)

        var data_freq = [];

        data_freq = generateFrequencyBeans(score_cell_data, scrRange, "", data_freq, buckets);
        // debug(data_freq)

        return data_freq;


    }


    function generateFrequencyBeans(data_bucket, funcRange, paramType, data_freq, buckets) {

        var index = 0;
        var index_bucket = 0;

        while (index_bucket < buckets) {

            const entry = data_bucket[index];

            var bucket = entry["key"];
            var freq = entry["value"];
            var range = funcRange.invertExtent((index_bucket + 1));

            // debug("freq" + paramType+ ": " + freq);
            // debug("bucket" + paramType+ ": " + bucket);
            // debug("index+1" + paramType+ ": " + (index_bucket+1));

            if ((index_bucket + 1) === bucket) {

                if (data_freq[index_bucket] === undefined) {

                    var item = {};

                    item["bucket"] = bucket;
                    item["freq" + paramType] = freq;
                    item["min" + paramType] = parseFloat((range[0]).toFixed(3));
                    item["max" + paramType] = parseFloat((range[1]).toFixed(3));
                    data_freq.push(item);

                } else {
                    data_freq[index_bucket]["freq" + paramType] = freq;
                    data_freq[index_bucket]["min" + paramType] = parseFloat(range[0].toFixed(3));
                    data_freq[index_bucket]["max" + paramType] = parseFloat(range[1].toFixed(3));
                }

                index++;
            } else {

                if (data_freq[index_bucket] === undefined) {

                    var item = {};

                    item["bucket"] = index_bucket + 1;
                    item["freq" + paramType] = 0;
                    item["min" + paramType] = parseFloat((range[0]).toFixed(3));
                    item["max" + paramType] = parseFloat((range[1]).toFixed(3));
                    data_freq.push(item);

                } else {
                    data_freq[index_bucket]["freq" + paramType] = 0;
                    data_freq[index_bucket]["min" + paramType] = parseFloat(range[0].toFixed(3));
                    data_freq[index_bucket]["max" + paramType] = parseFloat(range[1].toFixed(3));
                }

            }

            index_bucket++;
        }

        return data_freq;
    }



    // TODO: Tomar en cuenta cuando se ejecuta el proceso con apriori o prob
    // Esta sumando cada uno de los analisis que ya lo contienen
    function reduceScoreCell(data, val_apriori = 0, numr = 1) {

        var cross_cells = crossfilter(data)

        cross_cells.groupAll();
        var cells_dimension = cross_cells.dimension(function (d) {
            return d.gridid;
        });

        var groupByCell = cells_dimension.group().reduceSum(function (d) {
            return d.tscore;
        });

        var map_cell = groupByCell.top(Infinity);
        
        var cell_score_array = [];
        for (var i = 0; i < map_cell.length; i++) {

            const entry = map_cell[i];
            var tscore = parseFloat(entry["value"]) - (val_apriori*(numr-1))
            var gridid = entry["key"]
            
            cell_score_array.push({gridid: gridid, tscore: parseFloat(tscore.toFixed(3))})

        }
        
       console.log(cell_score_array);
        
        return cell_score_array;

    }


    function processDataForScoreCell(data, apriori, mapa_prob, all_cells = []) {

        _VERBOSE ? console.log("processDataForScoreCell") : _VERBOSE;

        var cells_array = data.map(function (d) {
            return {cells: d.cells, score: parseFloat(d.score)}
        });

        var cells = [];
        cells_array.forEach(function (item, index) {
            item.cells.forEach(function (cell_item, index) {
                cells.push({cell: cell_item, score: item.score})
            })
        })
        // debug(cells)

        var cross_cells = crossfilter(cells)
        cross_cells.groupAll();

        var cells_dimension = cross_cells.dimension(function (d) {
            return d.cell;
        });
        var groupByCell = cells_dimension.group().reduceSum(function (d) {
            return parseFloat(parseFloat(d.score).toFixed(3));
        });
        var map_cell = groupByCell.top(Infinity);

        // debug(map_cell)

        var cell_score_array = [];
        for (var i = 0; i < map_cell.length; i++) {
            const entry = map_cell[i];
            cell_score_array.push({gridid: entry["key"], tscore: parseFloat(entry["value"].toFixed(3))})
        }

        var data_freq = [];

        // debug(cell_score_array)
        return cell_score_array

    }


    function processDataForScoreDecil(data_cell) {

        _VERBOSE ? console.log("processDataForScoreDecil") : _VERBOSE;

        var decile = 10;
        var delta = Math.floor(data_cell.length / decile)

        // debug(data_cell.length)
        // debug(delta)

        data_cell.reverse()
        data_cell.forEach(function (item, index) {
            var dec = Math.floor(index / delta) + 1
            item["decile"] = dec > decile ? decile : dec
        })
        data_cell.reverse()

        var cross_score = crossfilter(data_cell)
        cross_score.groupAll()

        var scr_dimension = cross_score.dimension(function (d) {
            return d.decile
        });

        var groupByScoreCell = scr_dimension.group().reduce(
                function (item, add) {
                    item.val = item.val + 1
                    item.sum = item.sum + add.tscore
                    item.min = item.min < add.tscore ? item.min : add.tscore
                    item.max = item.max > add.tscore ? item.max : add.tscore
                    return item
                },
                function (item, remove) {
                    item.val = item.val - 1
                    item.sum = item.sum - remove.tscore
                    item.min = item.min < add.tscore ? item.min : add.tscore
                    item.max = item.max > add.tscore ? item.max : add.tscore
                    return item
                },
                function () {
                    return {
                        val: 0,
                        sum: 0,
                        min: Number.MAX_VALUE,
                        max: Number.MIN_VALUE
                    }
                }
        )

        var score_cell_decil = groupByScoreCell.top(Infinity);
        score_cell_decil.sort(_compare_desc)
        // debug(score_cell_decil)

        var cell_decil_array = []
        for (var i = 0; i < score_cell_decil.length; i++) {
            const entry = score_cell_decil[i];
            cell_decil_array.push({
                decil: entry["key"],
                avg: parseFloat((entry["value"].sum / entry["value"].val).toFixed(3)),
                l_sup: entry["value"].max,
                l_inf: entry["value"].min,
                vp: 0,
                fn: 0,
                nulos: 0,
                recall: 0
            })
        }

        // debug(cell_decil_array)

        return cell_decil_array;


    }

    function hashCode(str) {
      return str.split('').reduce((prevHash, currVal) =>
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
    }


    function processTitleGroup(groupid, tfilters) {

        _VERBOSE ? console.log("processTitleGroup") : _VERBOSE;

        _VERBOSE ? console.log(groupid) : _VERBOSE;
        _VERBOSE ? console.log(tfilters) : _VERBOSE;

        var title_valor = ''

        // debug("groupid: " + groupid)
        // debug(tfilters)

        if (groupid !== undefined) {

            // group_item = 0 ->> root
            if (parseInt(tfilters[0].type) === _TYPE_BIO) {

                title_valor = JSON.stringify(
                        {'title': 'Grupo Bio ' + groupid,
                            'type': tfilters[0].type,
                            'group_item': tfilters[0].group_item,
                            'is_parent': true})
            } else { //if (tfilters[0].type != 0) {


                title_valor = JSON.stringify(
                        {'title': 'Grupo Raster ' + groupid,
                            'type': tfilters[0].type,
                            'group_item': tfilters[0].group_item,
                            'is_parent': true})
            }
            // else { 
            //   title_valor = JSON.stringify(
            //     {'title':'Grupo Topo ' + groupid, 
            //       'type': tfilters[0].type , 
            //       'group_item': tfilters[0].group_item, 
            //       'is_parent':true })
            // }
        } else if (tfilters[0].value) {

            if (parseInt(tfilters[0].type) === _TYPE_BIO) {


                title_valor = JSON.stringify(
                        {'title': tfilters[0].value,
                            'type': tfilters[0].type,
                            'group_item': tfilters[0].group_item,
                            'is_parent': false})
            } else {


                title_valor = JSON.stringify(
                        {'title': tfilters[0].label,
                            'type': tfilters[0].type,
                            'group_item': tfilters[0].group_item,
                            'is_parent': false})
            }
        }

        return JSON.parse(title_valor)
    }


    // Asigna el decil a cada una de las celdas, filtra las celdas que pertenecen al decil selecionado y obtiene el número de presencias de cada especie por decil
    function processDataForScoreDecilTable(data_cell, decil_selected) {

        _VERBOSE ? console.log("processDataForScoreDecilTable") : _VERBOSE;

        var decile = deciles
        var delta = Math.floor(data_cell.length / decile)

        data_cell.reverse()
        data_cell.forEach(function (item, index) {
            var dec = Math.floor(index / delta) + 1
            item["decile"] = dec > decile ? decile : dec
        })
        data_cell.reverse()
        
        // console.log(data_cell)
        console.log(data_cell.length)
        // console.log(data_cell[0].decile)
        // console.log(decil_selected)
        // console.log(data_cell[0].decile === decil_selected)
        // console.log(data_cell[0].decile == decil_selected)
        // console.log(8 == decil_selected)

        var decil_array = data_cell.filter(function(item){
            
          return item.decile == decil_selected  
             
        });

        // console.log(decil_array)
        console.log(decil_array.length)


        var map_spid = d3.map([]);

        // data_cell.forEach(function (row_item, index) {
        decil_array.forEach(function (row_item, index) {

            // if (row_item.decile != decil_selected)
            //     return;

            row_item.species.forEach(function (specie, index) {

                // if (!map_spid.has(specie.spid)) {
                if (!map_spid.has(specie.name)) {
                    var item = {};
                    item.decile = row_item.decile
                    // item.spid = specie.spid
                    item.gridid = row_item.gridid
                    item.score = specie.score
                    item.epsilon = specie.epsilon
                    item.nj = specie.nj
                    item.njd = 1
                    item.name = specie.name
                    // map_spid.set(specie.spid, item)
                    map_spid.set(specie.name, item)
                } else {
                    // var item = map_spid.get(specie.spid);
                    var item = map_spid.get(specie.name);
                    item.njd = item.njd + 1
                    map_spid.set(specie.name, item)
                    // map_spid.set(specie.spid, item)
                }

            })

        })

        return {
            tbl_freq_decil: map_spid.values(), 
            length_decil: decil_array.length,
            decil_array: decil_array
        } 


    }

    // Obtiene el score por celda. Obtiene la sumatoria de todas las especies que tiene presencia en cada celda.
    function processDataForScoreCellTable(data) {

        _VERBOSE ? console.log("processDataForScoreCellTable") : _VERBOSE;

        var total_length
        var cells = d3.map([]);


        data.forEach(function (item, index) {

            total_length = item.n

            item.cells.forEach(function (cell_item, index) {
            
                var name = item.reinovalido === "" ? (item.layer + " " + item.tag) : (item.generovalido +" "+item.especieepiteto+" "+item.nombreinfra)
                
                var item_map = {
                    cell: cell_item,
                    score: parseFloat(item.score),
                    epsilon: parseFloat(item.epsilon),
                    nj: parseFloat(item.nj),
                    name: name
                }

                cells.set("" + cell_item + name, item_map)
                
            })
        })

        console.log("cells_values: " + cells.values().length)

        var cross_cells = crossfilter(cells.values())
        cross_cells.groupAll();

        var cells_dimension = cross_cells.dimension(function (d) {
            return d.cell;
        });

        var groupByScoreCell = cells_dimension.group().reduce(
                function (item, add) {
                    item.tscore = item.tscore + add.score
                    // item.spids.push(add.spid)
                    item.epsilons.push(add.epsilon)
                    item.scores.push(add.score)
                    item.njs.push(add.nj)
                    item.names.push(add.name)

                    return item
                },
                function (item, remove) {
                    item.tscore = item.tscore - remove.score

                    var index = item.names.indexOf(remove.name);
                    if (index > -1) {
                        item.epsilons.splice(index, 1);
                        item.scores.splice(index, 1);
                        item.njs.splice(index, 1);
                        item.names.splice(index, 1);
                    }

                    return item
                },
                function () {
                    return {
                        tscore: 0,
                        spids: [],
                        epsilons: [],
                        scores: [],
                        njs: [],
                        names: []

                    }
                }
        )

        // var groupByCell = cells_dimension.group().reduceSum(function(d) { return parseFloat(parseFloat(d.score).toFixed(3)); });
        var map_cell = groupByScoreCell.top(Infinity);

        console.log(map_cell)
        console.log("map_cell: " + map_cell.length)


        // Obtiene un array con gridid, score total (key) y un array con las espcecies en la celda, cada especie con sus valores de epsilon, score y nj

        var cell_score_array = [];
        for (var i = 0; i < map_cell.length; i++) {
            const entry = map_cell[i];
            // var len = entry["value"].spids.length;
            var len = entry["value"].names.length;
            // console.log("len: " + len)

            var item = {};
            item.gridid = entry["key"];
            item.key = parseFloat((entry["value"].tscore).toFixed(3));

            var species = [];
            for (var j = 0; j < len; j++) {

                var specie = {};
                // specie.spid = entry["value"].spids[j];
                specie.epsilon = entry["value"].epsilons[j];
                specie.score = entry["value"].scores[j];
                specie.nj = entry["value"].njs[j];
                specie.name = entry["value"].names[j];

                species.push(specie)
            }
            item.species = species;
            cell_score_array.push(item)

        }
        cell_score_array.sort(_compare_desc);

        // retorna y el total de celdas de la malla
        return {array: cell_score_array, total_length: total_length} 

    }

    function reduceDecilGroups(validatation_data_result){

          var cross_cells = crossfilter(validatation_data_result)
          cross_cells.groupAll();

          var decil_dimension = cross_cells.dimension(function(d) { return d.decil; });
          
          var groupByDecil = decil_dimension.group().reduce(
            function(item,add){
              ++item.count
              
              item.vp += add.vp
              item.fn = item.fn + add.fn
              item.nulo = item.nulo + add.nulo
              item.recall = item.recall + add.recall


              item.vvp += add.vvp
              item.vfn = item.vfn + add.vfn
              // item.nulo = item.nulo + add.nulo
              item.vrecall = item.vrecall + add.vrecall
              
              return item
            },
            function(item,remove){
              --item.count
              
              item.vp -= remove.vp
              item.fn = item.fn - remove.fn
              item.nulo = item.nulo - remove.nulo
              item.recall = item.recall - remove.recall

              item.vvp -= remove.vvp
              item.vfn = item.fn - remove.vfn
              // item.vnulo = item.nulo - remove.nulo
              item.vrecall = item.vrecall - remove.vrecall

              return item
            },
            function(){
              return {
                count: 0,
                vp: 0,
                fn: 0,
                nulo: 0,
                recall: 0,
                vvp: 0,
                vfn: 0,
                // nulo: 0,
                vrecall: 0
              }
            }
          )

          var reduce_data = groupByDecil.top(Infinity);
          reduce_data.sort(_compare_desc)

          var data_result = []
          for(var i=0; i<reduce_data.length; i++){
              const entry = reduce_data[i];

              data_result.push({
                decil: entry["key"],
                vp: parseFloat((entry["value"].vp / entry["value"].count).toFixed(2)),
                fn: parseFloat((entry["value"].fn / entry["value"].count).toFixed(2)),
                nulo: parseFloat((entry["value"].nulo / entry["value"].count).toFixed(2)),
                recall: parseFloat((entry["value"].recall / entry["value"].count).toFixed(2)),
                vvp: parseFloat((entry["value"].vvp / entry["value"].count).toFixed(2)),
                vfn: parseFloat((entry["value"].vfn / entry["value"].count).toFixed(2)),
                // nulo: parseFloat((entry["value"].nulo / entry["value"].count).toFixed(2)),
                vrecall: parseFloat((entry["value"].vrecall / entry["value"].count).toFixed(2))
                
              })
          }

          // debug(data_result)

          return data_result

    }


    function _compare(a, b) {
        if (a.key < b.key)
            return -1;
        if (a.key > b.key)
            return 1;
        return 0;
    }

    function _compare_desc(a, b) {

        _VERBOSE ? console.log("_compare_desc") : _VERBOSE;

        if (a.key > b.key)
            return -1;
        if (a.key < b.key)
            return 1;
        return 0;
    }


    function getLinkToken(data_link, type, url_api, url_front) {

        console.log("utils getLinkToken");
        // console.log(data_link)

        $.ajax({
            url: url_api + "/niche/especie/getToken",
            type: 'post',
            data: data_link,
            dataType: "json",
            success: function (resp) {

                var cadena_ini = url_front + '#link/?';
                var tokenlink = resp.data[0].token;

                console.log("token: " + tokenlink);

                $("#modalRegenera").modal();
                $("#lb_enlace").val(cadena_ini + "token=" + tokenlink);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                _VERBOSE ? console.log("error: " + textStatus) : _VERBOSE;

            }
        });

    }


    function genLinkURL() {

        _VERBOSE ? console.log("utils genLinkURL") : _VERBOSE;

        if (_json_config == undefined) {
            return;
        }

//        console.log(_json_config.token);
        var token = _json_config.token;
        getValuesFromToken(token);

    }


    



    /**
     * Función que inicializa las variables necesarias para la creación de histogramas.
     *
     * @function startUtilsModule
     * @public
     * @memberof! utils_module
     * 
     */
    function startUtilsModule() {
        _VERBOSE ? console.log("startUtilsModule") : _VERBOSE;
    }


    // Añadir los miembros públicos
    return{
        startUtilsModule: startUtilsModule,
        processDataForScoreCell: processDataForScoreCell,
        processDataForScoreDecil: processDataForScoreDecil,
        processTitleGroup: processTitleGroup,
        processDataForScoreDecilTable: processDataForScoreDecilTable,
        processDataForScoreCellTable: processDataForScoreCellTable,
        processDataForFreqSpecie: processDataForFreqSpecie,
        processDataForFreqCell: processDataForFreqCell,
        reduceScoreCell: reduceScoreCell,
        reduceDecilGroups: reduceDecilGroups,
        hashCode: hashCode,
        getLinkToken: getLinkToken,
        // genLinkURL: genLinkURL
        // getValuesFromToken: getValuesFromToken
    }


});
