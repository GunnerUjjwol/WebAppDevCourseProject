import { Application, Session } from "./deps.js";
import { router } from "./routes/routes.js";
import * as middleware from './middlewares/middlewares.js';
import { viewEngine, engineFactory, adapterFactory } from "./deps.js";


const app = new Application();

let port = 7777;
if (Deno.args.length > 0) {
  const lastArgument = Deno.args[Deno.args.length - 1];
  port = Number(lastArgument);
}

const session = new Session({ framework: "oak" });
await session.init();
app.use(session.use()(session));

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();
app.use(viewEngine(oakAdapter, ejsEngine, {
    viewRoot: "./views"
}));


app.use(middleware.requestLogger);
app.use(middleware.authMiddleware)
app.use(middleware.serveStaticFilesMiddleware);
app.use(middleware.errorMiddleware);


app.use(router.routes());

if (!Deno.env.get('TEST_ENVIRONMENT')) {
    app.listen({ port: 7777 });
  } else {
  	app.listen({port: port})
  }
  
  export {app};