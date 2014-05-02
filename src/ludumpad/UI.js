/* LudumPad.UI */

LudumPad.UI = {};
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