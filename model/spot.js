module.exports = function(Db,Cfg){
	Db.spot.ensureIndex({'loc':'2dsphere'});
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
							radius:req.params.radius,
							available_times : req.params.times.split(";"),
							state:1
						});
						res.end('{"code":"success","msg":"车位已成功添加"}');
					}
					else{
						res.end('{"code":"error","msg":"此车位已存在,无需重复添加"}');
					}
				})
			});
		},//spot_add method end
		'/myspots/:uid' : function(req,res,next,domain){
			Db.spot.find({uid:req.params.uid},function(err,result){
				domain.run(function(){
					res.end('{"code":"success","total":'+result.length+',"result":'+JSON.stringify(result)+'}');
				})
			});
		}//myspots method end
	}
}