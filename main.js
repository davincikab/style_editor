var marker = null;
var lmarker = null;
var boundaryLayer = {"type":"FeatureCollection", "features":[]};
var cur_center = null;
var cur_zoom = 12.5;
var mapSettings = {
	attribution:false,
	flyover:false
};

mapboxgl.accessToken = 'pk.eyJ1IjoiZnV0dXJlcXVlc3QiLCJhIjoiY2tsOXF5YjBpMXBuMzJwcHJtcW1paWR3cSJ9.Wm9-3kbklDkExCUNxK8XQA';
        // let zoom = window.innerHeight 

let map = new mapboxgl.Map({
    container: 'map',
    zoom: 12.48236,
    style: 'mapbox://styles/futurequest/ckm5cxhg8dygi17qnrwoa67bw',
	center: [-74.5, 40],
	attributionControl:false
});

var attributionControl = new mapboxgl.AttributionControl();
map.addControl(attributionControl, 'bottom-right');

var geocoder = new MapboxGeocoder({ 
	accessToken: mapboxgl.accessToken, 
	language: 'en-US', 
	types:'country, region, district, place',
	flyTo:{
		linear:false,
		padding: { top: 15, bottom:15, left: 15, right: 15},
		easing:function(t) { return Math.pow(t, 2) }
	},
	filter: function(item) {
		return true;
	}
});

geocoder.addTo(map);

// implement a filter function 



var map2 = null;



map.on('load', function(){
	
	$(".mapboxgl-ctrl-geocoder.mapboxgl-ctrl").append('<div class="map_body2"><div id="map2"  style="height:100%; width:100%; background-color: rgba(2,2,2, 0.1)"></div></div>');
	
	// load marker icons
	map.loadImage("/img/anchor.png", function(err, image) {
		if(err) throw err;
		map.addImage("anchor", image);
	});

	// create a layer for the boundary
	map.addSource('admin-data', {
		"type":"geojson",
		"data":boundaryLayer
	});

	map.addLayer({
		"id":'admin-data',
		"source":"admin-data",
		"type":"line",
		"paint":{
			"line-color":"yellow",
			"line-width":2
		}
	});

	map.on("click", function(e) {
		let features = map.queryRenderedFeatures({layers:['admin-1-boundary']});
		console.log(features);
	});

	// 
	map2 = new mapboxgl.Map({
            container: 'map2',
            zoom: 0,
            //style: 'mapbox://styles/futurequest/ckm5cxhg8dygi17qnrwoa67bw',
			style: 'mapbox://styles/futurequest/ckmcyl3pf703117qyegfwncb4',
			center: [-74.5, 40],
            //style: 'mapbox://styles/futurequest/cklmncax93kky17w3fqcd9tqb',
            // maxBounds:new mapboxgl.LngLatBounds([-126.180383, 19.560182], [-67.508087, 53.92002])
	});
	
	map2.on('load', function(){
	
	map2.setPaintProperty('water', 'fill-color', 'transparent');
	
	map2.setPaintProperty('water-shadow', 'fill-color', 'transparent');
	
	
	map2.setPaintProperty('land', 'background-color', 'transparent');
	
	//map2.setPaintProperty('landcover', 'fill-color', '#ffffff');
	
	//map2.setPaintProperty('landuse', 'fill-color', '#ffffff');
	
	map2.setPaintProperty('landcover', 'fill-opacity', 0.8);
	map2.setPaintProperty('landuse', 'fill-opacity', 0.8);
	
	map2.setPaintProperty('national-park', 'fill-color', '#ffffff');
	map2.setPaintProperty('building', 'fill-color', '#ffffff');
	//map2.setPaintProperty('landuse', 'fill-color', '#ffffff');
	
	
	//map2.setPaintProperty('background', 'background-color', '#F00');
	
	//map2.setPaintProperty('water', 'background-opacity', '0.5');

	});

	
});




// Add zoom and rotation controls to the map.
//map.addControl(new mapboxgl.NavigationControl());
geocoder.on("clear", function(e) {
	console.log("clear");

	boundaryLayer.features = [];
	map.getSource("admin-data").setData(boundaryLayer);
	
	if (lmarker) lmarker.remove();
});

