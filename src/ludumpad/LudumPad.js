/**
 * @author David da Silva Contín http://dasilvacont.in/ @dasilvacontin
 */

/**
 * @module LUDUMPAD
 */
var LUDUMPAD || {};

/* 
* 
* This file contains a lot of ludumpad consts which are used across the library
* @class Consts
*/

LUDUMPAD.ID_SIZE = 4;
LUDUMPAD.ID_BLOCK_SIZE = 4;

LUDUMPAD.NONE = -1;
LUDUMPAD.UP = 0;
LUDUMPAD.RIGHT = 1;
LUDUMPAD.DOWN = 2;
LUDUMPAD.LEFT = 3;

//Input Sources
LUDUMPAD.TOUCHES = 0;
LUDUMPAD.ACCELEROMETER = 1;
LUDUMPAD.GYROSCOPE = 2;
LUDUMPAD.GESTURES = 3;
LUDUMPAD.SCREEN = 4;
		

// useful for testing against if your lib is using LudumPad
LUDUMPAD.VERSION = "v0.1";