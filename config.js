module.exports=function(){
	return {
		'ErrorSet' 		: false,
		'CurrentRes'	: null,
		'Models'		: ['user','apply','spot','comment','shop'],
		'Port'			: 9527,
		'Point_rules'   : {
			'firstlogin' : 5
		},
		'PushInterface' : '/Applications/MAMP/htdocs/getui_php/Send_message.php',
		'Sms' : {
			'Platform' 	: 'Weimi',
			'Uid'		: '0iZqv6ysd8zG',
			'Pass'		: 'vkqggtkf',
			'Template'    : {
				'RegisterVerifyCode' : '【停车易】您的验证码是：{verify_code}，5分钟内有效。如非您本人操作，可忽略本消息。'
			}
		}
	}
}()