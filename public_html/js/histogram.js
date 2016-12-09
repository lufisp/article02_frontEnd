
function Histogram() {    
    this.numOperationsTrack = 40;
    this.operDiff = [];
    this.operSun = [];
    this.atmId = "";
    this.bar;


    var svg = d3.select("#histogramSvg");
    var margin = {top: 20, right: 20, bottom: 20, left: 50};
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var paddingX = 2;
    var numberOfAtms;
    var maxDomainValue = 100000;

    var y = d3.scaleLinear()
            .domain([0, maxDomainValue])
            .range([height, 0]);


    this.startHistogram = function (atmCashHist) {
        //console.log("Atm: " + atmId + " has been clicked");                        
        this.atmCash = atmCashHist;
        numberOfAtms = atmCashHist.length;
        var barWidth = width / numberOfAtms;


        svg.selectAll("*").remove();
        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var x = d3.scaleLinear()
                .domain([0, this.atmCash.length])
                .range([0, width]);

        g.append("g")
                .attr("class", "axis-y-histogram")
                .call(d3.axisLeft(y));


        this.bar = g.selectAll(".bar")
                .data(this.atmCash)
                .enter()
                .append("g")
                .attr("class", "bar")
                .attr("transform", function (d, i) {
                    return "translate(" + x(i) + "," + y(d.value) + ")";
                });

        this.bar.append("rect")
                .attr("x", 1)
                .attr("width", barWidth - paddingX)
                .attr("fill", function (d) {
                    if (d.value > 0.6 * maxDomainValue) {
                        return "#579086";
                    } else if (d.value > 0.4 * maxDomainValue) {
                        return "#DDB835";
                    } else
                        return "#DD4A35";

                })
                .attr("height", function (d) {
                    return height - y(d.value);
                });
        this.bar.append("text")
                .attr("y", -5)
                .attr("x", barWidth / 2)
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.id
                });



    };
    this.updateHistogram = function (atmCashHist) {
        var x = d3.scaleLinear()
                .domain([0, this.atmCash.length])
                .range([0, width]);

        for (var i = 0; i < this.atmCash.length; i++) {
            this.atmCash[i].value = atmCashHist[i].value;
        }
        this.bar
                .attr("transform", function (d, i) {
                    return "translate(" + x(i) + "," + y(d.value) + ")";
                })
                .selectAll("rect")
                .transition()
                .duration(1500)
                .attr("fill", function (d) {
                    if (d.value > 0.6 * maxDomainValue) {
                        return "#579086";
                    } else if (d.value > 0.4 * maxDomainValue) {
                        return "#DDB835";
                    } else
                        return "#DD4A35";

                })
                .attr("height", function (d) {
                    return height - y(d.value);
                })
                

    }



}
Histogram.prototype = {};
