#!/usr/bin/env node

// Requirements
// ============
// [File System](http://nodejs.org/api/fs.html)
var fs = require("fs"),
// [path](http://nodejs.org/api/path.html)
    path = require("path"),
// [Request Module](https://www.npmjs.org/package/request)
    request = require("request"),
// [Mustache](https://www.npmjs.org/package/mustache)
    Mustache = require("mustache"),
// [Commander.js](https://www.npmjs.org/package/commander)
    program = require("commander");


// Commands and options with commander.js
// ======================================

program
    .version(require("../package.json").version)
    .option("-l, --language [lang]", "specifies the language - as a ISO County Code [US]", "US")
    .option("-o, --output [name]", "which name the output HTML file should have [movies]", "movies")
    .option("-t, --template [name]", "choose template name: list | poster [list]", "list");


// Get all movies
// ==============
// First, we need to get all movies
// in the **current** directory.
//
// Because every movie is in **one** directory,
// every directory represents one movie. So we just need
// to get all the files in the current directory and filter
// for directories.

var movieList = fs.readdirSync('.').filter(function(element){
    return fs.statSync(element).isDirectory();
});

// Maybe delete all info.json files
// ================================
// If the ```reset``` command is called, we need to delete every
// ```info.json``` file in every folder.
//
// After that, we can exit the tool.
program
    .command("reset")
    .description("deletes every info.json file")
    .action(function(){
        for(var i = 0; i < movieList.length; i++){
            var path = "./" + movieList[i] + "/info.json";
            if(fs.existsSync(path)){
                fs.unlinkSync(path);
            }
        }
        
        console.log("All information is resetted.");
        
        // End the tool with success
        process.exit(0);
        
    });

program.parse(process.argv);

// Filter the list
// ===============
// We need to filter the list, which of these
// directories doesn't have a `info.json` file in it,
// because all the information about a movie is stored in
// this file inside of its directory.

var newMovies = movieList.filter(function(element){
    return !fs.existsSync("./" + element + "/info.json");
});

// Now, we have all new movies or better: all the movies
// without any information stored inside of its folder.

// Get information about new movies
// ================================
// This tool uses the [iTunes Search API](https://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html) to retrieve
// information about a movie.
//
// Every new movie needs an `info.json` file inside
// of its folder with the following tags in it:
//
// - `title` - `String` - the title of the movie
// - `description` - `String` - the description of the movie plot
// - `poster` - `String` - a url to the movie poster
// - `duration` - `String` - the length of the movie as a string in this form: `hh:mm:ss`
// - `genre` - `String` - the genre as a string (e.g. `Action`)
// - `year` - `Integer` - the year the movie came out
// - `trailer` - `String` - a direct url to a trailer
//
// Not (yet) supported by the iTunes API:
//
// - `director` - `String` - the director's name
// - `actors` - `Array of Strings` - an array of actors
// - `watched` - `Boolean` - was the movie watched?
// - `rating` - `Float` - a rating by the user (usually 1-10)
//
// The not supported tags will be filled with empty values.
// If you want, you can fill them out.

// Query iTunes Search API
// -----------------------
// For every new movie, search the iTunes API and
// save the JSON file in the directory.

// If there are no new movies, then just create the new
// HTML file.
if(newMovies.length === 0){
    nextStep();
}

// Go through all new movies and start the AJAX request
for(var i = 0; i < newMovies.length; i++){
    getInfo(newMovies[i]);
}

var counter = 0;

// This function queries the iTunes search API
function getInfo(title){
    
    var url = constructLink(title);
     
    request(url, function (error, response, body) {
        
        if (!error && response.statusCode == 200) {
            
            var json = JSON.parse(body);
            var result = json.results[0];
            
            createInfo(title, result);
            
            console.log(title);
            
        } else{
            console.log("Failed to get information from iTunes for " + title);
            process.exit(1);
        }
        
        counter++;
        
        if(counter === newMovies.length){
            nextStep();
        }
    
    })
}

// Link construction
// -----------------
// Constructs the link with all options that were given
function constructLink(title){
    
    // Construct the URL
    var url = "https://itunes.apple.com/search?media=movie&limit=1&term=" + title;
    
    // language option
    url += "&country=" + program.language;
    
    return url;
    
}

// This function sets the JSON for the movie
// and saves it to the disk.
function createInfo(title, json){
    
    // This are the **default values** for an `info.json` file
    var movie = {
        title: title,
        description: "No Description",
        poster: "",
        duration: "Unknown",
        genre: "Unknown",
        year: "Unknown",
        trailer: "",
        director: "",
        actors: [],
        watched: false,
        rating: 0
    };
    
    // If we found something in iTunes, we will overwrite these
    // values.
    if(json){
        movie.title = json.trackName;
        movie.description = json.longDescription;
        movie.poster = getBigPoster(json.artworkUrl100);
        movie.duration = convertTime(json.trackTimeMillis);
        movie.genre = json.primaryGenreName;
        movie.year = getReleaseYear(json.releaseDate);
        movie.trailer = json.previewUrl;
    }
    
    fs.writeFileSync("./" + title + "/info.json", JSON.stringify(movie));
    
}


// This is the callback function for having all new `info.json`
// files created. We then simply call the functions below for
// finishing the process.
function nextStep(){
    
    var movies = readAllInfo();
    
    renderTemplate({movies: movies});
    
}



// Read all movie information
// ==========================
// Now we need to read all the movie information from the
// corresponding `info.json` files.
//
// We will then push these onto an array of movie objects,
// which can be rendered by Mustache.
// 
// Remember the `movieList` array? This is the array, where
// all movie titles of this directory are stored.

function readAllInfo(){
    
    return movieList.map(function(title){
        
        var info = fs.readFileSync("./" + title + "/info.json", "utf8");
        
        return JSON.parse(info);
        
    })
    
}


// Render and save the template
// ============================
// We want to load the `template.html` file from disk
// and render that template with our generated `movie` list.
//
// At the end, we will save this file to the **current**
// directory, that means *the root folder* of our movies.

function renderTemplate(movies){
    
    var dir = path.join(path.dirname(fs.realpathSync(__filename)), '../templates');
    
    if(fs.existsSync(dir + "/" + program.template + ".html")){
        var templateName = program.template;
    } else{
        console.log("No valid template name - use default template");
        var templateName = "list";
    }
    
    var template = fs.readFileSync(dir + "/" + templateName + ".html");
    var output = Mustache.render(String(template), movies);
    
    fs.writeFileSync(program.output + ".html", output);
    
}

// Helper functions
// ================
// This function converts milliseconds into human readable
// time strings.
function convertTime(millis){
    
    var hours = Math.floor(millis / 36e5).toString(),
        mins = Math.floor((millis % 36e5) / 6e4).toString(),
        secs = Math.floor((millis % 6e4) / 1000).toString();
    
    mins = mins.length === 1 ? "0" + mins : mins;
    secs = secs.length === 1 ? "0" + secs : secs;
    
    return hours + ":" + mins + ":" + secs;
    
}

// This function slices the year from the given
// releaseDate string.
function getReleaseYear(string){
    return string.slice(0, 4);
}

// A function that constructs a link
// to a bigger image (600x600)
function getBigPoster(url){
    return url.replace("100x100", "600x600");
}
