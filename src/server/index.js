var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var morgan = require('morgan')
var ip = require('ip')

var qrcode = require('qrcode-terminal')
var robot = require('robotjs')

// app.use(function (req, res, next) { console.log(req.url) })
app.use(morgan('combined'))

app.use(express.static(__dirname + '/public'))

var mappings = [
  {
    '-1': 'left', // left
    '1': 'right' // right
  },
  {
    '-1': 'down', // down
    '1': 'up' // up
  },
  {
    '1': 'z' // button
  }
]

io.on('connection', function (socket) {
  console.log('a user connected')

  var oldData = [null, null]
  socket.on('update', function (data) {
    data = data.split(',')
    data.forEach(function (val, i) {
      if (oldData[i] === val) return
      var oldVal = oldData[i]
      var oldKey = mappings[i][oldVal]
      if (oldKey) robot.keyToggle(oldKey, 'up')
      var newKey = mappings[i][val]
      if (newKey) robot.keyToggle(newKey, 'down')
    })
    oldData = data
  })
})

var port = process.env.PORT || 3000
http.listen(port, function () {
  var address = 'http://' + ip.address() + ':' + port
  console.log('# Listening on ' + address + '\n')
  qrcode.generate(address)
  console.log('')
})
