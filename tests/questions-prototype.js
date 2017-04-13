// //This is a very confusing way to create inquirer questions.  I recognize that this is silly, but wanted to work with prototypes and inheritance.
// // // Create a prototype question constructor
var Question = function (name, message) {
	this.type = '';
	this.name = 'name';
	this.message = 'message';
}

// // //Create a list question constructor
var List = function (name, message, choices) {
	this.type = 'checkbox';
	this.name = name;
	this.message = message;
	this.choices = choices;
}

// // //Specify that List inherits from Question
List.prototype = new Question;
List.prototype.constructor = List; 

// // //Create input questions constructor
var Input = function (name, message) {
	this.type = 'input';
	this.name = name; 
	this.message = message;
}

// // //Specify that Input inherits from Question
Input.prototype = new Question;
Input.prototype.constructor = Input;


// // //The only thing that makes that worthwhile is the relative ease of creating new question objects:
// // //Array of commands for prompt question
var cmdArray = ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says', 'toggle-interface', 'quit'];

// // //Make a prompt question object
var prompt = new List('cmd', 'please select an option below', cmdArray);

// // //Need to set a filter to pass correct commands to parser
prompt.filter = function (str){
				if (str === 'quit') str = 'q';
				if (str === 'toggle-interface') str = 'i';
				console.log('answers', str);
				return str;
			}

// // //Create conditional questions for extra information if song or movie is selected
// // //the when function specifies that questions will be called when condition is true.
var song = new Input('song', 'OK, so what song are you looking for?');
song.when = function(answers){ return answers.cmd === 'spotify-this-song';}

var movie = new Input('movie', 'Ok, so what movie are you looking for?');
movie.when = function(answers){return answers.cmd === 'movies-this';}

// // //Command line interface question
var cmd = new Input('cmd', "Please enter a command. Press ? for help. \n");

// // //Create array of prompt and command questions
var promptQuestions = [prompt, song, movie];
var cmdQuestions = [cmd];