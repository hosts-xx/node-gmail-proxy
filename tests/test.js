var ngp = require("node-gmail-proxy");

var table = {
    "pid@cloudstudios.ch":"patrik.stutz@gmail.com"
};


var s = ngp.createServer();
s.on("mail",function(incoming){
    ngp.createMail(incoming.from,table[incoming.to],function(outgoing){
        incoming.on("data",function(d){
            outgoing.write(d);
        });
        incoming.on("end",function(){
            outgoing.end();
        });
    });
});
s.listen(25);