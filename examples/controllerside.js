
/*
var server = new LUDUMPAD.ServerDetails("http://dasilvacont.in", 4242);
var session = new LUDUMPAD.Session("uygasy5b32i3").inServer(server);
var controller = new LUDUMPAD.Controller().joinSession(session);
*/

var json = LUDUMPAD.Utils.GETParamsToJSON();
var session = LUDUMPAD.Session.fromJSON(json);
var controller = new LUDUMPAD.Controller().joinSession(session);

controller.on('joined', function () {

});

controller.on('disconnect', function () {

});

controller.on('configuration', function(configuration) {

	controller.dpad.setValue(LUDUMPAD.NONE);
	controller.sendUpdate();

});

