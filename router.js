
module.exports = function(request, response, url) 
{

	var   fs            = require('fs')
		, util          = require('util')
	    , url_request   = url.parse(request.url).pathname
	    , file_path     = __dirname + url_request
	    , mimes         = {
							'css':  'text/css',
							'js':   'text/javascript',
							'htm':  'text/html',
							'html': 'text/html',
							'eot': 'application/vnd.ms-fontobject',
							'otf': 'application/octet-stream',
							'ttf': 'application/octet-stream',
							'woff': 'application/x-font-woff',
							'png': 'image/png',
							'gif': 'image/gif',
							'ico':  'image/vnd.microsoft.icon'
						  }
		, tmp           = file_path.lastIndexOf(".")
	    , ext           = file_path.substring((tmp + 1))
	    , content_type  = mimes[ext] || 'text/plain'
		, static_file   = false;
	
	if (ext == 'css' || ext == 'js' || ext == 'ico' || ext == 'png' || ext == 'gif' || ext == 'jpg' || ext == 'eot' || ext == 'ttf' || ext == 'otf' || ext == 'woff')
		static_file = true;
	else 
	{
		url_request += "/web/index.html"
		static_file = false;
		
		file_path = __dirname + url_request
	}
	
	if(static_file)
	{
		console.log(file_path)
		get_file(fs, file_path, response, function(data){
			response.writeHeader(200, {"Content-Type": content_type});  
			response.write(data);    
			response.end(); 
		});
	}
	else
	{
		var   tmp           = file_path.lastIndexOf(".")
	        , ext           = file_path.substring((tmp + 1))
	        , content_type  = mimes[ext] || 'text/plain';	
			
			get_file(fs, file_path, response, function(data){
				response.writeHeader(200, {"Content-Type": content_type});  
				response.write(data);    
				response.end(); 
			});		
	}
};	

function get_file(fs, file_path, response, callback)
{
	fs.exists(file_path,function(exists)
	{  
		if(!exists)
		{  
			display_error(404, response, fs);
		}  
		else{  
			fs.readFile(file_path, function(error, data) 
			{    
				if(error) 
					display_error(500, response, fs);  
				else   
					callback(data) 
			});  
		}  
	});
}
	
function display_error(error_code, response, fs)
{
	var file_path = __dirname + "/web/error_" + error_code + ".html"  
	fs.readFile(file_path, function(error, data) 
	{ 
		response.writeHeader(error_code, {"Content-Type": "text/html"});  
		response.write(data);    
		response.end();  
	}); 
}