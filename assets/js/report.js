var report;
$(document).ready(function () {
	socket.on('connect', function socketConnected() {
		socket.get("/report/subscribe");
	});
	report = new ReportPanel();
	
	$('.trigger').click(function () {
		var test_name = $(this).closest('tr').find('td').eq(2).html();	
		var status = $(this).closest('tr').find('td').eq(2).html().split(' ');
		var test_type = $(this).closest('tr').find('td').eq(2).html();
	
		socket.post('/actionRoute',{test_name:test_name, action: status, test_type: test_type}, function (response) {
			console.log("done")
		});
	});
});
var imageStatus = {
	'Running' : {
		'status' :'icon-refresh',
		'action' : 'icon-stop'
	},
	'Halted' : {
		'status' : 'icon-pause',
		'action' : 'icon-play'
	},
	'Completed' : {
		'status' : 'icon-check',
		'action' : 'icon-remove'
	}
}


function ReportPanel(){
	var self =this;
	self.class = 'ReportPanel';
	
}

ReportPanel.prototype.create = function (input) {
	var self = this;
	var data = input.data;
	var newRow = "<tr id='reportTr"+data.id+"' ><td><i class="+imageStatus[data.status].action+" trigger></i></td><td><a href="+data.path+" target=_blank>"+ data.name +"</a></td><td>"+data.status +" <i class=icon-refresh></i></td><td>"+ data.test_type +"</td><td>"+ data.description +"</td><td>"+ data.date +"</td></tr>";
	$('#reportTable > tbody:last').append(newRow);
	$("#"+data.status).html(parseInt($("#"+data.status).html())+1);	
}

ReportPanel.prototype.update = function (input) {
	var self = this;
	var value = $('#reportTr' + input.id).find("td").eq(2).html().split(' ');
	$("#"+value[0]).html(parseInt($("#"+value[0]).html())-1);
	$('#reportTr' + input.id).find("td").eq(0).html('<i class='+imageStatus[input.data.status].action+'></i>');
	$('#reportTr' + input.id).find("td").eq(2).html(input.data.status+' <i class='+imageStatus[input.data.status].status+'></i>');
	$("#"+input.data.status).html(parseInt($("#"+input.data.status).html())+1);	
}

//~ ReportPanel.prototype.destroy = function (data) {
	//~ var self = this;
	//~ var newRow = "<tr id='reportTr"+data.id+"' ><td><a href="+data.path+" target=_blank>"+ data.name +"</a></td><td> "+data.date +"</td><td>"+ data.status +"</td></tr>";
	//~ $('#reportTable > tbody:last').append(newRow);
//~ }


