/* globals io */

import { Howl } from 'howler'
import screenfull from 'screenfull'

var startupSound = new Howl({ urls: ['assets/sounds/startup.wav'] })

var inputStartSound = new Howl({
  urls: ['assets/sounds/inputStart.wav'],
  volume: 0.1
})

var inputEndSound = new Howl({
  urls: ['assets/sounds/inputEnd.wav'],
  volume: 0.02
})

var socket = null
var rootDOM = document.getElementsByTagName('html')[0]

function preventer (e) { e.preventDefault() }
window.addEventListener('touchstart', preventer)
window.addEventListener('touchmove', preventer)
window.addEventListener('touchend', preventer)

var player = null
var ping = '??'
var lastPing = null
var debugLabel = document.getElementById('debug-label')
function renderDebugLabel () {
  const playerNum = player == null ? '?' : (player + 1)
  debugLabel.innerHTML = `[DEBUG] Player #${playerNum}; Ping ${ping}.`
}

function startup () {
  if (screenfull.enabled) screenfull.request()
  rootDOM.style.background = '#4363D4'
  document.body.style.opacity = 1
  startupSound.play()
  socket = io()

  window.removeEventListener('touchend', startup)
  window.removeEventListener('mouseup', startup)

  window.addEventListener('touchstart', touchStart)
  window.addEventListener('touchmove', touchMove)
  window.addEventListener('touchend', touchEnd)

  // to dodge the double-triggering some browsers experience
  var onFocusTimeout = null
  window.onfocus = function () {
    clearTimeout(onFocusTimeout)
    onFocusTimeout = setTimeout(function () {
      if (socket.disconnected) socket = io()
      if (screenfull.enabled) screenfull.request()
    }, 0)
  }

  window.onblur = window.onbeforeunload = function () {
    socket.io.disconnect()
  }

  socket.on('ld:welcome', function (props) {
    player = props.number
    renderDebugLabel()
  })

  function sendPing () {
    lastPing = Date.now()
    socket.emit('ld:ping')
  }

  socket.on('ld:pong', function () {
    var pingNow = Date.now() - lastPing
    ping = typeof ping !== 'number'
      ? pingNow
      : Math.floor((ping + pingNow) / 2)
    socket.emit('ld:pung')
    renderDebugLabel()
    setTimeout(sendPing, 1000)
  })

  socket.on('connect', function () {
    sendPing()
  })
}

// iOS doesn't play sounds until the first touchend event
window.addEventListener('touchend', startup)
window.addEventListener('mouseup', startup)

var dirPad = document.getElementById('dir-pad')
var joystickBg = document.getElementById('joystick-bg')
var inputTimeout = 1000

var oldData = null
var joystickData = [0, 0] // x and y axis
var jcenter = { x: 76 + (181 / 2), y: 97 + (181 / 2) }
var joystickTouchId = null
var lastJoystickEvent = Date.now()

function tlToArray (list) {
  var array = []
  for (var i = 0; i < list.length; ++i) array.push(list[i])
  return array
}

function getJoystickTouch (e) {
  var now = Date.now()
  var delta = now - lastJoystickEvent
  if (delta > inputTimeout) joystickTouchId = null
  lastJoystickEvent = now
  var touches = tlToArray(e.changedTouches)
  if (joystickTouchId === null) {
    return touches.find(function (touch) { return touch.pageX < 334 })
  }
  return touches.find(function (touch) {
    return touch.identifier === joystickTouchId
  })
}

function handleJoystickStart (e) {
  var touch = getJoystickTouch(e)
  if (!touch) return
  joystickTouchId = touch.identifier
  dirPad.style.opacity = joystickBg.style.opacity = 1
  handleJoystickMove(e)
  inputStartSound.play()
}

function handleJoystickMove (e) {
  var touch = getJoystickTouch(e)
  if (!touch) return

  var dx = touch.pageX - jcenter.x
  var dy = touch.pageY - jcenter.y
  var theta = Math.atan2(dy, dx)
  theta *= 180 / Math.PI
  if (theta < 0) theta += 360
  var exceed = theta % 45
  var angle = exceed < 22.5
    ? theta - exceed
    : theta + 45 - exceed
  if (angle === 360) angle = 0

  switch (angle) {
    case 0:
      joystickData = [1, 0]
      break

    case 45:
      joystickData = [1, -1]
      break

    case 90:
      joystickData = [0, -1]
      break

    case 135:
      joystickData = [-1, -1]
      break

    case 180:
      joystickData = [-1, 0]
      break

    case 225:
      joystickData = [-1, 1]
      break

    case 270:
      joystickData = [0, 1]
      break

    case 315:
      joystickData = [1, 1]
      break
  }
  dirPad.style.transform = 'rotate(' + (angle + 180) + 'deg)'
}

