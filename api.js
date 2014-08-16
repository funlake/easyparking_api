var restify			= require("restify");
var Server 			= restify.createServer();
Server.use(restify.bodyParser()); 
/*Domain error handler*/
var D 				= require('domain').create();
var Config			= require('./config.js');
//mogodb initialize
var Db = require("mongojs").connect("mydb", ["users","spot"]);
Db.runCommand({ping:1}, function(err, res) {
    if(!err && res.ok) console.log("we're up");
    else{
    	console.log(err);
    }
});
var setErrorHandle  = function(req,res){
	Config.CurrentRes = res;
	if(!Config.ErrorSet)
	{
		D.on('error', function(er){
		  Config.CurrentRes.end("{code:'error',message:'"+er.message+"'}");
		  console.log("[ERROR]:"+er.message);
		});
		Config.ErrorSet = true;
	}
}

Config.Models.forEach(function(M){
	var M = require("./model/"+M+".js")(Db,Config),p='',method='',link='';
	for(var i in M){
		p = i.split('@');
		if(p.length > 1){
			method 	= p[0];
			link 	= p[1];
		}
		else{
			method = 'get';
			link   = i;
		}
		Server[method](
			link,//route url
			function(url){
				return function(req,res,next){
					setErrorHandle.apply(this,[req,res]);
					//res.statusCode = 200;
					res.setHeader("Content-Type","application/json;charset=utf-8");
					//console.log(i);
					D.run(function(){
							M[url].apply(this,[req,res,next,D]);
						}	
					)
					//D.run(next)
				}
			}(i)//Closure trick make callback connected correctly to url
		);//Server.get end
	}
});
//D.add(Server)
Server.listen(9527,function(){
	console.log("Start server listening on port 9527");
});
// process.on('uncaughtException', function(err){
// 	console.log(err);
// });



