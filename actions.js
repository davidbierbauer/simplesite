var {Response} = require('ringo/webapp/response');
var fs = require('fs');
var md = require('ringo/markdown');
var files = require('ringo/utils/files');
var strings = require('ringo/utils/strings');
var numbers = require('ringo/utils/numbers');
var log = require('ringo/logging').getLogger(module.id);

var root = fs.absolute(require("./config").root);
var welcomePages = ["index.html","index.md"];

exports.index = function (req,path)
{
    var uriPath = files.resolveUri(req.rootPath, path);
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
    var paths = fs.list(absolutePath).filter(function(file)
    {
        return !files.isHidden(file);
    }).sort().map(function(file)
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
            lastModified: fs.lastModified(filePath),
            path: files.resolveUri(uriPath,file)
        };
    });

    var parentDir = uriPath == "/" ? "":"/../";

    return Response.skin(module.resolve('skins/list.html'), {
        files: paths,
        title: uriPath,
        parent: parentDir
    });
}

function serveFile(absolutePath)
{
    if(fs.extension(absolutePath)==".md")
    {
        var html = md.Markdown().process(fs.read(absolutePath));
        return Response.skin(module.resolve('skins/page.html'), {
            content: html,
        });
    }
    return Response.static(absolutePath);
}

function checkRequest(request)
{
    var path = request.split('/');

    for(var i=0;i<path.length;i++)
    {
        if(path[i]!="" && files.isHidden(path[i]))
        {
            throw {notfound:true};
        }
    }
}

