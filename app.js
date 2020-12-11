import { Application, Session } from "./deps.js";
import { router } from "./routes/routes.js";
import * as middleware from './middlewares/middlewares.js';
import { parse, viewEngine, engineFactory, adapterFactory } from "./deps.js";


const app = new Application();
const args = parse(Deno.args);
console.log(args)
let port = 7777;
if (args['p']) {
  port = args['p'];
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


console.log('App is listening on port : ', port)
app.listen({ port: port });

  
  
  export {app};