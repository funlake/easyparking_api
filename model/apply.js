module.exports = function(Db,Cfg){
	Db.apply.ensureIndex({uid:1,spot_id:1},{unique: true, dropDups: true})
	return {
		'/apply': function(req,res,next){
			res.end("{code:'apply'}");
			console.log("nice apply response");
		},
		'post@/apply_add':function(req,res,next,domain){
			if((typeof req.params.spot_id == "undefined") || (typeof req.params.uid == "undefined")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			res.end('{"code":"success","msg":"车位成功申请!"}');
			var helper = require("../helper.js");
			var spots = req.params.spot_id.split(",");
			for(var i = 0,j=spots.length;i<j;i++){
				//Db.apply.find({uid:req.params.uid,spot_id:spots[i],state:"normal"},(function(sp){
						//return function(err,result){
							//if(!err && (result.length == 0)){
								Db.apply.save({
									uid 	: req.params.uid,
									spot_id : spot[i],
									created_time : helper.getDateTime(),
									state 	: "applying"
					 			})
							//}
						//}
					//})(spots[i])//ending of callback
				//)//ending of Dp.apply.find
			}//ending of for staterment
		},
		'/myapply/:uid':function(req,res,next,domain){
			Db.apply.find({uid:req.params.uid},function(err,result){
				domain.run(function(){
					res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}')
				})
			})
		}
	}

}