geocoder.on('result', function(e){
	console.log(e);
   var result = e.result;
   console.log(result)
   
   cur_center = result.center;
   
   map2.flyTo({
   		center: cur_center,
		zoom: 3,
		bearing: 0,
		speed: 0.4, // make the flying slow
		curve: 1, // change the speed at which it zooms out
		easing: function (t) {
			return t;
		},
		essential: true
   
   });

	// update boundary layer
   let context = result.context || [];
   console.log(context);

   if(context[0]) {
	   let contextOne = context[0];

	   console.log(contextOne);
	   let resultType = contextOne.id.split(".")[0];


		map.once("zoomend", function(e) {
			boundaryLayer.features = [];

			if(result.bbox) {
				let bboxPolygon = turf.bboxPolygon(result.bbox);
				boundaryLayer.features.push(bboxPolygon);
			}

			// update the 
			map.getSource('admin-data').setData(boundaryLayer);

			// add the marker map marker
			var elMarker = document.createElement('div');
			elMarker.classList.add("drop-marker");
			elMarker.innerHTML = "<img src='/img/anchor.png' alt='' style='height:35px; width:35px;' />";

			if (lmarker) lmarker.remove();

			lmarker = new mapboxgl.Marker({element:elMarker})
				.setLngLat(result.center)
				.addTo(map);

			cur_zoom = map.getZoom();
		});
			   

	//    map.setFilter('admin-1-boundary', ['==', ['get', 'name'], ]);
	  
   }

   var last_name_lv = '';
   var place_name = result["text_en-US"];
   var rplace_name = result["place_name_en-US"];
   var more_loc =  "";

   if("context" in result){
	   var context_x = [];
	   var clen = result["context"].length;
	   for(var ix = 0;  ix < clen; ix++){
		   if(ix != (clen - 1 ))
		   		context_x.push(result["context"][ix]["text_en-US"]);
		}
	    
		if(clen > 1){
			
			//more_loc = 	context_x.join(', ');
			//more_loc  =  '<div class="pl_main_sub2">' + more_loc + '</div>'
			
			last_name_lv = result["context"][clen - 2]["text_en-US"];
		}
		else
			last_name_lv = result["context"].pop()["text_en-US"];   
	}
	else{
		last_name_lv = '';
	}

	var rplace_name_array = rplace_name.split(',');
	last_name_lv = rplace_name_array.slice(-1);
	rplace_name = rplace_name_array[0] + ", " + rplace_name_array.slice(-1);

   $("#place_header").html('<span>'+rplace_name+' &nbsp; &nbsp; at &nbsp; &nbsp;</span> <i>' + result.center[0] + ', '+ result.center[1] + '</i>');
  
   
  // create a HTML element for each feature
  var elm = document.createElement('div');
  elm.className = 'lmarker';
  var content = '<a href="#"><div><div class="pl_main">' + place_name + '</div>'+ more_loc +'<div class="pl_main_ln"></div><div class="pl_main_sub">' + last_name_lv + '</div></div></a>'; 
  elm.innerHTML = content;
  
  document.getElementById('map_loc_label').innerHTML = '';
  document.getElementById('map_loc_label').appendChild(elm);
  		
  
  // create a HTML element for each feature
  var el = document.createElement('div');

  el.className = 'cmarker';
  if(marker != null)
  	marker.remove();
  	marker = new mapboxgl.Marker(el)
			.setLngLat(result.center)
			.addTo(map2);			
			
  
//   if('bbox' in result){
	  
// 	  var bbx = result.bbox;
// 	  console.log(bbx);
	  
// 	  var cityBounds = get_map_bounds(bbx);
	  
// 	  console.log(cityBounds);
// 	  map.fitBounds(bbx, {
// 			// padding: { top: 10, bottom:25, left: 15, right: 5},
// 		  	linear:false,
// 		  	easing:function(t) { return 1 - t }
// 	  });

//   }
});


function flyover_map(event){
	event.preventDefault();

	if(cur_center == null) return;
		
	
	map.flyTo({
		center: cur_center,
		zoom: cur_zoom,
		bearing: 0,
		speed: 0.8, // make the flying slow
		curve: 1, // change the speed at which it zooms out
		easing: function (t) {
			return t;
		},
		essential: true
	});
	
	
}




