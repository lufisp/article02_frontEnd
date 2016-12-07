/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var atmCash;
var atmCashHist = [];
var atmOperHist = {};
var host = "http://localhost:8080";
var map;
var atmMarkers = [];
var atmMap;
var atmMapOverlay;
var analyse;
var updateTime = 2000;

$(document).ready(function () {
    getDataFirstTime();
    analyse = new Analyse();
});

function dropMarkerAtm(map) {
    var atmsPosition = [];    
    clearMarkers();
    for (var i = 0; i < atmCashHist[0].length; i++) {
        var id = atmCashHist[0][i].id;
        var lat = Number(atmCashHist[0][i].latitude);
        var lng = Number(atmCashHist[0][i].longitude);  
        var position = {"lat":lat,"lng":lng};
        addMarker(id, position, map);
    }
}

function addMarker(id,position, map) {    
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        animation: google.maps.Animation.DROP
    });
    marker.addListener('click',function(){
        analyse.startAnalysis(id,atmOperHist);
    });
    atmMarkers.push(marker);
}

function clearMarkers() {
    for (var i = 0; i < atmMarkers.length; i++) {
        atmMarkers[i].setMap(null);
    }
    atmMarkers = [];
}

function AtmMapOverlay() {
    var layer;
    var projection;
    var paddingX = 20;
    var paddingY = 10;
    var paddingTextY = 22;
    var paddingTextX = 0;

    function transform(d) {        
        d = new google.maps.LatLng(d.latitude, d.longitude);        
        d = projection.fromLatLngToDivPixel(d);        
        return d3.select(this)
                .style("left", (d.x - paddingX) + "px")
                .style("top", (d.y - paddingY) + "px");
    }

    this.onAdd = function () {
        layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "atmCashMap");
    };
    this.draw = function () { 
        projection = this.getProjection();        
        var atmCashMap = layer.selectAll("svg")
                .data(atmCashHist[0])                
                .each(transform)
                .enter()
                .append("svg")
                .each(transform);

        atmCashMap.selectAll("text")
                .data(function (a) {
                    return  [a];
                })
                .enter()
                .append("text")
                .attr("id", function (d) {
                    return "text_" + d.id;
                })
                .attr("class", "atmCashText")
                .attr("x", paddingTextX)
                .attr("y", paddingTextY)
                .attr("dy", ".31em")
                .text("");
    };

    this.update = function () {        
        var diff = this.diffOper();
        var atmCashMap = layer.selectAll("svg")
                .data(d3.values(diff))
                .each(transform);       
         atmCashMap.selectAll("text")
         .data(function(a) {return [a.value];})                                
         .style('opacity',0)
         .transition()
         .duration(500)
         .style('opacity',1)                
         .attr("x", paddingTextX)
         .attr("y", paddingTextY)
         .attr("dy", ".31em")
         .text(function (d) {
            if(d === 0)return "";
            else return d;
         });
    };
    
    this.diffOper = function () {
        var previus = atmCashHist[atmCashHist.length - 2];
        var current = atmCashHist[atmCashHist.length - 1];
        var diff = [];
        for (i = 0; i < previus.length; i++) {
            var object = {
                "id": previus[i].id,
                "value": current[i].value - previus[i].value
                
            };
            diff.push(object);
        }
        return diff;
    };

}
AtmMapOverlay.prototype = new google.maps.OverlayView();


function startMap() {
    var mapStyles = [
        {
            featureType: "road",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ],
            featureType: "poi.all",
                    elementType: "labels",
                    stylers: [
                        {visibility: "off"}
                    ]
        }
    ];
    var map;
    map = new google.maps.Map($("#myMap").get(0), {
        center: {lat: 45.504813, lng: -73.577156},
        zoom: 12
    });
    map.setOptions({styles: mapStyles});
    dropMarkerAtm(map);
    atmMapOverlay = new AtmMapOverlay();
    atmMapOverlay.setMap(map);
    
    
}

function getDataFirstTime() {    
    jQuery.ajax({
        type: 'GET',
        url: host + '/getDataFirstTime/',
        dataType: 'json',
        success: function (data, textStatus, jqXHR) {            
            atmCashHist.push(data);             
            var html = "<table class='table'>";
            html = html + "<tr><th>Id</th>";
            html = html + "<th>Value</th>";           
            for (var tableIndex in data) {
                atmOperHist[data[tableIndex].id] = [];
                atmOperHist[data[tableIndex].id].push(data[tableIndex].value);
                html = html + "<tr>";
                html = html + " <td>";
                html = html + data[tableIndex].id;
                html = html + " </td>";
                html = html + " <td>";
                html = html + data[tableIndex].value;
                html = html + " </td>";                
                html = html + "</tr>";            
            }
            html += '</table>';
            //reset the table
            $("#atmData").html("");
            //add just the html constructed above
            $("#atmData").append(html);

            startMap();
            analyse.startAnalysis(1,atmOperHist);


            setTimeout(function () {
                getData();
            }, updateTime);
        }
    });
}

function getData() {
    jQuery.ajax({
        type: 'GET',
        url: host + '/getData/',
        dataType: 'json',
        success: function (data, textStatus, jqXHR) {            
            atmCashHist.push(data)
            var html = "<table class='table'>";
            html = html + "<tr><th>Id</th>";
            html = html + "<th>Value</th>";            
            for (var tableIndex in data) {
                atmOperHist[data[tableIndex].id].push(data[tableIndex].value);
                html = html + "<tr>";
                html = html + " <td>";
                html = html + data[tableIndex].id;
                html = html + " </td>";
                html = html + " <td>";
                html = html + data[tableIndex].value;
                html = html + " </td>";               
                html = html + "</tr>";
            }
            html += '</table>';
            //reset the table
            $("#atmData").html("");
            //add just the html constructed above
            $("#atmData").append(html);

            
            analyse.updateAnalysis(atmOperHist);
            atmMapOverlay.update();

            setTimeout(function () {
                getData();
            }, updateTime);
        }
    });
}