var response = require('ringo/webapp/response');
var fs = require('fs');
var md = require('ringo/markdown');

var root = fs.absolute(system.args[0] || ".");

exports.index = function (req,path)
{
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

      if(fs.isDirectory(absolutePath,path))
      {
          return listFiles(absolutePath);
      }
      throw {notfound:true};
}

function listFiles(absolutePath,path)
{
   var files = fs.list(absolutePath);
   files = files.map(function(file)
   {
        var filePath = fs.join(absolutePath,file)
        return {
            name:file,
            size:fs.size(filePath),
            lastModified:fs.lastModified(filePath),
            path:fs.join(path,file)
        };
   });
   
   return response.skinResponse('skins/index.html', {
      files: files,
   });

}