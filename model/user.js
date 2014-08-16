module.exports = function(Db,Cfg){
	return {
		'/': function(req,res,next){
			res.end("{code:'AA'}");
			console.log("nice response");
		},
		'/user' : function(req,res,next){
			var users = Db.users.find({},function(err,users){
				if(err){
					throw new Error(err);
				}
				else{
					res.end(JSON.stringify(users));
				}
			})
		},
		'/user2' : function(req,res,next){
			res.end('ahaha2');
		},
		'post@/user_verify':function(req,res,next,domain){
			if(req.params.username === undefined){
				throw new Error("You must offer name of user");
			}
			else if(req.params.userpass === undefined){
				throw new Error("You must offer password of user");
			}
			else
			{
				Db.users.find({name:req.params.username},function(err,users){
					domain.run(function(){
						if(err) throw new Error(err);
						if(users.length < 1){
							throw new Error("wrong account");
						}
						else{
							res.end("{code:'success'}");
						}
					})
				})
			}
		}
	}
}

