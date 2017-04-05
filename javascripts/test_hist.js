function createEpsilonHistrogram(json){

    // console.log(json);
    
    console.log("createEpsilonHistrogram");
    
    var margin = {top: 10, right: 40, bottom: 50, left: 15};
    var width = ($("#hist").width()) - margin.left - margin.right;
    var height = histHeight - margin.top - margin.bottom;
    var barPadding = 5;

    console.log("width_hist: " + width);
    // console.log(height);


    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, -10])
        .html(function(d) {
          return  "<strong>Epsilon: </strong> <span style='color:red'>" + parseFloat(d.lbean).toFixed(2)  + " - " + parseFloat(d.rbean).toFixed(2) + "</span><br/><br/>";
        });

    
    var epsilon = getEpsilonFrequencies(json);
    
    // console.log(epsilon);
    // brushYearStart = d3.min(epsilon);
    // brushYearEnd = d3.max(epsilon);

    brushYearStart = 0;
    brushYearEnd = NUM_BEANS - 1;
    minVal_eps = d3.min(epsilon.map(function(d) {return d.val;}));
    maxVal_eps = d3.max(epsilon.map(function(d) {return d.val;}));

    // console.log(brushYearStart);
    // console.log(brushYearEnd);
    // console.log(minVal_eps);
    // console.log(maxVal_eps);


    // scales
    var x = d3.scale.ordinal()
        // .domain([0 , NUM_BEANS-1])
        .rangeRoundBands([margin.left, width - margin.left]);
        // .range([0, $("#hist").width()]);

    var y = d3.scale.linear()
        .domain([0, maxVal_eps+1])
        .range([height, 0]);



    // Prepare the barchart canvas
    var barchart = d3.select("#hist").append("svg")
        .attr("class", "barchart")
        // .attr("width", width + margin.left + margin.right)
        .attr("width", width + margin.left + margin.right)
        // .attr("width", width - margin.left)
        .attr("height", height + margin.top + margin.bottom )
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(tip)
        // .attr("y", height - height - 100)
        // .append("g");

    x.domain(epsilon.map(function(d) { 
        return  parseFloat((d.lbean + d.rbean) / 2).toFixed(2); 
    }));

    // Axis variables for the bar chart
    // x_axis = d3.svg.axis().scale(x).orient("bottom");
    y_axis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        // .tickValues([0,1,2,3,4,5]);

    x_axis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        // .ticks(NUM_BEANS)
        // .tickFormat(function(d) {
        //     console.log(epsilon[d]);
        //     return parseFloat(epsilon[d].lbean).toFixed(2)  + " - " + parseFloat(epsilon[d].rbean).toFixed(2);
        // });


    // x axis
    barchart.append("g")
        .attr("class", "x axis")
        // .style("fill", "#000")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis)
        .append("text")
          // .attr("transform", "rotate(-90)")
          .attr("y", 25)
          .attr("x", width / 2)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Epsilon");
      

    // y axis
    barchart.append("g")
        .attr("class", "y axis")
        // .style("fill", "#000")
        .call(y_axis)
        .attr("transform", "translate(" + (margin.left - 5) + ", 0)")
        .append("text")
          // .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x", 50)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Frecuencia");
        // .attr("transform", "translate(" + margin.left + ", 0)")
        


    // Add a rect for each date.
    barchart.selectAll("rect")
        .data(epsilon)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d,i) {

            // console.log(margin.left);
            
            return (i * ( width / NUM_BEANS-1)) + margin.left;
            
        })
        .attr("y", function (d,i) {
            
            // console.log( "height: " + height);
            // console.log( "y: " + y(d));
            // console.log( "dif: " + (height - y(d)));
            return  y(d.val);

        })

        .attr("height", function (d,i) {
            
            // console.log( "altura: " + y(d));
            return height - y(d.val);

        })
        .attr("width", function(d,i){

            return (width / NUM_BEANS-1) - barPadding;

        })
        .attr("fill", "steelblue")
        .on('mouseover',tip.show)
        .on('mouseout', tip.hide);


    // Draw the brush
    var brush_hist = d3.svg.brush()
        .x(x)
        .on("brush", brushmove)
        .on("brushend", brushend);

    var arc = d3.svg.arc()
      .outerRadius(height / 15)
      .startAngle(0)
      .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

    brushg = barchart.append("g")
      .attr("class", "brush")
      .call(brush_hist);

    brushg.selectAll(".resize").append("path")
        .attr("transform", "translate(0," +  height / 2 + ")")
        .attr("d", arc);

    brushg.selectAll("rect")
        .attr("height", height);





    // ****************************************
    // Brush functions
    // ****************************************

    function brushmove(e) {

        // console.log(e)
        try{
            console.log(e.selected);
            return true;
        }catch(e){
            console.log("nodos");
        }

        var valoresEps = [];

            
        var y = d3.scale.linear()
            .domain([margin.left, width - margin.left])
            .range([0, NUM_BEANS-1]);


        //interval of values
        b = brush_hist.extent();
        // console.log(b);
        // console.log(y(b[0]));
        // console.log(y(b[1]));
        

        var localBrushYearStart = (brush_hist.empty()) ? brushYearStart : y(b[0]),
            localBrushYearEnd = (brush_hist.empty()) ? brushYearEnd : y(b[1]);


        // console.log(localBrushYearStart);
        // console.log(localBrushYearEnd);


        // Snap to rect edge
        d3.select("g.brush").call((brush_hist.empty()) ? brush_hist.clear() : brush_hist.extent([y.invert(localBrushYearStart), y.invert(localBrushYearEnd)]));


        
        // Fade all years in the histogram not within the brush
        d3.selectAll("rect.bar").style("opacity", function(d, i) {

          if(i < localBrushYearStart || i >= localBrushYearEnd || brush_hist.empty()){
            return "1"
          }
          else{
            
            valoresEps.push(d);
            return "0.4"
          }

          // return i >= localBrushYearStart && i <= localBrushYearEnd || brush.empty() ? "1" : ".4";
          // return i < localBrushYearStart || i > localBrushYearEnd || brush_hist.empty() ? "1" : ".4";
          

        });

        // getVisibleNodes(valoresEps,true);
        
    }

    function brushend(e) {


        try{
            console.log(e.selected);
            return true;
        }catch(e){
            console.log("nodos");
        }

        var valoresEps = [];
        var noSelection = false;


        var y = d3.scale.linear()
            .domain([margin.left, width - margin.left])
            .range([0, NUM_BEANS-1]);

        var localBrushYearStart = (brush_hist.empty()) ? brushYearStart : y(b[0]),
            localBrushYearEnd = (brush_hist.empty()) ? brushYearEnd : y(b[1]);

        d3.selectAll("rect.bar").style("opacity", function(d, i) {

              // console.log(i)
              // console.log(localBrushYearStart)
              // console.log(localBrushYearEnd)

              if(brush_hist.empty()){
                noSelection = true;
                return "1";
              }
              else if(i < localBrushYearStart || i > localBrushYearEnd ){
                return "1";
              }
              else{
                valoresEps.push(d);
                return "0.4";
              }

          // return i >= localBrushYearStart && i <= localBrushYearEnd || brush.empty() ? "1" : ".4";
          // return i < localBrushYearStart || i > localBrushYearEnd || brush_hist.empty() ? "1" : ".4";

        });


        
        // if noSelection is equal to true is the same process as the first time the graph is loaded.
        console.log("noSelection: " + noSelection)
        if(noSelection)
            valoresEps = [brushYearStart, brushYearEnd];

        console.log(valoresEps);

        var arrayLinkVisible = getVisibleNodes(valoresEps, noSelection);
        arrayTemp = arrayLinkVisible[0];
        arrayVisibleNodes = arrayLinkVisible[1];
        
        var json = {"nodes":json_nodes, "links":arrayTemp};

        selectableForceDirectedGraph(json, arrayVisibleNodes);

    }


    // createNodeTable(json);

}