module.exports = function(Db,Cfg){
	return {
		'/shop_goods' : function(req,res,next,domain){
			Db.shop.find({state:1}).sort({points:1},function(error,data){
				domain.run(function(){
					res.end('{code:"success",total:'+data.length+',result:'+JSON.stringify(data)+'}')
				})
			})
		}
	}
}