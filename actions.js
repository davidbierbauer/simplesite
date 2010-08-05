include('ringo/webapp/response');
var fs = require('fs');
var root = system.args[1] || ".";
var md = require('ringo/markdown');


exports.index = function (req,path)
{
      var html=null;

      path = fs.absolute(fs.join(root,path));
      //print(root,path);
      if(fs.isFile(path))
      {
          return staticResponse(path);
      }
      
      if(fs.isFile(path+".md"))
      {
          html = md.Markdown().process(fs.read(path+".md"));
          return Response(html);
      }

      throw {notfound:true};
}