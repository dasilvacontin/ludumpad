import path from 'path'
import express from 'express'
import { Server } from 'http'
import IOServer from 'socket.io'
import ip from 'ip'
import qrcode from 'qrcode-terminal'

// hacks
import LDController from './ld-controller.js'
import Socket from 'socket.io/lib/socket.js'
LDController.injectInto(Socket)

function renderTitle () {
  const b64title = 'IF8gICAgICAgICAgICAgIF8gICAgICAgICAgICAgICAgIF9fX18gICAgICAgICAgIF8gDQp8IHwgICBfICAgXyAgX198IHxfICAgXyBfIF9fIF9fXyB8ICBfIFwgX18gXyAgX198IHwNCnwgfCAgfCB8IHwgfC8gX2AgfCB8IHwgfCAnXyBgIF8gXHwgfF8pIC8gX2AgfC8gX2AgfA0KfCB8X198IHxffCB8IChffCB8IHxffCB8IHwgfCB8IHwgfCAgX18vIChffCB8IChffCB8DQp8X19fX19cX18sX3xcX18sX3xcX18sX3xffCB8X3wgfF98X3wgICBcX18sX3xcX18sX3wNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA0KIF9fICBfXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgDQp8ICBcLyAgfCBfXyBfIF8gX18gIF8gX18gICBfX18gXyBfXyANCnwgfFwvfCB8LyBfYCB8ICdfIFx8ICdfIFwgLyBfIFwgJ19ffA0KfCB8ICB8IHwgKF98IHwgfF8pIHwgfF8pIHwgIF9fLyB8ICAgDQp8X3wgIHxffFxfXyxffCAuX18vfCAuX18vIFxfX198X3wgICANCiAgICAgICAgICAgICB8X3wgICB8X3wgICAgICAgICAgICAgIA=='
  let title = Buffer.from
    ? Buffer.from(b64title, 'base64')
    : new Buffer(b64title, 'base64')
  console.log(title.toString())
}

export default class LDServer extends IOServer {
  constructor (config = {}) {
    const app = express()
    var publicPath = path.join(__dirname, '/public')
    app.use(express.static(publicPath))

    const http = Server(app)
    super(http)

    this.controllers = []

    this.on('connection', this.onConnection.bind(this))

    const port = config.port || 3000
    http.listen(port, function () {
      renderTitle()
      console.log('')
      const address = `http://${ip.address()}:${port}`
      console.log(`LudumPad Server listening on ${address}\n`)
      qrcode.generate(address)
      console.log('')
    })
  }

  onConnection (controller) {
    const freeSlot = this.getFreeSlotIndex()
    controller.init(freeSlot)
    this.controllers[freeSlot] = controller
    console.log(`!> ${controller.id} connected as controller #${freeSlot + 1}`)

    controller.on('disconnect', () => {
      this.controllers[controller.number] = null
      console.log(`!> ${controller.id} (player #${controller.number + 1}) disconnected from the server`)
    })
  }

  getFreeSlotIndex () : number {
    let freeSlot = this.controllers.indexOf(null)
    if (freeSlot === -1) freeSlot = this.controllers.length
    return freeSlot
  }
}
