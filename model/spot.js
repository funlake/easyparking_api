module.exports = function(Db,Cfg){
	Db.spot.ensureIndex({'loc':'2dsphere'});
	//Db.spot.ensureIndex({'loc':'2d'});
	Db.spot.ensureIndex({'uid':1});
	return {
		'post@/spot_add' : function(req,res,next,domain){
			if(typeof req.params.latlng == "undefined" || (req.params.latlng.length == 0) || (req.params.latlng.indexOf(',') === -1)){
				res.end("{code:'error',msg:'latlng parameter must be specified'}");
			}
			else{
				var latlng = req.params.latlng.split(","),lat = parseFloat(latlng[0]),lng = parseFloat(latlng[1]);
			}
			Db.spot.find({uid:req.params.uid,loc:{longitude:lng,latitude:lat}},function(err,result){
				domain.run(function(){
					if(result.length < 1){
						Db.spot.insert({
							uid:req.params.uid,
							address:req.params.address,
							loc:{
								longitude:lng,
								latitude:lat
							},
							desc:req.params.desc,
							available_times : req.params.times.split(";"),
							state:1
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
						res.end('{"code":"error","msg":"此车位已存在,无需重复添加"}');
					}
				})
			});
		},//spot_add method end
		'/spot_remove/:id':function(req,res,next,domain){
			Db.spot.remove({_id:Db.ObjectId(req.params.id)},function(err,status){
				domain.run(function(){
					if(!err){
						res.end('{"code":"success","msg":"车位已经删除"}');
					}
					else{
						res.end('{"code":"error","msg":"'+status+'"}');
					}
				})
			})
		},
		'/spot_radius_find/:lng/:lat/:radius' : function(req,res,next,domain){
			Db.spot.find({'loc':{
				$geoWithin:{
					$centerSphere:[ 
						//6371 符合高德地图切面,3959不符合
						[parseFloat(req.params.lng),parseFloat(req.params.lat)] , parseFloat(req.params.radius)/6371 ] 
				}
			}},function(err,result){
				domain.run(function(){
					res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}');
				})

			});
		},
		'/myspots/:uid' : function(req,res,next,domain){
			Db.spot.find({uid:req.params.uid},function(err,result){
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