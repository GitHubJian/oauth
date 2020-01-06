const Koa = require('koa')
const Router = require('koa-router')

const port = 8419
const app = new Koa()
const route = new Router({
  prefix: '/oauth2.0'
})

route.get('/authorize', async function(ctx, next) {
  let redirect_uri = ctx.query.redirect_uri

  ctx.redirect(decodeURIComponent(redirect_uri) + '&code=100')
})

route.get('/accessToken', async function(ctx, next) {
  ctx.body = {
    access_token: '123456'
  }
})

route.get('/userinfo', async function(ctx, next) {
  ctx.body = {
    misid: '123',
    name: 'xiaows',
    age: 29,
    sex: 1
  }
})

route.get('/logout', async function(ctx, next) {
  let redirect_uri = ctx.query.redirect_uri

  ctx.redirect(decodeURIComponent(redirect_uri))
})

app.use(route.routes())
app.use(route.allowedMethods())

app.listen(port, function() {
  console.log(`✨ Server Run on: http://localhost:${port}`)
})
