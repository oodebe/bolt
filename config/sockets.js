/**
 * Socket Configuration
 *
 * These configuration options provide transparent access to Sails' encapsulated
 * pubsub/socket server for complete customizability.
 *
 * For more information on using Sails with Sockets, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.sockets = {

  // This custom onConnect function will be run each time AFTER a new socket connects
  // (To control whether a socket is allowed to connect, check out `authorization` config.)
  // Keep in mind that Sails' RESTful simulation for sockets 
  // mixes in socket.io events for your routes and blueprints automatically.
  onConnect: function(session, socket) {
	console.log('client connected');
		sails.io.of('/browser').on('connection', function (socket) {
			//sendStatus();
			console.log('browser socket connected');		
			
		});
		socket.on('abort', function (data)	 {
			console.log('Sending abort signal...');
			var master = sails.controllers.master;
			sails.io.sockets.in(data.test_name).emit('abort', {});
			delete master.tests[data.test_name];
		});
		socket.on('intro', function (data) {
			console.log('intro1 fired');
			var master = sails.controllers.master;
			var config = master.socketConfig;
			var count = Object.keys(config.clients).length + 1;
			client_info = {
				'id': count,
				'ip': socket.handshake.address.address,
				'port': data.port,
				'platform': data.platform,
				'status': 0,
				'socket': socket
			}
			config.clients[socket.id] = client_info;
			//sendStatus();
		});
		
		socket.on('disconnect', function () {
			console.log('Client dc');
			var master = sails.controllers.master;
			var config = master.socketConfig;
			if (socket.id in config.busy) {
				console.log('client was busy');
				var test_name = config.busy[socket.id].test_name;
				console.log('Sending abort signal...');
				console.log(test_name);
				master.tests[test_name].started = false;  // setting it to false to restart the process after aborted process completed
				sails.io.sockets.in(test_name).emit('abort', {});
				delete config.busy[socket.id];
				master.recover_AbortedTest('ab',test_name);
				//sendStatus();
				//process.nextTick(function(){master.recover_AbortedTest('ab',test_name)}); 	// passing the test name for now, should be stored in client
			}else{
				console.log('client was not busy');
				delete config.clients[socket.id];
				//sendStatus();	
			}
		});
		
		socket.on('report', function (data) {
			var client;
			var master = sails.controllers.master;
			var config = master.socketConfig;
			if (socket.id in config.busy) client = config.busy[socket.id];
			if (!client) return;
			client.socket.leave(data.params.test_name);
			config.clients[socket.id] = client;
			delete config.busy[socket.id];
			if (data.params.test_name in master.tests) {
				master.tests[data.params.test_name].save(data, client);
			}
			//sendStatus();
		});
		
		socket.on('aborted', function (data) {
			var client;
			var master = sails.controllers.master;
			var config = master.socketConfig;
			if (socket.id in config.busy) client = config.busy[socket.id];
			if (!client) return;
			client.socket.leave(data.params.test_name);
			config.clients[socket.id] = client;
			delete config.busy[socket.id];
			Report.update({tname: data.params.test_name},{status: 'Halted'},function(err,report){
				Report.publishUpdate(report[0].id,{status: 'Halted'});
			//socket.emit('message',report);
			});
			//sendStatus();
			//master.recover_AbortedTest('ab',data.params.test_name);
		});
		
		socket.on('progress', function (data) {
			var client;
			var master = sails.controllers.master;
			var config = master.socketConfig;
			if (socket.id in config.busy) client = config.busy[socket.id];
			console.log(client.id + ': ' + data.msg);
			data['client'] = {
				'id': client.id,
				'ip': client.ip,
				'port': client.port,
				'platform': client.platform
			};
			sails.io.of('/browser').emit('progress', data);
		});
  },

  // This custom onDisconnect function will be run each time a socket disconnects
  onDisconnect: function(session, socket) {

    // By default: do nothing
    // This is a good place to broadcast a disconnect message, or any other custom socket.io logic
  },



  // `transports`
  //
  // A array of allowed transport methods which the clients will try to use.
  // The flashsocket transport is disabled by default
  // You can enable flashsockets by adding 'flashsocket' to this list:
  transports: [
  'websocket',
  'htmlfile',
  'xhr-polling',
  'jsonp-polling'
  ],




  // Use this option to set the datastore socket.io will use to manage rooms/sockets/subscriptions:
  // default: memory
  adapter: 'memory',

  
  // Node.js (and consequently Sails.js) apps scale horizontally.
  // It's a powerful, efficient approach, but it involves a tiny bit of planning.
  // At scale, you'll want to be able to copy your app onto multiple Sails.js servers
  // and throw them behind a load balancer.
  //
  // One of the big challenges of scaling an application is that these sorts of clustered 
  // deployments cannot share memory, since they are on physically different machines.
  // On top of that, there is no guarantee that a user will "stick" with the same server between
  // requests (whether HTTP or sockets), since the load balancer will route each request to the 
  // Sails server with the most available resources. However that means that all room/pubsub/socket
  // processing and shared memory has to be offloaded to a shared, remote messaging queue (usually Redis)
  //
  // Luckily, Socket.io (and consequently Sails.js) apps support Redis for sockets by default.
  // To enable a remote redis pubsub server: 
  // adapter: 'redis',
  // host: '127.0.0.1',
  // port: 6379,
  // db: 'sails',
  // pass: '<redis auth password>'
  // Worth mentioning is that, if `adapter` config is `redis`, 
  // but host/port is left unset, Sails will try to connect to redis 
  // running on localhost via port 6379 



  // `authorization`
  //
  // Global authorization for Socket.IO access, 
  // this is called when the initial handshake is performed with the server.
  // 
  // By default (`authorization: true`), when a socket tries to connect, Sails verifies
  // that a valid cookie was sent with the upgrade request.  If the cookie doesn't match
  // any known user session, a new user session is created for it.
  //
  // However, in the case of cross-domain requests, it is possible to receive a connection
  // upgrade request WITHOUT A COOKIE (for certain transports)
  // In this case, there is no way to keep track of the requesting user between requests,
  // since there is no identifying information to link him/her with a session.
  //
  // If you don't care about keeping track of your socket users between requests,
  // you can bypass this cookie check by setting `authorization: false`
  // which will disable the session for socket requests (req.session is still accessible 
  // in each request, but it will be empty, and any changes to it will not be persisted)
  //
  // On the other hand, if you DO need to keep track of user sessions, 
  // you can pass along a ?cookie query parameter to the upgrade url, 
  // which Sails will use in the absense of a proper cookie
  // e.g. (when connection from the client):
  // io.connect('http://localhost:1337?cookie=smokeybear')
  //
  // (Un)fortunately, the user's cookie is (should!) not accessible in client-side js.
  // Using HTTP-only cookies is crucial for your app's security.
  // Primarily because of this situation, as well as a handful of other advanced
  // use cases, Sails allows you to override the authorization behavior 
  // with your own custom logic by specifying a function, e.g:
  /*
    authorization: function authorizeAttemptedSocketConnection(reqObj, cb) {

        // Any data saved in `handshake` is available in subsequent requests
        // from this as `req.socket.handshake.*`

        //
        // to allow the connection, call `cb(null, true)`
        // to prevent the connection, call `cb(null, false)`
        // to report an error, call `cb(err)`
    }
  */
  authorization: true,

  // Match string representing the origins that are allowed to connect to the Socket.IO server
  origins: '*:*',

  // Should we use heartbeats to check the health of Socket.IO connections?
  heartbeats: true,

  // When client closes connection, the # of seconds to wait before attempting a reconnect.
  // This value is sent to the client after a successful handshake.
  'close timeout': 60,

  // The # of seconds between heartbeats sent from the client to the server
  // This value is sent to the client after a successful handshake.
  'heartbeat timeout': 60,

  // The max # of seconds to wait for an expcted heartbeat before declaring the pipe broken
  // This number should be less than the `heartbeat timeout`
  'heartbeat interval': 25,

  // The maximum duration of one HTTP poll-
  // if it exceeds this limit it will be closed.
  'polling duration': 20,

  // Enable the flash policy server if the flashsocket transport is enabled
  // 'flash policy server': true,

  // By default the Socket.IO client will check port 10843 on your server 
  // to see if flashsocket connections are allowed.
  // The Adobe Flash Player normally uses 843 as default port, 
  // but Socket.io defaults to a non root port (10843) by default
  //
  // If you are using a hosting provider that doesn't allow you to start servers
  // other than on port 80 or the provided port, and you still want to support flashsockets 
  // you can set the `flash policy port` to -1
  'flash policy port': 10843,

  // Used by the HTTP transports. The Socket.IO server buffers HTTP request bodies up to this limit. 
  // This limit is not applied to websocket or flashsockets.
  'destroy buffer size': '10E7',

  // Do we need to destroy non-socket.io upgrade requests?
  'destroy upgrade': true,

  // Should Sails/Socket.io serve the `socket.io.js` client? 
  // (as well as WebSocketMain.swf for Flash sockets, etc.)
  'browser client': true,

  // Cache the Socket.IO file generation in the memory of the process
  // to speed up the serving of the static files.
  'browser client cache': true,

  // Does Socket.IO need to send a minified build of the static client script?
  'browser client minification': false,

  // Does Socket.IO need to send an ETag header for the static requests?
  'browser client etag': false,

  // Adds a Cache-Control: private, x-gzip-ok="", max-age=31536000 header to static requests, 
  // but only if the file is requested with a version number like /socket.io/socket.io.v0.9.9.js.
  'browser client expires': 315360000,

  // Does Socket.IO need to GZIP the static files?
  // This process is only done once and the computed output is stored in memory. 
  // So we don't have to spawn a gzip process for each request.
  'browser client gzip': false,

  // Optional override function to serve all static files, 
  // including socket.io.js et al.
  // Of the form :: function (req, res) { /* serve files */ }
  'browser client handler': false,

  // Meant to be used when running socket.io behind a proxy. 
  // Should be set to true when you want the location handshake to match the protocol of the origin. 
  // This fixes issues with terminating the SSL in front of Node 
  // and forcing location to think it's wss instead of ws.
  'match origin protocol': false,

  // Direct access to the socket.io MQ store config
  // The 'adapter' property is the preferred method
  // (`undefined` indicates that Sails should defer to the 'adapter' config)
  store: undefined,

  // A logger instance that is used to output log information.
  // (`undefined` indicates deferment to the main Sails log config)
  logger: undefined,

  // The amount of detail that the server should output to the logger.
  // (`undefined` indicates deferment to the main Sails log config)
  'log level': undefined,

  // Whether to color the log type when output to the logger.
  // (`undefined` indicates deferment to the main Sails log config)
  'log colors': undefined,

  // A Static instance that is used to serve the socket.io client and its dependencies.
  // (`undefined` indicates use default)
  'static': undefined,

  // The entry point where Socket.IO starts looking for incoming connections. 
  // This should be the same between the client and the server.
  resource: '/socket.io'

};
