
var   server 	= require('http')
	, fs 		= require('fs')
	, url  	  	= require('url');

	
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
	socket.ip_address = "";
	socket.type = "";
	socket.active = true;
	socket.screen_streaming = false;
	
	socket.on('connected', function (data){
		socket.ip_address = data.IPAddress;
		socket.type = data.Type
		console.log(data.IPAddress + " has connected");
		
		if(socket.type == 'desktop'){		
			socket.emit("load_image", {streaming: "thumbnail_streaming"}); 
			socket.stream_interval 	= 	setInterval(function(){
											if(socket.screen_streaming == false){
												socket.emit("load_image", {streaming: "thumbnail_streaming"}); 
											}
										}, 10000);
		}
	});
	
	socket.on("send_image", function(data){	
		io.sockets.clients().forEach(function(client){
			if(socket.screen_streaming == false && client.type == 'web' && client.screen_streaming == false  && client.active){
				client.emit("display_image", {
										image: data.Thumbnail, 
										client: { 
													id		: socket.ip_address.replace(/\./g,''), 
													name	: socket.ip_address, 
													ip		: socket.ip_address
												}
									}); 
			}
			else if(socket.screen_streaming == true && client.type == 'web' && client.active)
			{
				if(client.screen_streaming == true)
				{
					client.emit("start_streaming", {
											image: data.Thumbnail, 
											client: { 
														id		: socket.ip_address.replace(/\./g,''), 
														name	: socket.ip_address, 
														ip		: socket.ip_address
													}
										}); 
										
					/*fs.writeFile(__dirname +"/images/" + new Date().getTime() + ".jpg", data.Thumbnail, 'base64', function(err) {
					  console.log(err);
					});*/
				}
				else
				{
					client.screen_streaming = false;
				}
			}
		});
	});
	
	socket.on("status", function(data){	
		socket.active = data.status;
	});
	
	socket.on("action", function(data){	
		if(data.action == 'video_streaming'){			
			socket.screen_streaming = true;
			
			io.sockets.clients().forEach(function(client){
				if(client.ip_address == data.client && client.type == 'desktop'){
					client.screen_streaming = true;
					clearInterval(client.stream_interval);
					client.stream_interval 	= 	setInterval(function(){
													if(client.screen_streaming == true){
														client.emit("load_image", {streaming: "video_streaming"}); 
													}
												}, 10);
				}
			});
		}
		else{
			socket.screen_streaming = false;
			
			io.sockets.clients().forEach(function(client){
				if(client.ip_address == data.client && client.type == 'desktop'){
					client.screen_streaming = false;
					clearInterval(client.stream_interval);
					client.stream_interval 	= 	setInterval(function(){
													if(client.screen_streaming == true){
														client.emit("load_image", {streaming: "video_streaming"}); 
													}
												}, 10000);
				}
			});
		}
	});
	
	socket.on("disconnect", function(){	
		io.sockets.clients().forEach(function(client){
			if(client.type == 'web' && socket.type == 'desktop')
			{
				client.emit("disconnect_user", { 
										client: { 
													id		: socket.ip_address.replace(/\./g,''), 
													name	: socket.ip_address, 
													ip		: socket.ip_address
												}
									}); 
			}
		});
	});
	
	
});

app.listen(5000);

 