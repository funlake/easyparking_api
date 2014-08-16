module.exports = function(Db,Cfg){
	return {
		'/apply': function(req,res,next){
			res.end("{code:'apply'}");
			console.log("nice apply response");
		}
	}
}