function handleJoystickEnd (e) {
  var touch = getJoystickTouch(e)
  if (!touch) return
  joystickTouchId = null
  joystickData = [0, 0]
  dirPad.style.opacity = joystickBg.style.opacity = 0
  inputEndSound.play()
}

var A_BUTTON = 0
var B_BUTTON = 1
var buttons = [A_BUTTON, B_BUTTON]
var buttonTouchId = [null, null]
var lastButtonEvent = [Date.now(), Date.now()]
var buttonData = [0, 0]

var buttonPressedSprite = []
buttonPressedSprite[A_BUTTON] = document.getElementById('a-pressed')
buttonPressedSprite[B_BUTTON] = document.getElementById('b-pressed')

var buttonPosition = []
buttonPosition[A_BUTTON] = { x: 550, y: 120 }
buttonPosition[B_BUTTON] = { x: 450, y: 260 }

function timeoutButtons (e) {
  var now = Date.now()

  var touches = tlToArray(e.touches)
  for (var i = 0; i < touches.length; ++i) {
    var touch = touches[i]
    var index = buttonTouchId.indexOf(touch.identifier)
    if (index > -1) lastButtonEvent[index] = Date.now()
  }

  for (var buttonId = 0; buttonId < lastButtonEvent.length; ++buttonId) {
    var delta = now - lastButtonEvent[buttonId]
    if (delta > inputTimeout) buttonTouchId[buttonId] = null
  }
}

function getClosestButtonId (t) {
  var minDist = Infinity
  var closestButton = null

  for (var buttonId = 0; buttonId < buttons.length; ++buttonId) {
    var bPos = buttonPosition[buttonId]
    var dist = Math.pow(Math.abs(t.pageX - bPos.x), 2) +
      Math.pow(Math.abs(t.pageY - bPos.y), 2)
    if (dist < minDist) {
      minDist = dist
      closestButton = buttonId
    }
  }

  return closestButton
}

function handleButtonStart (e) {
  timeoutButtons(e)
  var touches = tlToArray(e.changedTouches)
  touches = touches.filter(function (touch) { return touch.pageX >= 334 })

  for (var i = 0; i < touches.length; ++i) {
    var touch = touches[i]
    var buttonId = getClosestButtonId(touch)

    // button already has touch assigned
    if (buttonTouchId[buttonId]) continue

    // assign touch to button
    buttonTouchId[buttonId] = touch.identifier
    buttonData[buttonId] = 1
    buttonPressedSprite[buttonId].style.opacity = 1
    lastButtonEvent[buttonId] = Date.now()
    inputStartSound.play()
  }
}

function handleButtonMove (e) {
  timeoutButtons(e)
}

function handleButtonEnd (e) {
  timeoutButtons(e)
  var touches = tlToArray(e.changedTouches)
  var endedTouches = {}
  touches.forEach(function (touch) { endedTouches[touch.identifier] = true })

  for (var buttonId = 0; buttonId < buttons.length; ++buttonId) {
    var touchId = buttonTouchId[buttonId]
    if (!touchId) continue
    if (endedTouches[touchId]) {
      buttonTouchId[buttonId] = null
      buttonData[buttonId] = 0
      buttonPressedSprite[buttonId].style.opacity = 0
      lastButtonEvent[buttonId] = Date.now()
      inputEndSound.play()
    }
  }
}

function touchStart (e) {
  handleJoystickStart(e)
  handleButtonStart(e)
  sendData()
}

function touchMove (e) {
  handleJoystickMove(e)
  handleButtonMove(e)
  sendData()
}

function touchEnd (e) {
  handleJoystickEnd(e)
  handleButtonEnd(e)
  sendData()
}

function sendData () {
  var currentData = joystickData.concat(buttonData).join(',')
  if (oldData === currentData) return
  oldData = currentData
  socket.emit('ld:input-update', currentData)
}
