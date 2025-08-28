import { NextResponse } from 'next/server';

const COINGECKO_API_KEY = 'CG-9W1U48SPhUME6EeyinMWDtJs';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache compartilhado para preços em tempo real
let REALTIME_PRICES_CACHE: { [symbol: string]: any } = {};
let CACHE_TIMESTAMP = 0;
const CACHE_DURATION = 10 * 1000; // 10 segundos de cache

// Função para buscar preços em tempo real com cache compartilhado
async function getRealTimePricesWithCache(symbols: string[]) {
  const now = Date.now();
  
  // Verificar se o cache ainda é válido
  if (Object.keys(REALTIME_PRICES_CACHE).length > 0 && (now - CACHE_TIMESTAMP) < CACHE_DURATION) {
    console.log('📦 Usando cache compartilhado de preços:', Object.keys(REALTIME_PRICES_CACHE).length, 'tokens');
    
    // Retornar apenas os símbolos solicitados que estão no cache
    const cachedResults = symbols.map(symbol => {
      const cached = REALTIME_PRICES_CACHE[symbol];
      if (cached) {
        return {
          symbol,
          success: true,
          realTimePrice: cached.price,
          priceChange24h: cached.priceChange24h,
          lastUpdated: cached.lastUpdated
        };
      } else {
        return {
          symbol,
          success: false,
          error: 'Token não encontrado no cache'
        };
      }
    });
    
    return cachedResults;
  }

  // Cache expirado ou vazio, buscar novos dados
  console.log('🔄 Cache expirado, buscando novos preços da CoinGecko...');
  
  try {
    // Buscar todos os tokens da CoinGecko (usando a mesma lógica do buscador)
    const allTokens = await getAllTokensFromCoinGecko();
    
    // Processar os símbolos solicitados
    const results = symbols.map(symbol => {
      const token = allTokens.find(t => t.symbol === symbol.toUpperCase());
      
      if (token) {
        const result = {
          symbol,
          success: true,
          realTimePrice: token.currentPrice,
          priceChange24h: token.priceChange24h,
          lastUpdated: new Date().toISOString()
        };
        
        // Adicionar ao cache
        REALTIME_PRICES_CACHE[symbol] = {
          price: token.currentPrice,
          priceChange24h: token.priceChange24h,
          lastUpdated: new Date().toISOString()
        };
        
        return result;
      } else {
        return {
          symbol,
          success: false,
          error: 'Token não encontrado'
        };
      }
    });
    
    // Atualizar timestamp do cache
    CACHE_TIMESTAMP = now;
    
    console.log('✅ Cache compartilhado atualizado:', Object.keys(REALTIME_PRICES_CACHE).length, 'tokens');
    
    return results;
  } catch (error) {
    console.error('❌ Erro ao buscar preços em tempo real:', error);
    
    // Se o cache tem dados antigos, usar eles mesmo assim
    if (Object.keys(REALTIME_PRICES_CACHE).length > 0) {
      console.log('🔄 Usando cache antigo devido ao erro');
      return symbols.map(symbol => {
        const cached = REALTIME_PRICES_CACHE[symbol];
        if (cached) {
          return {
            symbol,
            success: true,
            realTimePrice: cached.price,
            priceChange24h: cached.priceChange24h,
            lastUpdated: cached.lastUpdated
          };
        } else {
          return {
            symbol,
            success: false,
            error: 'Token não encontrado'
          };
        }
      });
    }
    
    return symbols.map(symbol => ({
      symbol,
      success: false,
      error: 'Erro na API'
    }));
  }
}

// Função para buscar todos os tokens da CoinGecko (copiada do buscador)
async function getAllTokensFromCoinGecko() {
  try {
    console.log('🔄 Buscando todos os tokens da CoinGecko...');
    
    let allTokens: any[] = [];
    
    // Buscar até 60 páginas (15.000 tokens)
    for (let page = 1; page <= 60; page++) {
      const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=24h`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SenhorBarriga-Portfolio/1.0',
          'X-CG-API-KEY': COINGECKO_API_KEY
        },
        cache: 'no-store',
        next: { revalidate: 300 }
      });

      if (response.ok) {
        const data = await response.json();
        allTokens = allTokens.concat(data);
        console.log(`📄 Página ${page}: ${data.length} tokens encontrados`);
        
        if (data.length === 0) break;
        
        // Delay para evitar rate limiting
        if (page < 60) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        console.log(`⚠️ Erro na página ${page}:`, response.status);
        if (response.status === 429) {
          console.log('🚫 Rate limit atingido');
        }
        break;
      }
    }
    
    return allTokens.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      currentPrice: coin.current_price,
      priceChange24h: coin.price_change_percentage_24h
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar tokens:', error);
    return [];
  }
}

// Handler da API
export async function POST(request: Request) {
  try {
    const { symbols } = await request.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Lista de símbolos é obrigatória' 
      }, { status: 400 });
    }
    
    console.log('📊 Buscando preços em tempo real para:', symbols);
    
    const results = await getRealTimePricesWithCache(symbols);
    
    return NextResponse.json({
      success: true,
      results,
      cacheInfo: {
        cachedTokens: Object.keys(REALTIME_PRICES_CACHE).length,
        cacheAge: Date.now() - CACHE_TIMESTAMP,
        cacheDuration: CACHE_DURATION
      }
    });
  } catch (error) {
    console.error('❌ Erro na API de cache compartilhado:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Endpoint GET para verificar status do cache
export async function GET() {
  return NextResponse.json({
    success: true,
    cacheInfo: {
      cachedTokens: Object.keys(REALTIME_PRICES_CACHE).length,
      cacheAge: Date.now() - CACHE_TIMESTAMP,
      cacheDuration: CACHE_DURATION,
      isExpired: (Date.now() - CACHE_TIMESTAMP) >= CACHE_DURATION
    }
  });
}
