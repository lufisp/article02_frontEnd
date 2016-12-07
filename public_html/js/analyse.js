
function Analyse() {
    this.maxDomainValue = 10000;
    this.numOperationsTrack = 10;
    this.operDiff = [];
    this.operSun = [];
    this.atmId = "";


    this.startArrays = function (data) {
        /*The array data, has negative values, but want the array operDff and 
         * operSun */
        var init = 0;
        if (data.length > this.numOperationsTrack) {
            init = data.length - this.numOperationsTrack - 1;
        } else {
            init = 0;
        }
        
        for (var i = init, j = 0; i < data.length; i++,j++) {            
            if (i == init) {
                this.operDiff[j] = 0;                
            } else {
                this.operDiff[j] = data[i] - data[i - 1];                
            }
        }
        
        for (var i = init, j = 0; i < data.length; i++,j++) {            
            if (i == init) {
                this.operSun[j] = 0;
                /*Accumulates the previous diffs on the first ellement of the array*/
                for(var k = 1; k < init; k++){
                    this.operSun[j] += data[k] - data[k-1];
                }
            } else {                
                this.operSun[j] = this.operSun[j - 1] + data[i] -  data[i - 1];
            }
        }

    }

    this.updateArrays = function (data) {
        var lastElementOperDiff;
        var lastElementSun;

        if (this.operDiff.length > 0) {
            lastElementOperDiff = this.operDiff[this.operDiff.length - 1];
            this.operDiff.push(data[data.length - 1] - data[data.length - 2]);
        } else
            this.operDiff.push(0);

        if (this.operSun.length > 0) {
            lastElementSun = this.operSun[this.operSun.length - 1];
            this.operSun.push(lastElementSun + data[data.length - 1] - data[data.length - 2]);
        } else
            this.operSun.push(0);
    };

    this.shiftArrays = function () {
        if (this.operDiff.length > this.numOperationsTrack) {
            this.operDiff.shift();
            this.operSun.shift();
        }
    }

    var svg = d3.select("#analyseSvg");
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
        //console.log(this.operDiff);            
        //console.log(this.operSun);            

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
                .datum(this.operSun)
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
