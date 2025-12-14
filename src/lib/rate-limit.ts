

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
    count: number;
    resetTime: number;
    firstRequest: number;
}


const rateLimitStore = new Map<string, RateLimitRecord>();


setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    message?: string;
}


export function checkRateLimit(
    request: NextRequest,
    config: RateLimitConfig
): NextResponse | null {
    const ip = getClientIp(request);
    const now = Date.now();

    const key = `${ip}:${request.nextUrl.pathname}`;
    const record = rateLimitStore.get(key);

    
    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
            firstRequest: now,
        });
        return null;
    }

    
    if (record.count >= config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);

        return NextResponse.json(
            {
                success: false,
                error: config.message || 'Too many requests. Please try again later.',
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': config.maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
                },
            }
        );
    }

    
    record.count++;

    return null;
}


function getClientIp(request: NextRequest): string {
    
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    return 'unknown';
}


export const RATE_LIMITS = {
    
    AUTH: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, 
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },

    
    API: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, 
        message: 'Too many requests. Please try again later.',
    },

    
    EMAIL: {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, 
        message: 'Too many email requests. Please try again in 1 hour.',
    },
};
