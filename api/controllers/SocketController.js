/**
 * SocketController
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
    
  
  /**
   * Action blueprints:
   *    `/socket/socketConnect`
   */
   socketConnect: function (req, res) {
		console.log('testst');
		//var session = req.session;
		//if (req.isSocket) {
			//var handshake = req.socket.manager.handshaken[req.socket.id];
			//if (handshake) {
				//session = handshake.session;
			//}
		//}
		return res.json({
			hello: 'world'
		});
    /* Send a JSON response
    return res.json({
      hello: 'world'
    });*/
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SocketController)
   */
  _config: {}

  
};
