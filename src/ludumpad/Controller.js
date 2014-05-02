/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The Controller object represents a device running a LudumPad client, either local or remote.
 *
 * @class Controller
 * @constructor
 */
LUDUMPAD.Controller = function()
{
    LUDUMPAD.EventTarget.call(this);

    this.components = {};

    this.inputSources = {};

    return this;
};

/**
 * Fired when the Controller has joined a session
 *
 * @event joined
 */
var EVT_JOINED = 'joined';

/**
 * Fired when the Controller failed to join a session
 *
 * @event join_error
 */
var EVT_JOIN_ERROR = 'join_error';

/**
 * Fired when the Controller has disconnected from a session
 *
 * @event disconnect
 */
var EVT_CONNECTION_FAILED = 'disconnect';
 
/**
 * Local Controller joins the session
 *
 * @method joinSession
 * @param host {Session} session the controller should join
 */
LUDUMPAD.Controller.prototype.joinSession = function(session)
{
    var self = this;
    this.session = session;
    session.joinAsController();
    session.on('joined', function () {
        self.emit({type:EVT_JOINED});
    });
    session.on('join_error', function () {
        self.emit({type:EVT_JOIN_ERROR});
    });
};

/**
 * Adds a component to the Controller
 *
 * @method addComponent
 * @param id {String} the Component's id
 * @param component {Component} the Component that will be added
 */
LUDUMPAD.Controller.prototype.addComponent = function(id, component)
{
    this.components[id] = component;
    component.setId(id);
    component.setOwner(this);
};

/**
 * Returns a Component with the given id
 *
 * @method component
 * @param id {String} the Component's id
 */
LUDUMPAD.Controller.prototype.component = function(id)
{
    return this.components[id];
};

/**
 * Enables input sources on the Controller
 *
 * @method enable
 * @param sources {Array} array with source constants
 */
LUDUMPAD.Controller.prototype.enable = function(sources)
{
    for (var i = 0; i < sources.length; ++i) this.inputSources[sources[i]] = 1;
    return this;
};

/**
 * Disables input sources on the Controller
 *
 * @method disable
 * @param sources {Array} array with source constants
 */
LUDUMPAD.Controller.prototype.disable = function(sources)
{
    for (var i = 0; i < sources.length; ++i) delete this.inputSources[sources[i]];
    return this;
};

/**
 * Checks if input source is enable on the Controller
 *
 * @method isEnabled
 * @param source {Number} input source constant
 */
LUDUMPAD.Controller.prototype.isEnabled = function(source)
{
    return (this.inputSources[source] !== undefined);
};

// constructor
LUDUMPAD.Controller.prototype.constructor = LUDUMPAD.Controller;
