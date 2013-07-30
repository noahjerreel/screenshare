
var   server 	= require('http');
var   fs 		= require('fs');
var   url  	  	= require('url');
var port = process.env.PORT || 5000;
//Creating HTTP Server 	
var app = server.createServer(function(request, response){
	require('./router')(request, response, url);	
});

var io = require('socket.io').listen(app);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) 
{
	socket.on('connected', function(data){
		socket.join(data.room);
	});
	
	socket.on('display_screen', function(data){
		io.sockets.in('web').emit('display_image', data)
	});
});

app.listen(port, function(){
	console.log('NodeJS Server running at port ' + port);
});

 