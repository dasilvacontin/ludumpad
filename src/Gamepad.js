LudumPad.GamepadButton = function (text, bgcolor) {
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
LudumPad.Gamepad._instances = [];