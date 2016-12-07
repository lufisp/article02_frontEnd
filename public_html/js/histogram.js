
function Histogram() {
    this.maxDomainValue = 1000;
    this.numOperationsTrack = 40;
    this.operDiff = [];
    this.operSun = [];
    this.atmId = "";

    
    var svg = d3.select("#histogramSvg");
    var margin = {top: 20, right: 20, bottom: 20, left: 50};
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;

    this.startAnalysis = function (atmId, atmOperHist) {
        //console.log("Atm: " + atmId + " has been clicked");                
        this.atmId = atmId;
        this.operDiff = [];
        this.operSun = [];
        data = atmOperHist[this.atmId];
        this.startArrays(data);
                  

        svg.selectAll("*").remove();
        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var x = d3.scaleLinear()
                .domain([0, this.numOperationsTrack - 1])
                .range([0, width]);

        var y = d3.scaleLinear()
                .domain([0, this.maxDomainValue])
                .range([height, 0]);



        var line = d3.line()
                .x(function (d, i) {
                    return x(i);
                })
                .y(function (d, i) {
                    return y(d);
                });

        g.append("defs")
                .append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

        g.append("g")
                .attr("class", "axis-y")
                .call(d3.axisLeft(y));

        g.append("g")
                .attr("clip-path", "url(#clip)")
                .append("path")
                .datum(this.operDiff)
                .attr("class", "line")
                .attr("id", "path_" + this.atmId)
                .attr("d", line);

    };
    this.updateAnalysis = function (atmOperHist) {
        data = atmOperHist[this.atmId];
        this.updateArrays(data);

        var x = d3.scaleLinear()
                .domain([0, this.numOperationsTrack - 1])
                .range([0, width]);

        var y = d3.scaleLinear()
                .domain([0, this.maxDomainValue])
                .range([height, 0]);


        var line = d3.line()
                .x(function (d, i) {
                    return x(i);
                })
                .y(function (d, i) {
                    return y(-1 * d);
                });



        var path = d3.select("#path_" + this.atmId)
                .attr("d", line)
                .attr("transform", null)
                .transition();


        if (data.length > this.numOperationsTrack)
            path.attr("transform", "translate(" + x(-1) + ",0)")
                    .duration(500)
                    .ease(d3.easeLinear);

        this.shiftArrays();
    }



}
Analyse.prototype = {};
