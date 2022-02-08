const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let resolvers = [];

function validatePublishBody(ctx, next) {
	const message = ctx.request.body.message;
	if (resolvers.length > 0 && message) {
		resolvers.forEach((resolver) => resolver(message));
		resolvers = [];
		return next();
	} else {
		ctx.status = 400;
		ctx.body = 'Not validate data!';
	}
}

router.get('/subscribe', async (ctx, next) => {
		await new Promise((resolve) => {
			resolvers.push(resolve);
		}).then((message) => {
			ctx.status = 200;
			ctx.body = message;
			return next();
		});
	},
);

router.post('/publish', validatePublishBody, async (ctx) => {
	ctx.status = 204;
	ctx.body = 'published';
});

app.use(router.routes());

module.exports = app;
