// Rate Limiter básico para proteção contra ataques
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs; // 15 minutos por padrão
    this.maxRequests = maxRequests; // 100 requests por janela
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const key = identifier;
    
    if (!store[key] || now > store[key].resetTime) {
      // Primeira requisição ou janela expirada
      store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return true;
    }

    if (store[key].count >= this.maxRequests) {
      // Limite excedido
      return false;
    }

    // Incrementar contador
    store[key].count++;
    return true;
  }

  getRemaining(identifier: string): number {
    const key = identifier;
    if (!store[key]) return this.maxRequests;
    
    const now = Date.now();
    if (now > store[key].resetTime) return this.maxRequests;
    
    return Math.max(0, this.maxRequests - store[key].count);
  }

  getResetTime(identifier: string): number {
    const key = identifier;
    return store[key]?.resetTime || Date.now() + this.windowMs;
  }
}

// Instâncias específicas para diferentes tipos de operação
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 tentativas de login por 15 min
export const apiRateLimiter = new RateLimiter(15 * 60 * 1000, 100); // 100 requests por 15 min
export const tokenRateLimiter = new RateLimiter(15 * 60 * 1000, 50); // 50 operações de token por 15 min

// Função helper para obter IP do cliente
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Middleware de rate limiting para APIs
export function withRateLimit(
  rateLimiter: RateLimiter,
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    const identifier = getClientIP(request);
    
    if (!rateLimiter.isAllowed(identifier)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimiter.getResetTime(identifier),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimiter.getRemaining(identifier).toString(),
            'X-RateLimit-Reset': rateLimiter.getResetTime(identifier).toString(),
          },
        }
      );
    }

    const response = await handler(request);
    
    // Adicionar headers de rate limit
    response.headers.set('X-RateLimit-Remaining', rateLimiter.getRemaining(identifier).toString());
    response.headers.set('X-RateLimit-Reset', rateLimiter.getResetTime(identifier).toString());
    
    return response;
  };
}
