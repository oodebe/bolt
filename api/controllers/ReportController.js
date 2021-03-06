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
		var statusCounts = {
			Halted : 0,
			Completed : 0,
			Running : 0
			};
		var sortImage = {
			Asc : 'icon-chevron-up',
			Dsc : 'icon-chevron-down'
		}
		var testStatus = {};
		var sortField ='name';
		var sorting =(req.query.sort !==undefined && req.query.sort!=='') ? req.query.sort:'Asc';
		if(req.query.status!==undefined && req.query.status!=='') {
			testStatus['status'] = req.query.status;
		}
		if(req.query.sortField!==undefined && req.query.sortField!=='') {
			sortField = req.query.sortField;
		}
		if(req.query.sort!==undefined && req.query.sort!=='' && req.query.sort=="Dsc") {
			sorting = req.query.sort;
			icon='Asc';
		} else {
			sorting = 'Asc';
			icon='Dsc';
		}
		
		Report.find({}).sort(sortField+' '+sorting).done(function(err, reports) {
		  // Error handling
		  if (err) {
			return console.log(err);
		  // Found multiple reports!
		  } else {
				for (i in reports) {
					statusCounts[reports[i].status]++;	
				}
				Report.find(testStatus).sort(sortField+' '+sorting).done(function(err,reports) {
					if (err) {
						return console.log(err);
					} else {
						var activeClass = {
							'dashboard' : '',
							'report' : 'active',
							'createTest' : ''
						}
							
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
							},
							'statusCounts' : statusCounts
						}
						res.view('report/index',{
							data: reports,
							activeClass:activeClass,
							showstatus:imageStatus,
							sortIcon: sortImage[icon]
						});
					}
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
	  Report.findOne({tname:'abc'}).done(function(err, report) {
		  // Error handling
			if (err) {
				return console.log(err);
			} else {
				console.log(report);
			}
			//else{
				//console.log('Provided Test Case Not Found, Restarting Recovery Process');
				//sails.controllers.master.recover_AbortedTest();
		//	}
		});
		res.end();
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
