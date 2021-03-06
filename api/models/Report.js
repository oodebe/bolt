/**
 * Report
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
attributes: {
  	name:{
		type: 'string',
		required: true
	},
	tname:{
		type: 'string',
		required: true,
		unique : true
	},
  	date:'datetime',
  	path:'string',
  	status : 'string',
  	description : 'string',
  	test_type : 'string'
  }
};
