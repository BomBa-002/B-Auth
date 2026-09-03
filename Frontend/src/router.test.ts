/**
 * @file        : Frontend/src/router.test.ts
 * @description : اختبار المسارات الأساسية والتأكد من عدم حذف أي شاشة معتمدة.
 * @updated     : [{ "date": "03/09/2026", "version": "2.0.0", "by": ["v0"], "comment": "اختبارات بادئة اللغة الإلزامية وتحليل المسارات" }]
 */

import { describe, expect, it } from 'vitest'
import { parseScreenFromPath, resolveScreenPath, ROUTE_PATHS } from './router'

describe('application route tree', () => {
  it('contains all public and protected screen paths for both languages', () => {
    expect(ROUTE_PATHS).toEqual(expect.arrayContaining(['/en/signin', '/en/signup', '/en/home', '/en/error', '/ar/signin', '/ar/signup', '/ar/home', '/ar/error']))
  })

  it('redirects protected home navigation to signin without a session', () => {
    expect(resolveScreenPath('home', false, 'en')).toBe('/en/signin')
    expect(resolveScreenPath('home', true, 'en')).toBe('/en/home')
    expect(resolveScreenPath('home', false, 'ar')).toBe('/ar/signin')
    expect(resolveScreenPath('home', true, 'ar')).toBe('/ar/home')
  })

  it('bounces authenticated users away from auth screens to home', () => {
    expect(resolveScreenPath('signin', true, 'en')).toBe('/en/home')
    expect(resolveScreenPath('signup', true, 'ar')).toBe('/ar/home')
  })

  it('keeps supported screen navigation inside the route tree', () => {
    expect(resolveScreenPath('signin', false, 'en')).toBe('/en/signin')
    expect(resolveScreenPath('signup', false, 'en')).toBe('/en/signup')
    expect(resolveScreenPath('error', false, 'en')).toBe('/en/error')
    expect(resolveScreenPath('unknown', false, 'en')).toBe('/en/signin')
  })

  it('parses the screen from paths with and without a language prefix', () => {
    expect(parseScreenFromPath('/en/home')).toBe('home')
    expect(parseScreenFromPath('/ar/signin')).toBe('signin')
    expect(parseScreenFromPath('/')).toBe('home')
    expect(parseScreenFromPath('/signin')).toBe('signin')
    expect(parseScreenFromPath('/en')).toBe('home')
  })
})
