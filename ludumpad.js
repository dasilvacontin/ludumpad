/*
  ludumpad-client - v0.0.1 - 2013-10-28
  Copyright(c) 2013 David da Silva Contín <daviddasilvacontin@me.com> MIT Licensed
*/

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
// MIT license
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());



//bind polyfill

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}



// greensock polyfill

if (!window.TweenLite) {
	//Ugly polyfill lulz
	window.TweenLite = {};
	TweenLite.to = function (who, during, what) {
		for (var prop in what) {
			if (prop == 'onComplete') setTimeout(function () {
				what.onComplete();
			}, during*1000);
			else who[prop] = what[prop];
		}
		
	}
	window.Power4 = {ease:0};
}



// From underscore.js
// Extend a given object with all the properties in passed-in object(s).

var _ = {};
var slice = Array.prototype.slice;
var nativeForEach = Array.prototype.forEach;
var each = _.each = _.forEach = function(obj, iterator, context) {
	if (obj == null) return;
	if (nativeForEach && obj.forEach === nativeForEach) {
	  obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
	  for (var i = 0, length = obj.length; i < length; i++) {
	    if (iterator.call(context, obj[i], i, obj) === breaker) return;
	  }
	} else {
	  var keys = _.keys(obj);
	  for (var i = 0, length = keys.length; i < length; i++) {
	    if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
	  }
	}
};
_.extend = function(obj) {
	each(slice.call(arguments, 1), function(source) {
	  if (source) {
	    for (var prop in source) {
	      obj[prop] = source[prop];
	    }
	  }
	});
	return obj;
};



// http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}



// http://stackoverflow.com/questions/10001726/access-get-variables-using-jquery-javascript

function getParameterByName (name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};var LudumPad = {
	debug : false,
	_oldDate : +new Date (),
	_delta : 0,
	version: 0.1 //Used to check compatibility between versions
};
LudumPad.Colors = ["#fe0e63"]; //Just an array of colors I personally like

//Channel Message Type
LudumPad.MessageTypePacket = -1;
LudumPad.MessageTypeGamepadConfiguration = 0;
LudumPad.MessageTypePingResponse = 1;
LudumPad.MessageTypeGamepadSyncType = 2;

//Gamepad Types (Gamepad can be 2 types at most)
LudumPad.GamepadTypeDPAD = 0;
LudumPad.GamepadTypeJoystick = 1;
LudumPad.GamepadTypeButtons = 2;

//Input Configuration (additional input data)
LudumPad.GamepadConfInputTouches = 0;
LudumPad.GamepadConfInputGyroscope = 1;
LudumPad.GamepadConfInputAccelerometer = 2;
LudumPad.GamepadConfInputPointer = 3;

LudumPad._logic = function () {

	requestAnimationFrame(LudumPad._logic);
	var newDate = +new Date ();
	this._delta = newDate - this._oldDate;
	this.oldDate = newDate;

	var gamepads = LudumPad.Gamepad._instances;
	for (var i = 0; i < gamepads.length; ++i) gamepads[i]._logic(newDate);

	var channels = LudumPad.Channel._instances;
	for (var i = 0; i < channels.length; ++i) channels[i]._logic(newDate);

}
LudumPad.StatusCode = {
	OK : 0,
	ChannelNotFound : 10,
	ChannelAlreadyExists : 11
};
LudumPad.debugMode = function () {
	this.debug = true;
}
LudumPad.log = function (msg) {
	if (this.debug) console.log('<LudumPad> '+msg);
}
var dummyf = function () {}; // Default function for callbacks




/* LudumPad.Audio | Thanks Torley! */

LudumPad.Audio = {};
LudumPad.Audio.Ping = new Audio ("../ludumpad-client/im_ping_4.wav");
LudumPad.Audio.Error = new Audio ("../ludumpad-client/classic_coin_3.wav");




/* LudumPad base clases */

LudumPad.ObjectWithEvents = function () {}
LudumPad.ObjectWithEvents.prototype = {
	on : function (e, f) {
		this['_on'+e.toLowerCase()] = f;
	}
}

