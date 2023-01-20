////////////////////////////////////////////////////////////////////
// General settings
////////////////////////////////////////////////////////////////////

var map = L.map('map', {
    minZoom: 12,
    maxZoom: 18
}).setView([46.5384, 6.6201], 12);
mapLink = "<a href='http://openstreetmap.org'>OpenStreetMap</a>";
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: 'Leaflet &copy; ' + mapLink + ', contribution', maxZoom: 18 }).addTo(map);

var starticon = L.icon({
    iconUrl: 'start_icon.png',

    iconSize:     [40, 45], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [20, 44], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var endicon = L.icon({
    iconUrl: 'end_icon.png',

    iconSize:     [40, 45], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [0, 45], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


var waypoints;
var routing;
var start_marker;
var end_marker;
var routing;

var user_speed = 4;
var user_biais = 0;
var user_biais_comment = "normal";

var btn_start = document.getElementById('start-btn');
var btn_end = document.getElementById('end-btn');
var btn_stats = document.getElementById('stats-btn');

accessToken = 'pk.eyJ1IjoibWVsaW5kYWYiLCJhIjoiY2wxbmY4N3MwMDEyajNjbnBoeGpja2oydCJ9.285qhroGeLjv0mL78fDCqQ'







////////////////////////////////////////////////////////////////////
// Set start and end markers
////////////////////////////////////////////////////////////////////

function set_start() {
  
  btn_start.style.backgroundColor = 'rgb(108, 117, 125)';
  btn_start.style.color = 'white';

  map.on('click', function (e) {

    // Reset and hide stats-div content
    //reset_stats();

    if (start_marker != undefined) { start_marker.remove() }
    
    start_marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: starticon, draggable: 'true'}).addTo(map);
    
    setUpRouting();
    

    // Reset the map.onclick function
    map.off('click');

    btn_start.style.backgroundColor = 'rgb(245, 245, 245)';
    btn_start.style.color = 'rgb(108, 117, 125)';

    btn_end.style.backgroundColor = 'rgb(245, 245, 245)';
    btn_end.style.color = 'rgb(108, 117, 125)';
  })
  
}


function set_end() {
  
  btn_end.style.backgroundColor = 'rgb(108, 117, 125)';
  btn_end.style.color = 'white';

  map.on('click', function (e) {

    // Reset and hide stats-div content
    //reset_stats();

    if (end_marker != undefined) { end_marker.remove() }

    end_marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: endicon, draggable: 'true'}).addTo(map);
    setUpRouting();
    
    // Reset the map.onclick function
    map.off('click');

    btn_end.style.backgroundColor = 'rgb(245, 245, 245)';
    btn_end.style.color = 'rgb(108, 117, 125)';

    btn_start.style.backgroundColor = 'rgb(245, 245, 245)';
    btn_start.style.color = 'rgb(108, 117, 125)';    
  })

}









////////////////////////////////////////////////////////////////////
// Routing function
////////////////////////////////////////////////////////////////////

function setUpRouting() {
  // Remove old route it it exists and launch new routing

  if (routing != undefined) {routing.remove()}
  startRouting()
};

function get_points() {
  waypoints = [
    L.latLng(start_marker._latlng.lat,start_marker._latlng.lng),
    L.latLng(end_marker._latlng.lat,end_marker._latlng.lng)
  ]
  return waypoints
};

function startRouting() {
  // Main routing function

  if (start_marker && end_marker != undefined) {

    // Retrive user inputs from HTML
    // user_speed is adjusted each time the slider is moved (sliderChanged() function), if not get standard 5km/h
    // user_biais = 
/*     if (user_speed == undefined) {
      console.log("user speed is undefined and")
      user_speed  = 2;
    } else {
      user_speed = document.getElementById('user-walking-speed').innerHTML
    } */
    console.log("This is the user speed: " + user_speed);

    // Set up maxbox routing with access token and attributes
    mapboxRouting = L.Routing.mapbox(accessToken, { 
      profile : 'mapbox/walking',
      walking_biais: user_biais,
      walking_speed: user_speed,
      alternative: true,
      language: 'fr'
    });

    // Calculate route and show on map
    routing = L.Routing.control({
        router: mapboxRouting,
        waypoints: get_points(),
        routeWhileDragging: true,
        lineOptions: {
          styles: [{
            color: 'red',
            opacity: 1,
            weight: 3
          }]
        },
        createMarker: function (i, start, n){
    var marker_icon = null
    if (i == 0) {
        // This is the first marker, indicating start
        marker_icon = starticon
    } else if (i == n -1) {
        //This is the last marker indicating destination
        marker_icon = endicon
    }
    var marker = L.marker (start.latLng, {
                draggable: true,
                bounceOnAdd: false,
                bounceOnAddOptions: {
                    duration: 1000,
                    height: 800,
                },
                icon: marker_icon
    })
    return marker 
    }}).addTo(map);

    // Check and print routing obj
    console.log("This is the selected route object:")
    console.log(routing)
    
    
    // Do not display to right rectange in map
    routing._container.style.display = "None" 


    // Remove original markers to only leave draggable markers
    start_marker.remove()
    end_marker.remove()

    //document.getElementById("user-inputs").style.display = "none";

    routing.route({ geometryOnly : true, simplifyGeometry: false })
    
    btn_stats.disabled=false
}

};






