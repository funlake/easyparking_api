module.exports=function(){
	return {
		'ErrorSet' 		: false,
		'CurrentRes'	: null,
		'Models'		: ['user','apply','spot','comment'],
		'Port'			: 9527,
		'Point_rules'   : {
			'firstlogin' : 5
		}
	}
}()