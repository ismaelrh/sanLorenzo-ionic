//Load locations of old map
var fs = require('fs');
var read = require('readline-sync');

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

function searchPlace(placeName, locations){
	var cleanPlaceName = cleanName(placeName);
	var match = false;
	for (var key in locations) {
   		if (locations.hasOwnProperty(key)) {
   			//Extract before -,.
   			let alternative;
   			if(cleanPlaceName.indexOf("-")>-1){
   				alternative = cleanPlaceName.substr(0,cleanPlaceName.indexOf("-")).trim();
   			}
   			if(cleanPlaceName.indexOf(",")>-1){
   				alternative = cleanPlaceName.substr(0,cleanPlaceName.indexOf(",")).trim();
   			}
   			if(cleanPlaceName.indexOf(".")>-1){
   				alternative = cleanPlaceName.substr(0,cleanPlaceName.indexOf(",")).trim();
   			}
      		if(key.indexOf(cleanPlaceName) > -1 || key.indexOf(alternative) >-1){
      			match = true;
      			return {place_long:locations[key].place_long, place_lat:locations[key].place_lat}
      		}
   		}
	}
	return undefined;
}


function cleanName(name){
	var res = name.replace("–","-");
	res = res.trim();
	res = res.toLowerCase();
	res = res.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
	res = res.replace("“","\"");
	res = res.replace("”","\"");
	if(res.charAt(res.length-1)=='.'){
		res = res.substr(0,res.length-1);
	}
	return res;
}


var locations = {};
var loaded = 0;
readFiles("old/",function(filename,content){
	const list = JSON.parse(content);
	for(var obj of list){
		var name = cleanName(obj.place_text);
		locations[name]={
			place_text: name,
			place_long: obj.place_long,
			place_lat: obj.place_lat
		}
	}
	loaded++;
	if(loaded>=8){
		process(locations);
	}
},function(error){
	console.log(error);
});


function process(locations){

	console.log(locations);
	//Now, we read every input file
	readFiles("new/",function(filename,content){
		const events = JSON.parse(content);
		for(var event of events){
			var loc = searchPlace(event.place_text,locations);
			if(!loc){
				console.log("No info for \"" + event.place_text + "\"");
				coord = read.question("lat,long");
			
				event.place_lat = coord.split(",")[0].trim();
				event.place_long = coord.split(",")[1].trim();
				locations[cleanName(event.place_text)]={
					place_text: cleanName(event.place_text),
					place_long: event.place_lat,
					place_lat: event.place_long
				}
				console.log(event);
			}
			else{
				event.place_lat = loc.place_lat;
				event.place_long = loc.place_long;
			}
			
			//console.log(cleanName(event.place_text));
		}

		fs.writeFile("output/" + filename, JSON.stringify(events,null,4), function(err) {
    	if(err) {
    	    return console.log(err);
   		 }

    console.log("The file was saved!");
}); 
		
	});
	//console.log(locations);
}


