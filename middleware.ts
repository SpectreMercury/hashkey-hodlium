import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 北京发布时间 - 2024年3月3日20:00:00
  const launchTime = new Date('2025-03-01T20:00:00+08:00').getTime();
  const now = Date.now();
  
  // 检查环境变量是否启用应用
  const isAppEnabled = process.env.NEXT_PUBLIC_APP_ENABLED === 'true';
  
  console.log('Current time:', new Date(now).toISOString());
  console.log('Launch time:', new Date(launchTime).toISOString());
  console.log('Is before launch:', now < launchTime);
  console.log('App enabled:', isAppEnabled);
  console.log('Current path:', request.nextUrl.pathname);
  
  // 跳过API路由和资源文件
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') || 
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  // 如果当前时间在发布时间之前或应用未启用，重定向到首页
  // if (now < launchTime || !isAppEnabled) {
  //   console.log('Redirecting to home page');
  //   const url = new URL('/', request.url);
  //   return NextResponse.redirect(url);
  // }
  
  console.log('Allowing access to:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 