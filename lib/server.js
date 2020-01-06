const Koa = require('koa')
const login = require('./login')
const other = require('./other')

const port = 8420
const app = new Koa()

app.use(login())

app.use(other())

app.listen(port, function() {
  console.log(`✨ Server Run on: http://localhost:${port}`)
})
