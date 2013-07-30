
var   server 	= require('http');
var   fs 		= require('fs');
var   url  	  	= require('url');

//Creating HTTP Server 	
var app = server.createServer(function(request, response){
	require('./router')(request, response, url);	
});

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) 
{
	socket.on('connect', function(data){
		socket.join(data.room);
	});
	
	socket.on('display_screen', function(data){
		io.sockets.in('web').emit('display_image', data)
	});
});

app.listen(3000, function(){
	console.log('NodeJS Server running at port 8080');
});

 