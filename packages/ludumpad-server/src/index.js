import path from 'path'
import express from 'express'
import { Server } from 'http'
import IOServer from 'socket.io'
import ip from 'ip'
import figlet from 'figlet'
import qrcode from 'qrcode-terminal'

// hacks
import LDController from './ld-controller.js'
import Socket from 'socket.io/lib/socket.js'
LDController.injectInto(Socket)

export default class LDServer extends IOServer {
  name: string
  version: string
  address: string
  controllers : Array<?Socket>

  constructor (config = {}) {
    const app = express()
    var publicPath = path.dirname(require.resolve('ludumpad-client'))
    app.use(express.static(publicPath))

    const http = Server(app)
    super(http)

    this.name = config.name || 'LudumPad Server'
    this.version = config.version || '?.?.?'
    this.controllers = []

    this.on('connection', this.onConnection.bind(this))

    console.log(figlet.textSync(this.name))
    console.log(`v${this.version}\n`)
    const port = config.port || 3000
    this.address = `http://${ip.address()}:${port}`
    http.listen(port, () => {
      console.log(`LudumPad Server listening on ${this.address}\n`)
      qrcode.generate(this.address)
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
