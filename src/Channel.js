/* LudumPad.Channel */

LudumPad.Channel = function (options) {
	this.setOptions(options);
	if (this.channelID == undefined) this.generateRandomChannelID();
	this.gamepadList = [];
	this.gamepadHash = {};
	LudumPad.Channel._instances.push(this);
}
LudumPad.Channel.prototype = _.extend(new LudumPad.DefaultConnectionConfig (), new LudumPad.ObjectWithEvents ());
LudumPad.Channel.prototype = _.extend(LudumPad.Channel.prototype, {


	/*events*/
	_onopen : dummyf,
	_onconnectionerror : function (statusCode) {
		if (statusCode == LudumPad.StatusCode.ChannelAlreadyExists) {
			this.generateRandomChannelID();
			this.open();
		}
	},
	_ongamepadconnection : dummyf, // <Gamepad>
	_ongamepaddisconnection : dummyf, // <Gamepad>
	_onpacketfromgamepad : dummyf, // <Gamepacket, Gamepad>
	_onconnectionfailed : dummyf,
	_onconnectionclosed : dummyf,

	paused : false,

	open : function () {

		if (this.connected || this.connecting) return false;
		this.connecting = true;

		this.host = this.hostList[this.hostIndex];

		this.socket = io.connect('http://'+this.host+':'+this.port);

		this.socket.on('openChannelCallback', function (p) { //{statusCode, localIP}
			this.connected = true;
			this.connecting = false;
			if (this.host == "localhost") this.host = p.localIP;
			switch (p.statusCode) {
				case LudumPad.StatusCode.OK: LudumPad.log('Opened channel with ID '+this.channelID);
					new LudumPad.UI.Bubble({msg:'Successfully opened Channel with id '+this.channelID + ' on server '+this.host});
					this._onopen();
					break;
				case LudumPad.StatusCode.ChannelAlreadyExists: alert('Channel already exists.');
					this.connecting = false;
					this.connected = false;
					this._onconnectionerror(p.statusCode);
					break;
			}
		}.bind(this));

		this.socket.on('GamepadConnected', function (gamepad) {
			var g = new LudumPad.Gamepad ();
			LudumPad.log('New gamepad');
			for (var prop in gamepad) {
				if (prop != "screen") g[prop] = gamepad[prop];
			}
			if (gamepad.screen) g.screen.setSize(gamepad.screen);
			var uindex = this._firstUndefinedSlot();
			if (uindex >= 0) {
				g.index = uindex;
				this.gamepadList[uindex] = g;
			} else {
				g.index = this.gamepadList.length;
				this.gamepadList.push(g);
			}
			this.gamepadHash[g.id] = g;
			var msg = g.alias+' has connected as Gamepad #'+(g.index+1);
			LudumPad.log(msg);
			new LudumPad.UI.Bubble({msg:msg});
			this._ongamepadconnection(g);
		}.bind(this));

		this.socket.on('GamepadDisconnected', function (gid) {
			var gamepad = this.gamepadHash[gid];
			this._removeGamepad(gamepad);
			new LudumPad.UI.Bubble({msg:"Gamepad #"+(gamepad.index+1)+" disconnected.", type:"error"});
			this._ongamepaddisconnection(gamepad);
		}.bind(this));

		this.socket.on('gotGamepadPacket', function (gPacket){
			var gamepad = this.gamepadHash[gPacket.id];
			if (gPacket.ping) {
				//TO-DO: update `ping` in Channel's Gamepads.
				this.emitPacketToGamepads([gamepad], {}, 1);
			} else {
				if (gPacket.t != undefined) gamepad.touches = gPacket.t;
				if (gPacket.s != undefined) gamepad.screen.setSize(gPacket.s);
				if (gPacket.g != undefined) gamepad.gyroscope = gPacket.g;
				if (gPacket.p != undefined) gamepad.paused = gPacket.p;
				if (gPacket.u != undefined) {
					for (var i = 0; i < gPacket.u.length; ++i) gamepad.types[i].update(gPacket.u[i]);
				}
				this._onpacketfromgamepad(gPacket, gamepad);
			}
		}.bind(this));

		this.socket.on('connect', function () {
			this.socket.emit('openChannel', this.channelID);
		}.bind(this));

		this.socket.on('connect_failed', function () {
			if (this.connecting || this.connected) {
				new LudumPad.UI.Bubble({type:'error', msg:'Connection to server "'+this.host+'" failed'});
				LudumPad.log('connect failed');
				this.connecting = false;
				this.connected = false;
				this._onconnectionfailed();
				if (this.hostIndex+1 < this.hostList.length) {
					this.hostIndex++;
					this.open();
				}
			}
		}.bind(this));

		this.socket.on('close', function () {
		   LudumPad.log('close');
		    this.connecting = false;
		   this.connected = false;
		   this._onconnectionclosed();
		}.bind(this));

		return this;

	},
	_firstUndefinedSlot : function () {
		var list = this.gamepadList;
		for (var i = 0; i < list.length; ++i) {
			if (list[i] == undefined) return i;
		}
		return -1;
	},
	_removeGamepad : function (gamepad) {
		delete this.gamepadHash[gamepad.id];
		var list = this.gamepadList;
		for (var i = list.length-1; i >= 0; --i) {
			if (list[i] == gamepad) return list[i] = undefined;
		}
	},
	emitPacketToGamepads : function (gamepads, p, t) {
		if (t == undefined) t = LudumPad.MessageTypePacket;
		var gidlist = [];
		for (var i = 0; i < gamepads.length; ++i) {
			var gid = gamepads[i].id;
			if (gid) gidlist.push(gid);
		}
		this.socket.emit('packetToGamepads', {t:t, p:p, g:gidlist});
	},
	emitConfigurationToGamepads : function (gamepads, c) {
		this.emitPacketToGamepads(gamepads, c, LudumPad.MessageTypeGamepadConfiguration);
	},
	forEachGamepad : function (f) {
		var glist = this.gamepadList;
		for (var i = 0; i < glist.length; ++i) if (glist[i] != undefined) f(glist[i]);
	},
	_sendPing : function () {
		var now = +new Date ();
		this.emitPacketToGamepads(this.gamepadList, now, LudumPad.MessageTypePingResponse);
	},
	_getFirstPausedGamepad : function () {
		for (var i = 0; i < this.gamepadList.length; ++i) {
			var gamepad = this.gamepadList[i];
			if (gamepad != undefined && gamepad.paused) return gamepad;
		}
		return undefined;
	},
	_logic : function () {

		var pausedNow = (this._getFirstPausedGamepad() != undefined);
		if (!this.paused && pausedNow) new LudumPad.UI.PauseCover(this);
		this.paused = pausedNow;

		for (var i = 0; i < this.gamepadList.length; ++i) {
			var gamepad = this.gamepadList[i];
			if (gamepad._needsTypeSync) {
				gamepad._needsTypeSync = false;
				this.emitPacketToGamepads([gamepad], gamepad.types, LudumPad.MessageTypeGamepadSyncType);
				LudumPad.log("Syncing Type with gamepad "+gamepad.id);
			}
		}

	}
});
LudumPad.Channel._instances = [];