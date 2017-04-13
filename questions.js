var Inquirer = require('inquirer');

//The questions created in the straigtforward and understandable fashion: 
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

//Export the question arrays for access in main liri file. 
exports.prompt = promptQuestions;
exports.cmd = cmdQuestions; 

