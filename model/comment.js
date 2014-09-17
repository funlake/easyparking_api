module.exports=function(Db,Cfg){
	return {
		'post@comment_add' : function(req,res,next,domain){
			console.log(req.params.aid);
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
		}//end of line 3
	}//end of line 2
}