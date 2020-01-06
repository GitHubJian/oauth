const fetch = require('node-fetch')

const SSO_HOST = 'http://127.0.0.1:8419'
const CLIENT_ID = 'app1'

const COOKIE_TOKEN_KEY = 'ssoid'
const COOKIE_MISID = 'misid'

module.exports = function() {
  return async function(ctx, next) {
    let checkUrl = ctx.path

    if (checkUrl === '/auth/login') {
      return await login.call(ctx)
    }

    if (checkUrl === '/auth/callback') {
      return await callback.call(ctx)
    }

    if (checkUrl === '/auth/logout') {
      return await logout.call(ctx)
    }

    const token = await getToken.call(ctx)
    let userData

    if (token) {
      userData = await getUserInfo.call(ctx, token)
    }

    if (!token) {
      return setLoginMessage.call(ctx, 'login', '已退出登录，请重新登录')
    }

    if (!userData) {
      setAuthInfo.call(ctx)

      return setLoginMessage.call(ctx, 'logout', '登录过期，请重新登录')
    }

    await next()
  }
}

async function login() {
  let callbackUri = this.query.callback || encodeURIComponent('/')
  let redirect_uri = encodeURIComponent(
    `${this.origin}/auth/callback?callback=${callbackUri}`
  )

  this.redirect(
    `${SSO_HOST}/oauth2.0/authorize?redirect_uri=${redirect_uri}&client_id=${CLIENT_ID}`
  )
}

async function callback() {
  let code = this.query.code
  let tokenUrl = `${SSO_HOST}/oauth2.0/accessToken?grant_type=code&client_id=${CLIENT_ID}&code=${code}`

  let callbackUri = decodeURIComponent(this.query.callback || '/')

  try {
    let res = await fetch(tokenUrl)
    let authData = await res.json()
    setAuthInfo.call(this, authData)
    let userInfo = await getUserInfo.call(this, authData.access_token)
    if (!userInfo) {
      throw new Error('登录失败')
    }
    setUserInfo.call(this, userInfo)

    this.redirect(callbackUri)
    debugger
  } catch (error) {}
}

async function logout() {
  let callbackUri = this.query.callback || encodeURIComponent('/')
  let redirect_uri = encodeURIComponent(
    `${this.origin}/auth/callback?callback=${callbackUri}`
  )
  setAuthInfo.call(this, {
    access_token: '',
    expires: 0,
    refresh_expires: 0,
    refresh_token: ''
  })
  this.redirect(
    `${ssoHost}/oauth2.0/logout?redirect_uri=${redirect_uri}&client_id=${CLIENT_ID}`
  )
}

function setAuthInfo({ access_token = '', expires = 0 }) {
  this.cookies.set(COOKIE_TOKEN_KEY, access_token, {
    maxAge: expires ? null : 0
  })
}

async function getUserInfo(token) {
  let res = await fetch(`${SSO_HOST}/oauth2.0/userinfo?access_token=${token}`)
  let userData = await res.json()

  return userData
}

async function getToken() {
  return this.cookies.get(COOKIE_TOKEN_KEY)
}

function setLoginMessage(type, msg) {
  return this.redirect(
    `${this.origin}/auth/${type}?callback=${encodeURIComponent(this.url)}`
  )
}

function setUserInfo(userInfo) {
  this.cookies.set(COOKIE_MISID, userInfo.misid, { httpOnly: false })
}
