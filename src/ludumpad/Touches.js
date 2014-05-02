/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The Touches object helps keeping track of the touches on the Controller's screen.
 *
 * @class Touches
 * @constructor
 * @extends Component
 */
LUDUMPAD.Touches = function()
{
    LUDUMPAD.Component.call(this);

    this.watching = false;

    this.touches = [];

    this.uncommittedChanges = false;
    this.forceCommit = false;

    return this;
};

/**
 * Fired when a touch begins
 *
 * @event touchstart
 */
var EVT_TOUCH_START = 'touchstart';

/**
 * Fired when a touch ends
 *
 * @event touchend
 */
var EVT_TOUCH_END = 'touchend';

/**
 * Indicates if the Component should be synced.
 *
 * @method needsSync
 */
LUDUMPAD.Touches.prototype.needsSync = function(timeUpdate)
{
    return this.forceCommit || (this.uncommittedChanges && timeUpdate);
}

/**
 * Generates the sync packets for the touches
 *
 * @method needsSync
 */
LUDUMPAD.Touches.prototype.syncPacket = function()
{
	var packet = [];
	for (var i = 0; i < this.touches.length; ++i) {
		var touch = this.touches[i];
		packet.push({screenX:touch.screenX, screenY:touch.screenY});
	}
	return packet;
}

/**
 * Starts listening for touch events on the current device
 *
 * @method watch
 */
LUDUMPAD.Touches.prototype.watch = function(value)
{
	// We don't want to have multiple listeners
	if (this.watching) return;
	this.watching = true;

	document.body.addEventListener('touchstart', function (event) {
		this.touches = event.touches;
		this.uncommittedChanges = this.forceCommit = true;
		this.emit({type: EVT_TOUCH_START, touches: event.touches});
	}.bind(this), false);

    document.body.addEventListener('touchmove', function (event) {
		event.preventDefault();
		this.touches = event.touches;
		this.uncommittedChanges = true;
	}.bind(this), false);

	document.body.addEventListener('touchend', function (event) {
		this.touches = event.touches;
		this.uncommittedChanges = this.forceCommit = true;
		this.emit({type: EVT_TOUCH_END, touches: event.touches});
	}.bind(this), false);
}

// constructor
LUDUMPAD.Touches.prototype.constructor = LUDUMPAD.Touches;