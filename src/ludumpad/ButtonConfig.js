/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * The ButtonConfig object contains the configuration of a Button component.
 *
 * @class ButtonConfig
 * @constructor
 * @extends Component
 */
LUDUMPAD.ButtonConfig = function()
{
	this.label = '';

	this.fontColor = 'white';

	this.color = 'user';

    return this;
};

/**
 * Sets the text of the Button's label.
 *
 * @method setLabel
 */
LUDUMPAD.ButtonConfig.prototype.setLabel = function(text)
{
    this.label = text;
    return this;
}

/**
 * Sets the color of the Button's label font.
 *
 * @method setFontColor
 */
LUDUMPAD.ButtonConfig.prototype.setFontColor = function(color)
{
    this.fontColor = color;
    return this;
}

/**
 * Sets the color of the Button's background.
 *
 * @method setFontColor
 */
LUDUMPAD.ButtonConfig.prototype.setFontColor = function(color)
{
    this.fontColor = color;
    return this;
}

// constructor
LUDUMPAD.ButtonConfig.prototype.constructor = LUDUMPAD.ButtonConfig;