LudumPad.DefaultConnectionConfig = function () {}
LudumPad.DefaultConnectionConfig.prototype = {
	channelID : undefined,
	connected : false,
	connecting : false,
	host : undefined,
	hostIndex : 0,
	hostList : ['localhost', 'kipos.me'],
	port : 4242,
	idSize : 4,
	setOptions : function (options) {
		if (!options) return;
		if (options.channelID) this.channelID = options.channelID;
		if (options.host) this.hostList.splice(1, 0, options.host);
		if (options.port) this.port = options.port;
	},
	generateRandomChannelID : function () {
		var cake = "xxxx";
		var lie = '-';
		var yummy = "";
		for (var i = 0; i < this.idSize; ++i) {
			if (i!=0) yummy += lie;
			yummy += cake;
		}
		this.channelID = yummy.replace(/[x]/g, function(c) {
	    	return (Math.random()*16|0).toString(16);
		});
	}
};LudumPad.Screen = function () {}
LudumPad.Screen.prototype = _.extend(new LudumPad.ObjectWithEvents (), {
	width: window.innerWidth,
	height: window.innerHeight,
	_onresize : dummyf
});
LudumPad.Screen.prototype.isLocal = function () {
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	var self = this;
	$(window).resize(function() {
		self.setSize({width:window.innerWidth, height:window.innerHeight});
	});
	return this;
}
LudumPad.Screen.prototype.setSize = function (size) {
	this.width = size.width;
	this.height = size.height;
	this._onresize();
}
LudumPad.Screen.prototype.packet = function () {
	return {width:this.width, height:this.height};
}
LudumPad.LocalScreen = (new LudumPad.Screen ()).isLocal();;LudumPad.GamepadButton = function (text, bgcolor) {
	this.text = text;
	this.bgcolor = bgcolor;
}

LudumPad.GamepadType = function (type) {
	this.type = type;
}
LudumPad.GamepadType.prototype = {
	addButtonToRow : function (button, row) {
		if (this.buttons == undefined) this.buttons = [];
		while (row > this.buttons.length-1) this.buttons.push([]);
		this.buttons[row].push(button);
	}
}
LudumPad.GamepadType.prototype.checkUpdate = function () {
	switch (this.type) {

		case LudumPad.GamepadTypeDPAD:  //DPAD
			if (this._old == undefined) this._old = -1;
			if (this.dpad == undefined) this.dpad = -1;
			if (this._old != this.dpad) {
				this._old = this.dpad;
				return this.dpad;
			} else {
				this._old = this.dpad;
				return undefined;
			}

		case LudumPad.GamepadTypeButtons: //Buttons
			var currSnapshot = this.buttonsSnapshot();
			if (this._old == undefined) this._old = currSnapshot;

			var isEqual = this.equalSnapshots(currSnapshot, this._old)
			this._old = currSnapshot;
			if (isEqual) return currSnapshot;
			else return undefined;

		default: return undefined;

	}
}
LudumPad.GamepadType.prototype.buttonsSnapshot = function () {
	if (this.buttons == undefined) this.buttons = [];
	var snap = [];
	for (var i = 0; i < this.buttons.length; ++i) {
		var brow = this.buttons[i];
		var row = [];
		for (var j = 0; j < brow.length; ++j) {
			row.push((brow[j].state == true));
		}
		snap.push(row);
	}
	return snap;
}
LudumPad.GamepadType.prototype.equalSnapshots = function (snap1, snap2) {
	if (snap1.length != snap2.length) return false;
	for (var i = 0; i < snap1.length; ++i) {
		if (snap1[i].length != snap2[i].length) return false;
		for (var j = 0; j < snap1[i].length; ++j) {
			if (snap1[i][j] != snap2[i][j]) return false;
		}
	}
	return true;
}
LudumPad.GamepadType.prototype.update = function (u) {
	if (u == undefined) return;
	switch (this.type) {

		case LudumPad.GamepadTypeDPAD: this._old = this.dpad;
		this.dpad = u;
		break;

		case LudumPad.GamepadTypeButtons: //Buttons
			for (var i = 0; i < this.buttons.length; ++i) {
				var row = this.buttons[i];
				for (var j = 0; j < row.length; ++j) {
					var button = this.buttons[i][j];
					button._old = button.state;
					button.state = u[i][j];
				}
			}
		break;

	}
}


/* LudumPad.Gamepad */

