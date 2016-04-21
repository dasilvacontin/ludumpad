import expect from 'unexpected'
import listWords from '../src/lib'

describe('list-words', () => {
  it('should return a promise', () => {
    let returnedVal = listWords([])
    expect(returnedVal, 'to be a', Promise)
  })

  it('the promise should fulfill with the list of words', async () => {
    let words = await listWords(['package.json'])
    expect(words, 'to contain', 'boilerplate')
  })
})
