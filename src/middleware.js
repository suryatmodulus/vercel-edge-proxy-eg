import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio'; 

const baseUrl = 'https://mydukaan.io'
let storeSlug = '';
let customDomain = '';

// config with custom matcher
export const config = {
  matcher: '/:path*',
};

export default async function middleware(request) {
    const { pathname, hostname } = new URL(request.url);
    customDomain = hostname;
    storeSlug = `nomana`;
    // storeSlug = hostname.split('.')[0];
    if (request.method !== 'GET') return MethodNotAllowed(request);
    let storeUrl = ``;
    if (pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.svg')) {
      storeUrl = `${baseUrl}${pathname}`;
    } else {
      const customPathname = pathname.replace(`/${storeSlug}`, '');
      storeUrl = `${baseUrl}/${storeSlug}${customPathname}`;
    }
    const res = await fetch(storeUrl);
    const contentType = res.headers.get('Content-Type');
    
    // If the response is HTML, it can be transformed with
    // HTMLRewriter -- otherwise, it should pass through
    if (contentType.startsWith('text/html')) {
      return rewriteResposeHtml(res);
      // return new Response(await res.text(), {
      //   headers: {
      //     'content-type': 'text/raw;charset=UTF-8',
      //   },
      // });
    } else {
      return res;
    }
}

async function rewriteResposeHtml(res){
    const $ = cheerio.load(await res.text());
    return new Response(
        $.html(),
        {
          status: 200,
          headers: {
            'content-type': 'text/html',
          },
        }
    )
}

function MethodNotAllowed(request) {
    return new NextResponse(`Method ${request.method} not allowed.`, {
      status: 405,
      headers: {
        Allow: 'GET',
      },
    });
}