/**
 * ReportController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var	qs = require('querystring');
var fs = require('fs');
var path = require('path');

module.exports = {
  showReports: function (req, res) {
		pendingCount = 0;
		runningCount = 0;
		completedCount = 0;
		var testStatus = {};
		var sortField ='';
		if(req.query.status!==undefined && req.query.status!=='') {
			testStatus['status'] = req.query.status;
		}
		if(req.query.sort!==undefined && req.query.sort!=='') {
			sortField = req.query.sort;
		}
		Report.find(testStatus).sort(sortField+' ASC').done(function(err, reports) {
		  // Error handling
		  if (err) {
			return console.log(err);
		  // Found multiple reports!
		  } else {
				for (i in reports) {
					if(reports[i].status === 'Pending') {
						pendingCount++;
					} else if (reports[i].status === 'Completed') {
						completedCount++;
					} else {
						runningCount++
					}		
			}	
			 var activeClass = {
				'dashboard' : '',
				'report' : 'active',
				'createTest' : ''
			}	
				var status = {
					'Pending' : 'icon-refresh',
					'Paused' : 'icon-pause',
					'Completed' : 'icon-check',
					'pendingCount' : pendingCount,
					'runningCount' : runningCount,
					'completedCount' : completedCount
				}
				//console.log(status);
			 res.view('report/index',{
                data: reports,
                activeClass:activeClass,
                showstatus:status
                
                
            });
		  }
		});
  },
detailReport: function (req, res) {
      //test_name, cloudWatch, couchDB
    var avg;
    var testCompleted = false;
    var test_name = req.query.test_name;
    var test_folder = __dirname + '/../tests/ab/reports/'+test_name+'/';  // providing location for abtest for now, need to change it
    var testCompleted = (fs.existsSync(test_folder+'/currentstatus.stat'))?false:true;
    var cloudreports = null;
    var couchreports = null;
    if(req.body.cloudWatch){
        var cloud_folder = __dirname + '/../tests/cloudwatch/reports/' + test_name+'/';
        if(fs.existsSync(cloud_folder)){
            var cloud_files = fs.readdirSync(cloud_folder);   
            cloudreports = {};
            for (var b in cloud_files) {
                var cfile = cloud_folder + cloud_files[b];
                if (fs.existsSync(cfile) && path.extname(cfile) == '.json') {
                    var obj = JSON.parse(fs.readFileSync(cfile));
                    var title = obj.title;
                    if (!cloudreports[title]) cloudreports[title] = {};
                    if (!cloudreports[title]['cseries']) cloudreports[title]['cseries'] = {};
                    if (!cloudreports[title]['cseries']['cpuAvg']) cloudreports[title]['cseries']['cpuAvg'] = [];
                    if (!cloudreports[title]['cseries']['cpuMin']) cloudreports[title]['cseries']['cpuMin'] = [];
                    if (!cloudreports[title]['cseries']['cpuMax']) cloudreports[title]['cseries']['cpuMax'] = [];
                    if (!cloudreports[title]['cseries']['ramAvg']) cloudreports[title]['cseries']['ramAvg'] = [];
                    if (!cloudreports[title]['cseries']['ramMin']) cloudreports[title]['cseries']['ramMin'] = [];
                    if (!cloudreports[title]['cseries']['ramMax']) cloudreports[title]['cseries']['ramMax'] = [];
                    if (!cloudreports[title]['category']) cloudreports[title]['category'] = [];
                    cloudreports[title]['category'].push(obj.concurrency);
                    cloudreports[title]['cseries']['cpuAvg'].push(obj.CPUaverage);
                    cloudreports[title]['cseries']['cpuMin'].push(obj.CPUminimum);
                    cloudreports[title]['cseries']['cpuMax'].push(obj.CPUmaximum);
                    cloudreports[title]['cseries']['ramAvg'].push(obj.RAMaverage);
                    cloudreports[title]['cseries']['ramMin'].push(obj.RAMminimum);
                    cloudreports[title]['cseries']['ramMax'].push(obj.RAMmaximum);
                }
            }
        }
    }
    if(req.body.couchDB){
        var couch_folder = __dirname + '/../tests/couchdbTest/reports/' + test_name+'/';
        if(fs.existsSync(couch_folder)){
            var couch_files = fs.readdirSync(couch_folder);
            couchreports = {};
            for (var b in couch_files) {
                var cufile = couch_folder + couch_files[b];
                if (fs.existsSync(cufile) && path.extname(cufile) == '.json') {
                    var obj = JSON.parse(fs.readFileSync(cufile));
                    var title = obj.title;
                    if (!couchreports[title]) couchreports[title] = {};
                    if (!couchreports[title]['cseries']) couchreports[title]['cseries'] = {};
                    if (!couchreports[title]['cseries']['Mean']) couchreports[title]['cseries']['Mean'] = [];
                    if (!couchreports[title]['cseries']['Min']) couchreports[title]['cseries']['Min'] = [];
                    if (!couchreports[title]['cseries']['Max']) couchreports[title]['cseries']['Max'] = [];
                    if (!couchreports[title]['category']) couchreports[title]['category'] = [];
                    couchreports[title]['category'].push(obj.concurrency);
                    couchreports[title]['cseries']['Mean'].push(obj.meanRequest);
                    couchreports[title]['cseries']['Min'].push(obj.minReq);
                    couchreports[title]['cseries']['Max'].push(obj.maxReq);
                }
            }
        }
    }
   
    var files = fs.readdirSync(test_folder);   
    var reports = {};
    for (i in files) {
        file = test_folder + files[i];
        if (fs.existsSync(file) && path.extname(file) == '.json') {
            var obj = JSON.parse(fs.readFileSync(file));
           var conc = obj.params.concurrency;
           var title = obj.params.title;
            if (!reports[title]) reports[title] = {};
            if (!reports[title][conc]) reports[title][conc] = [];
            reports[title][conc].push(obj);
        }
    }
    var activeClass = {
				'dashboard' : '',
				'report' : 'active',
				'createTest' : ''
			}
    res.view('report/detailreport',{
        reports: reports,
        cloudreports: cloudreports,
        couchreports: couchreports,
        testCompleted:testCompleted,
        test_name : test_name,
        activeClass : activeClass
        
    });
  },
  create: function (req, res) {
	  //Report.create({
		  //name: 'Randy',
		  //status: 'Started',
		  //date:'2014-02-17',
		  //path:'#'
		//}).done(function(err,report){
			////console.log(report);
			//Report.publishCreate(report.toJSON());
			////socket.emit('message',report);
			//});
		return res.json({
			hello: 'world'
		});
  },
  subscribe: function (req, res) {
	  Report.find({}).sort('date DESC').done(function(err, reports) {
		  // Error handling
		  if (err) {
			return console.log(err);
		  // Found multiple reports!
		  } else {
			 Report.subscribe(req.socket);
			 Report.subscribe(req.socket,reports);
			 console.log('subscribed to Report Model');
		  }
		  return res.json({});
		});
		
	},
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ReportController)
   */
  _config: {}  
};
