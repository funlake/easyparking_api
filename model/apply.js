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
			var helper = require("../helper.js");
			Db.apply.save({
				uid 	: req.params.uid,
				spot_id : req.params.spot_id,
				created_time : helper.getDateTime(),
				state 	: "normal"
 			})
		}
	}
}