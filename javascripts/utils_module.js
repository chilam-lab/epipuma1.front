var utils_module = (function (verbose) {

    var _VERBOSE = verbose;
    var buckets = 20;
    var deciles = 10;

    function processDataForScoreCell(data) {

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

    function _compare_desc(a, b) {

        _VERBOSE ? console.log("_compare_desc") : _VERBOSE;

        if (a.key > b.key)
            return -1;
        if (a.key < b.key)
            return 1;
        return 0;
    }

    function processTitleGroup(groupid, tfilters) {

        _VERBOSE ? console.log("processTitleGroup") : _VERBOSE;
        
        _VERBOSE ? console.log(groupid) : _VERBOSE;
        _VERBOSE ? console.log(tfilters) : _VERBOSE;

        var title_valor = '';

        if (groupid !== undefined) {
            // group_item = 0 ->> root
            if (tfilters[0].type === 4) {
                title_valor = JSON.stringify(
                        {'title': 'Grupo Bio ' + groupid,
                            'type': tfilters[0].type,
                            'group_item': tfilters[0].group_item,
                            'is_parent': true})
            } else if (tfilters[0].type === 0) {
                title_valor = JSON.stringify(
                        {'title': 'Grupo Abio ' + groupid,
                            'type': tfilters[0].type,
                            'group_item': tfilters[0].group_item,
                            'is_parent': true})
                // title_valor = "Grupo Abio " + groupid;
            } else { // if (tfilters[0].type == 1){
                title_valor = JSON.stringify(
                        {'title': 'Grupo Topo ' + groupid,
                            'type': tfilters[0].type,
                            'group_item': tfilters[0].group_item,
                            'is_parent': true})
                // title_valor = "Grupo Abio " + groupid;
            }
        } else if (tfilters[0].value) {
            // debug("title: " + tfilters[0].value);
            // debug("title: " + tfilters[0].label);
            // debug(group_item);
            if (tfilters[0].type === 4) {
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

//         debug("title_valor: " + title_valor);
        return JSON.parse(title_valor)
    }


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
        // debug(data_cell)

        // var cross_score = crossfilter(data_cell)
        // cross_score.groupAll()
        // var decil_dimension = cross_score.dimension(function(d) { return d.decile });
        // decil_dimension.filter(10)

        var map_spid = d3.map([]);

        data_cell.forEach(function (row_item, index) {

            if (row_item.decile != decil_selected)
                return;

            row_item.species.forEach(function (specie, index) {

                if (!map_spid.has(specie.spid)) {
                    var item = {};
                    item.decile = row_item.decile,
                            item.spid = specie.spid
                    item.score = specie.score
                    item.epsilon = specie.epsilon
                    item.nj = specie.nj
                    item.njd = 1
                    item.name = specie.name
                    map_spid.set(specie.spid, item)
                } else {
                    var item = map_spid.get(specie.spid);
                    item.njd = item.njd + 1
                    map_spid.set(specie.spid, item)
                }

            })

        })

        // debug(map_spid.values());

        return map_spid.values();


    }


    function processDataForScoreCellTable(data) {
        
        _VERBOSE ? console.log("processDataForScoreCellTable") : _VERBOSE;

        var cells_array = data.map(function (d) {
            return {
                cells: d.cells,
                score: parseFloat(d.score),
                spid: d.spid,
                epsilon: parseFloat(d.epsilon),
                score: parseFloat(d.score),
                nj: d.nj,
                name: d.especievalidabusqueda
            }
        })

        var cells = []
        cells_array.forEach(function (item, index) {
            item.cells.forEach(function (cell_item, index) {
                cells.push({
                    cell: cell_item,
                    score: item.score,
                    spid: item.spid,
                    epsilon: item.epsilon,
                    score: item.score,
                    nj: item.nj,
                    name: item.name
                })
            })
        })
        // debug(cells)

        var cross_cells = crossfilter(cells)
        cross_cells.groupAll();

        var cells_dimension = cross_cells.dimension(function (d) {
            return d.cell;
        });

        var groupByScoreCell = cells_dimension.group().reduce(
                function (item, add) {
                    item.tscore = item.tscore + add.score
                    item.spids.push(add.spid)
                    item.epsilons.push(add.epsilon)
                    item.scores.push(add.score)
                    item.njs.push(add.nj)
                    item.names.push(add.name)

                    return item
                },
                function (item, remove) {
                    item.tscore = item.tscore - remove.score

                    var index = item.spids.indexOf(remove.spid);
                    if (index > -1) {
                        item.spids.splice(index, 1);
                    }

                    index = item.epsilons.indexOf(remove.epsilon);
                    if (index > -1) {
                        item.epsilons.splice(index, 1);
                    }

                    index = item.scores.indexOf(remove.score);
                    if (index > -1) {
                        item.scores.splice(index, 1);
                    }

                    index = item.njs.indexOf(remove.nj);
                    if (index > -1) {
                        item.njs.splice(index, 1);
                    }

                    index = item.names.indexOf(remove.name);
                    if (index > -1) {
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

        var cell_score_array = [];
        for (var i = 0; i < map_cell.length; i++) {
            const entry = map_cell[i];
            var len = entry["value"].spids.length;

            var item = {};
            item.gridid = entry["key"];
            item.key = parseFloat((entry["value"].tscore).toFixed(3));

            var species = [];
            for (var j = 0; j < len; j++) {

                var specie = {};
                specie.spid = entry["value"].spids[j];
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
        // debug(cell_score_array)
        // debug(cell_score_array[0].gridid)
        // debug(cell_score_array[0].tscore)
        // debug(cell_score_array[0].species)
        return cell_score_array

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
        processDataForScoreCellTable: processDataForScoreCellTable
    }


});