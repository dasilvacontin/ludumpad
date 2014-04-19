var LudumPad = {
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
}