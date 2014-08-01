/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The Component object contains the state, configuration and value of a Controller component.
 *
 * @class Component
 * @constructor
 */
LUDUMPAD.Component = function()
{
    LUDUMPAD.EventTarget.call(this);

    /**
     * @property value
     * @type Number
     * @default 0
     */
    this.value = 0;

    /**
     * @property syncedValue
     * @type Number
     * @default 0
     */
    this.syncedValue = 0;

    /**
     * @property id
     * @type String
     * @default undefined
     */
    this.id = undefined;

    return this;
};

/**
 * Fired when the value has been synced.
 *
 * @event value_changed
 */
var EVT_SYNC = 'sync';

/**
 * Indicates if the Component should be synced. Override this function.
 *
 * @method needsSync
 */
LUDUMPAD.Component.prototype.needsSync = function()
{
    return (this.value !== this.syncedValue);
}

/**
 * Called when synced with the remote the remote Controller
 *
 * @method syncedWithValue
 */
LUDUMPAD.Component.prototype.syncedWithValue = function(value)
{
    this.value = value;
    this.syncedValue = value;
    this.emit(this.generateBaseEvent({type:EVT_SYNC, value:value}));
    return this;
}

/**
 * Sets the value. Remember, it is only synced if needsSync returns true.
 *
 * @method setValue
 */
LUDUMPAD.Component.prototype.setValue = function(value)
{
    this.value = value;
    return this;
}

/**
 * Sets the Component's id. Meant to be called by the Controller to which the Component is added.
 *
 * @method setId
 */
LUDUMPAD.Component.prototype.setId = function(id)
{
    this.id = id;
    return this;
}

/**
 * Sets the Component's owner (Controller). Meant to be called by the Controller to which the Component is added.
 * Owner property used 
 *
 * @method setOwner
 */
LUDUMPAD.Component.prototype.setOwner = function(controller)
{
    this.owner = controller;
    return this;
}

/**
 * Generates a summary of the Component, 
 *
 * @method summary
 */
LUDUMPAD.Component.prototype.summary = function()
{
    var summary = {
        type: this.componentType,
        config: this.config
    };
    return summary;
}

// constructor
LUDUMPAD.Component.prototype.constructor = LUDUMPAD.Component;

LUDUMPAD.Component.prototype.componentType = "Component";

LUDUMPAD.Component.prototype.generateBaseEvent = function(props)
{
    var evt = {
        type: undefined,
        component: this,
        controller: this.owner
    };
    for (var prop in props) evt[prop] = props[prop];
    return evt;
}