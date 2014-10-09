module.exports=function(Db,Cfg){
	Db.comment.ensureIndex({created_time:-1})
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
						},function(err2,store){
							if(!err2 && store!=null){
								res.end('{"code":"success","msg":"评论已成功添加!"}')
								domain.run(function(){
									Db.comment.find({spot_id:data.spot_id},function(err3,cr){
										var goodStat = 0;
										for(var i=0,j=cr.length;i<j;i++){
											if(cr[i].attitude == "good"){
												goodStat++;
											}
											else if(cr[i].attitude == "soso"){
												goodStat = goodStat + 0.5
											}
										}
										//转化为5星rating
										var rating = (goodStat*5)/cr.length;
										//保留一位小数
										rating 	   = Math.round(rating*10)/10
										//余数
										var ri = parseInt(rating),rf = (rating * 10) % 10;

										if(rf < 5){
											rating = ri;
										}
										else{
											rating = ri+ 0.5
										}
										Db.spot.update({_id:Db.ObjectId(data.spot_id)},{$set:{rating:rating}})
									})
								})

								//Db.spot.update({_id:Db.ObjectId(data.spotinfo._id)},{$set:{rating:}})
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
			Db.comment.find({spot_id:req.params.spot_id}).sort({created_time:-1},function(err,result){
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