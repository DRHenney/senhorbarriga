import { NextResponse } from 'next/server';

const COINGECKO_API_KEY = 'CG-9W1U48SPhUME6EeyinMWDtJs';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache compartilhado para preços em tempo real
let REALTIME_PRICES_CACHE: { [symbol: string]: any } = {};
let CACHE_TIMESTAMP = 0;
const CACHE_DURATION = 10 * 1000; // 10 segundos de cache

// Função para buscar preços em tempo real com cache compartilhado
async function getRealTimePricesWithCache(tokens: Array<{ symbol: string; coinGeckoId?: string }>) {
  const now = Date.now();
  
  // Verificar se o cache ainda é válido
  if (Object.keys(REALTIME_PRICES_CACHE).length > 0 && (now - CACHE_TIMESTAMP) < CACHE_DURATION) {
    console.log('📦 Usando cache compartilhado de preços:', Object.keys(REALTIME_PRICES_CACHE).length, 'tokens');
    
    // Verificar quais tokens estão no cache e quais precisam ser buscados
    const cachedTokens = tokens.filter(token => REALTIME_PRICES_CACHE[token.symbol]);
    const missingTokens = tokens.filter(token => !REALTIME_PRICES_CACHE[token.symbol]);
    
    console.log('📦 Tokens no cache:', cachedTokens.map(t => t.symbol));
    console.log('❓ Tokens faltando:', missingTokens.map(t => t.symbol));
    
    // Se todos os tokens estão no cache, retornar do cache
    if (missingTokens.length === 0) {
      const cachedResults = tokens.map(token => {
        const cached = REALTIME_PRICES_CACHE[token.symbol];
        return {
          symbol: token.symbol,
          success: true,
          realTimePrice: cached.price,
          priceChange24h: cached.priceChange24h,
          lastUpdated: cached.lastUpdated
        };
      });
      
      return cachedResults;
    }
    
    // Se alguns tokens estão faltando, buscar apenas eles e manter o cache
    console.log('🔄 Buscando tokens faltando:', missingTokens.map(t => t.symbol));
    const missingResults = await fetchMissingTokens(missingTokens);
    
    // Combinar resultados do cache com os novos
    const allResults = tokens.map(token => {
      if (REALTIME_PRICES_CACHE[token.symbol]) {
        // Usar cache existente
        const cached = REALTIME_PRICES_CACHE[token.symbol];
        return {
          symbol: token.symbol,
          success: true,
          realTimePrice: cached.price,
          priceChange24h: cached.priceChange24h,
          lastUpdated: cached.lastUpdated
        };
      } else {
        // Usar resultado da busca
        const result = missingResults.find(r => r.symbol === token.symbol);
        return result || {
          symbol: token.symbol,
          success: false,
          error: 'Token não encontrado'
        };
      }
    });
    
    return allResults;
  }

  // Cache expirado ou vazio, buscar novos dados
  console.log('🔄 Cache expirado, buscando novos preços da CoinGecko...');
  
  try {
    // Buscar todos os tokens da CoinGecko (usando a mesma lógica do buscador)
    const allTokens = await getAllTokensFromCoinGecko();
    
    // Processar os tokens solicitados
    const results = tokens.map(token => {
      let foundToken;
      
      // Se temos coinGeckoId, buscar por ID específico
      if (token.coinGeckoId) {
        foundToken = allTokens.find(t => t.id === token.coinGeckoId);
        console.log(`🔍 Buscando por ID: ${token.coinGeckoId} (${token.symbol})`);
      }
      
      // Se não encontrou por ID, buscar por símbolo
      if (!foundToken) {
        foundToken = allTokens.find(t => t.symbol === token.symbol.toUpperCase());
        console.log(`🔍 Buscando por símbolo: ${token.symbol}`);
      }
      
      if (foundToken) {
        const result = {
          symbol: token.symbol,
          success: true,
          realTimePrice: foundToken.currentPrice,
          priceChange24h: foundToken.priceChange24h,
          lastUpdated: new Date().toISOString()
        };
        
        // Adicionar ao cache
        REALTIME_PRICES_CACHE[token.symbol] = {
          price: foundToken.currentPrice,
          priceChange24h: foundToken.priceChange24h,
          lastUpdated: new Date().toISOString()
        };
        
        console.log(`✅ ${token.symbol}: $${foundToken.currentPrice} (ID: ${foundToken.id})`);
        return result;
      } else {
        console.log(`❌ ${token.symbol}: não encontrado`);
        return {
          symbol: token.symbol,
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
      return tokens.map(token => {
        const cached = REALTIME_PRICES_CACHE[token.symbol];
        if (cached) {
          return {
            symbol: token.symbol,
            success: true,
            realTimePrice: cached.price,
            priceChange24h: cached.priceChange24h,
            lastUpdated: cached.lastUpdated
          };
        } else {
          return {
            symbol: token.symbol,
            success: false,
            error: 'Token não encontrado'
          };
        }
      });
    }
    
    return tokens.map(token => ({
      symbol: token.symbol,
      success: false,
      error: 'Erro na API'
    }));
  }
}

// Função para buscar apenas tokens faltantes (sem buscar toda a lista)
async function fetchMissingTokens(missingTokens: Array<{ symbol: string; coinGeckoId?: string }>) {
  try {
    console.log('🔍 Buscando tokens faltantes:', missingTokens.map(t => t.symbol));
    
    // Buscar apenas os tokens específicos que estão faltando
    const results = [];
    
    for (const token of missingTokens) {
              try {
          let apiUrl: string;
          
          // Se temos coinGeckoId, usar busca por ID específico
          if (token.coinGeckoId) {
            apiUrl = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${token.coinGeckoId}&order=market_cap_desc&per_page=1&sparkline=false&price_change_percentage=24h`;
            console.log(`🔍 Buscando por ID: ${token.coinGeckoId} (${token.symbol})`);
          } else {
            // Se não temos coinGeckoId, buscar por símbolo (menos preciso)
            apiUrl = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&price_change_percentage=24h`;
            console.log(`🔍 Buscando por símbolo: ${token.symbol}`);
          }
          
          const response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'SenhorBarriga-Portfolio/1.0',
              'X-CG-API-KEY': COINGECKO_API_KEY
            },
            cache: 'no-store'
          });

          if (response.ok) {
            const data = await response.json();
            let foundToken = null;
            
            if (token.coinGeckoId) {
              // Busca por ID específico
              foundToken = data.find((t: any) => t.id === token.coinGeckoId);
            } else {
              // Busca por símbolo
              foundToken = data.find((t: any) => t.symbol.toUpperCase() === token.symbol.toUpperCase());
            }
            
            if (foundToken) {
              const result = {
                symbol: token.symbol,
                success: true,
                realTimePrice: foundToken.current_price,
                priceChange24h: foundToken.price_change_percentage_24h,
                lastUpdated: new Date().toISOString()
              };
              
              // Adicionar ao cache
              REALTIME_PRICES_CACHE[token.symbol] = {
                price: foundToken.current_price,
                priceChange24h: foundToken.price_change_percentage_24h,
                lastUpdated: new Date().toISOString()
              };
              
              results.push(result);
              console.log(`✅ ${token.symbol}: $${foundToken.current_price} (ID: ${foundToken.id})`);
            } else {
              results.push({
                symbol: token.symbol,
                success: false,
                error: 'Token não encontrado'
              });
              console.log(`❌ ${token.symbol}: não encontrado`);
            }
          } else {
            results.push({
              symbol: token.symbol,
              success: false,
              error: `Erro API: ${response.status}`
            });
            console.log(`❌ ${token.symbol}: erro ${response.status}`);
          }
        
        // Delay pequeno entre requisições
        await new Promise(resolve => setTimeout(resolve, 50));
        
             } catch (error) {
         console.error(`❌ Erro ao buscar ${token.symbol}:`, error);
         results.push({
           symbol: token.symbol,
           success: false,
           error: 'Erro de rede'
         });
       }
     }
     
     return results;
   } catch (error) {
     console.error('❌ Erro ao buscar tokens faltantes:', error);
     return missingTokens.map(token => ({
       symbol: token.symbol,
       success: false,
       error: 'Erro interno'
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
    const { tokens } = await request.json();
    
    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Lista de tokens é obrigatória' 
      }, { status: 400 });
    }
    
    console.log('📊 Buscando preços em tempo real para:', tokens.map(t => ({ symbol: t.symbol, coinGeckoId: t.coinGeckoId })));
    
    const results = await getRealTimePricesWithCache(tokens);
    
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
