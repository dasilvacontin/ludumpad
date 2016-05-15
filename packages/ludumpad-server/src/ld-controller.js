import { EventEmitter } from 'events'
const emit = EventEmitter.prototype.emit

type Input = {
  xaxis: number,
  yaxis: number,
  a: number,
  b: number
}

const components = [
  'xaxis',
  'yaxis',
  'a',
  'b'
]

export default class LDController {
  number: number
  oldInput: Input

  init (number) {
    this.number = number
    this.oldInput = this.input = {}
    components.forEach(component => { this.input[component] = 0 })
    this.emit('ld:welcome', { number })

    this.on('ld:ping', () => {
      this.lastPingTimestamp = Date.now()
      this.emit('ld:pong')
    })
    this.on('ld:pung', () => {
      this.ping = Date.now() - this.lastPingTimestamp
    })

    this.on('ld:input-update', this.onInputUpdate.bind(this))
    this.on('ld:debug', msg => {
      console.log(`> debug message from ${this.id} (player #${this.number + 1}): ${msg}`)
    })
  }

  onInputUpdate (data) {
    this.oldInput = this.input
    this.input = {}

    data.split(',').forEach((val, i) => {
      const component = components[i]
      this.input[component] = Number(val)
    })

    emit.call(this, 'input-update', this.input, this.oldInput)
  }
}

LDController.injectInto = function injectInto (constructor) {
  const sourceProto = LDController.prototype
  const targetProto = constructor.prototype
  const methods = Object.getOwnPropertyNames(sourceProto)
  methods.forEach(function (name) {
    if (name === 'constructor') return
    targetProto[name] = sourceProto[name]
  })
}

LDController.components = components
