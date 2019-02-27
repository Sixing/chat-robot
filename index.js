var http = require("http");
var url = require('url');
var fs = require('fs');
var req = require('request');

http.createServer(function (request, response) {

  var pathname = url.parse(request.url).pathname;
  var isStatic = isStaticFile(pathname);

  if (isStatic) { //静态文件
    try {
      var data = fs.readFileSync('./pages' + pathname);
      response.writeHead(200);
      response.write(data);
      response.end();

    } catch (e) {
      response.writeHead(404);
      response.write('<html><body><h1>404 Not Found</h1></body></html>');
      response.end();
    }
  } else { //非静态文件，走代理请求

    if (pathname == '/api/chat') {
      var params = url.parse(request.url, true).query;

      var data = {
        "reqType": 0,
        "perception": {
          "inputText": {
            "text": params.text
          }
        },
        "userInfo": {
          "apiKey": "7eefeac798254ebb8ecd62044d4ab17d",
          "userId": "123456"
        }
      }

      req({
        url: 'http://openapi.tuling123.com/openapi/api/v2',
        method: 'POST',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(data)
      }, function (error, resp, body) {

        if (!error && resp.statusCode == 200) {
          var tempObj = JSON.parse(body);
          var head = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "x-request-with, content-type"
          }
          //返回正确的结果
          response.writeHead(200, head);
          if (tempObj && tempObj.results && tempObj.results.length > 0 && tempObj.results[0].values) {
            response.write(JSON.stringify(tempObj.results[0].values));
            response.end();
          } else {
            response.write("{\"text\":\"小老弟不要乱说话,小心我盘你！！\"}");
            response.end();
          }
        } else {
          //返回前端400错误
          response.writeHead(400)
          response.write("数据异常");
          response.end();
        }
      })

    } else {
      console.log('接口返回错了')
    }
  }






}).listen(12306);


function isStaticFile(pathname) {
  var result = false
  var staticFile = ['.html', '.css', '.js', '.jpg', '.jpeg', '.png', '.gif'];

  staticFile.forEach(function (item, index) {
    if (pathname.indexOf(item) == pathname.length - item.length) {
      result = true
    }
  })
  return result;
}

console.log('服务器已经启动，监听端口：' + 12306)