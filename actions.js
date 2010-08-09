var {skinResponse, staticResponse} = require('ringo/webapp/response');
var fs = require('fs');
var md = require('ringo/markdown');
var fileutils = require('ringo/fileutils');
var strings = require('ringo/utils/strings');
var log = require('ringo/logging').getLogger(module.id);

var root = fs.absolute(require("./config").root);
var welcomePages = ["index.html","index.md"];
var parentDir = "/../";

exports.index = function (req,path)
{
    var uriPath = fileutils.resolveUri(req.rootPath, path);
    var absolutePath=fs.join(root,path);
    var isDirectory=fs.isDirectory(absolutePath);	

	if(uriPath=="/")
	{
		parentDir = "";	
	}else{
		parentDir = "/../";	
	}

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
};

function listFiles(absolutePath,uriPath)
{
    var files = fs.list(absolutePath).sort();
    files = files.map(function(file)
    {
        var filePath = fs.join(absolutePath,file)	

        return {
            name:file,
			size:fs.size(filePath)/1024 + "KB",
            lastModified:fs.lastModified(filePath),
            path:fileutils.resolveUri(uriPath,file)
        };
    });

	files = files.filter(function(file)
	{
		if(fileutils.isHidden(file.path))
		{ 
			return false;
		}
		return true;
	});
	
//	print("---------------------------");
	for each(var file in files)
	{	
		var filePath = fs.join(absolutePath,file.path);
		//print("filePath="+filePath);		
		if(fs.isDirectory(filePath))
		{
		//	print("directory");
			var size = fs.list(filePath).length;
			if(size>0)
			{
				file.size="directory: " + size + " sub elements";
			} else{
				file.size="empty directory";			
			}
		}
	}

    return skinResponse('./skins/list.html', {
        files: files,
		title: uriPath,
		parent: parentDir
		
    });
}

function serveFile(absolutePath)
{
    if(fs.extension(absolutePath)==".md")
    {
        var html = md.Markdown().process(fs.read(absolutePath));
        return skinResponse('./skins/page.html', {
            content: html,
        });
    }
    return staticResponse(absolutePath);
}