LudumPad.Gamepad = function () {
	this.touches = [];
	this.screen = new LudumPad.Screen ();
	this.types = [];
	this.conf = {};
}
LudumPad.Gamepad.prototype = {

	alias : 'Anonymous',
	index : -1,
	id : undefined,
	paused: false,
	conf : {},
	screen : new LudumPad.Screen (),
	gyroscope : {LR:0, FB:0, dir:0},
	dpad : -1,
	bgcolor : "#111111",
	ping : 0,
	_needsTypeSync : false,
	setTypes : function (types) {
		this.types = types;
		this._needsTypeSync = true;
	}
	
};
LudumPad.Gamepad.dir = {
	UP : 0,
	RIGHT : 1,
	DOWN : 2,
	LEFT : 3,
	NONE : -1
}
LudumPad.Gamepad.dirPoints = [{x:0.5,y:0},{x:1,y:0.5},{x:0.5,y:1},{x:0,y:0.5}];
LudumPad.Gamepad._instances = [];;LudumPad.GamepadClient = function (options) {
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

});;LudumPad.Channel = function (options) {
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
LudumPad.Channel._instances = [];;LudumPad.UI = {};
LudumPad.UI.configure = function (props) {
	if (props.canvas) this.canvas = props.canvas;
	if (props.ctx) this.ctx = props.ctx;
}
LudumPad.UI._instances = [];
LudumPad.UI.render = function () {
	if (this._instances.length < 1) return;
	var uielem = this._instances[0];
	uielem.render(this.canvas, this.ctx);
	if (uielem.zombie) this._instances.splice(0,1);
}




/* LudumPad.UI.PauseCover */

LudumPad.UI.PauseCover = function (channel) {
	this.channel = channel;
	LudumPad.UI._instances.push(this);
}
LudumPad.UI.PauseCover.prototype = {
	font : "30px StiffStaff",
	textColor : "white",
	init : dummyf,
	render : function (canvas, ctx) {
		ctx.save();
		if (!this.channel.paused) {
			this.zombie = true;
			return;
		}
		var gamepad = this.channel._getFirstPausedGamepad();
		var msg = "PAUSED";
		ctx.textBaseline = "middle";
		ctx.font = this.font;
		var msgWidth = ctx.measureText(msg).width;

		ctx.fillStyle = "black";
		ctx.globalAlpha = 0.5;
		ctx.fillRect(0,0,canvas.width, canvas.height);
		ctx.globalAlpha = 1;
		ctx.fillStyle = gamepad.color;
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, msgWidth/2+30, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.fillStyle = this.textColor;
		
		console.log(ctx.font);
		ctx.fillText(msg, (canvas.width-msgWidth)/2, canvas.height/2);
		ctx.restore();
	}
}




/* LudumPad.UI.Bubble */

LudumPad.UI.Bubble = function (props) {
	if (props) {
		if (props.msg) this.msg = props.msg;
		if (props.type) {
			this.type = props.type;
			switch (props.type) {
				case 'error' : this.bulletColor = "#CC0000";
			}
		}
	}
	LudumPad.UI._instances.push(this);
}
LudumPad.UI.Bubble.prototype = {
	msg : "Connected to the server!",
	height : 30,
	margin : 30,
	cornerRadius : 15,
	idle: 1,
	type : 'default',
	backgroundColor : "white",
	textColor : "#111111",
	bulletColor : "#3399FF",
	zombie : false,
	ready : false,
	init : function () {
		this.ready = true;
		this.margin = 30;
		this.x = this.margin;
		this.yoffset = this.margin+this.height;
		TweenLite.to(this, 1, {yoffset:-this.margin, ease: Power4.easeOut, onComplete:function () {
			setTimeout(function () {
				TweenLite.to(this, 1, {yoffset:this.margin+this.height, ease: Power4.easeOut, onComplete: function () {
					this.zombie = true;
				}.bind(this)});
			}.bind(this),this.idle*1000);
		}.bind(this)});
		switch (this.type) {
			case 'default': LudumPad.Audio.Ping.play();
			break;

			case 'error': LudumPad.Audio.Error.play();
			break;
		}
	},
	render : function (canvas, ctx) {
		if (!this.ready) this.init();
		var baseY = LudumPad.UI.canvas.height+this.yoffset-this.height;
		ctx.save();
		ctx.font = "12px sans-serif";

		var bubbleWidth = this.cornerRadius*3+ctx.measureText(this.msg).width;
		var x = (canvas.width-bubbleWidth)/2;

		ctx.shadowBlur = 10;
		ctx.shadowColor = "black";
		ctx.roundRect(x, baseY, bubbleWidth, this.height, this.cornerRadius);
		ctx.fillStyle = this.backgroundColor;
		ctx.fill();
		ctx.shadowBlur = 5;
		ctx.shadowColor = this.bulletColor;
		ctx.beginPath();
      	ctx.arc(x+this.cornerRadius, baseY+this.height/2, 5, 0, 2 * Math.PI, false);
      	ctx.fillStyle = this.bulletColor;
      	ctx.fill();
      	ctx.fillStyle = this.textColor;
      	ctx.shadowBlur = 0;
		ctx.fillText(this.msg, x+this.cornerRadius*2, baseY+this.cornerRadius+4);
		ctx.restore();
	}
}

requestAnimationFrame(LudumPad._logic);