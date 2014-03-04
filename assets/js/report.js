var report;
$(document).ready(function () {
	socket.on('connect', function socketConnected() {
		socket.get("/report/subscribe");
	});
	report = new ReportPanel();
	
	$('#reportTable').on('click','.trigger',function () {
		var testId = ($(this).closest('tr').attr('id').split('reportTr'))[1];
		var test_name = $(this).closest('tr').find('td').eq(1).text().trim()+'-'+$(this).closest('tr').find('td').eq(5).text().trim();	
		var status = $(this).closest('tr').find('td').eq(2).text().trim();
		var test_type = $(this).closest('tr').find('td').eq(3).text().trim();
		socket.post('/actionRoute',{testId:testId ,test_name:test_name, action: statusObject[status]['action'], test_type: test_type}, function (response) {
			console.log("done")
		});
	});
});
var statusObject = {
	'Running' : {
		'status' :'icon-refresh',
		'actionImage' : 'icon-stop',
		'action' : 'stop'
	},
	'Halted' : {
		'status' : 'icon-pause',
		'actionImage' : 'icon-play',
		'action' : 'start'
	},
	'Completed' : {
		'status' : 'icon-check',
		'actionImage' : 'icon-remove',
		'action' : 'del'
	}
}


function ReportPanel(){
	var self =this;
	self.class = 'ReportPanel';
	
}

ReportPanel.prototype.create = function (input) {
	var self = this;
	var data = input.data;
	var newRow = "<tr id='reportTr"+data.id+"' ><td><i class='"+statusObject[data.status].actionImage+" trigger'></i></td><td><a href="+data.path+" target=_blank>"+ data.name +"</a></td><td>"+data.status +" <i class=icon-refresh></i></td><td>"+ data.test_type +"</td><td>"+ data.description +"</td><td>"+ data.date +"</td></tr>";
	$('#reportTable > tbody:last').append(newRow);
	$("#"+data.status).html(parseInt($("#"+data.status).html())+1);	
}

ReportPanel.prototype.update = function (input) {
	var self = this;
	var value = $('#reportTr' + input.id).find("td").eq(2).text();
	$("#"+value).html(parseInt($("#"+value).html())-1);
	$('#reportTr' + input.id).find("td").eq(0).html('<i class="'+statusObject[input.data.status].actionImage+' trigger"></i>');
	$('#reportTr' + input.id).find("td").eq(2).html(input.data.status+' <i class='+statusObject[input.data.status].status+'></i>');
	$("#"+input.data.status).html(parseInt($("#"+input.data.status).html())+1);	
}

ReportPanel.prototype.destroy = function (input) {
	var self = this;
	$('#reportTr' + input.id).remove();
}
