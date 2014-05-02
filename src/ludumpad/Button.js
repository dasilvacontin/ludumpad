/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The Button object contains the state, configuration and value of a Controller button.
 *
 * @class Button
 * @constructor
 * @extends Component
 */
LUDUMPAD.Button = function()
{
    LUDUMPAD.Component.call(this);

    return this;
};

/**
 * Fired when the button's state has changed to 'up'
 *
 * @event release
 */
var EVT_BUTTON_RELEASE = 'release';

/**
 * Fired when the button's state has changed to 'down'
 *
 * @event press
 */
var EVT_BUTTON_PRESS = 'press';

/**
 * Called when synced with the remote the remote Controller.
 *
 * @method syncedWithValue
 */
LUDUMPAD.Button.prototype.syncedWithValue = function(value)
{
    this.value = value;
    this.syncedValue = value;
    this.emit({type:EVT_SYNC, value:value});
    if (value === 1) this.emit({type:EVT_BUTTON_PRESS, value:value});
    else if (value === 0) this.emit({type:EVT_BUTTON_RELEASE, value:value});
    return this;
}

// constructor
LUDUMPAD.Button.prototype.constructor = LUDUMPAD.Button;