////////////////////////////////////////////////////////////////////
// Dynamically change user_speed var on user input 
////////////////////////////////////////////////////////////////////

function sliderChange_biais(value) {
  
  if (value == -1) {
  document.getElementById("user-biais").innerHTML = "Bas"
  }
  if (value == 0) {
  document.getElementById("user-biais").innerHTML = "Normal"
  }
  if (value == 1) {
  document.getElementById("user-biais").innerHTML = "Haut"
  }

  if (value == -1) {
  user_biais_comment = "bas"
  }
  if (value == 0) {
  user_biais_comment = "normal"
  }
  if (value == 1) {
  user_biais_comment = "haut"
  }

  user_biais = value
  //startRouting();
  if (start_marker && end_marker != undefined) {
    show_stats();
  }
}

// When the user change the slider value, automatically recalculate 
// the chosen route travel time
function sliderChange(val) {

  if (val == 2) {
  document.getElementById("user-walking-speed").innerHTML = "Marche lente"
  }
  if (val == 4) {
  document.getElementById("user-walking-speed").innerHTML = "Marche normale"
  }
  if (val == 6) {
  document.getElementById("user-walking-speed").innerHTML = "Marche rapide"
  }
  if (val == 8) {
  document.getElementById("user-walking-speed").innerHTML = "Course lente"
  }
  if (val == 10) {
  document.getElementById("user-walking-speed").innerHTML = "Course normale"
  }
  if (val == 12) {
  document.getElementById("user-walking-speed").innerHTML = "Course rapide"
  }
  user_speed = val;

  //startRouting();
  if (start_marker && end_marker != undefined) {
    show_stats();
  }
}
/* 
// Recalculate route when user change walking biais
function radioChange(val) {
  if (start_marker && end_marker != undefined) {
    user_biais = val;
    setUpRouting();
    reset_stats();
  } 
}  */







////////////////////////////////////////////////////////////////////
// Stats functions
////////////////////////////////////////////////////////////////////

function show_stats() {
  // Show stats-div and update current route informations

  console.log("Yay, we're in the show_stats() function.")

  if (routing != null) {
    
    if (routing != undefined){
      console.log("try try try...", routing)
    }
    
    route_distance = routing._selectedRoute.summary.totalDistance
    route_time = routing._selectedRoute.summary.totalTime;

    // Set div visibility to visible:
    document.getElementById("stat-div").style.display = "block";
    // Populate HTML elements with routing attributes and convert in km and minutes
    document.getElementById("route-distance-stat").innerHTML = (route_distance/1000).toFixed(2) + " kilomètre(s)";
    document.getElementById("route-time-stat").innerHTML = (0.06*route_distance/user_speed).toFixed(1) + " minute(s)";
    document.getElementById("stat-comment").innerHTML = "Le biai de marchabilité choisi est " + user_biais_comment.italics() + " et la vitesse de déplacement est " + (user_speed) + " km/h.";

    //FYI
    console.log("The walking biais is (first value) and walking speed is second (from the router itself): ")
    console.log(routing._router.options.walking_biais);
    console.log(routing._router.options.walking_speed);


  } else {

    console.log("routing is empty, select starting and ending points first.");
    alert("Select START and END points.");
  }
  document.getElementById("stats-btn").style.display = "none"

}




function reset_stats() {
  // Hide stats-div, empty divs and reset route informations

  console.log("reset stats function called.")

  document.getElementById("stat-div").style.display = "none";
  document.getElementById("route-distance-stat").innerHTML = "";
  document.getElementById("route-time-stat").innerHTML = "";

  document.getElementById("user-inputs").style.display = "block";
  document.getElementById("stats-btn").style.display = "block"
  routing = null; 

}




////////////////////////////////////////////////////////////////////
// Reset function 
////////////////////////////////////////////////////////////////////

function set_reset() {
  console.log('gros vendredi soir')

  btn_stats.disabled=true

  if (routing != undefined) { 
    routing.remove()
  }
  if (start_marker != undefined) { 
    start_marker.remove()
    start_marker = undefined;
  }

  if (end_marker != undefined) { 
    end_marker.remove()
    end_marker = undefined;
  }
  waypoints = undefined;  

  map.setView([46.5384, 6.6201], 12);

  // Reset and hide stats-div content
  reset_stats();


}








////////////////////////////////////////////////////////////////////
// Geosearch start point
////////////////////////////////////////////////////////////////////

