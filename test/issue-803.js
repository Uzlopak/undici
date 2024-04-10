'use strict'

const { tspl } = require('@matteo.collina/tspl')
const { test, after } = require('node:test')
const { once } = require('node:events')
const { Client } = require('..')
const { createServer } = require('node:http')
const { platform } = require('node:os')

const timeout = platform() === 'darwin' ? 120000 : 60000

test('https://github.com/nodejs/undici/issues/803', { timeout }, async (t) => {
  t = tspl(t, { plan: 2 })

  const SIZE = 5900373096
  const chunkSize = 65536
  const parts = (SIZE / chunkSize) | 0
  const lastPartSize = SIZE % chunkSize
  const chunk = Buffer.allocUnsafe(chunkSize)

  const server = createServer(async (req, res) => {
    res.setHeader('content-length', SIZE)
    let i = 0
    while (i++ < parts) {
      if (res.write(chunk) === false) {
        await once(res, 'drain')
      }
    }
    if (res.write(chunk.subarray(0, lastPartSize)) === false) {
      await once(res, 'drain')
    }

    res.end()
  })
  after(() => server.close())

  server.listen(0)

  await once(server, 'listening')
  const client = new Client(`http://localhost:${server.address().port}`)
  after(() => client.close())

  client.request({
    path: '/',
    method: 'GET'
  }, (err, data) => {
    t.ifError(err)

    let pos = 0
    data.body.on('data', (buf) => {
      pos += buf.length
    })
    data.body.on('end', () => {
      t.strictEqual(pos, SIZE)
    })
  })
  await t.completed
})
