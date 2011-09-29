#node-gmail-proxy
##what does it?
It´s a library that includes the following functionality:

* creating an smtp server and receive mails very easy
* sending mails to a gmail address

Using this library, it´s very easy to create virtual email adresses and proxy
all incoming emails to various gmail accounts.

for example:
someone sends you an email at hansi@yourdomain.com, node-gmail-proxy receives this
mail and forwards it in realtime to your hans.muster@gmail.com address.

##advantages
The advantages of this compared to a POP3-server that gmail fetches periodically are:

* It´s in realtime
* You don´t have to configure gmail
* You don´t have to save emails on your server
* It´s easy
* It´s customizable
* It supports an endless count of email adresses & gmail accounts

##example

    var ngp = require("node-gmail-proxy");
    
    var table = {
        "hansi@yourdomain.com":"hans.muster@gmail.com"
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

##License
I want it to stay free for everyone, so I provide it under the GNU General Public License.

