$(document).ready(function () {
	$(".getQuery").click(function(){
		keyvalue= [];
		var parameter=$(this).attr("url");
		var Data = ExtractQueryString(parameter);
		for(var i in Data) {
			keyvalue.push(i+"="+Data[i]);
		}
		var pathname= keyvalue.join("&");
		console.log(pathname)
		window.location = "/reports?"+pathname;
		
	});
	
function ExtractQueryString(parameter) {
    var oResult = {};
    var aQueryString = ((window.location).search.substr(1));
	spliturl = (aQueryString+'&'+parameter).split("&");
	
    for (var i = 0; i < spliturl.length; i++) {
        var aTemp = spliturl[i].split("=");
        if (aTemp[1] !==undefined && aTemp[1].length > 0) {
            oResult[aTemp[0]] = unescape(aTemp[1]);
        }
    }
    return oResult;
}
	
});

