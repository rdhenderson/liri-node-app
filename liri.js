var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');
var keys = require('./key.js');

//Flag to toggle command line or prompt interface
var cmdLineInterface = true;


var helpString = 	"-------------------------------- \n" +
					"Valid commands: \n" + 
					"* my-tweets \n" + 
					"* spotify-this-song <SONG NAME> \n" + 
					"* movie-this <MOVIE NAME>\n" +
					"* do-what-it-says \n" + 
					"* Toggle interface with 'i' and 'q' to quit"
					"-----------------------"

var promptQuestions = [
		{ 	
			type: 'list',
			message: 'Please select an option below',
			choices: ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says', 'toggle interface', 'quit'],
			name: 'cmd',
			filter: function (str){
				if (str === 'quit') str = 'q';
				if (str === 'toggle interface') str = 'i';
				console.log('answers', str);
				return str;
			}
		},  
		{
		  name: 'song',
		  message: 'OK, so what song are you looking for?',
		  type: 'input',
		  when: function(answers){
		    return answers.cmd === 'spotify-this-song';
	  		}
	  	},
	  	{
		  name: 'movie',
		  message: 'OK, so what movie are you looking for?',
		  type: 'input',
		  when: function(answers){
		    return answers.cmd === 'movie-this';
	  		}
	  	}];

var cmdQuestions = [{ 	
			type: 'input', 
			message: "==============   \n Please enter a command. Press ? for help. \n",
			name: 'cmd'
		}];

var horizontal = "=======================================================";

//Say hello to the user
console.log(horizontal);
console.log("");
console.log("Welcome! LIRI the BENEVOLENT hears you. LIRI will help.");
console.log("");
console.log(horizontal);

//Start command loop by calling parse function with command line arguments
liriParse(process.argv.slice(2));

function liriListen(){
	//Choose question set based on command line interface flag
	var questions = (cmdLineInterface) ? cmdQuestions : promptQuestions;
	
	inquirer.prompt(questions).then(function(response){
		
		console.log(horizontal);
		//Create argument string from responses (in case song/movie is multiple words)
		var args = '';
		for(var key in response) {
			args += response[key] + ' ';
		}
		if (response.cmd === 'Quit') args = 'q';
		if (response.cmd === 'Toggle Interface') args = 'i';
		
		liriParse(args.trim().split(' '));
	});
}

//Listener function to select functionality: 
function liriParse(args){
	//If no command, exit function and call listen
	if (!args[0]) return liriListen();	
	
	//Otherwise, log and then parse command
	logCmd(args);

	switch (args[0]) {
		case 'my-tweets':
			listTweets(args);
			break;
		case 'spotify-this-song':
			listSpotify(args);
			break;
		case 'movie-this':
			listMovie(args);
			break;
		case 'do-what-it-says':
			listFileCmd(args);
			break;
		case '?' :
			console.log(helpString);
			liriListen();	
			break;
		case 'q': //Quit
			console.log("Goodbye!");
			process.exit();
			break;
		case 'i':
			cmdLineInterface = !cmdLineInterface;
			liriListen();
			break;
		case 'python':
			console.log("Ni! NIIII!");
			liriListen();
		default: 
			console.log("I'm sorry, I did not understand your request.  Enter '?'' for help or 'i' to toggle interactive prompts.");
			logCmd(['error:', args]);
			liriListen();
			break;
		}
}


function listFileCmd(args) {
	//Check if user entered a text file as argument, if not, use random.txt
	var file = (args[1].endsWith('.txt')) ? args[1] : 'random.txt';
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
	// var movieName = 'princess bride';

	// Then run a request to the OMDB API with the movie specified
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&r=json&tomatoes=true";

	// This line is just to help us debug against the actual URL.
	console.log(queryUrl);

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

	  		// console.log(JSON.stringify(movie, null, 2));

	  	
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

	var params = {screen_name: 'rdhcoding'};

	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (error) {
	   	console.error("error: ", error);
	  } else {
	  	//console.log(JSON.stringify(tweets, null, 2));
	  	console.log("===================================");
		console.log(" ");
		console.log(" ");
	  	for (var i = 0; i < tweets.length; i++) {
	  		console.log("Text:", tweets[i].text);
	  		console.log("Created:", tweets[i].created_at);
	  		console.log("");
	  	}
		console.log(" ");
		console.log(" ");
	  	console.log("===================================");

	  }
	  liriListen();
	});
}



function logCmd(args){
	//Open log file and count number of lines
	var data = fs.readFileSync('log.txt');
	var lines = data.toString().split('\n').length-1;
	fs.appendFile('log.txt', lines+ ') ' + args.join(' ') + '\n', function(error){
		if (error) {
			return console.error(error);
		}	
	});
}





