var tls = require("net");
var dns = require("dns");


function getMX(cb){
    dns.resolveMx("gmail.com",function(err,mx){
        var highest;
        for(var i = 0; i < mx.length; i++){
            if(!highest || highest.priority > mx[i].priority){
                highest = mx[i];
            }
        }
        cb(highest.exchange);
    });
}

module.exports = function (from,to,cb){
    getMX(function(address){
        var c = tls.createConnection(25,address);
        c.on("connect",function(){
            c.once("data",function(){
                c.write("HELO "+to.split("@")[1]+"\r\n");
                c.once("data",function(){
                    c.write("MAIL FROM:<"+from+">\r\n");
                    c.once("data",function(){
                        c.write("RCPT TO:<"+to+">\r\n");
                        c.once("data",function(){
                            c.write("DATA\r\n");
                            c.once("data",function(){                                
                                c.emit("body");
                                var mail = {};
                                mail.write = function(d){
                                    c.write(d);
                                }
                                mail.end = function(){
                                    c.write(".\r\n");
                                    c.once("data",function(){
                                        c.write("QUIT\r\n");
                                        c.once("data",function(){
                                            c.destroy();
                                        });
                                    });
                                }
                                cb(mail);
                                
                            });
                        });
                    });
                });
            });

        });
    });
}
