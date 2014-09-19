var curTime = function() {
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

    return year + "-" + month + "-" + day + " " + hour + ":" + min;
}
//update zombie applys
db.apply.update({state:{$in:['normal','applying','waitforconfirm']},end_time:{$lte:curTime()}},{$set:{state:'expired'}},{multi:true});
//update parking applys
db.apply.update({state:{$in:['approved']},end_time:{$lte:curTime()}},{$set:{state:'success'}},{multi:true});
//reopen spots
db.spot.update({state:{$in:['approved']},parking_end_time:{$lte:curTime()}},{$set:{state:'normal'},$inc:{success_count:1}},{multi:true});
//add points to apply user and change status
db.users.update({state:{$in:['approved']},parking_end_time:{$lte:curTime()}},{$set:{state:'normal'},$inc:{points:5}},{multi:true});