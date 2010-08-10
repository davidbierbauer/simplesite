var {skinResponse, staticResponse} = require('ringo/webapp/response');
var fs = require('fs');
var md = require('ringo/markdown');
var fileutils = require('ringo/fileutils');
var strings = require('ringo/utils/strings');
var numbers = require('ringo/utils/numbers');
var log = require('ringo/logging').getLogger(module.id);

var root = fs.absolute(require("./config").root);
var welcomePages = ["index.html","index.md"];

exports.index = function (req,path)
{
    var uriPath = fileutils.resolveUri(req.rootPath, path);
    var absolutePath=fs.join(root,path);

	checkRequest(uriPath);	

    if(fs.isFile(absolutePath))
    {
        return serveFile(absolutePath);
    }

    if(fs.isDirectory(absolutePath))
    {
        for each(var name in welcomePages)
        {
            if(fs.isFile(fs.join(absolutePath,name)))
            {
                return serveFile(fs.join(absolutePath,name));
            }
        }
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
        var filePath = fs.join(absolutePath,file);
        var size;
        if (fs.isDirectory(filePath)) {
            size = fs.list(filePath).length + " files";
        } else {
            size = numbers.format(fs.size(filePath) / 1024) + " kB";
        }
        return {
            name:file,
			size: size,
            lastModified:fs.lastModified(filePath),
            path:fileutils.resolveUri(uriPath,file)
        };
    });

	files = files.filter(function(file)
	{
		return !fileutils.isHidden(file.path);
	});
	
	var parentDir = uriPath == "/" ? "":"/../"; 	

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

function checkRequest(request)
{
	var path = request.split('/');

	for(var i=0;i<path.length;i++)
	{
		if(path[i]!="" && fileutils.isHidden(path[i]))
		{
			throw {notfound:true};
		}
	}
}
