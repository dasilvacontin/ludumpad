/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The ServerDetails object contains the conection details of a LudumPad server.
 *
 * @class ServerDetails
 * @constructor
 * @param host {String} address of the server
 * @param port {Number} port on which the server is running
 */
LUDUMPAD.ServerDetails = function(host, port)
{
    /**
     * @property host
     * @type String
     * @default "http://localhost"
     */
    this.host = host || "http://localhost";
 
    /**
     * @property port
     * @type Number
     * @default 4242
     */
    this.port = port || 4242;

    return this;
};

/**
 * Gets full address of the server
 *
 * @method fullAddress
 * @return {String} the full address of the server
 */
LUDUMPAD.ServerDetails.prototype.fullAddress = function()
{
    return this.host+':'+this.port;
};
 
/**
 * Creates a clone of the server details
 *
 * @method clone
 * @return {ServerDetails} a copy of the server details
 */
LUDUMPAD.ServerDetails.prototype.clone = function()
{
    return new LUDUMPAD.ServerDetails(this.host, this.port);
};
 
// constructor
LUDUMPAD.ServerDetails.prototype.constructor = LUDUMPAD.ServerDetails;
 
LUDUMPAD.ServerDetails.prototype.set = function(host, port)
{
    this.host = host || "http://localhost";
    this.port = port || 4242;
    return this;
};