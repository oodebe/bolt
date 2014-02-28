/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var fs = require('fs');
var path = require('path');
module.exports.bootstrap = function (cb) {
	
	var testReports = {};
	var activeTests = [];
	var report_folder = __dirname + '/../api/tests/ab/reports/';   // need to show for all test types(ab,cWatch etc)
	var reports = fs.readdirSync(report_folder);
	for (var i in reports){
		if(path.extname(reports[i]) == '.test'){
			activeTests.push(path.basename(reports[i],'.test'));
			continue;
		}
		var reportData = JSON.parse(fs.readFileSync(report_folder+reports[i]+'/test.input'));
		Report.create({
		  tname : reports[i],
		  name: reportData.tname,
		  date: reportData.createTime,
		  status : 'Completed',
		  description : reportData.description,
		  test_type : reportData.test_type,
		  path : '/detailedReport?test_type=ab&cloudWatch=true&couchDb=true&test_name='+reports[i]
		}).done(function(){});
	}
	if(activeTests.length > 0){
		for(var j in activeTests){
			Report.update({
			  name: activeTests[j]
			},{
			  status: 'Pending'
			}, function(err, users) {});
		}
	}
  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
