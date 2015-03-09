module.exports = function(){
	return {
		'getDateTime':function() {

		    var date = new Date();

		    var hour = date.getHours();
		    hour = (hour < 10 ? "0" : "") + hour;

		    var min  = date.getMinutes();
		    min = (min < 10 ? "0" : "") + min;

		    var sec  = date.getSeconds();
		    sec = (sec < 10 ? "0" : "") + sec;

		    var year = date.getFullYear();

		    var month = date.getMonth() + 1;
		    month = (month < 10 ? "0" : "") + month;

		    var day  = date.getDate();
		    day = (day < 10 ? "0" : "") + day;

		    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
		},
		'getDate' : function(addDay){

		    var date = new Date();

		    var year = date.getFullYear();

		    var month = date.getMonth() + 1;
		    month = (month < 10 ? "0" : "") + month;

		    var day  = date.getDate();

		    if(typeof addDay != "undefined"){
		    	date.setDate(day+addDay)
		    	day = date.getDate();
		    }

		    day = (day < 10 ? "0" : "") + day;

		    return year + "-" + month + "-" + day;			
		},
		'sendPushMsg' : function(CmdPath,clientId,title,body,throughMsg){
			var sendCmd = [CmdPath,clientId,title,body,throughMsg].join(" ");
			require("child_process").exec("/usr/bin/php "+sendCmd,function (error,stdout,stderr){
				console.log(stdout);
			});	
		},
		'sendVerifySms' : function(number){
			var Config		= require('./config.js');
			var Http 		= require('http');
			var Querystring 	= require('querystring');
			var postData = {
			    uid:Config.Sms.Uid,
			    pas:Config.Sms.Pass,
			    mob:number,
			    con:Config.Sms.Template.RegisterVerifyCode.replace(/\{verify_code\}/,Math.floor(Math.random()*89999 + 10000)),
			    type:'json'
			};
			console.log(postData);return;
			var content = Querystring.stringify(postData);
			var options = {
			    host:'api.weimi.cc',
			    path:'/2/sms/send.html',
			    method:'POST',
			    agent:false,
			    rejectUnauthorized : false,
			    headers:{
			        'Content-Type' : 'application/x-www-form-urlencoded', 
			        'Content-Length' :content.length
			    }
			};
			var req = Http.request(options,function(res){
			    res.setEncoding('utf8');
			    res.on('data', function (chunk) {
			        console.log(JSON.parse(chunk));
			    });
			    res.on('end',function(){
			        console.log('over');
			    });
			});
			req.write(content);
			req.end();
		}
	}
}()