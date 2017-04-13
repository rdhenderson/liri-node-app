var http = require('http');

var fileSystem = require('fs');
console.log('Server trying to start');

var s = http.createServer(function (request, response) {    


    // response.writeHead(200, {'Content-Type': 'text/html'});

    // var read_stream = fileSystem.createReadStream('liri.txt');
    // read_stream.on('data', writeCallback);
    // read_stream.on('close', closeCallback);

    // function writeCallback(data){
    //     response.write('<li>' + data + '</li>');

    //     console.log(data);
    // }

    // function closeCallback(){
    //     response.end();
    //}

}).listen(8080);

s.on('request', function(request, response){
        response.writeHead(200);
        console.log('method', request.method);
        console.log('headers', request.headers);
        console.log('url', request.url);
        console.log('response: ', request);
        response.write('hi');
        response.end();
    });

console.log('Server started');