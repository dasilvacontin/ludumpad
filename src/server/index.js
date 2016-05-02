var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var robot = require('robotjs')

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
  console.log('Listening on ' + port)
})