new Autocomplete("search_start", {
  selectFirst: true,
  insertToInput: true,
  cache: true,
  howManyCharacters: 2,
  // onSearch
  onSearch: ({ currentValue }) => {
    // api
    const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
      currentValue
    )}`;

    /**
     * Promise
     */
    return new Promise((resolve) => {
      fetch(api)
        .then((response) => response.json())
        .then((data) => {
          resolve(data.features);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  },

  // nominatim GeoJSON format
  onResults: ({ currentValue, matches, template }) => {
    const regex = new RegExp(currentValue, "gi");

    // if the result returns 0 we
    // show the no results element
    return matches === 0
      ? template
      : matches
          .map((element) => {
            return `
                <li>
                  <p>
                    ${element.properties.display_name.replace(
                      regex,
                      (str) => `<b>${str}</b>`
                    )}
                  </p>
                </li> `;
          })
          .join("");
  },

  onSubmit: ({ object }) => {
    // remove all layers from the map
    // map.eachLayer(function (layer) {
    //   if (!!layer.toGeoJSON) {
    //     map.removeLayer(layer);
    //   }
    // });

    const { display_name } = object.properties;
    const [lng, lat] = object.geometry.coordinates;
    // custom id for marker
    

    // Try to assign new dragged waypoints to markers
    if (waypoints != undefined) {  
      end_marker = L.marker([waypoints[1].lat, waypoints[1].lng])
      console.log('changed end is',end_marker)
    }

    // Remove marker if one already exists
    if (start_marker != undefined) { start_marker.remove() }
    
    // Defines new start_marker
    start_marker = L.marker([lat, lng], {draggable: 'true'} ).addTo(map);
    console.log('start works!', start_marker)

    // On start_marker drag, redefine start_marker latlong !! Only works after dragging it the second time... WHY??
    start_marker.on('dragend', function(event){
      var marker = event.target;
      var position = marker.getLatLng();
      start_marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'})
      console.log('New dragged start_marker is ', start_marker)
    });

    if (routing != undefined) { routing.remove()}

    /// ROUTING DYNAMIC
    if (end_marker != undefined) {startRouting()}
      
  
  },

  // get index and data from li element after
  // hovering over li with the mouse or using
  // arrow keys ↓ | ↑
  onSelectedItem: ({ index, element, object }) => {
    console.log("onSelectedItem:", { index, element, object });
  },

  // the method presents no results
  // no results
  noResults: ({ currentValue, template }) =>
    template(`<li>No results found: "${currentValue}"</li>`),
});








////////////////////////////////////////////////////////////////////
// Geosearch end point
////////////////////////////////////////////////////////////////////

new Autocomplete("search_end", {
  selectFirst: true,
  insertToInput: true,
  cache: true,
  howManyCharacters: 2,
  // onSearch
  onSearch: ({ currentValue }) => {
    // api
    const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
      currentValue
    )}`;

    /**
     * Promise
     */
    return new Promise((resolve) => {
      fetch(api)
        .then((response) => response.json())
        .then((data) => {
          resolve(data.features);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  },

  // nominatim GeoJSON format
  onResults: ({ currentValue, matches, template }) => {
    const regex = new RegExp(currentValue, "gi");

    // if the result returns 0 we
    // show the no results element
    return matches === 0
      ? template
      : matches
          .map((element) => {
            return `
                <li>
                  <p>
                    ${element.properties.display_name.replace(
                      regex,
                      (str) => `<b>${str}</b>`
                    )}
                  </p>
                </li> `;
          })
          .join("");
  },

  onSubmit: ({ object }) => {
    // remove all layers from the map
    // map.eachLayer(function (layer) {
    //   if (!!layer.toGeoJSON) {
    //     map.removeLayer(layer);
    //   }
    // });

  if (end_marker != undefined) {'teste test', end_marker.remove(), routing.remove()}



    const { display_name } = object.properties;
    const [lng, lat] = object.geometry.coordinates;
    // custom id for marker


    if (waypoints != undefined) {   
    start_marker = L.marker([waypoints[0].lat, waypoints[0].lng])
    console.log('changed start is',start_marker)
    }
    if (end_marker != undefined) { end_marker.remove() }
    
    end_marker = L.marker([lat, lng]).addTo(map);
    console.log('end works!', end_marker)
    if (routing != undefined) { routing.remove()}

    //ROUTING DYNAMIC
    if (start_marker != undefined) {startRouting()}
      

  },

  // get index and data from li element after
  // hovering over li with the mouse or using
  // arrow keys ↓ | ↑
  onSelectedItem: ({ index, element, object }) => {
    console.log("onSelectedItem:", { index, element, object });
  },

  // the method presents no results
  // no results
  noResults: ({ currentValue, template }) =>
    template(`<li>No results found: "${currentValue}"</li>`),
});





