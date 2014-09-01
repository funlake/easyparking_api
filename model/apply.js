module.exports = function(Db,Cfg){
	return {
		'/apply': function(req,res,next){
			res.end("{code:'apply'}");
			console.log("nice apply response");
		},
		'post@/apply_add':function(req,res,next,domain){
			if((typeof req.params.spot_id == "undefined") || (typeof req.params.uid == "undefined")){
				res.end('{"code":"error","msg":"Spot or user info required"}')
			}
			Db.apply.find({uid:req.params.uid,spot_id:req.params.spot_id,state:"normal"},function(err,result){
				if(!err && (result.length == 0)){
					var helper = require("../helper.js");
					domain.run(function(){
						Db.apply.save({
							uid 	: req.params.uid,
							spot_id : req.params.spot_id,
							created_time : helper.getDateTime(),
							state 	: "normal"
			 			},function(err,status){
			 				if(!err && status){
								res.end('{"code":"success","msg":"申请添加成功"}');
							}
							else{
								res.end('{"code":"error","msg":"申请添加失败"}');
							}
			 			})
					})
				}
				else{
					res.end('{"code":"error","msg":"您正在申请该车位,无需重复申请!"}');
				}
			})


		}
	},
	'/myapply/:uid':function(req,res,next,domain){
		Db.apply.find({uid:req.params.uid},function(err,result){
			domain.run(function(){
				res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}')
			})
		})
	}
}