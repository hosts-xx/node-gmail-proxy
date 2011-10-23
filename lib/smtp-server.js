var net = require("net");
var fs = require("fs");
module.exports = function(){
    var s = net.createServer(function(c){
        console.log("connection!");
        var Server = this;
        var mail = new (require("events").EventEmitter)();

        var data = new Buffer(0);
        c.write("220 service ready\n");
        c.on("data",function(d){
            
            process.stdout.write(d);
            var b = new Buffer(data.length+d.length);
            data.copy(b,0,0);
            d.copy(b,data.length,0);
            data = b;
            
            for(var i = 0; i < data.length; i++){
                if(data[i] == 10){
                    c.emit("line",data.slice(0,i+1));                
                    data = data.slice(i+1);
                    i = 0;
                }
            }
        });
        function onLine(data){
            var l = trim(data+"","\r\n").split(" ");
            var cmd = l[0];
            switch(cmd){
                
                case "HELO":
                    c.write("250 OK\n");
                    listen();
                    break;
                case "MAIL":
                case "RCPT":
                    mail[cmd=="MAIL"?"from":"to"] = l.slice(1).join("").split("<")[1].split(">")[0];
                    c.write("250 OK\n");
                    if(cmd == "RCPT"){
                        s.emit("mail",mail);
                        c.pause();
                        mail.on("newListener",function(ev){
                            if(ev == "data"){
                                c.resume();
                                listen();
                            }
                        });
                    }else{
                        listen();
                    }
                    break;
                case "DATA":
                    c.write("354 start mail input\n");                    
                    function readData(d){
                        var l = trim(d+"","\r\n");
                        if(l == "."){
                            c.removeListener("line",readData);
                        	listen();                                                      
							c.write("250 OK\n");
                        }else{    
                            mail.emit("data",d);
                        }
                    }                    
                    c.on("line",readData);
                    break;
                case "QUIT":
                    c.write("221 closing channel\n");
                    mail.emit("end",mail);
                    break;
                
                default:
                    c.write("502 Command not implemented\n");
                    listen();
                    break;
            }            
        }
        function listen(){
            c.once("line",onLine);
        }
        listen();
    });
    return s;
}

function trim(str, chars) {
    return ltrim(rtrim(str, chars), chars);
}
 
function ltrim(str, chars) {
    chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
 
function rtrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}
