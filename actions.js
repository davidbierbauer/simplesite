var response = require('ringo/webapp/response');
var fs = require('fs');
var md = require('ringo/markdown');
var fileutils = require('ringo/fileutils');
var strings = require('ringo/utils/strings');
var log = require('ringo/logging').getLogger(module.id);

var root = fs.absolute(require("./config").root);
var welcomePages = ["index.html","index.md"];

exports.index = function (req,path)
{
      var uriPath = fileutils.resolveUri(req.rootPath, path);
      var absolutePath=fs.join(root,path);
	var isDirectory=fs.isDirectory(absolutePath);
	
	if(isDirectory)
      {
		for each(var name in welcomePages)
		{
			if(fs.isFile(fs.join(absolutePath,name)))
			{
				return serveFile(fs.join(absolutePath,name));	
			}		
		}
      }
	
	if(fs.isFile(absolutePath))
	{
		return serveFile(absolutePath);
	}

      if(isDirectory)
      {
          if (!strings.endsWith(uriPath, "/")) {
              throw {redirect: uriPath + "/"};
          }
          return listFiles(absolutePath, uriPath);
      }
      throw {notfound:true};
}

function listFiles(absolutePath,uriPath)
{
   var files = fs.list(absolutePath).sort();
   files = files.map(function(file)
   {
        var filePath = fs.join(absolutePath,file)
        return {
            name:file,
            size:fs.size(filePath),
            lastModified:fs.lastModified(filePath),
            path:fileutils.resolveUri(uriPath,file)
        };
   });
   
   return response.skinResponse('skins/list.html', {
      files: files,
   });
}

function serveFile(absolutePath)
{
    if(fs.extension(absolutePath)==".md")
    {
         var html = md.Markdown().process(fs.read(absolutePath));
            return response.skinResponse('skins/page.html', {
	 content: html,
	 });
    }
    return response.staticResponse(absolutePath);
}
