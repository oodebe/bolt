function prepareChart(dataPage,requests,report, cloudreports, couchreports) { 
	var dataCat = [];
	var chartParam = {};
	for (var k in report[dataPage]){
		dataCat.push(k);
		for (var m in report[dataPage][k][0].result){
			if(!chartParam[m])chartParam[m] =[];
			chartParam[m].push(report[dataPage][k][0].result[m]);
		}
	}
	var cSeries = [];
	for (var z in chartParam){
		var sData = {};
		sData['name'] = z;
		sData['data'] = chartParam[z];
		cSeries.push(sData);
	}
	var chart = '';
	chart = "<div id="+dataPage+" '>";
	chart += "<div id="+dataPage+"_report style='max-width: 800px; height: 300px; margin: 0 auto' ></div><script>$('#"+dataPage+"_report'). highcharts({ title: { text: 'Requests :"+requests+"  --  Page "+dataPage+" ', x: -20}, xAxis: { title: { text: ' Concurrency ' },categories: "+JSON.stringify(dataCat)+"}, yAxis: { title: { text: 'Response Time ' }, plotLines: [{ value : 0, width: 1, color: '#808080' }] }, tooltip: { valueSuffix: 'msec' }, legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle', borderWidth: 0 }, series: "+JSON.stringify(cSeries)+" });</script>";
	if(cloudreports){
		var cloudCat = cloudreports[dataPage]['category'];
		var cloudSeries = [];
		for(var m in cloudreports[dataPage]['cseries']){
			var cData = {};
			cData['name'] = m;
			cData['data'] = cloudreports[dataPage]['cseries'][m];
			cloudSeries.push(cData);
		}
		
		chart += "<div id="+dataPage+"_cloudReport style='max-width: 800px; height: 300px; margin: 0 auto' ></div><script>$('#"+dataPage+"_cloudReport'). highcharts({ title: { text: 'Requests :"+requests+"  --  Page "+dataPage+" ', x: -20}, xAxis: { title: { text: ' Concurrency ' },categories: "+JSON.stringify(cloudCat)+"}, yAxis: { title: { text: ' CPU & RAM Utilization ' }, plotLines: [{ value : 0, width: 1, color: '#808080' }],min:0,max:100 }, tooltip: { valueSuffix: '%' }, legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle', borderWidth: 0 }, series: "+JSON.stringify(cloudSeries)+" });</script>";
		
	}
	if(couchreports){
		var couchCat = couchreports[dataPage]['category'];
		var couchSeries = [];
		for(var m in couchreports[dataPage]['cseries']){
			var cData = {};
			cData['name'] = m;
			cData['data'] = couchreports[dataPage]['cseries'][m];
			couchSeries.push(cData);
		}
		
		chart += "<div id="+dataPage+"_couchReport style='max-width: 800px; height: 300px; margin: 0 auto' ></div><script>$('#"+dataPage+"_couchReport'). highcharts({ title: { text: 'Requests :"+requests+"  --  Page "+dataPage+" ', x: -20}, xAxis: { title: { text: ' Concurrency ' },categories: "+JSON.stringify(couchCat)+"}, yAxis: { title: { text: ' CouchDb Request Time ' }, plotLines: [{ value : 0, width: 1, color: '#808080' }] }, tooltip: { valueSuffix: 'msec' }, legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle', borderWidth: 0 }, series: "+JSON.stringify(couchSeries)+" });</script>";
		
	}
	chart += "</div><br>";
return chart;
}