function add_style(event){
	
	var name = $('#name').val().trim();
	var linkn = $('#linkn').val().trim();
	
	if(name == '' || linkn == '')
		return ;
		
	var sbn = $("#sbutton").html();
	$("#sbutton").prop('disabled', true);
    $("#sbutton").html('<span class="fa fa-spin fa-spinner"></span>');
   
   $.ajax({
	 type: "POST",
	 data: {ch: 'add_style', name: name, linkn: linkn},
	 url:   "",
	 success: function(data){
			$("#sbutton").html(sbn);
			$("#sbutton").prop('disabled', false);
			if(data.substr(0, 4) == 'PASS'){
				
				$('#name').val('');
				$('#linkn').val('');
				
				var id = data.substr(4);
				
				var row = '<tr class="mp_items" data-id="'+id+'" data-link="'+linkn+'"><td style="font-size:16px;"><div id="map_'+id+'" style="width:150px; height:120px;"></div><div><a href="" onClick="show_style(event)">Select</a></div></td><td style="font-size:16px;"><a href="" onClick="show_style(event)">'+name+'</a></td><td>'+linkn+'</td><td><button class="btn btn-danger btn-sm" onClick="remove_style(event)"> Remove</button></td></tr>';
				
				$("#modal_map table tbody").prepend(row);
				
				new mapboxgl.Map({
					container: 'map_' + id,
					zoom: 6,
					style: $(this).data('link'),
					center: [-74.5, 40],
				});		
						
						
				
				
			}
			else{
			  alert(data)	;
				
			}
			 
	 }
	});	
	
}


function  remove_style(event){
	
	event.preventDefault();
	var conf = confirm('Do you want to delete this Style?');
	if(!conf) return;
	
	var parent = $(event.target).closest('tr');
	var id = parent.data('id');
		
	var sbn = $(event.target).html();
	$(event.target).prop('disabled', true);
    $(event.target).html('<span class="fa fa-spin fa-spinner"></span>');
   
   $.ajax({
	 type: "POST",
	 data: {ch: 'remove_style', id: id},
	 url:   "",
	 success: function(data){
			$(event.target).html(sbn);
			$(event.target).prop('disabled', false);
			if(data.substr(0, 4) == 'PASS'){
				parent.remove();
			}
			else{
			  alert(data)	;
				
			}
			 
	 }
	});	
	
	
}

function show_style(event){
	
	event.preventDefault();
	
	var parent = $(event.target).closest('tr');
	
	var style = parent.data('link');
	
	map.setStyle(style);
	
	$("#modal_map").modal('hide');
	

}




$(document).ready(function(){
	
   $(".mp_items").each(function(){
	   
	    new mapboxgl.Map({
            container: 'map_' + $(this).data('id'),
            zoom: 6,
            style: $(this).data('link'),
			center: [-74.5, 40],
		});

	   
	});	
	
	
});


function get_map_bounds(bbx){
	var lat_max = bbx[0];
	var lat_min = bbx[2];
	var lon_max = bbx[1];
	var lon_min =  bbx[3];

	
	var lat_diff_fact = (lat_max - lat_min) / 2;
	lat_max  += lat_diff_fact;
	lat_min  -= lat_diff_fact;
	
	var lon_diff_fact = (lon_max - lon_min) / 2;
	lon_max  += lon_diff_fact;
	lon_min  -= lon_diff_fact;
	
	return [lat_max, lon_max, lat_min, lon_min];
	
}

// settings
$("#flyover-switch").on("input", function(e) {

	// update the settings object;
	let enableFlyOver = e.target.checked;
	mapSettings.flyover = enableFlyOver;

	if(enableFlyOver) {
		$('#map_flyover').css('display', 'inline-block')
	} else {
		$('#map_flyover').css('display', 'none')
	}

});

$("#attribution-switch").on("input", function(e) {

	// update the settings object;
	let showAttribution = e.target.checked;
	mapSettings.attribution = showAttribution;

	if(showAttribution) {
		map.addControl(attributionControl);
	} else {
		map.removeControl(attributionControl, 'bottom-right');
	}

});