async function cross(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
    );
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (ctx.method == 'OPTIONS') {
        return (ctx.body = 200);
    }

    await next();
}

module.exports = cross;
