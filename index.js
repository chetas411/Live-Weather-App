const http = require("http");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch")
const { extname } = require("path");

const server = http.createServer((req,res)=>{

  // Getting the orginal html file content
  const mainFile = fs.readFileSync(path.join(__dirname,'Public','index.html'),'utf-8');

  // replacing the values as per user input
  const replaceVal = (tempVal,orgVal)=>{
    let currVal = tempVal.replace("{%tempVal%}",(orgVal.main.temp-273.15).toFixed(2));
    currVal = currVal.replace("{%location%}",orgVal.name);
    currVal = currVal.replace("{%country%}",orgVal.sys.country);
    currVal = currVal.replace("{%minTemp%}",(orgVal.main.temp_min -273.15).toFixed(2));
    currVal = currVal.replace("{%maxTemp%}",(orgVal.main.temp_max-273.15).toFixed(2));
    currVal = currVal.replace("{%weather%}",orgVal.weather[0].main);
    // console.log(currVal);
    return currVal;
  };

  // fetching the weather api to get data of a perticular city
  async function getData(cityName){
    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=2de24d370559f7601f03b80edf49a117`);
    const json = await response.json();
    const output = replaceVal(mainFile,json);
    // console.log(output);
    res.writeHead(200,{"Content-Type" : "text/html"})
    res.end(output);
  }

  const filePath = path.join(__dirname,'Public',req.url==='/'? 'index.html' : req.url);
  const ext = extname(filePath);

  // handling routing
  if(ext === ".html" || ext === ".css" || ext === ".js" || ext === ".json" || ext === ".ico"){
    var ContentType = 'text/html';
    if(req.url == '/'){
      getData('delhi');
    }else{
      switch (ext) {
        case '.css':
          ContentType = 'text/css';
          break;
        case '.js':
          ContentType = 'text/javascript';
          break;
        case '.json':
          ContentType = 'application/json';
          break;
        case '.ico':
          ContentType = 'image/x-icon';
          break;
      }
      fs.readFile(filePath,'utf-8',(err,data)=>{
        if(err) console.log("Error !!!");
        res.writeHead(200,{"Content-Type" : ContentType})
        // console.log(data);
        res.end(data);
      });
    }
  }else{
    var len = req.url.length;
    var name = req.url.substr(1,len-1);
    getData(name);

  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{console.log(`Server is running at ${PORT}...`);});