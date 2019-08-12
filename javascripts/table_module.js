
/**
 * Módulo tabla, utilizado para crear y gestionar las tablas en nicho ecológico y comunidad ecológica.
 *
 * @namespace table_module
 */
var table_module = (function(verbose) {

    
    var _VERBOSE = verbose;
    var _tbl_decil = false,
            _tbl = false,
            _tbl_net = false;
    var _language_module;
    var _iTrans;
    var _json, _display_obj;
    var _data_list_eps, _data_list_decil;

    var _fcols = {
        '0': 'generovalido', '1': 'epitetovalido',
        // '2' : 'bioclim', '3' : 'rango',
        '2': 'nij', '3': 'nj',
        '4': 'ni', '5': 'n',
        '6': 'epsilon', '7': 'score',
        '8': 'reinovalido', '9': 'phylumdivisionvalido',
        '10': 'clasevalida', '11': 'ordenvalido',
        '12': 'familiavalida'
    };


    /**
     * Éste método inicializa variables y componentes que son necesarios en la generación de tablas.
     *
     * @function _initilizeTableModule
     * @private
     * @memberof! table_module
     * 
     * @param {boolean} tbl_net - Bandera que indica el estado incial de la tabla desplegada en comunidad ecológica
     */
    function _initilizeTableModule(tbl_net) {
        _VERBOSE ? console.log("_initilizeTableModule") : _VERBOSE;
        _tbl_net = tbl_net;
    }


    /**
     * Éste método asigna a una variable global una instancia del módulo de lenguaje.
     *
     * @function setLanguageModule
     * @public
     * @memberof! table_module
     * 
     * @param {object} language_module - Módulo de internacionalización
     */
    function setLanguageModule(language_module) {
        _language_module = language_module;
        _iTrans = _language_module.getI18();
    }


    /**
     * Éste método genera la tabla decil del análisis de nicho ecológico cuando un decil del histograma es seleccionado.
     *
     * @function createDecilList
     * @public
     * @memberof! table_module
     * 
     * @param {array} list_elements - Array con el resultado del análisis de nicho ecológico del histograma decil
     */
    function createDecilList(list_elements = null) {

        _VERBOSE ? console.log("createDecilList") : _VERBOSE;

        if(list_elements){

            _data_list_decil = []
            
            list_elements.forEach(function(d) {
                var item_list = [];
                item_list.push(d.decil)
                item_list.push(d.species)
                item_list.push(d.epsilons)
                item_list.push(d.scores)
                item_list.push(d.occ)
                item_list.push(d.occ_perdecile)            
                _data_list_decil.push(item_list)
            })

        }
        

        if (_tbl_decil != false) {
            // $('#example').dataTable().fnClearTable();
            // $('#example').dataTable().fnAddData(data_list);
            $('#example').dataTable().fnDestroy();
        }
        // else {

        $('#example').DataTable({
            "dom": 'Bfrtip',
            "info": true,
            "bSort": true,
            "aoColumnDefs": [{
                    "bSortable": false,
                    "aTargets": []
                }],
            // "bFilter" : false,
            "bLengthChange": false,
            "bPaginate": true, // Pagination True
            "processing": true, // Pagination True
            // "pagingType" : 'simple',
            "iDisplayLength": 10,
            "searching": true,
            "scrollY": "300px",
            "scrollCollapse": true,
            "paging": false,
            data: _data_list_decil,
            columns: [
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Decil'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_decil') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_decil')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Variable'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_name') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_especie_tbl')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Epsilon'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_epsilon') + "'); table_module().addImageEpsilon(); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_epsilon')},
                {title: ' <button type=\'button\' class=\'btn btn-info glyphicon glyphicon-info-sign btn_column\' onclick=\' $("#div_formula").empty(); $("#lb_header_info").text("Score"); $("#lb_body_info").text("' + _iTrans.prop('lb_msg_score') + '"); table_module().addImageScore(); $("#modalInfo").modal()\' ></button> ' + _iTrans.prop('tip_tbl_score')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Porcentaje por decil'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_por_decil') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_procentaje_occ')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Porcentaje occ en decil'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_por_occdecil') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_procentaje_occdecil')}
            ],
            buttons: [
                'copy', 'csv', 'excel', 'print'
            ],
            language: {
                "sEmptyTable": _iTrans.prop('sEmptyTable'), 
                "info": _iTrans.prop('info'),
                "search": _iTrans.prop('search') + " ",
                "zeroRecords": _iTrans.prop('zeroRecords'),
                "infoEmpty": _iTrans.prop('infoEmpty'),
                "infoFiltered": _iTrans.prop('infoFiltered')
            }




        });

        // }

        _tbl_decil = true;

    }


    /**
     * Éste método agrega la imagen de la fórmula para el cáculo de score.
     *
     * @function addImageScore
     * @public
     * @memberof! table_module
     * 
     */
    function addImageScore() {

        $("#div_formula").append("<img src=images/score.png>");

    }

    /**
     * Éste método agrega la imagen de la fórmula para el cáculo de epsilon.
     *
     * @function addImageEpsilon
     * @public
     * @memberof! table_module
     * 
     */
    function addImageEpsilon() {

        $("#div_formula").append("<img src=images/epsilon.png>");

    }
    
    
    
    /**
     * Éste método limpia la tabla de resultados generales del análisis de nicho ecológico.
     *
     * @function clearEspList
     * @public
     * @memberof! table_module
     * 
     */
    function clearEspList(){
        _VERBOSE ? console.log("clearEspList") : _VERBOSE;

        if (_tbl) {
            $('#tdisplay').dataTable().fnClearTable();
        }
    }
    
    
    /**
     * Éste método limpia la tabla de resultados generales del análisis de nicho ecológico.
     *
     * @function clearEspList
     * @public
     * @memberof! table_module
     * 
     */
    function clearDecilList(){
        _VERBOSE ? console.log("clearDecilList") : _VERBOSE;
        
        if (_tbl_decil) {
            $('#example').dataTable().fnClearTable();
        }
    }


    /**
     * Éste método genera la tabla de resultados totales para el análisis de nicho ecológico. 
     *
     * @function createEspList
     * @public
     * @memberof! table_module
     * 
     * @param {array} rawdata - Array con el resultado de epsilon y score por especie del análisis de nicho ecológico. 
     */
    function createEspList(rawdata = null) {

        _VERBOSE ? console.log("createEspList") : _VERBOSE;

        // var data_list = rawdata.data;    
        _data_list_eps = rawdata ? rawdata.data : _data_list_eps
        
        if (_tbl != false) {
            // $('#tdisplay').dataTable().fnClearTable();
            // $('#tdisplay').dataTable().fnAddData(data_list);
            $('#tdisplay').dataTable().fnDestroy();
        }
        

        $('#tdisplay').dataTable({
            "dom": 'Bfrtip',
            "info": true,
            "bSort": true,
            "aoColumnDefs": [{
                    "bSortable": false,
                    "aTargets": []
                }],
            // "bFilter" : false,
            "bLengthChange": false,
            "bPaginate": true, // Pagination True
            "processing": true, // Pagination True
            // "serverSide" : true,
            // "pagingType" : 'simple',
            "iDisplayLength": 10,
            "searching": true,
            "scrollY": "300px",
            "scrollCollapse": true,
            "paging": false,
            "data": _data_list_eps,
            "columns": [
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\"(function(){$('#lb_header_info').text('"+_iTrans.prop('lb_especie_tbl_eps')+"'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_name') + "'); $('#modalInfo').modal();}())\" ></button> " + _iTrans.prop('lb_especie_tbl_eps')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nij'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_nij') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nij')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nj'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_nj') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nj')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Ni'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_ni') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_ni')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('N'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_n') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_n')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Epsilon'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_epsilon') + "'); table_module().addImageEpsilon(); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_epsilon')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Score'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_score') + "'); table_module().addImageScore(); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('tip_tbl_score')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('"+_iTrans.prop('a_item_reino')+"'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_reino') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_reino')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('"+_iTrans.prop('a_item_phylum')+"'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_phylum') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_phylum')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('"+_iTrans.prop('a_item_clase')+"'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_clase') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_clase')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('"+_iTrans.prop('a_item_orden')+"'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_orden') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_orden')},
                {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('"+_iTrans.prop('a_item_familia')+"'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_familia') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('a_item_familia')}
            ],
            buttons: [
                'copy', 'csv', 'excel', 'print'
            ],
            language: {
                "sEmptyTable": _iTrans.prop('sEmptyTable'), 
                "info": _iTrans.prop('info'),
                "search": _iTrans.prop('search') + " ",
                "zeroRecords": _iTrans.prop('zeroRecords'),
                "infoEmpty": _iTrans.prop('infoEmpty'),
                "infoFiltered": _iTrans.prop('infoFiltered')
            }

        });


        _tbl = true;

    }

    /**
     * Éste método ajusta los componentes visuales después de obtener lso resutlados del análisis de nicho ecológico. 
     *
     * @function _adjustComponents
     * @private
     * @memberof! table_module
     * 
     */
    function _adjustComponents() {

        _VERBOSE ? console.log("_adjustComponents") : _VERBOSE;

//        var window_width = $(window).width();
//        var left_margin = window_width * 0.05;
//        left_margin = left_margin / 2;

//        _VERBOSE ? console.log("left_margin: " + left_margin) : _VERBOSE;
        // $( "myScrollableBlockEpsilonTable" ).css( "margin-left", left_margin );
//        $("#treeAddedPanel").css({marginLeft: left_margin + "px"});
//        $("#div_example").css({marginLeft: left_margin + "px"});
//        $("#histcontainer_row").css({marginLeft: left_margin + "px"});
//        $("#myScrollableBlockEpsilonDecil").css({marginLeft: left_margin + "px"});
//        $('.title_element').css({'margin-left': left_margin + 'px'});

    }


    /**
     * Éste método retorna una instancia del módulo tabla para enlazarlo con el histograma de comunidad ecológica.
     *
     * @function createListNet
     * @public
     * @memberof! table_module
     * 
     * @param {json} json - Valores generados por el módulo histograma creado en comunidad ecológica
     * @param {object} display_obj - Referencia del controlador de comunidad ecológica
     */
    function createListNet(json, display_obj) {

        _VERBOSE ? console.log("createListNet") : _VERBOSE;

        _display_obj = display_obj;
        
        var list_array = [EpsilonList];
        var list_component = d3.selectAll(".list")
                .data(list_array);

        _json = json;
        _VERBOSE ? console.log(_json.links) : _VERBOSE;

        

        return list_component;

    }


    /**
     * Clase que genera instancias de tipo tabla para la interacción con el módulo de histograma y el modulo de red utilizando el controlador de comunidad ecológica.
     *
     * @function EpsilonList
     * @public
     * @memberof! table_module
     * 
     * @param {object} div - Contendor de la tabla de los resultados del análisis de comunidad ecológica y de los rangos enviados por el módulo histograma
     */
    function EpsilonList(div) {

        _VERBOSE ? console.log("EpsilonList: " + _tbl_net) : _VERBOSE;

        var epsilonByGender = _display_obj.nestByR.entries(dim_eps_freq.top(Infinity));
        
        var temp_list = [];
        var link_counter = 0
        var max_link = _display_obj.max_num_link

        console.log("tbl_module max_link: " + max_link)
        console.log("tbl_module first_load: " + _display_obj.hist_load)


        epsilonByGender.forEach(function(bean, i) {

            bean.values.forEach(function(item, j) {

                if (Math.abs(parseFloat(item.value)) > ep_th) {
                    link_counter++

                    if(_display_obj.hist_load || link_counter <= max_link){
                        temp_list.push(item);    
                    }
                    
                }

            })

        });

        
        // epsilonByGender = temp;

        console.log("temp_list length: " + temp_list.length)
        console.log(temp_list)


        div.each(function() {

            _VERBOSE ? console.log("div each epsilonList") : _VERBOSE;

            var data_list = [];


            // epsilonByGender.forEach(function(d) {

                // item = d.values[0];
                temp_list.forEach(function(val) {
                    
                    
                    console.log(val)
                    console.log(_json.nodes)

                    var item_list = [];

                    var name_s, name_t;

                    if(_json.nodes[val.source] === undefined)
                        return true;


                    if(_json.nodes[val.source].biotic){

                        name_s =  _json.nodes[val.source].generovalido + " " + _json.nodes[val.source].especieepiteto
                    }
                    else{
                        var infimo = _json.nodes[val.source].tag.split(':')[0];
                        var supremo = _json.nodes[val.source].tag.split(':')[1];

                        name_s = _iTrans.prop("a_item_" + _json.nodes[val.source].layer) + " (" + parseFloat(infimo).toFixed(2) + ":" + parseFloat(supremo).toFixed(2) + ")";
                    }

                    if(_json.nodes[val.target] === undefined)
                        return true;

                    if(_json.nodes[val.target].biotic){
                        name_t = _json.nodes[val.target].generovalido + " " + _json.nodes[val.target].especieepiteto
                    }
                    else{
                        var infimo = _json.nodes[val.target].tag.split(':')[0];
                        var supremo = _json.nodes[val.target].tag.split(':')[1];

                        name_t = _iTrans.prop("a_item_" + _json.nodes[val.target].layer) + " (" + parseFloat(infimo).toFixed(2) + ":" + parseFloat(supremo).toFixed(2) + ")";
                    }

                    item_list.push(name_s);
                    item_list.push(name_t);

                    item_list.push(val.nij);
                    item_list.push(val.nj);
                    item_list.push(val.ni);
                    item_list.push(val.n);

                    item_list.push(val.value);
                    
                    item_list.push(val.score);

                    data_list.push(item_list)

                });


            // })

            console.log("data_list.length: " + data_list.length)



            if (_tbl_net == true) {
                // $('#relation-list').dataTable().fnClearTable();
                $('#relation-list').dataTable().fnDestroy();
            }
            _tbl_net = true;
            
            
            $('#relation-list').DataTable({
                "dom": 'Bfrtip',
                "info": true,
                "bSort": true,
                "aoColumnDefs": [{
                        "bSortable": false,
                        "aTargets": []
                    }],
                "bLengthChange": false,
                "bPaginate": true, // Pagination True
                "processing": true, // Pagination True
                "iDisplayLength": 10,
                "searching": true,
                "scrollY": "300px",
                "scrollCollapse": true,
                "paging": false,
                data: data_list,
                columns: [
                    // { sTitle: "<input type='checkbox'></input>","mDataProp": null, "sWidth": "20px", "sDefaultContent": "<input type='checkbox' ></input>", "bSortable": false}

                    {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Variable fuente'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_source') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_fuente_tbl')},
                    {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Variable destino'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_target') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_sumidero_tbl')},
                    {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nij'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_nij') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nij')},
                    {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Nj'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_nj') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_nj')},
                    {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Ni'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_ni') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_ni')},
                    {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('N'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_n') + "'); $('#modalInfo').modal()\" ></button> " + _iTrans.prop('lb_n')},
                    {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Epsilon'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_epsilon') + "'); table_module().addImageEpsilon(); $('#modalInfo').modal()\" ></button> " + "Epsilon"}
                    // {title: " <button type='button' class='btn btn-info glyphicon glyphicon-info-sign btn_column' onclick=\" $('#div_formula').empty(); $('#lb_header_info').text('Score'); $('#lb_body_info').text('" + _iTrans.prop('lb_msg_score') + "'); table_module().addImageScore(); $('#modalInfo').modal()\" ></button> " + "Score"}
                ],
                buttons: [
                    'copy', 'csv', 'excel', 'print'
                ],
                language: {
                    "sEmptyTable": _iTrans.prop('sEmptyTable'), 
                    "info": _iTrans.prop('info'),
                    "search": _iTrans.prop('search') + " ",
                    "zeroRecords": _iTrans.prop('zeroRecords'),
                    "infoEmpty": _iTrans.prop('infoEmpty'),
                    "infoFiltered": _iTrans.prop('infoFiltered')
                }
            });
            // data-target='#modalInfo' data-toggle='modal'
            // header_param='Variable fuente' body_param='Variable fuente'
        });


    }

    /**
     * Éste método realiza el llamdo de la función que inicializa los parámetros necesarios para la creación de tablas en los sistemas de nicho y comunidad.
     *
     * @function startTableModules
     * @public
     * @memberof! table_module
     * 
     * @param {boolean} tbl_net - Bandera que indica el estado incial de la tabla desplegada en comunidad ecológica
     */
    function startTableModule(tbl_net) {
        _VERBOSE ? console.log("startTableModule") : _VERBOSE;
        _initilizeTableModule(tbl_net);
    }

    return{
        startTableModule: startTableModule,
        createDecilList: createDecilList,
        createEspList: createEspList,
        setLanguageModule: setLanguageModule,
        createListNet: createListNet,
        addImageScore: addImageScore,
        addImageEpsilon: addImageEpsilon,
        clearEspList: clearEspList,
        clearDecilList: clearDecilList,
        // getTblEps: getTblEps
    }


});
