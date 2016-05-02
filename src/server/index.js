var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var morgan = require('morgan')
var path = require('path')
var ip = require('ip')

var qrcode = require('qrcode-terminal')
var robot = require('robotjs')

// app.use(function (req, res, next) { console.log(req.url) })
app.use(morgan('combined'))

var publicPath = path.join(__dirname, '/public')
app.use(express.static(publicPath))

var mappings = [
  [ // player 1
    {
      '-1': 'left', // left
      '1': 'right' // right
    },
    {
      '-1': 'down', // down
      '1': 'up' // up
    },
    {
      '1': 'x' // A button
    },
    {
      '1': '.' // B button
    }
  ],
  [ // player 2
    {
      '-1': 'a', // left
      '1': 'd' // right
    },
    {
      '-1': 's', // down
      '1': 'w' // up
    },
    {
      '1': 'space' // A button
    },
    {
      '1': 'e' // B button
    }
  ]
]

var players = []

io.on('connection', function (socket) {
  var freeSlot = players.indexOf(null)
  if (freeSlot === -1) freeSlot = players.length
  players[freeSlot] = socket.id
  var player = freeSlot
  var mapping = mappings[player]
  console.log(socket.id + ' connected as player #' + (player + 1))

  socket.emit('welcome', {
    player: (player + 1)
  })

  socket.on('ldping', function () {
    socket.emit('ldpong')
  })

  var oldData = [null, null]
  socket.on('update', function (data) {
    data = data.split(',')
    data.forEach(function (val, i) {
      if (oldData[i] === val) return
      var oldVal = oldData[i]
      var oldKey = mapping[i][oldVal]
      if (oldKey) robot.keyToggle(oldKey, 'up')
      var newKey = mapping[i][val]
      if (newKey) robot.keyToggle(newKey, 'down')
    })
    oldData = data
  })

  socket.on('disconnect', function () {
    console.log(socket.id + '(player #' + (player + 1) + ') disconnected')
    players[player] = null
  })
})

var port = process.env.PORT || 3000
http.listen(port, function () {
  var address = 'http://' + ip.address() + ':' + port
  console.log('# Listening on ' + address + '\n')
  qrcode.generate(address)
  console.log('')
})
