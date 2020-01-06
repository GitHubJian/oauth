module.exports = function() {
  return async function(ctx, next) {
    ctx.body = 'hello, world'
  }
}
