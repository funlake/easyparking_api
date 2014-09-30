module.exports = function(Db,Cfg){
	//Db.apply.ensureIndex({uid:1,spot_id:1},{unique: true, dropDups: true})
	Db.apply.ensureIndex({state:1});
	return {
		'/apply': function(req,res,next){
			res.end("{code:'apply'}");
			console.log("nice apply response");
		},
		'/apply_get/:id/:uid' : function(req,res,next,domain){
			Db.apply.findOne({_id:Db.ObjectId(req.params.id),uid:req.params.uid},function(err,data){
				domain.run(function(){
					if(!err){
						res.end('{"code":"success","result":'+JSON.stringify(data)+'}')
					}
					else{
						res.end('{"code":"error","msg":"没有找到相应数据!"}')
					}					
				})
			})
		},
		'post@/apply_add/:uid':function(req,res,next,domain){

			if((typeof req.params.spot_id == "undefined") || (typeof req.params.uid == "undefined")){
				res.end('{"code":"error","msg":"Not offered required params"}')
			}
			var helper = require("../helper.js");

			var spots = req.params.spot_id.split(",");
			//handle time
			var start_time = req.params.beginning,end_time = req.params.end,ed;
			var st = helper.getDate()+" "+start_time+":00";
			if(parseInt(start_time.replace(/:/)) > parseInt(end_time.replace(/:/))){
				//datetime of end bigger than beginning
				//so end must be the day after beginning date
				ed = helper.getDate(1)+" "+end_time+":00";
			}
			else{
				ed = helper.getDate()+ " " + end_time+":00";
			}

			spots.forEach(function(spot_id){

				Db.users.findOne({_id:Db.ObjectId(req.params.uid)},function(err,user){
					Db.spot.findOne({_id:Db.ObjectId(spot_id)},function(err2,spot){
						if((!err) && (!err2) && (user!=null) && (spot!=null)){
								Db.apply.findOne({
									uid 	: req.params.uid,
									spot_id : spot_id,
									state 	: 'applying'
								},function(err3,data){
									if(!err3 && data != null){
										res.end('{"code":"error","msg":"您已经有一条申请中的记录!"}');
									}
									else{
										Db.apply.save({
											uid 	: req.params.uid,
											spot_id : spot_id,
											created_time : helper.getDateTime(),
											start_time 	 : st,
											end_time 	 : ed,
											state 	: "applying",
											userinfo : user,
											spotinfo  : spot,
											//申请人是否已经评论
											user_comment : false
							 			},function(err4,store){
							 				domain.run(function(){
								 				if(!err4 && !!store){
								 					Db.spot.update({_id:Db.ObjectId(spot_id)},{$set:{new_apply:true}},function(err4){});
								 					//send push message to spot owner
								 					helper.sendPushMsg(
								 						Cfg.PushInterface,
								 						spot.userinfo.clientid,
									 					"新申请",
									 					"用户["+user.user+"]申请了您的车位",
									 					"spot"
								 					);
								 					res.end('{"code":"success","msg":"车位成功申请!"}');
								 				}
								 				else{
								 					res.end('{"code":"error","msg":"车位申请失败!('+err4+')"}');
								 				}
							 				})
							 			})//Db.apply.save
									}
								})

						}//error detect
					})//Db.spot.find
				})//ending of Db.user.find
			});
		},
		'post@/apply_remove/:uid' : function(req,res,next,domain){
			if(req.params.ids == ""){
				res.end('{"code":"error","msg":"未提供要删除的id"}');
				return;
			}
			var ids = req.params.ids.split(",");
			if(ids.length){
				res.end('{"code":"success","msg":"您已成功删除申请"}'); //quick response,let process worked behind
				var tid;
				//console.log(ids);
				for(var i = 0,j=ids.length;i<j;i++){
					tid = Db.ObjectId(ids[i]);
					Db.apply.remove(
						{_id:tid,uid:req.params.uid}
					);
				}
			}
			else{
				res.end('{"code":"error","msg":"未提供要删除的申请id"}');
			}

		},
		'/myapply/:uid':function(req,res,next,domain){
			Db.apply.find({uid:req.params.uid}).sort({created_time:-1},function(err,result){
				domain.run(function(){
					res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}')
				})
			})
		},
		'/apply_by_spot/:spot_id' : function(req,res,next,domain){
			if(typeof req.params.spot_id == "undefined"){
				res.end('{"code":"error","msg":"Spot id needed to get apply data"}')
			}
			Db.apply.find({spot_id:req.params.spot_id}).sort({created_time:-1},function(err,result){
				res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}')
				Db.spot.update({_id:Db.ObjectId(req.params.spot_id)},{$set:{new_apply:false}});
			});
		},
		'post@/apply_confirm' : function(req,res,next,domain){

			if((typeof req.params.aid == "undefined") || (typeof req.params.uid == "undefined") || (req.params.aid+req.params.uid == "")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}

			var helper = require("../helper.js");
			Db.apply.findAndModify({
				query : {_id:Db.ObjectId(req.params.aid),uid:req.params.uid,end_time:{$gte:helper.getDateTime()}},
				update : {$set:{state:'waitforconfirm'}},
				new : false
			},function(err,data,lastErrorObject){
				if(!err && data!=null){
					res.end('{"code":"success","msg":"已确认所选申请"}')
					domain.run(function(){
						//把车位的状态设置为"已同意申请"状态
						//Db.spot.update({_id:Db.ObjectId(data.spotinfo._id.toString())},{$set:{state:'waitforconfirm'}},function(err2,updated){
						//	if(!err2){
								//send push message to applicant
			 					helper.sendPushMsg(
			 						Cfg.PushInterface,
			 						data.userinfo.clientid,
				 					"申请通过",
				 					"您的申请已通过",
				 					"apply"
			 					);
								//把相同停车位的其他申请设置为"被拒绝"
								Db.apply.update({state:'applying',spot_id:data.spot_id},{$set:{state:'fail'}},{multi:true},function(err2,updated2){

								})
							//}
						//})//Db.spot.update
					})
				}
				else{
					Db.apply.update({_id:Db.ObjectId(req.params.aid),uid:req.params.uid},{$set:{state:'expired'}});
					res.end('{"code":"error","msg":"申请已经过期!"}')
				}

			})//Db.apply.findAndModify
		},
		'post@/apply_reject' : function(req,res,next,domain){

			if((typeof req.params.aid == "undefined") || (typeof req.params.uid == "undefined") || (req.params.aid+req.params.uid == "")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			res.end('{"code":"success","msg":"已拒绝所选申请"}')
			Db.apply.findAndModify({
				query : {_id:Db.ObjectId(req.params.aid),uid:req.params.uid},
				update : {$set:{state:'fail'}},
				new : false
			},function(err,data,lastErrorObject){
				// domain.run(function(){
				// 	//把车位的状态设置为"已同意申请"状态
				// 	Db.spot.update({_id:Db.ObjectId(data.spotinfo._id.toString())},{$set:{state:'waitforconfirm'}},function(err2,updated){
				// 		if(!err2){
				// 			//把相同停车位的其他申请设置为"被拒绝"
				// 			Db.apply.update({state:'applying',spot_id:data.spot_id},{$set:{state:'fail'}},{multi:true},function(err2,updated2){

				// 			})
				// 		}
				// 	})//Db.spot.update
				// })
			})//Db.apply.findAndModify
		},
		'post@/apply_approved': function(req,res,next,domain){
			if((typeof req.params.aid == "undefined") || (typeof req.params.uid == "undefined") || (req.params.aid+req.params.uid == "")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			domain.run(function(){
				var helper = require("../helper.js");
				Db.apply.findAndModify({
					query : {_id:Db.ObjectId(req.params.aid),uid:req.params.uid,state:'waitforconfirm',start_time:{$lte:helper.getDateTime()}},
					update : {$set:{state:'approved'}},
					new : false
				},function(err,data,lastErrorObject){
					if(!err && data!=null){
						//更新车位状态,标识停车截止时间,以方便定时任务更新车位状态
						Db.spot.update({_id:Db.ObjectId(data.spot_id)},{$set:{state:'approved',parking_end_time:data.end_time}});
						//更新申请人状态,标识停车截止时间,以方便定时任务更新申请人积分
						Db.users.update({_id:Db.ObjectId(data.uid)},{$set:{state:'approved',parking_end_time:data.end_time}});
						//更新车位主积分
						Db.users.update({_id:Db.ObjectId(data.spotinfo.uid)},{$inc:{points:5}});
						//send push message to spot owner
						helper.sendPushMsg(
	 						Cfg.PushInterface,
	 						data.spotinfo.userinfo.clientid,
		 					"用户停车",
		 					"["+data.userinfo.user+"]已确定停靠在您的车位",
		 					"spot"
			 			);	
						res.end('{"code":"success","msg":"停车开始!"}')
					}
					else{
						res.end('{"code":"error","msg":"无法停车,未到停车开始时间或数据异常!"}')
					}

				})				
			})
		},
		//leave the spot.mark apply as successfully one
		'post@/apply_leave' : function(req,res,next,domain){
			if((typeof req.params.aid == "undefined") || (typeof req.params.uid == "undefined") || (req.params.aid+req.params.uid == "")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			domain.run(function(){
				var helper = require("../helper.js");
				Db.apply.findAndModify({
					query : {_id:Db.ObjectId(req.params.aid),uid:req.params.uid,state:'approved'},
					//保存成实际停车时间
					update : {$set:{state:'success',end_time:helper.getDateTime()}},
					new : false
				},function(err,data,lastErrorObject){
					if(!err && data!=null){
						//重新开放车位
						Db.spot.update({_id:Db.ObjectId(data.spot_id)},{$set:{state:'normal'},$inc:{success_count:1}});
						//车位申请成功为申请人添加5个积分
						Db.users.update({_id:Db.ObjectId(data.uid)},{$set:{state:'normal'},$inc:{points:5}});
						//send push message to spot owner
						helper.sendPushMsg(
	 						Cfg.PushInterface,
	 						data.spotinfo.userinfo.clientid,
		 					"用户离开",
		 					"["+data.userinfo.user+"]已离开您的车位",
		 					"spot"
			 			);	
						res.end('{"code":"success","msg":"停车结束!"}')
					}
					else{
						res.end('{"code":"error","msg":"操作失败('+err+')"}')
					}

				})				
			})			
		}
	}

}