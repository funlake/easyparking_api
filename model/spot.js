module.exports = function(Db,Cfg){
	Db.spot.ensureIndex({'loc':'2dsphere'});
	//Db.spot.ensureIndex({'loc':'2d'});
	Db.spot.ensureIndex({'uid':1});
	return {
		'post@/spot_add' : function(req,res,next,domain){
			if(typeof req.params.latlng == "undefined" || (req.params.latlng.length == 0) || (req.params.latlng.indexOf(',') === -1) || (req.params.code.trim() == "") ){
				res.end("{code:'error',msg:'必填信息不允许为空'}");
			}
			else{
				var latlng = req.params.latlng.split(","),lat = parseFloat(latlng[0]),lng = parseFloat(latlng[1]);
			}
			var helper = require("../helper.js");
			Db.spot.find({uid:req.params.uid,loc:{longitude:lng,latitude:lat},code:req.params.code},function(err,result){
				domain.run(function(){
					if(result.length < 1){
						Db.spot.insert({
							uid:req.params.uid,
							address:req.params.address,
							loc:{
								longitude:lng,
								latitude:lat
							},
							desc:req.params.desc+" ",
							created_time : helper.getDateTime(),
							available_times : req.params.times.split(";"),
							code:req.params.code,
							state:'normal'
						},function(err,inserted){
							if(!err && inserted){
								res.end('{"code":"success","msg":"车位已成功添加"}');
							}
							else{
								res.end('{"code":"error","msg":"车位无法添加"}');
							}
						});
					}
					else{
						res.end('{"code":"error","msg":"此车位已存在"}');
					}
				})
			});
		},//spot_add method end
		'post@/spot_remove/:uid':function(req,res,next,domain){
			if(req.params.ids == ""){
				res.end('{"code":"error","msg":"未提供要删除的id"}');
				return;
			}
			var ids = req.params.ids.split(",");
			if(ids.length){
				res.end('{"code":"success","msg":"车位已经删除"}'); //quick response,let process worked behind
				var tid;
				//console.log(ids);
				for(var i = 0,j=ids.length;i<j;i++){
					tid = Db.ObjectId(ids[i]);
					Db.spot.remove(
						{_id:tid,uid:req.params.uid},
						(
							function(sid){
								return function(err,status){
									//update all related apply
									if(!err){
										Db.apply.update({spot_id:sid},{$set:{state:"spot_removed"}},{multi:true})
									}
								}
							}
						)(tid)
					);
				}
			}
			else{
				res.end('{"code":"error","msg":"未提供要删除的id"}');
			}


		},
		'/spot_radius_find/:lng/:lat/:radius/:uid' : function(req,res,next,domain){
			Db.spot.find({'loc':{
				$geoWithin:{
					$centerSphere:[ 
						//6371 符合高德地图切面,3959不符合
						[parseFloat(req.params.lng),parseFloat(req.params.lat)] , parseFloat(req.params.radius)/6371 ] 
				}
			},state:'normal'},function(err,result){
				if(!err){
					domain.run(function(){
						res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}');
					})
				}
				else{
					res.end('{"code":"error","msg":"'+err+'"}');
				}

			});
		},
		'/spot_point_find/:lng/:lat/:uid':function(req,res,next,domain){
			domain.run(function(){
				Db.spot.find({'loc':{
					'longitude' : parseFloat(req.params.lng),
					'latitude'  : parseFloat(req.params.lat)
				}}).sort({uid:1,code:1},function(err,result){
					//res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}');
					if(!err){
						domain.run(function(){
							var booked = {}
							Db.apply.find({uid:req.params.uid},function(err,applys){
								//搜出所有当前用户正在申请的车位
								applys.forEach(function(v){
									booked[v['spot_id']] = v.state
								})
								//改变返回车位的申请状态为用户当前的申请状态
								//可能值为:"可申请","申请中","待确认"
								for(var i = 0,j=result.length;i<j;i++){
									if(booked.hasOwnProperty(result[i]['_id'])){
										result[i]['state'] = booked[result[i]['_id']];
									}
								}
								res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}');
							})
						})
					}
					else{
						res.end('{"code":"error","msg":"'+err+'"}');
					}
				})
			});
		},
		'/myspots/:uid' : function(req,res,next,domain){
			Db.spot.find({uid:req.params.uid}).sort({created_time:-1},function(err,result){
				domain.run(function(){
					res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}');
				})
			});
		},//myspots method end
		'/spot_get/:id' : function(req,res,next,domain){
			Db.spot.find({_id:Db.ObjectId(req.params.id)},function(err,result){
				domain.run(function(){
					res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}')
				});
			});
		}
	}
}