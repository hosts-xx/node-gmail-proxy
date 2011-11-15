var net = require("net");
var fs = require("fs");
module.exports = function(){
    var s = net.createServer(function(c){
        
        var success = false;
        var alldata = "";
        c.once("close",function(){
            if(!success){
                s.emit("error",alldata);
            }
            alldata = null;
            data = null;
            mails = null;
            
        });
        var Server = this;
        var mail = new (require("events").EventEmitter)();
        
        var mails = [];
        var from;
        var readymails = 0;

        var data = new Buffer(0);
        c.write("220 service ready\r\n");
        c.on("data",function(d){
            alldata += d;
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
        
        function receiveMail(){
            if(readymails == mails.length){
                c.write("354 start mail input\r\n");                    
                function readData(d){
                    var l = trim(d+"","\r\n");
                    if(l == "."){
                        for(var i = 0; i < mails.length; i++){
                            mails[i].emit("end");
                        }
                        c.removeListener("line",readData);
                        listen();                                                      
						c.write("250 OK\r\n");                        
                    }else{
                        for(var i = 0; i < mails.length; i++){
                            mails[i].emit("data",d);
                        }
                    }
                }                    
                c.on("line",readData);
            }
        }
        
        function onLine(data){
            
            var l = trim(data+"","\r\n").split(" ");
            var cmd = l[0];
            switch(cmd){
                
                case "HELO":
                    c.write("250 OK\r\n");
                    listen();
                    break;
                case "MAIL":
                    from = l.slice(1).join("").split("<")[1].split(">")[0];
                    listen();
                    c.write("250 OK\r\n");
                    break;
                case "RCPT":                
                    var mail =  new (require("events").EventEmitter)();
                    mail.from = from;
                    mail.to = l.slice(1).join("").split("<")[1].split(">")[0];
                    mail.on("newListener",function(ev){
                        if(ev == "data"){
                            readymails++;
                            receiveMail();
                        }
                    });
                    mails.push(mail);
                    c.write("250 OK\r\n");
                    listen();
                    break;
                case "DATA":
                    for(var i = 0; i < mails.length; i++){
                        s.emit("mail",mails[i]);
                    }                 
                    break;
                case "QUIT":
                    success = true;
                    c.write("221 closing channel\r\n");
                    setTimeout(function(){
                        
                    },5000);
                    break;
                
                default:
                    c.write("502 Command not implemented\r\n");
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
