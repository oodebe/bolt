var report;
$(document).ready(function () {
	socket.get("/report/subscribe");	
	report = new ReportPanel();
});

function ReportPanel(){
	var self =this;
	self.class = 'ReportPanel';
	
}

ReportPanel.prototype.create = function (input) {
	var self = this;
	var data = input.data;
	var newRow = "<tr id='reportTr"+data.id+"' ><td><a href="+data.path+" target=_blank>"+ data.name +"</a></td><td> "+data.date +"</td><td>"+ data.status +"</td></tr>";
	$('#reportTable > tbody:last').append(newRow);
}

ReportPanel.prototype.update = function (input) {
	var self = this;
	$('#reportTr' + input.id).find("td").eq(2).html(input.data.status);
}

ReportPanel.prototype.destroy = function (data) {
	var self = this;
	var newRow = "<tr id='reportTr"+data.id+"' ><td><a href="+data.path+" target=_blank>"+ data.name +"</a></td><td> "+data.date +"</td><td>"+ data.status +"</td></tr>";
	$('#reportTable > tbody:last').append(newRow);
}

function testReport(){
	console.log('test');
	return 1;
}
