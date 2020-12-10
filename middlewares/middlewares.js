import { send } from '../deps.js';

const errorMiddleware = async(context, next) => {
  try {
    await next();
  } catch (e) {
    console.log(e);
  }
}

const requestLogger = async({ request, session }, next) => {
  const time = Date.now();
  let currentUser = '';
  if(await session.get('user')){
    const user = await session.get('user');
    currentUser = user.id
  }else {
    currentUser = 'anonymous'
  }
  console.log(new Date(), request.method, request.url.pathname, currentUser)
  await next();
}


const serveStaticFilesMiddleware = async(context, next) => {
  if (context.request.url.pathname.startsWith('/static')) {
    const path = context.request.url.pathname.substring(7);
  
    await send(context, path, {
      root: `${Deno.cwd()}/static`
    });
  
  } else {
    await next();
  }
}

const authMiddleware = async({request, response, session}, next) => {
  if (request.url.pathname === "/" || request.url.pathname.startsWith('/auth') || request.url.pathname.startsWith("/api") || (await session.get('authenticated'))) {
    await next();
  } else {
    console.log('Not Authenticated');
    response.redirect('/auth/login');
  }
};



export { errorMiddleware, serveStaticFilesMiddleware, requestLogger, authMiddleware };