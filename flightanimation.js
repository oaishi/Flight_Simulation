$(function() {
  var OD_PAIRS = [
    ["NRT", "JFK"],
    ["SFO", "NRT"],
    ["LAX", "HNL"],
    ["HNL", "NRT"],
    ["CDG", "JFK"],
    ["NRT", "SYD"],
    ["FCO", "PEK"],
    ["LHR", "PVG"],
    ["NRT", "ARN"],
    ["LAX", "JFK"],
    ["NRT", "DEL"],
    ["DFW", "GRU"],
    ["MAD", "ATL"],
    ["ORD", "CAI"],
    ["HKG", "CDG"],
    ["LAS", "CDG"],
    ["NRT", "SVO"],
    ["DEN", "HNL"],
    ["ORD", "LAX"],
    ["SIN", "SEA"],
    ["SYD", "PEK"],
    ["CAI", "CPT"],
    ["CUN", "JFK"],
    ["ORD", "JFK"],
    ["LHR", "BOM"],
    ["LAX", "MEX"],
    ["LHR", "CPT"],
    ["PVG", "CGK"],
    ["SYD", "BOM"],
    ["JFK", "CPT"],
    ["MAD", "GRU"],
    ["EZE", "FCO"],
    ["DEL", "DXB"],
    ["DXB", "NRT"],
    ["GRU", "MIA"],
    ["SVO", "PEK"],
    ["YYZ", "ARN"],
    ["LHR", "YYC"],
    ["HNL", "SEA"],
    ["JFK", "EZE"],
    ["EZE", "LAX"],
    ["CAI", "HKG"],
    ["SVO", "SIN"],
    ["IST", "MCO"],
    ["MCO", "LAX"],
    ["FRA", "LAS"],
    ["ORD", "FRA"],
    ["MAD", "JFK"]
  ];

  var currentWidth = $('#map').width();
  var width = 938;
  var height = 620;

  var projection = d3.geo
                     .mercator()
                     .scale(150)
                     .translate([width / 2, height / 1.41]);

  var path = d3.geo
               .path()
               .pointRadius(2)
               .projection(projection);
  
  var svg = d3.select("#map")
              .append("svg")
              .attr("preserveAspectRatio", "xMidYMid")
              .attr("viewBox", "0 0 " + width + " " + height)
              .attr("width", currentWidth)
              .attr("height", currentWidth * height / width);

  var airportMap = {};
  var download_flag = 0;
  
  var ending_path = "";
  var d , start_time;

  function transition(plane, route, id, origin, destination) {
    var l = route.node().getTotalLength();
    plane.transition()
        .duration(l * 50)
        .attrTween("transform", delta(plane, route.node(), id, origin, destination))
        .each("end", function() { route.remove(); 
                console.log("finishing_flight: " + id); 
                d = new Date();
                var end_time = d.getTime();   
                ending_path += origin + " " + destination + " " + (end_time - start_time) / 1000 + "\n";
                download_flag++;
                if (download_flag == OD_PAIRS.length)
                {
                download(ending_path, 'all_routes.txt', 'text/plain');
                download_flag = 1;
                }
                
                })
        .remove();
  }
  
  function delta(plane, path, id, origin, destination) {
    var l = path.getTotalLength();
    var plane = plane;
    return function(i) {
      return function(t) {
        var p = path.getPointAtLength(t * l);

        var t2 = Math.min(t + 0.05, 1);
        var p2 = path.getPointAtLength(t2 * l);

        var x = p2.x - p.x;
        var y = p2.y - p.y;
        var r = 90 - Math.atan2(-y, x) * 180 / Math.PI;

        var s = Math.min((Math.sin(Math.PI * t) * 0.7), 0.3);
        
        console.log( id + ": translate(" + p.x + "," + p.y + ") scale(" + s + ") rotate(" + r + ")");
        
        return "translate(" + p.x + "," + p.y + ") scale(" + s + ") rotate(" + r + ")";
		//return "translate(" + p.x + "," + p.y + ") scale(0.7) rotate(" + r + ")";
      }
    }
  }

  function fly(origin, destination, id) {
    var route = svg.append("path")
                   .datum({type: "LineString", coordinates: [airportMap[origin], airportMap[destination]]})
                   .attr("class", "route")
                   .attr("d", path);

    //https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    var str = "rgb(" + r + "," + g + ","+ b + ")";
   
    // .attr does not work on fill/stroke, we need .style for that 
    var plane = svg.append("path")
                   .attr("class", "plane")
                   .attr("d", "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z")
                   .style("fill", str/*"rgb(255,0,0)"*/)
                   .style("stroke-width", 10);

    transition(plane, route, id, origin, destination);
  }
  
  function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
   }

  function project(coordinates){
      
    var TILE_SIZE = 256;
    var siny = Math.sin((coordinates[0] * Math.PI) / 180);

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);

    x = TILE_SIZE * (0.5 + coordinates[1] / 360),
    y = TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
        
    return {
        x_cord: x,
        y_cord: y,
    };
   } 
   
  function loaded(error, countries, airports) {
    svg.append("g")
       .attr("class", "countries")
       .selectAll("path")
       .data(topojson.feature(countries, countries.objects.countries).features)
       .enter()
       .append("path")
       .attr("d", path);

    svg.append("g")
       .attr("class", "airports")
       .selectAll("path")
       .data(topojson.feature(airports, airports.objects.airports).features)
       .enter()
       .append("path")
       .attr("id", function(d) {return d.id;})
       .attr("d", path);
       
    d = new Date();
    start_time = d.getTime();   
    

    var airport_positions = "";
    var geos = topojson.feature(airports, airports.objects.airports).features;
    for (i in geos) {
      airportMap[geos[i].id] = geos[i].geometry.coordinates;
      airport_positions += geos[i].id + " " + geos[i].geometry.coordinates + "\n";
      pixel_cords = project(geos[i].geometry.coordinates);
      //var iterator = geos[i].geometry.coordinates.values();
      console.log("Airport " + i + " cord: " + Array.isArray(geos[i].geometry.coordinates));
    }
    
    download(airport_positions, 'json.txt', 'text/plain');

    var i = 0;
    setInterval(function() {
      if (i > OD_PAIRS.length - 1) {
        //set we want loop
        //i = 0;
        //set we do not want loop        
        clearInterval();
      }
      var od = OD_PAIRS[i];
      fly(od[0], od[1], i);
      i++;
    }, 150);
  }

  queue().defer(d3.json, "json/countries2.topo.json")
         .defer(d3.json, "json/airports.topo.json")
         .await(loaded);

  $(window).resize(function() {
    currentWidth = $("#map").width();
    svg.attr("width", currentWidth);
    svg.attr("height", currentWidth * height / width);
  });
});