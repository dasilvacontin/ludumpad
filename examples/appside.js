
var server = new LUDUMPAD.ServerDetails("http://dasilvacont.in", 4242);
var app = new LUDUMPAD.App(server);

app.on('session_created', function(server)
{

});

app.on('disconnect', function(server)
{

});-

var callbackA = function(evt)
{
	console.log(evt.component.id + " was pressed on Controller " + evt.controller.index);
};

app.on('controller_joined', function(controller)
{
	controller.setLayout(LUDUMPAD.CLASSIC_LAYOUT);

	controller.enable([
		LUDUMPAD.ACCELEROMETER,
		LUDUMPAD.GYROSCOPE
	]);.

	app.sendConfiguration(controller);
	controller.component('buttonA').on('press', callbackA);
});

app.controllers.forEach(function (controller) {

});

app.controllers.withIndex(i);

