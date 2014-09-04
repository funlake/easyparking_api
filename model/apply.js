module.exports = function(Db,Cfg){
	Db.apply.ensureIndex({uid:1,spot_id:1},{unique: true, dropDups: true})
	return {
		'/apply': function(req,res,next){
			res.end("{code:'apply'}");
			console.log("nice apply response");
		},
		'post@/apply_add/:uid':function(req,res,next,domain){
			if((typeof req.params.spot_id == "undefined") || (typeof req.params.uid == "undefined")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			res.end('{"code":"success","msg":"车位成功申请!"}');
			var helper = require("../helper.js");
			var spots = req.params.spot_id.split(",");
			spots.forEach(function(spot_id){
				Db.users.find({mobileid:req.params.uid},function(err,user){
					Db.spot.find({_id:Db.ObjectId(spot_id)},function(err2,spot){
						if((!err) && (!err2) && user.length && spot.length){
								Db.apply.save({
									uid 	: req.params.uid,
									spot_id : spot_id,
									created_time : helper.getDateTime(),
									state 	: "applying",
									userinfo : user[0],
									spotinfo  : spot[0]
					 			},function(err3,store){
					 				if(!err3 && !!store){
					 					//store.spotinfo = null;
					 					//store.spot_id = null;
					 					Db.spot.update({_id:Db.ObjectId(spot_id)},{$inc:{apply_count:1},$push:{applicants:store._id}},function(err4){});
					 				}
					 			})//Db.apply.save
						}//error detect
					})//Db.spot.find
				})//ending of Db.user.find
			});
		},
		'/myapply/:uid':function(req,res,next,domain){
			Db.apply.find({uid:req.params.uid},function(err,result){
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
		}
	}

}