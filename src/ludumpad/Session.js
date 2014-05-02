/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The Session object contains the connection details for an App and handles the connection to the session on the server.
 *
 * @class Session
 * @constructor
 * @param id {String} session identifier
 * @param server {ServerDetails} details of the server in which the session is open
 */
LUDUMPAD.Session = function(server)
{
    /**
     * @property id
     * @type String
     * @default Random generated id
     */
    this.id = this.generateRandomId();
 
    /**
     * @property server
     * @type ServerDetails
     */
    this.server = server;

    return this;
};

/**
 * Fired when the session is created in a server
 *
 * @event created
 */
var EVT_CREATED = 'created';

/**
 * Fired when the App has failed to connect to a server
 *
 * @event connection_failed
 */
var EVT_CONNECTION_FAILED = 'connection_failed';

/**
 * Fired when the session is joined as a Controller
 *
 * @event joined
 */
var EVT_JOINED = 'joined';

/**
 * Generates a random id with ID_SIZE blocks of ID_BLOCK_SIZE alfanumerical characters
 *
 * @method generateRandomId
 * @return {Session} self reference for chaining
 */
LUDUMPAD.Session.prototype.generateRandomId = function()
{
    this.id = "";
    var dict = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

    for (var i = 0; i < LUDUMPAD.ID_SIZE; ++i) {
        if (i!=0) this.id += '-';
        for (var j = 0; j < LUDUMPAD.ID_BLOCK_SIZE; ++j) {
            this.id += dict[Math.floor(Math.random()*dict.length)];
        }
    }

    return this;
};

/**
 * Creates the session
 *
 * @method create
 * @return {Session} self-reference for chaining
 */
LUDUMPAD.Session.prototype.create = function()
{
    //TO-DO
    var socket = io.connect(this.server.fullAddress());

    return this;
};
 
/**
 * Joins a session as a Controller
 *
 * @method joinAsController
 * @return {Session} self-reference for chaining
 */
LUDUMPAD.Session.prototype.joinAsController = function()
{
    this.socket = io.connect(this.server.fullAddress());

    this.socket.on('connect', function () {
        //TO-DO: Upgrade when server gets refactored
        this.socket.emit('connectToChannel', {channel:this.id, g:{alias:undefined, screen:undefined}});
    });

    this.socket.on('connectToChannelCallback', function (statusCode) {
        this.connected = true;
        this.connecting = false;
        this.socket = socket;
        // We asume OK because YOLO
        console.log('connectToChannelCallback. StatusCode: '+statusCode);
        console.log('Connected to Session with id '+this.id);
        this.emit({type:EVT_JOINED});
    }.bind(this));

    return this;
};

/**
 * Creates a clone of the session details
 *
 * @method clone
 * @return {ServerDetails} a copy of the session details
 */
LUDUMPAD.Session.prototype.clone = function()
{
    return new LUDUMPAD.Session(this.id, this.server);
};
 
// constructor
LUDUMPAD.Session.prototype.constructor = LUDUMPAD.Session;
 
LUDUMPAD.Session.prototype.set = function(id, server)
{
    this.id = id;
    this.server = server;
    return this;
};