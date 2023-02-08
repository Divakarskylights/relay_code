var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var db = 'Mon, Wed, Fri, Sat';
var dayName = days[new Date().getDay()];
var ff = db.split(', '); 
var hel = ff.includes(dayName)

console.log(hel);
