module.exports = function(Db,Cfg){
	//Db.apply.ensureIndex({uid:1,spot_id:1},{unique: true, dropDups: true})
	return {
		'/apply': function(req,res,next){
			res.end("{code:'apply'}");
			console.log("nice apply response");
		},
		'post@/apply_add/:uid':function(req,res,next,domain){
			if((typeof req.params.spot_id == "undefined") || (typeof req.params.uid == "undefined")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			
			var helper = require("../helper.js");
			var spots = req.params.spot_id.split(",");
			//handle time
			var start_time = req.params.beginning,end_time = req.params.end,ed;
			var st = helper.getDate()+" "+start_time;
			if(parseInt(start_time.replace(/:/)) < parseInt(end_time.replace(/:/))){
				//datetime of end bigger than beginning
				//so end must be the day after beginning date
				ed = helper.getDate(1)+" "+end_time;
			}
			spots.forEach(function(spot_id){
				Db.users.find({_id:Db.ObjectId(req.params.uid)},function(err,user){
					Db.spot.find({_id:Db.ObjectId(spot_id)},function(err2,spot){
						if((!err) && (!err2) && user.length && spot.length){
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
											userinfo : user[0],
											spotinfo  : spot[0]
							 			},function(err4,store){
							 				if(!err4 && !!store){
							 					//store.spotinfo = null;
							 					//store.spot_id = null;
							 					Db.spot.update({_id:Db.ObjectId(spot_id)},{$inc:{apply_count:1},$push:{applicants:store._id}},function(err4){});
							 					res.end('{"code":"success","msg":"车位成功申请!"}');
							 				}
							 			})//Db.apply.save
									}
								})

						}//error detect
					})//Db.spot.find
				})//ending of Db.user.find
			});
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
			Db.apply.find({spot_id:req.params.spot_id},function(err,result){
				res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}')
			});
		},
		'post@/apply_confirm' : function(req,res,next,domain){

			if((typeof req.params.aid == "undefined") || (typeof req.params.uid == "undefined") || (req.params.aid+req.params.uid == "")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			res.end('{"code":"success","msg":"已确认所选申请"}')
			Db.apply.findAndModify({
				query : {_id:Db.ObjectId(req.params.aid),uid:req.params.uid},
				update : {$set:{state:'waitforconfirm'}},
				new : false
			},function(err,data,lastErrorObject){
				domain.run(function(){
					//把车位的状态设置为"已同意申请"状态
					//Db.spot.update({_id:Db.ObjectId(data.spotinfo._id.toString())},{$set:{state:'waitforconfirm'}},function(err2,updated){
					//	if(!err2){
							//把相同停车位的其他申请设置为"被拒绝"
							Db.apply.update({state:'applying',spot_id:data.spot_id},{$set:{state:'fail'}},{multi:true},function(err2,updated2){

							})
						//}
					//})//Db.spot.update
				})

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
		}
	}

}