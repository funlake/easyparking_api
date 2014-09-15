module.exports = function(Db,Cfg){
	var _id = 0;
	return {
		'/': function(req,res,next){
			res.end("{code:'AA'}");
			console.log("nice response");
		},
		'/user_get/:uid' : function(req,res,next,domain){
			Db.users.findOne({_id:Db.ObjectId(req.params.uid)},function(err,userinfo){
				domain.run(function(){
					if(!err){
						res.end('{"code":"success","result":'+JSON.stringify(userinfo)+'}')
					}
					else{
						res.end('{"code":"error","msg":"无法获取用户信息!"}');
					}
				})
			});
		},
		'post@/user_update/:uid' : function(req,res,next,domain){
			Db.users.update({
				_id : Db.ObjectId(req.params.uid)
			},{
				$set : {
					phone : req.params.phone
				}
			},function(err,status){
				if(!err){
					res.end('{"code":"success","msg":"用户信息更新成功!"}')
				}
				else{
					res.end('{"code":"error","msg":"更新错误!('+err+')"}')
				}
			})
		},
		'post@/user_register' : function(req,res,next,domain){
			var pwd = req.params.pass.trim();
			if(req.params.user.trim() == ""){
				res.end('{"code":"error","msg":"用户名不能为空"}')
				return;				
			}
			if(pwd == "" || pwd.length < 6){
				res.end('{"code":"error","msg":"密码不可为空且不能小于6位"}')
				return;
			}
			Db.users.findOne({user:req.params.user},function(err,userinfo){
				domain.run(function(){
					if(!err && userinfo != null){
						res.end('{"code":"error","msg":"用户已存在!"}')
					}
					else{
						Db.users.save({
							user : req.params.user,
							pass : pwd,
							mobileid : req.params.did,
							state : "normal",
							//积分
							points:0,
							//是否登录过?预备第一次登录可加积分
							neverlogin:true,
							phone : ""，
							//默认北京市
							city : "39.90403,116.407525"
						},function(err2,store){
							if(!err2){
								res.end('{"code":"success","msg":"您已成功注册,请登录进入应用."}')
							}
						})
					}
				})
			})
		},
		'post@/user_login' : function(req,res,next,domain){
			var pwd = req.params.pass.trim();
			if(req.params.user.trim() == ""){
				res.end('{"code":"error","msg":"用户名不能为空"}')
				return;				
			}
			if(pwd == "" || pwd.length < 6){
				res.end('{"code":"error","msg":"密码不可为空且不能小于6位"}')
				return;
			}
			Db.users.findOne({user:req.params.user,pass:pwd},function(err,userinfo){
				domain.run(function(){
					if(err || userinfo == null){
						res.end('{"code":"error","msg":"用户名或密码错误!"}')
						return;
					}
					else{
						//第一次登录加5个积分.
						Db.users.update({_id:Db.ObjectId(userinfo._id.toString()),neverlogin:true},{$set:{neverlogin:false},$inc:{points:5}});
						res.end('{"code":"success","msg":"您已成功登录!","result":'+JSON.stringify(userinfo)+'}');
					}
				})

			})
		},
		'post@/user_add':function(req,res,next,domain){
			Db.users.find({user:req.params.user},function(err,users){
				domain.run(function(){
					if(users.length < 1){
						Db.users.save({
							//_id : ++_id,
							user:req.params.user,
							pass:req.params.pass,
							mobileid:req.params.uid,
							avatar:"",
							state:"normal"
						})
						res.end('{code:"AA",_id:"'+_id+'"}')
					}
					else{
						res.end('{code:"AA",_id:"'+users[0]['_id']+'"}')
					}
				}); 
			})
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
					//callback function don't forget to add domain.run
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

