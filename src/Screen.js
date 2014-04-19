/* LudumPad.Screen */

LudumPad.Screen = function () {}
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
LudumPad.LocalScreen = (new LudumPad.Screen ()).isLocal();