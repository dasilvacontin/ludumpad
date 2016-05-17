import LDServer from 'ludumpad-server'
import { components } from 'ludumpad-server/lib/ld-controller.js'
import robot from 'robotjs'

var mappings = [
  { // player 1
    xaxis: { '-1': 'left', '1': 'right' },
    yaxis: { '-1': 'down', '1': 'up' },
    a: { '1': '/' },
    b: { '1': '.' }
  },
  { // player 2
    xaxis: { '-1': 'a', '1': 'd' },
    yaxis: { '-1': 's', '1': 'w' },
    a: { '1': 'space' },
    b: { '1': 'e' }
  }
]

function mappingIsValid (mapping) {
  const isComplete = components.every(component => mapping[component])
  return isComplete
}

export default function ldMapper (config) {
  const app = new LDServer(config)

  app.on('connection', function (controller) {
    controller.mapping = mappings[controller.number]
    if (!controller.mapping) {
      app.log(`controller ${controller.number} connected, but no mapping is available`)
      return
    }

    controller.on('mapping-update', function (newMapping) {
      if (mappingIsValid(newMapping)) controller.mapping = newMapping
      else controller.emit('mapping-update-failure')
    })

    controller.on('input-update', function (input, oldInput) {
      for (var component in input) {
        const newVal = input[component]
        const oldVal = oldInput[component]
        if (newVal === oldVal) continue

        const oldKey = controller.mapping[component][oldVal]
        if (oldKey) robot.keyToggle(oldKey, 'up')

        const newKey = controller.mapping[component][newVal]
        if (newKey) robot.keyToggle(newKey, 'down')
      }
    })
  })

  return app
}

if (require.main === module) {
  console.log('yo mama!')
  const app = ldMapper({
    name: 'LudumPad Mapper',
    version: require('../package.json').version
  })
  app.logWelcome()
}
