# ludumpad-client [![Stories in Ready](https://badge.waffle.io/dasilvacontin/ludumpad-client.png?label=ready)](https://waffle.io/dasilvacontin/ludumpad-client)
LudumPad is an open-source javascript library for using smartphones as gamepads for your games.

With Lumpad, connecting a smartphone to a game is as easy as reading a QR-Code. It also provides a configurable gamepad client, and basic UI such as connection status bubbles and a pause screen. LudumPad is built on top of [socket.io](https://github.com/learnboost/socket.io), so porting LudumPad is effortless.

The default server is `"vgafib.com"` for now. It is recommended that you host your own ludumpad-server for an improved latency. I have plans to provide a solution to solve the latency problem later on.

There is an input demo of LudumPad [here](http://bluecodestudio.com/ludumpad/game.html).

Sample implementation:

```javascript
LudumPad.UI.configure({canvas:canvas, ctx:ctx});

var channel = new LudumPad.Channel ();
channel.open();

channel.on('GamepadConnection', function (gamepad) {
	gamepad.color = '#'+Math.floor(Math.random()*16777215).toString(16);
  channel.emitConfigurationToGamepads([gamepad], {
    bgcolor: gamepad.color,
    index: gamepad.index,
  	conf: [LudumPad.GamepadInputTypeDPAD, LudumPad.GamepadInputTypeTouches]});
});

channel.on('PacketFromGamepad', function (packet, gamepad) {
	console.log(packet);
});

function main () {
  requestAnimationFrame(main);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (var i = 0; i < channel.gamepadList.length; ++i) { // Acessing channel's gamepad list
  	var gamepad = channel.gamepadList[i];
  	if (gamepad != undefined) renderTouches(gamepad);
  }
  LudumPad.UI.render(); // UI render
}
requestAnimationFrame(main);
```

## LudumPad.DefaultConnectionConfig

Both `LudumPad.Channel` and `LudumPad.GamepadClient` subclass `LudumPad.DefaultConnectionConfig`, inheriting its properties and methods.

### Properties

* `channelID` : String
*	`connected` : Boolean
*	`connecting` : Boolean
*	`host` : String
*	`port` : Number
* `idSize` : Number

### Public methods

#### DefaultConnectionConfig.generateRandomChannelID()

Generates a random `channelID` of (`idSize`*4) hex chars, like the following: `"9ce0-22ab-a0a8-d16f"`.

## LudumPad.Channel

Inherits from `DefaultConnectionConfig`.

### Constructor

Create a new Channel for your game. A Channel represents a game session to where `GamepadClient`s can connect.
```javascript
var channel = new LudumPad.Channel (options);
```
`options` is an object that may have the following properties: `channelID`, `host` and `port`.

### Properties

* `paused` : Boolean. `true` if any of the gamepads is currently in pause mode. `false` otherwise.
* `gamepadList` : Array<`Gamepad`>. It might contain `undefined` values. When a `Gamepad` disconnects, its index in the array is set to `undefined`.
* `gamepadHash` : Object. Keys are gamepad ids, and values are `Gamepad` instances.

### Public methods

#### Channel.open()

Connects the Channel to the set `host`:`port`.

#### Channel.emitPacketToGamepads(gamepads, packet)

You won't be using this method unless you are using a custom gamepad-client.

* `gamepads` is an array of `Gamepad` instances.
* `packet` is the data you want to send.

#### Channel.emitConfigurationToGamepads(gamepads, packet)

* `gamepads` is an array of `Gamepad` instances.
* `packet` is an object with different properties that can be set in order to configure the gamepads. Setting `packet.bgcolor` changes the color of the gamepads' background to the value set. Setting `packet.index` will change the gamepads' player indicator HUD. `packet.conf` can be set to an array with different values that represent the type of data you want to obtain from the gamepads: `LudumPad.GamepadInputTypeTouches`, `LudumPad.GamepadInputTypeDPAD`, `LudumPad.GamepadMotionGyroscope`, and more to come.

Example:
```javascript
gamepad.color = '#'+Math.floor(Math.random()*16777215).toString(16);

var packet = {};
packet.bgcolor = gamepad.color;
packet.index = gamepad.index;
packet.conf = [LudumPad.GamepadInputTypeDPAD, LudumPad.GamepadInputTypeTouches];

channel.emitConfigurationToGamepads([gamepad], packet);
```
Notes:
* LudumPad already generates the proper value for `gamepad.index` when the gamepads connect. It's up to you to use it or not.
* You usually want to send a configuration packet to a single gamepad, so your gamepads array will usually have a single `Gamepad` object.

### Callbacks

For all of these callbacks, `gamepad` is an object of type `Gamepad`.

#### Channel.on('Open', function () {})

#### Channel.on('ConnectionError', function (statusCode) {})

A connection error means that the server refused to perform your request. e.g., you requested to open a channel whose `channelID` is already being used by another open channel.

For channels, `statusCode` can only be `LudumPad.StatusCode.ChannelAlreadyExists`.

LudumPad already sets a default function for this callback, which you can overwrite if you want:

```javascript
function (statusCode) {
	if (statusCode == LudumPad.StatusCode.ChannelAlreadyExists) {
		this.generateRandomChannelID();
		this.open();
	}
}
```

#### Channel.on('GamepadConnection', function (gamepad) {})

#### Channel.on('GamepadDisconnection', function (gamepad) {})

#### Channel.on('PacketFromGamepad', function (packet, gamepad) {})

#### Channel.on('ConnectionFailed', function () {})

This callback is fired when the server can't be reached at the given host:port.

## LudumPad.Screen

An instance of this class is created and synced for each `Gamepad`. `LudumPad.LocalScreen` is a `Screen` instance with the `
isLocal` already executed.

### Constructor

```javascript
var screen = new LudumPad.Screen ();
```

### Properties

* `width` : Number
* `height` : Number

### Public methods

#### Screen.isLocal()

Starts listenning to `window`'s resize event, syncing `width` and `height`.

#### Screen.setSize({width:w, height:h})

Sets new values for `width` and `height`, and fires the resize callback.

### Callbacks

#### Screen.on("resize", function () {})

## LudumPad.Gamepad

### Constructor

```javascript
var gamepad = new LudumPad.Gamepad ();
```

Creates a new `Gamepad`. It represents data from a `GamepadClient`.

Note: `Gamepad` instances are created and added to a `Channel`'s `gamepadList` when any `GamepadClient` connects to the channel. There aren't many case scenarios where you want to create an instance of `Gamepad` yourself, but it's useful to know the data/properties they provide you.

### Properties

* `alias`:String.
*	`bgcolor`:String
*	`conf`:Object. It has the value `true` set for every type of input the `GamepadClient` should send, e.g. `LudumPad.GamepadInputTypeTouches`.
* `dpad`:Number. e.g. `LudumPad.Gamepad.dir.UP`.
*	`gyroscope`:Object. The object has the following properties: `LR` (left-right), `FB` (front-back) and `dir` (compass direction).
*	`id`:String. The same as the `GamepadClient.socket.id`.
*	`index`:Number. Index the `Gamepad` occupies at the `Channel`'s `gamepadList` array.
*	`paused`:Boolean. Indicates that the `GamepadClient` is currently paused.
*	`ping`:Number
*	`screen`:`LudumPad.Screen`
*	`touches`:Array. An array of objects (`{screenX:x, screenY:y}`) which represent touches on the `GamepadClient`'s screen.

## LudumPad.GamepadClient

Inherits from `DefaultConnectionConfig` and `Gamepad`.

You will only be using the `GamepadClient` class when creating a custom gamepad-client.

### Constructor

```javascript
var gamepad = new LudumPad.GamepadClient (options);
```

`options` is an object that may have the following properties: `channelID`, `host` and `port`.

### Public methods

#### GamepadClient.connect()

#### GamepadClient.emitPacket(packet)

### Callbacks

#### GamepadClient.on('Connect', function () {})

#### GamepadClient.on('ConnectionError', function (statusCode) {})

#### GamepadClient.on('ChannelPacket', function (packet) {})

#### GamepadClient.on('ChannelDied', function () {})

#### GamepadClient.on('ConnectionFailed', function () {})

## Using LudumPad.UI

You can use the provided UI by configuring LudumPad with a canvas and a 2D drawing context.
```javascript
LudumPad.UI.configure({canvas:canvas, ctx:ctx});
```
Remember to call the `render` function in your render loop:
```javascript
LudumPad.UI.render();
```

You can create a new status bubble using:

```javascript
new LudumPad.UI.Bubble({msg:"Your message"});
new LudumPad.UI.Bubble({msg:"Your error", type:'error'});
```

## Constants

```javascript
LudumPad.StatusCode = {
	OK : 0,
	ChannelNotFound : 10,
	ChannelAlreadyExists : 11
};

//Channel Message Type
LudumPad.MessageTypePacket = -1;
LudumPad.MessageTypeGamepadConfiguration = 0;
LudumPad.MessageTypePingResponse = 1;

//Gamepad Input types
LudumPad.GamepadInputTypeTouches = 0;
LudumPad.GamepadInputTypeDPAD = 1;
/* Yet to be implemented
//LudumPad.GamepadInputTypeJoystick = 2;
//LudumPad.GamepadInputTypeButtons = 3; */
LudumPad.GamepadMotionGyroscope = 10;

LudumPad.Gamepad.dir = {
	UP : 0,
	RIGHT : 1,
	DOWN : 2,
	LEFT : 3,
	NONE : -1
}
```

