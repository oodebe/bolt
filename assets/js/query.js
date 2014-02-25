$(document).ready(function () {
	$(".getQuery").click(function(){
		keyvalue= [];
		var pathname='';
		var Data = ExtractQueryString();
		for(var i in Data) {
			keyvalue.push(i+'='+Data[i]);
		}
		keyvalue.push($(this).attr("url"))
		pathname = keyvalue.join('&');
		window.location = "/reports?"+pathname;
		console.log(keyvalue)
		
	});
	
function ExtractQueryString() {
    var oResult = {};
    var aQueryString = (window.location.search.substr(1)).split("&");
    for (var i = 0; i < aQueryString.length; i++) {
        var aTemp = aQueryString[i].split("=");
        if (aTemp[1].length > 0) {
            oResult[aTemp[0]] = unescape(aTemp[1]);
        }
    }
    return oResult;
}
	
});

