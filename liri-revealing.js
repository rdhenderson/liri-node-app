
//ISSUE: log.show is asynch call, need to figure out how to set liriListen as a callback


//============ MODULES and GLOBAL VARIABLES =================
var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');

// custom modules below
var keys = require('./key.js');  //Twitter authentication keys
var questions = require('./questions.js'); //Inquirer questions (unnecessary complexity)
var log = require('./log.js').Log; // Logging functionality (log.data, log.cmd, log.show('cmd' || 'data'))
//======================================


var liriModule = (function () {
	
	//Flag to toggle command line or prompt interface
	var cmdLineInterface = true;

	//Horizonal rule for formatting purposes. 				
	var hr = "\n=======================================================\n\n";

	var helpString = 	hr +
						"Valid commands: \n" + 
						"\t* my-tweets \n" + 
						"\t* spotify-this-song <SONG NAME> \n" + 
						"\t* movie-this <MOVIE NAME>\n" +
						"\t* do-what-it-says \n" + 
						"\t* Toggle interface with 'i' and 'q' to quit" + hr;

	//===========LIRI PRIVATE FUNCTIONALITY================
	function liriListen(){
		//Choose question set based on command line interface flag
		var liriQuestions = (cmdLineInterface) ? questions.cmd : questions.prompt;

		inquirer.prompt(liriQuestions).then(function(response){
			
			console.log(hr);
			//Create argument string from responses (in case song/movie is multiple words)
			//Looping over keys in response and concatenating to string, 
			var args = '';
		
			for(var key in response) {
				args += response[key] + ' ';
			}

			liriParse(args.trim().split(' '));
		});
	}

	function liriParse(args) {
		//If arg string is empty, just call listen function again
		
		if (args.length === 0) {
			return liriListen();
		} 
		// parse object with valid commands as keys and actions as values
		var parse = {
			'my-tweets': listTweets,
			'spotify-this-song': listSpotify,
			'movie-this': listMovie,
			'do-what-it-says': listFileCmd,
			
			'?' : function () {
				console.log(helpString);
				liriListen();
			},
			'q': function () {
				console.log("Goodbye!");
				process.exit();
			},
			'i': function() {
				cmdLineInterface = !cmdLineInterface;
				liriListen();
			},
			
			'python': function () {
				console.log("We are the nights who say ni! NI!!!!");
				liriListen();
			},

			'show' : function() {
				//Call show function with either user input or default of 'cmd'
				log.show((args[1] || 'cmd'));

				liriListen(); 
			},

			'default': function () { 
				console.log("I'm sorry, I did not understand your request.  Enter '?'' for help or 'i' to toggle interactive prompts.");
				liriListen();
			}
		};

		log.cmd(args);
		(parse[args[0]] || parse['default'])(args);
	}

	function listFileCmd(args) {
		//Check if user entered a text file as argument, if not, use random.txt
		//First check that argument exists, then check if its a text file
		var file = (args[1] && args[1].endsWith('.txt')) ? args[1] : 'random.txt';
		fs.readFile(file, 'utf8', function(error, data){
			//Check for errors
			if (error) return console.error(error);
			//Write file string to argument array
			var fileArgs = data.split(',');
			//Use file data to call parse function
			liriParse(fileArgs);
		});

	}

	function listMovie(args) {

		//Check for user specified movie name, otherwise use Princess Bride
		var movieName = (args.length > 1) ? args.slice(1).join(' ') : 'The Princess Bride';

		// Then run a request to the OMDB API with the movie specified
		var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&r=json&tomatoes=true";

		request(queryUrl, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var movie = JSON.parse(body);
				console.log('Title: ', movie.Title);
		  		console.log('IMDB Rating:', movie.imdbRating);
		  		console.log('Released: ', movie.Year);
		  		console.log('Country: ', movie.Country);
		  		console.log('Language: ', movie.Year);
		  		console.log('Plot Summary: ', movie.Plot);
		  		console.log('Actors: ', movie.Actors);
		  		for (var i = 0; i < movie.Ratings.length; i++) {
		  			if (movie.Ratings[i].Source === 'Rotten Tomatoes') {
				  		console.log('RT rating: ', movie.Ratings[i].Value);
				  		break;
			  		}
		  		}
		  		console.log('RT link: ', movie.tomatoURL);

		  		log.data('Title' + movie.Title);
			}  
			liriListen();	
		});

	}

	function listSpotify(args) {
		// logCmd(args);
		var songName = (args.length > 1) ? args.slice(1).join(' ') : 'The Sign by Ace of Base';
		spotify.search({ type: 'track', query: songName }, function(err, data) {
		    if ( err ) {
		        console.error('Error occurred: ' + err);
		        return;
		    } else {	
				console.log("===================================");
				console.log(" ");
				console.log(" ");
				console.log('Song:', data.tracks.items[0].name);
				for (var i = 0; i < data.tracks.items[0].artists.length; i++) {
					console.log('Artist:', data.tracks.items[0].artists[i].name);
				}
				console.log('Hear a preview at:', data.tracks.items[0].external_urls.spotify);
				console.log(" ");
				console.log(" ");
				console.log("===================================");
		 
				// Use inquirer prompt to allow user to scroll through alternate versions of songs HERE
		    }
		    log.data(data.tracks.items[0].name);
			liriListen();
		});
	}

	function listTweets(args) {
		var client = new Twitter({
		  consumer_key: keys.twitterKeys.consumer_key,
		  consumer_secret: keys.twitterKeys.consumer_secret,
		  access_token_key: keys.twitterKeys.access_token_key,
		  access_token_secret: keys.twitterKeys.access_token_secret
		});

		//Second argument may contain screen name for search 
		var params = {screen_name: (args[1] || 'rdhcoding')};

		client.get('statuses/user_timeline', params, function(error, tweets, response) {
		  if (error) {
		   	console.error("error: ", error);
		  } else {
		  	
		  	console.log(hr);
		  	for (var i = 0; i < tweets.length; i++) {
		  		console.log("Text:", tweets[i].text);
		  		console.log("Created:", tweets[i].created_at);
		  		console.log(" ");
		  		log.data(tweets[i].text + '\n' + tweets[i].created_at);
		  	}
			console.log(hr);
			
		  }
		  liriListen();
		});
	}

	function liriInit () {
		console.log(hr + "Welcome! LIRI the BENEVOLENT hears you. LIRI will help." + hr);
	}

	//Reveal public pointers to private functions
	return {
		parse : liriParse,
		listen : liriListen,
		start : liriInit
	}
})();
//=============================================


//======== MAIN EXECUTION ====================

//Start command loop by parsing any command line arguments
liriModule.parse(process.argv.slice(2));

//=============================================



