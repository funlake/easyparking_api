module.exports=function(){
	return {
		'ErrorSet' 		: false,
		'CurrentRes'	: null,
		'Models'		: ['user','apply','spot','comment','shop'],
		'Port'			: 9527,
		'Point_rules'   : {
			'firstlogin' : 5
		},
		'PushInterface' : '/Applications/MAMP/htdocs/getui_php/Send_message.php'
	}
}()