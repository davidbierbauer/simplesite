var response = require('ringo/webapp/response');
var fs = require('fs');
var md = require('ringo/markdown');
var fileutils = require('ringo/fileutils');
var strings = require('ringo/utils/strings');
var log = require('ringo/logging').getLogger(module.id);

var root = fs.absolute(system.args[0] || ".");

exports.index = function (req,path)
{
    var uriPath = fileutils.resolveUri(req.rootPath, path);
    var absolutePath=fs.join(root,path);

      if(fs.isFile(absolutePath))
      {
          if(fs.extension(absolutePath)==".md")
          {
               var html = md.Markdown().process(fs.read(absolutePath));
                  return response.Response(html);
          }
          return response.staticResponse(absolutePath);
      }

      if(fs.isDirectory(absolutePath))
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
   var files = fs.list(absolutePath);
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
   
   return response.skinResponse('skins/index.html', {
      files: files,
   });

}
