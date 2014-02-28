/**
 * DashboardController
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

module.exports = {
    
	
	dashboard: function (req, res) {
		var activeClass = {
				'dashboard' : 'active',
				'report' : '',
				'createTest' : ''
			}	 
		res.view('dashboard/index1',{
			activeClass:activeClass
		});
	},
	abtest: function (req, res) {
		var activeClass = {
				'dashboard' : '',
				'report' : '',
				'createTest' : 'active'
			}	 
		res.view('dashboard/index1',{
			activeClass:activeClass
		});
	},
	abtest1: function (req, res) {
		var activeClass = {
				'dashboard' : '',
				'report' : '',
				'createTest' : 'active'
			}	 
		res.view('partials/abtest',{
			activeClass:activeClass
		});
  },
	system_matrix: function (req, res) {
		var activeClass = {
				'dashboard' : '',
				'report' : '',
				'createTest' : 'active'
			}	 
		res.view('partials/systemmatrix',{
			activeClass:activeClass
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to DashboardController)
   */
  _config: {}

  
};
