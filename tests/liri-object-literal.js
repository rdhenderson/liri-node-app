
//============MODULES=================
var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');

// custom modules below
var keys = require('./key.js');  //Twitter authentication keys
var prompts = require('./questions.js'); //Inquirer questions
var log = require('./log.js').Log; // Logging functionality (log.data, log.cmd, log.show('cmd' || 'data'))
//======================================

//========GLOBAL VARIABLES==============
//Horizontal rule for logging clarity with
var hr = "\n=======================================================\n\n";

//===========LIRI FUNCTIONALITY================
//Constructor for Liri object
var liri = {
	//Flag to toggle command line or prompt interface
	CLI : true,

	that : this,
	//Default to CLI questions
	questions : prompts.cmd,

	// create object listing liri commands/actions
	command : {
		'my-tweets' : this.listTweets,
		// 'spotify-this-song': liri.listSpotify,
		// 'movie-this': liri.listMovie,
		// 'do-what-it-says': liri.listFile,
		
		// '?' : function () {
		// 	console.log(hr + "Valid commands: \n" + 
		// 					"* my-tweets \n" + 
		// 					"* spotify-this-song <SONG NAME> \n" + 
		// 					"* movie-this <MOVIE NAME>\n" +
		// 					"* do-what-it-says \n" + 
		// 					"* Toggle interface with 'i' and 'q' to quit" + hr);
		// 	this.listen();
		// },

		// 'q': function () {
		// 	console.log("Goodbye!");
		// 	process.exit();
		// },

		// 'i': function() {
		// 	cmdLineInterface = !cmdLineInterface;
		// 	this.questions = this.CLI ? questions.cmd : questions.prompt;
		// 	this.listen();
		// },
		
		// 'python': function () {
		// 	console.log("Ni! NIIII!");
		// 	this.listen();
		// },

		// 'show' : function() {
		// 	//Show logfile of either data or commands
		// 	// log.show((args[1] || 'cmd'));
		// },

		'default': function () { 
			console.log("I'm sorry, I did not understand your request.  Enter '?'' for help or 'i' to toggle interactive prompts.");
			//console.log('this in default', this);
			liri.listen();
		}
	},

	parse : function (args) {
		console.log('command', this.command);
		console.log('Parsing', args);
		//log.cmd(args);
		//console.log('parse', this);
		//console.log('command', this.command);
		(this.command[args[0]] || this.command['default'])(args);
	},

	//Initialization function to announce Liri's presence. 
	init : function () {
		console.log(hr + "Welcome! LIRI the BENEVOLENT hears you. LIRI will help." + hr);
	},

	listen : function () {
		console.log('Listening');
		inquirer.prompt(this.questions).then(function(response){
			
			console.log(hr);
			//Create argument string from responses (in case song/movie is multiple words)
			//Looping over keys in response and concatenating to string, 
			var args = '';
		
			for(var key in response) {
				args += response[key] + ' ';
			}
			console.log('Calling parse with args= ', args.trim().split(' '));
			this.parse(args.trim().split(' '));
		});
	},

	listFile : function (args) {
		console.log('File listing');
		this.listen();
		// //Check if user entered a text file as argument, if not, use random.txt
		// var file = (args[1].endsWith('.txt')) ? args[1] : 'random.txt';
		// fs.readFile(file, 'utf8', function(error, data){
		// 	//Check for errors
		// 	if (error) return console.error(error);
		// 	//Write file string to argument array
		// 	var fileArgs = data.split(',');
		// 	//Use file data to call parse function
		// 	liri.parse(fileArgs);
		// });
	},

	listMovie : function (args) {
		console.log('Movie listing');
		this.listen();
		// //Check for user specified movie name, otherwise use Princess Bride
		// var movieName = (args.length > 1) ? args.slice(1).join(' ') : 'The Princess Bride';
		// // var movieName = 'princess bride';

		// // Then run a request to the OMDB API with the movie specified
		// var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&r=json&tomatoes=true";

		// // This line is just to help us debug against the actual URL.
		// console.log(queryUrl);

		// request(queryUrl, function (error, response, body) {
		// 	if (!error && response.statusCode === 200) {
		// 		var movie = JSON.parse(body);
		// 		console.log('Title: ', movie.Title);
		//   		console.log('IMDB Rating:', movie.imdbRating);
		//   		console.log('Released: ', movie.Year);
		//   		console.log('Country: ', movie.Country);
		//   		console.log('Language: ', movie.Year);
		//   		console.log('Plot Summary: ', movie.Plot);
		//   		console.log('Actors: ', movie.Actors);
		//   		//Find the rotten tomatoes rating item
		//   		for (var i = 0; i < movie.Ratings.length; i++) {
		//   			if (movie.Ratings[i].Source === 'Rotten Tomatoes') {
		// 		  		console.log('RT rating: ', movie.Ratings[i].Value);
		// 		  		break;
		// 	  		}
		//   		}
		//   		console.log('RT link: ', movie.tomatoURL);

		//   		// console.log(JSON.stringify(movie, null, 2));

		//   		// log.data('Title' + movie.Title);
		// 	}
		// 	this.listen();	
		// });
	},

	listSpotify : function (args) {
		//Get songname from args array or set to default
		var songName = (args.length > 1) ? args.slice(1).join(' ') : 'The Sign by Ace of Base';
		
		spotify.search({ type: 'track', query: songName }, function(err, data) {
		    if ( err ) {
		        console.error('Error occurred: ' + err);
		        return;
		    } else {	
		    	console.log(hr);
				console.log('Song:', data.tracks.items[0].name);
				for (var i = 0; i < data.tracks.items[0].artists.length; i++) {
					console.log('Artist:', data.tracks.items[0].artists[i].name);
				}
				console.log('Hear a preview at:', data.tracks.items[0].external_urls.spotify);
				console.log(hr);
				console.log(" ");
				console.log("===================================");
		 
				// Use inquirer prompt to allow user to scroll through alternate versions of songs HERE
		    }
		    // log.data(data.tracks.items[0].name);
			this.listen();
		});
	},

	listTweets : function (args) {
		var client = new Twitter({
		  consumer_key: keys.twitterKeys.consumer_key,
		  consumer_secret: keys.twitterKeys.consumer_secret,
		  access_token_key: keys.twitterKeys.access_token_key,
		  access_token_secret: keys.twitterKeys.access_token_secret
		});

		var params = {screen_name: 'rdhcoding'};

		client.get('statuses/user_timeline', params, function(error, tweets, response) {
		  if (error) {
		   	console.error("error: ", error);
		  } else {
		  	//console.log(JSON.stringify(tweets, null, 2));
		  	console.log(hr);
		  	for (var i = 0; i < tweets.length; i++) {
		  		console.log("Text:", tweets[i].text);
		  		console.log("Created:", tweets[i].created_at);
		  		console.log("");
		  	}
			console.log(hr);
		  }
		  this.listen();
		});
	},



}
	


//======== MAIN EXECUTION ====================

//Create a new liri object
//var liri = new Liri();

//Start command loop - call parse if CLI arguments, else call listen function
// if (process.argv.length > 2) {
// 	liri.parse(process.argv.slice(2));
// } else {
// 	liri.listen();
// }

// console.log(liri);

liri.init();
//liri.listen();
liri.parse(['my-tweets']);
//liri.listTweets('my-tweets');



