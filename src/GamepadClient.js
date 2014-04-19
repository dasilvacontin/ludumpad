/* LudumPad.GamepadClient */

LudumPad.GamepadClient = function (options) {
	this.setOptions(options);
	LudumPad.Gamepad._instances.push(this);
	this.touches = [];
	this.types = [];
	this.conf = {};

	document.body.addEventListener('touchmove', function (event) {
		event.preventDefault();
	}, false);

	LudumPad.UI.canvas.addEventListener('touchstart', function (event) {
		this.touches = event.touches;
		this._touched = true;
		this._force = true;
	}.bind(this), false);

	document.body.addEventListener('touchmove', function (event) {
		this.touches = event.touches;
		this._touched = true;
	}.bind(this), false);

	LudumPad.UI.canvas.addEventListener('touchend', function 	(event) {
		this.touches = event.touches;
		this._touched = true;
		this._force = true;
	}.bind(this), false);

	if (window.DeviceOrientationEvent) {
		LudumPad.log("DeviceOrientation is supported");
		window.addEventListener('deviceorientation', this._gyroscopeHandler.bind(this), false);
	}

	this.screen = LudumPad.LocalScreen;
	this.screen.on('resize', function () {
		LudumPad.log('this._screenChanged = true');
		this._screenChanged = true;
	}.bind(this));

}
LudumPad.GamepadClient.prototype = _.extend(new LudumPad.DefaultConnectionConfig (), new LudumPad.ObjectWithEvents ());
LudumPad.GamepadClient.prototype = _.extend(LudumPad.GamepadClient.prototype, LudumPad.Gamepad.prototype);
LudumPad.GamepadClient.prototype = _.extend(LudumPad.GamepadClient.prototype, {

	_touched : false,
	_force : false,
	_screenChanged : false,
	_olddpad : -1,

	_lastPacket : +new Date (),
	_msSkip : 50,

	/*events*/
	_onconnect: dummyf,
	_onconnectionerror : dummyf,
	_onchannelpacket : dummyf,
	_onconfiguration : dummyf,
	_ontypesync : dummyf,
	_onconnectionfailed : dummyf,
	_onconnectionclosed : dummyf,
	_onchanneldied : dummyf,

	_lastPingRequest : undefined,

	connect : function () {

		if (this.connected || this.connecting) return false;
		this.connecting = true;

		this.host = this.hostList[0];
		console.log('host is '+this.host);

		this.socket = io.connect('http://'+this.host+':'+this.port);

		this.socket.on('connectToChannelCallback', function (statusCode) {
			this.connected = true;
			this.connecting = false;
			LudumPad.log('connectToChannelCallback. StatusCode: '+statusCode);
			switch (statusCode) {
				case LudumPad.StatusCode.OK: LudumPad.log('Connected to Channel with id '+this.channelID);
					new LudumPad.UI.Bubble({msg:'Connected to Channel with id '+this.channelID});
					this.ping = (+new Date()) - this._lastPingRequest;
					this._onconnect();
					setInterval(function () {
						this._pingRequest();
					}.bind(this), 1000);
					break;
				case LudumPad.StatusCode.ChannelNotFound: LudumPad.log('Channel with id '+this.channelID+' not found.');
					new LudumPad.UI.Bubble({msg:'Channel with id '+this.channelID+' not found', type:'error'});
					this._onconnectionerror(statusCode);
					break;
			}
		}.bind(this));

		this.socket.on('connect', function () {
			LudumPad.log('Connection. Requesting...');
			this._lastPingRequest = +new Date ();
			this.socket.emit('connectToChannel', {channel:this.channelID, g:{alias:this.alias, screen:this.screen.packet()}});
		}.bind(this));

		this.socket.on('channelPacket', function (data) {
			switch (data.t) {

				case LudumPad.MessageTypeGamepadConfiguration: LudumPad.log('Got conf packet from channel!');
					console.log(data);
					if (data.p) {
						if (data.p.bgcolor != undefined) this.bgcolor = data.p.bgcolor;
						if (data.p.index != undefined) this.index = data.p.index;
						if (data.p.conf) {
							this.conf = {};
							var conf = data.p.conf;
							for (var i = 0; i < conf.length; ++i) {
								this.conf[conf[i]] = true;
							}
						}
						if (data.p.type) this.type = data.p.type;
						this._onconfiguration(data.p);
					}
				break;

				case LudumPad.MessageTypePingResponse: this.ping = Math.floor( this.ping/3 + ( ((+new Date ()) - this._lastPingRequest)/2 )*2/3 );
				break;

				case LudumPad.MessageTypePacket: this._onchannelpacket(data.p);
				break;

				case LudumPad.MessageTypeGamepadSyncType: LudumPad.log("Got Sync Type Message from Channel");
					console.log(data);
					//this.types = data.p;
					this.types = [];
					for (var i = 0; i < data.p.length; ++i) {
						var ptype = data.p[i];
						var type = new LudumPad.GamepadType ();
						for (var prop in ptype) {
							type[prop] = ptype[prop];
						}
						this.types.push(type);
					}
					this._ontypesync();
				break;

			}
		}.bind(this));

		this.socket.on('connect_failed', function () {
			if (this.connecting || this.connected) {
				new LudumPad.UI.Bubble({type:'error', msg:'Connection to server "'+this.host+'" failed'});
				LudumPad.log('connect failed');
				this.connecting = false;
				this.connected = false;
				this._onconnectionfailed();
			}
		}.bind(this));

		this.socket.on('close', function () {
		  	LudumPad.log('close');
			this.connecting = false;
			this.connected = false;
			this._onconnectionclosed();
		}.bind(this));

		this.socket.on('channelDied', function () {
			this.connected = false;
			this.connecting = false;
			new LudumPad.UI.Bubble({msg:'Channel died. Disconnected.', type:'error'});
			this._onchanneldied();
		}.bind(this));

		return this;

	},
	emitPacket : function (p) {
		this.socket.emit('gamepadPacket', p);
	},
	_touchesPacket : function () {
		var p = [];
		for (var i = 0; i < this.touches.length; ++i) {
			var t = this.touches[i];
			p.push({screenX:t.screenX, screenY:t.screenY});
		}
		return p;
	},
	_gyroscopeHandler : function (e) {
		this.gyroscope = {LR:e.gamma, FB:e.beta, dir:e.alpha};
	},
	_logic : function (newDate) {

		if (!this.connected) return;
		var g = this.gyroscope;

		var needsUpdate = false;
		var timeUpdate = (newDate - this._lastPacket) > this._msSkip;

		var p = {};

		/* Screen changed? */
		if (this._screenChanged) {
			needsUpdate = true;
			this._screenChanged = false;
			p.s = this.screen.packet();
		}

		/* Pause changed? */
		var wasPaused = this.paused;
		this.paused = ((g.LR > 150 || g.LR < -150) && (g.FB < 25 && g.FB > -25));
		if (wasPaused != this.paused) {
			needsUpdate = true;
			p.p = this.paused;
		}

		if (!this.paused) {

			/* Check which pieces should update */
			for (var i = 0; i < this.types.length; ++i) {
				var update = this.types[i].checkUpdate();
				if (update != undefined) {
					needsUpdate = true;
					if (p.u == undefined) p.u = [];
					p.u[i] = update;
				}
			}

			/* Check if should update DPAD
			if (this.conf[LudumPad.GamepadTypeDPAD] && this._touched) {
				this._olddpad = this.dpad;
				this.dpad = this._updatedpad();
				if (this.dpad != this._olddpad) {
					p.pd = this.dpad;
					needsUpdate = true;
				}
			}
			*/

			/* Check if should update touches */
			if (this.conf[LudumPad.GamepadConfInputTouches] && (this._force || (this._touched && timeUpdate)) ) {
				needsUpdate = true;
			}
			
			/* Check if should update gyroscope */
			if (this.conf[LudumPad.GamepadConfInputGyroscope] && timeUpdate) {
				needsUpdate = true;
			}

		}

		if (needsUpdate) {
			if (this.conf[LudumPad.GamepadConfInputTouches]) p.t = this._touchesPacket();
			if (this.conf[LudumPad.GamepadConfInputGyroscope]) p.g = this.gyroscope;
			this._lastPacket = newDate;
			this._force = false;
			this._touched = false;
			this.emitPacket(p);
		}

	},
	_updatedpad : function () {
		if (this.touches.length == 0) return -1;
		var dirPoints = LudumPad.Gamepad.dirPoints;
		var minDist = this._distToPoint(dirPoints[0]);
		var newdir = 0;
		for (var i = 1; i < dirPoints.length; ++i) {
			var dist = this._distToPoint(dirPoints[i]);
			if (dist < minDist) {
				minDist = dist;
				newdir = i;
			}
		}
		return newdir;
	},
	_distToPoint : function (p) {
		var t = this.touches[0];
		return Math.sqrt(Math.pow(p.y-t.screenY/this.screen.height, 2)+Math.pow(p.x-t.screenX/this.screen.width, 2));
	},
	_pingRequest : function () {
		this._lastPingRequest = +new Date ();
		this.emitPacket({ping:1});
	},
	//Forces hostList to only be the provided host, if any
	setOptions : function (options) {
		if (!options) return;
		if (options.channelID) this.channelID = options.channelID;
		if (options.host) this.hostList = [options.host];
		if (options.port) this.port = options.port;
	}

});