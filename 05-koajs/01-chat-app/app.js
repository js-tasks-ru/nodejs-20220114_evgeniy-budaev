const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const resolvers = [];

router.get('/subscribe', async (ctx) => {
		return new Promise((resolve) => {
			const resolver = (message) => {
				resolve();
				ctx.body = message;
			};
			resolvers.push(resolver);
		});
	},
);

router.post('/publish', async (ctx, next) => {
	const message = ctx.request.body.message;
	if (resolvers.length > 0 && message) {
		resolvers.forEach((resolver) => resolver(message));
		ctx.status = 204;
	}
	return next();
});

app.use(router.routes());

module.exports = app;
