/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The App object represents a LudumPad-compatible App, either local or remote.
 *
 * @class App
 * @constructor
 * @param servers {ServerDetails|Array} server or array of servers where the app should create the session
 */
LUDUMPAD.App = function(servers)
{
    LUDUMPAD.EventTarget.call(this);

    /**
     * @property connecting
     * @type Boolean
     * @default false
     */
    this.connecting = false;

    /**
     * @property connected
     * @type Boolean
     * @default false
     */
    this.connected = false;

    /**
     * @property session
     * @type Session
     */

    this.createSessionOnServer(servers);

    return this;
};

/**
 * Fired when the App creates a session in a server
 *
 * @event session_created
 */
var EVT_SESSION_CREATED = 'session_created';

/**
 * Fired when the App has failed to connect to a server
 *
 * @event connection_failed
 */
var EVT_CONNECTION_FAILED = 'connection_failed';

/**
 * Fired when the App disconnects from the server
 *
 * @event disconnected
 */
var EVT_DISCONNECT = 'disconnect';

/**
 * Fired when a Controller joins the App's Session
 *
 * @event controller_joined
 */
var EVT_CONTROLLER_JOINED = 'controller_joined';

/**
 * Fired when a Controller disconnects from the App's Session
 *
 * @event controller_disconnect
 */
var EVT_CONTROLLER_DISCONNECT = 'controller_disconnect';
 
/**
 * Creates a session on the given server or the first server available from the given array
 *
 * @method createSessionOnServer
 * @param host {ServerDetails|Array} server or array of servers where the app should create the session
 */
LUDUMPAD.App.prototype.createSessionOnServer = function(servers)
{
    if (this.connecting || this.connected) return;
    this.connecting = true;

    //Convert single server to array, clone array, or throw error
    if (typeof servers === LUDUMPAD.ServerDetails) servers = [servers];
    else if (typeof servers === Array) servers = servers.slice(0);
    else throw new Error ("Param must be a ServerDetails object or an array of ServerDetails objects.");

    this.createSessionUsingServerList(servers);

    return this;
};

/**
 * Sends to the Controller its current configuration
 *
 * @method createSessionOnServer
 * @param host {ServerDetails|Array} server or array of servers where the app should create the session
 */
LUDUMPAD.App.prototype.sendConfiguration = function(controller)
{
    var config = {};

    config.inputSources = [];
    for (var source in controller.inputSources) config.inputSources.push(source);

    var components = controller.components;
    config.components = {};
    for (var componentId in components) {
        config.components[componentId] = components[componentId].summary();
    }
};

 
// constructor
LUDUMPAD.App.prototype.constructor = LUDUMPAD.App;

LUDUMPAD.App.prototype.createSessionUsingList = function(servers)
{
    if (servers.length > 0) {

        var server = servers.shift();
        var session = new LUDUMPAD.Session(server);
        session.create();
        this.session = session;
        
        session.on('created', this.sessionCreatedCallback.bind(this));

        session.on('connection_failed', function () {
            this.createSessionUsingList(servers);
        }.bind(this));

        //TO-DO: get session create error (id collision) and retry with new id

    } else {

        this.connecting = false;
        this.connected = false;
        this.emit({type:EVT_CONNECTION_FAILED});

    }
};

LUDUMPAD.App.prototype.sessionCreatedCallback = function(psession)
{
    this.connecting = false;
    this.connected = true;

    if (psession.server.host != this.session.server.host) {

        /**
         * Server address may change when connecting to localhost;
         * server sends us its private ip.
         */
        var pserver = psession.server;
        this.session.server = new LUDUMPAD.ServerDetails(pserver.host, pserver.port);

        //TO-DO: Straight from an object
        //this.session.server = new LUDUMPAD.ServerDetails(psession.server);

    }

    this.emit({type:EVT_SESSION_STARTED});
    this.session.socket.on('controller_joined', this.controllerJoinedCallback.bind(this));
    this.session.socket.on('controller_disconnected', this.controllerDisconnectedCallback.bind(this));
};

LUDUMPAD.App.prototype.controllerJoinedCallback = function(controller)
{

    this.emit({type:EVT_CONTROLLER_JOINED});

};

LUDUMPAD.App.prototype.controllerDisconnectedCallback = function(controller)
{

    this.emit({type:EVT_CONTROLLER_DISCONNECTED});

};