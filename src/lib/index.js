// @flow
import _ from 'lodash'
import { readFile } from 'fs'
import { promisify } from 'bluebird'
const readFileAsync = promisify(readFile)

function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function listWords (files: Array<string>) {
  let promises = files.map(filename => readFileAsync(filename))
  let buffers = await Promise.all(promises)
  let wordsPerFile = buffers.map(_.words)
  let words = _.union.apply(_, wordsPerFile)
  words = words.filter(word => word.match(/\D/)) // filter out numbers
  return words
}

// until https://phabricator.babeljs.io/T7295 gets fixed!
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = listWords

export async function fun () {
  console.log('hello')
  await sleep(1000)
  console.log('world')
  await sleep(1000)
  let words = await listWords(['package.json', '.babelrc', '.eslintrc'])
  console.log(words.join(', '))
}
