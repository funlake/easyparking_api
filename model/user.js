module.exports = function(Db,Cfg){
	//Db.verifycode.ensureIndex({phone:1},{unique: true, dropDups: true})
	Db.users.ensureIndex({phone:1})
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
			var latlng = req.params.latlng.split(","),lng = parseFloat(latlng[1]),lat = parseFloat(latlng[0])
			Db.users.update({
				_id : Db.ObjectId(req.params.uid)
			},{
				$set : {
					phone : req.params.phone,
					city : req.params.city,
					loc : {
						longitude : lng,
						latitude : lat
					}
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
		'post@/user_update_clientid/:uid' : function(req,res,next,domain){
			domain.run(function(){
				Db.users.update({
					_id : Db.ObjectId(req.params.uid)
				},{
					$set : {clientid:req.params.clientid}
				},function(err,status){
					if(!err){
						res.end('{"code":"success","msg":"clientid更新成功!"}')
					}
					else{
						res.end('{"code":"error","msg":"更新错误!('+err+')"}')
					}				
				})
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
						var latlng = req.params.latlng.split(","),lng = parseFloat(latlng[1]),lat = parseFloat(latlng[0])
						Db.users.save({
							user : req.params.user,
							pass : pwd,
							mobileid : req.params.did,
							//积分
							points:0,
							//是否登录过?预备第一次登录可加积分
							neverlogin:true,
							phone : req.params.phone,
							//默认北京市
							city : req.params.city,
							loc : {
								longitude : lng,
								latitude : lat
							},
							parking_end_time : "",
							state : "normal"

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
			if(req.params.phone.trim() == ""){
				res.end('{"code":"error","msg":"手机号不能为空"}')
				return;				
			}
			if(pwd == "" || pwd.length < 6){
				res.end('{"code":"error","msg":"密码不可为空且不能小于6位"}')
				return;
			}
			Db.users.findOne({phone:req.params.phone,pass:pwd},function(err,userinfo){
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
		},
		'post@/user_if_exists' : function(req,res,next,domain){
			Db.users.findOne({phone:req.params.phone},function(err,user){
				domain.run(function(){
					if(user != null){
						res.end('{"code":"error","msg":"此手机号码已被注册!"}')
					}
					else{
						res.end('{"code":"success","msg":"手机号码可用"}')
					}
				})
			})
		},
		'post@/user_register_send_verify_code' : function(req,res,next,domain){
			if(req.params.phone === undefined){
				throw new Error("You must offer correct phone number");
			}
			var vc = Math.floor(Math.random()*89999 + 10000)
			var helper = require("../helper.js");
			domain.run(function(){
				Db.verifycode.save({
					_id			: req.params.phone,
					phone 			: req.params.phone,
					verify_code 		: vc,
					expired_at		: Math.round(+new Date()/1000) + 3*60
				},function(err,store){
					if(!err){
						helper.sendVerifySms(req.params.phone,vc);
						res.end('{"code":"success","msg":"您已成功生成验证码"}')
					}
					else{
						res.end('{"code":"error","msg":"无法生成验证码!"}')
					}
				});				
			})
		},
		'post@/user_register_check_verify_code' : function(req,res,next,domain){
			domain.run(function(){
				Db.verifycode.findOne({phone:req.params.phone},function(err,data){
					if(data != null){
						var now = Math.round(+new Date()/1000) ;
						if(data.verify_code != req.params.code){
							res.end('{"code":"error","msg":"验证码不正确!"}')
						}
						else if(data.expired_at < now){
							res.end('{"code":"error","msg":"验证码已过期!"}')
						}
						else{
							res.end('{"code":"success","msg":"通过验证!"}')
							Db.verifycode.remove({phone:req.params.phone});
						}
					}
				})
			})
		}
	}
}

