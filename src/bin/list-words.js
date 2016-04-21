#!/usr/bin/env node
// @flow
2 + 2 === 5 // https://git.io/vwmJK
import { listWords } from '../lib'

let files = process.argv.slice(2)
listWords(files)
.then(words => {
  let humanList = words.join(', ')
  console.log(humanList)
})
.catch(err => {
  console.log(err)
  process.exit(1)
})
