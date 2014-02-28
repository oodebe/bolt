/**
 * MasterController
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
var http = require('http')
var	qs = require('querystring');
var fs = require('fs');
var path = require('path');
var tests = require('../tests');

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MasterController)
   */
  _config: {},
  socketConfig: {
		clients : {},	
		busy: {},
		concurrency : {
			min : 50,
			max : 200,
			diff: 50
		}
	},
   tests:{},
   start: function (req, res) {
		console.log('into start');
		res.end();
		var Test = tests[req.body.test_type];
		console.log('request ended');  
		var data = {
			'params': req.body,
			'config': sails.controllers.master.socketConfig
		}
		var test = new Test(data);
		sails.controllers.master.tests[req.body.test_name] = test;
		test.base = sails.controllers.master;
		test.io = sails.io;
		console.log('starting test');
		test.start();
  },
  actionRoute:function (req,res) {
	  res.end();
  },
  recovery:function (req,res) {
		var self = this;
		res.writeHead(200, {'content-type': 'text/html'});
		res.write('Recovery Process Initiated');
		sails.controllers.master.recover_AbortedTest(null,null,res);
	},
  recover_AbortedTest: function (test_type,test_name,res) {
	console.log('Starting Recovery Process');
	if(test_type && test_name){
	//assuming that test_name will always be provided if test_type is given
		if (tests[test_type]) {
			if (test_name in sails.controllers.master.tests) {
				if(sails.controllers.master.tests[test_name].started == true){
					console.log('Test Cannot be Started');
					return;
				}
				sails.controllers.master.tests[test_name].restart(test_name);
			}else{
				console.log('Provided Test Case Not Found, Restarting Recovery Process');
				sails.controllers.master.recover_AbortedTest();
			}
		}else{
			console.log('test '+test_type+' is not supported');
		}
	}else{
		/*
		//initiate test recovery for all the supported test systems 
		for (t in tests){
			
		}*/
		console.log('looking for aborted test')
		var rep_folder = __dirname + '/../tests/ab/reports/';  // providing location for abtest for now, need to change it
		var Test = tests['ab'];
		var data = {
			'recovery': true,
			'config' : sails.controllers.master.socketConfig
		}
		var recovery = false;
		var files = fs.readdirSync(rep_folder);
		for (i in files) {
			file = rep_folder + files[i];
			if (fs.existsSync(file) && path.extname(file) == '.test') {
				var testName = path.basename(file,'.test');
				if (testName in sails.controllers.master.tests) {
					if(sails.controllers.master.tests[testName].started == true){
						continue;
					}
					sails.controllers.master.tests[testName].restart(testName);
					recovery =true;
					break;
				}else{
					var test = new Test(data);
					sails.controllers.master.tests[testName] = test;
					test.base = sails.controllers.master;
					test.io = sails.io
					recovery =true;
					test.restart(testName);
					break;
				}
			}
		}
		var msg = (recovery)?'<br>Found some incomplete Tests, Recovery process started':' <br> No incomplete tests are found';
		console.log(msg);
		if(res){
			res.end(msg);
		}
	}
}

};
