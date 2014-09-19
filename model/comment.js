module.exports=function(Db,Cfg){
	return {
		'post@/comment_add' : function(req,res,next,domain){
			Db.apply.findAndModify({
				query : {
					_id : Db.ObjectId(req.params.aid),
					user_comment : false
				},
				update :{
					$set:{
						user_comment : true
					}
				},
				new : false
			},function(err,data){
				if(!err){
					domain.run(function(){
						var helper = require("../helper.js");
						Db.comment.save({
							spot_id: data.spot_id,
							uid : data.uid,
							userinfo : data.userinfo,
							spotinfo : data.spotinfo,
							attitude : req.params.attitude,
							comment : req.params.comment,
							created_time : helper.getDateTime()
						},function(err2){
							if(!err2){
								res.end('{"code":"success","msg":"评论已成功添加!"}')
							}
						})
					})
				}//end of line 15
				else{
					res.end('{"code":"error","msg":"'+err+'"}')
				}
			})//end of line 4
		},
		'/comment_find/:spot_id' : function(req,res,next,domain){
			Db.comment.find({spot_id:req.params.spot_id},function(err,result){
				if(!err){
					res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}');
				}
				else{
					res.end('{"code":"error","msg":"'+res+'"}');
				}
			})
		}
	}//end of line 2
}