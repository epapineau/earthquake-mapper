// Function for formatting timestamp
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    if (min.toString().length === 1){
        min = `0${min}`;
    }
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
    return time;
}

// Functions for determining circle color
function circleColor(mag){ 
    if(mag < 2){
        // Not normally felt
        return '#FF6699';
    } else if(mag < 3){
        // Felt
        return '#E0528F';
    } else if(mag < 4){
        // Felt
        return '#C23D85';
    } else if(mag < 5){
        // Damage
        return '#A3297A';
    } else if(mag < 6){
        // Damage
        return '#851470';
    } else {
        // Great earthquake. Can totally destroy communities.
        return '#660066';
    }
}

// Functions for determining circle size
function circleSize(mag){
    if(mag < 2){
        // Not normally felt
        return 4;
    } else if(mag < 3){
        // Felt
        return 7;
    } else if(mag < 4){
        // Felt
        return 10;
    } else if(mag < 5){
        // Damage
        return 15;
    } else if(mag < 6){
        // Damage
        return 20;
    } else {
        // Great earthquake. Can totally destroy communities.
        return 30;
    }
}

// Mapping function
function mapQuakes(url){    
    d3.json(url, function(data) {
        // Add map background
        var mapStyle = L.mapbox.styleLayer('mapbox://styles/epapineau/cjq79h5306obj2snojh260o8v', {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            // noWrap: true
        }).addTo(map);

        // Add plate boundries
        var plateBounds = L.mapbox
            .featureLayer('GeoJSON/PB2002_boundaries.json')
            .addTo(map);

        // Loop through data and add a circle for each earthquake
        var circleLayer = [];    
        for (var i = 0; i < data['features'].length; i++) {
            // Extract data
            var coords = data['features'][i]['geometry']['coordinates'];
            var details = data['features'][i]['properties'];
            var magnitude = details['mag'];
            var time = timeConverter(details['time']);
        
            // Add circles
            circleLayer.push(
                L.circleMarker([coords[1], coords[0]], {
                color: circleColor(magnitude),
                fillOpacity: 0.5,
                radius: circleSize(magnitude),
                weight: 1
                }).bindPopup(
                    `<div class = "popup text-center p-0">
                        <h2 class = "mb-0">${details['place']}</h2>
                        ${time}<br>
                        Magnitude: ${magnitude} | <a href = "${details['url']}" target = "_blank">USGS Details</a>
                    </div>`   
                )
            );
        }

        // Add circles to the map
        var allMarkers = L.layerGroup(circleLayer)
            .addTo(map);
    });
}

// Function to run on click of Select Data button
function handleSubmit() {
    // Prevent the page from refreshing
    d3.event.preventDefault();
    
    // Get form input of pettype and clear form
    var dataType = d3.select("#inputType").node().value;
    
    var url; 
    if(dataType === "hour"){
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson";
    } else if (dataType === "day"){
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";
    } else if (dataType === "week"){
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
    } else {
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
    }

    // Clear map
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
        console.log(layer)
    });

    // Run mapping function with appropriate URL
    mapQuakes(url);
}

// Initialize map and add style layer
var map = L.map('earthquake-map', {
    minZoom: 2,
    maxZoom: 12 
}).setView([45, -125], 4);

var legend = L.control({position: 'bottomleft'});
    
// Create legend
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var grades = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];
            var labels = [];
    
            // square colors and labels
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                '<i style="background:' + circleColor(grades[i]) + '"></i> ' +
                (grades[i]) + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };
    
        legend.addTo(map);

L.mapbox.accessToken = 'pk.eyJ1IjoiZXBhcGluZWF1IiwiYSI6ImNqb2o0bjJwYTAxZWIza3BhNTA3NDI1MzkifQ.4vnzyiDTvF3ZceR661AR0w';

// Default dataset on load
mapQuakes("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson");

// Change dataset on click
d3.select("#submit").on("click", handleSubmit);