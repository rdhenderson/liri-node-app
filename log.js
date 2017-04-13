var fs = require('fs');

//Constructor function sets default log files. Note, this can be changed in user program. 
var Log = function(){
	this.data_log = 'liri.txt';
	this.cmd_log ='log.txt';
}

Log.prototype.data = function (str) {
	fs.appendFile(this.data_log, '<p>' + str + '</p>', function(error){
		if (error) {
			return console.error(error);
		}	
	});
}

Log.prototype.cmd = function(args) {
	//Open log file and count number of lines
	var data = fs.readFileSync(this.cmd_log);
	var lines = data.toString().split('\n').length-1;
	
	fs.appendFile(this.cmd_log, lines+ ') ' + args.join(' ') + '\n', function(error){
		if (error) {
			return console.error(error);
		}	
	});
}

Log.prototype.show = function(type){
	//Set file based on whether liri passed 'cmd' or 'data' as request
	var file = (type === 'cmd') ? this.cmd_log : this.data_log; 
	console.log(this.callback);
	fs.readFile(file, 'utf-8', function(error, data){
		
		if (error) return error;

		var log = data.split('\n');
		console.log("===============================");
		console.log("Reading log file: ", this.data_log);
		for (var i = 0; i < log.length; i++){
			console.log(log[i]);
		}
		//This seems like a bad idea.  
		this.callback();
	});
}



exports.Log = new Log();

