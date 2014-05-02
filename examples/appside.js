
var server = new LUDUMPAD.ServerDetails("http://dasilvacont.in", 4242);
var app = new LUDUMPAD.App(server);

app.on('session_started', function(server)
{

});

app.on('disconnected', function(server)
{

});

var configA = new LUDUMPAD.ButtonConfig();
configA.setLabel('A');
configA.setFontColor('white');
configA.setColor('red');

var configB = new LUDUMPAD.ButtonConfig();
configA.setLabel('B');
configA.setFontColor('white');
configA.setColor('green');

var configDPAD = new LUDUMPAD.DPADConfig();
configDPAD.setColor('blue');

var callbackA = function(evt)
{
	console.log(evt.component.id + " was pressed on Controller " + evt.controller.index);
};

app.on('controller_joined', function(controller)
{
	controller.addComponent('buttonA', new LUDUMPAD.Button(configA));
	controller.addComponent('buttonB', new LUDUMPAD.Button(configB));
	controller.addComponent('dpad', new LUDUMPAD.DPAD(configDPAD));

	controller.enable([
		LUDUMPAD.ACCELEROMETER,
		LUDUMPAD.GYROSCOPE,
		LUDUMPAD.TOUCHES
	]);.

	app.sendConfiguration(controller);
	controller.component('buttonA').on('press', callbackA);
});

app.controllers.forEach(function (controller) {

});

app.controllers.withIndex(i);

