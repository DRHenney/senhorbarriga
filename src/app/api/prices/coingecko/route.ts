import { NextResponse } from 'next/server';

const COINGECKO_API_KEY = 'CG-9W1U48SPhUME6EeyinMWDtJs';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache global para tokens da CoinGecko (mesmo do buscador)
let ALL_TOKENS_CACHE: any[] = [];
let CACHE_TIMESTAMP = 0;
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hora (reduzido para debug)

// Função para buscar todos os tokens da CoinGecko (mesma do buscador)
async function getAllTokensFromCoinGecko() {
  const now = Date.now();
  
  // Verificar se o cache ainda é válido
  if (ALL_TOKENS_CACHE.length > 0 && (now - CACHE_TIMESTAMP) < CACHE_DURATION) {
    console.log('📦 Usando cache de tokens:', ALL_TOKENS_CACHE.length, 'tokens');
    return ALL_TOKENS_CACHE;
  }

  try {
    console.log('🔄 Buscando todos os tokens da CoinGecko...');
    
    // Buscar lista muito mais completa de tokens (múltiplas páginas)
    let allTokens: any[] = [];
    
    // Buscar muito mais páginas para incluir tokens de baixa capitalização (até posição #15000)
    for (let page = 1; page <= 60; page++) {
      const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=24h`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SenhorBarriga-Portfolio/1.0',
          'X-CG-API-KEY': COINGECKO_API_KEY
        },
        cache: 'no-store',
        next: { revalidate: 300 } // Cache por 5 minutos (reduzido para debug)
      });

      if (response.ok) {
        const data = await response.json();
        allTokens = allTokens.concat(data);
        console.log(`📄 Página ${page}: ${data.length} tokens encontrados`);
        
        // Se não há mais dados, parar
        if (data.length === 0) break;
        
        // Adicionar delay para evitar rate limiting
        if (page < 60) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }
      } else {
        console.log(`⚠️ Erro na página ${page}:`, response.status, response.statusText);
        if (response.status === 429) {
          console.log('🚫 Rate limit atingido, parando busca');
        }
        break;
      }
    }
    
    console.log('✅ Busca completa funcionou:', allTokens.length, 'tokens encontrados no total');
    
    // Processar e cachear os tokens
    ALL_TOKENS_CACHE = allTokens.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      imageUrl: coin.image,
      marketCapRank: coin.market_cap_rank,
      currentPrice: coin.current_price,
      priceChange24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      score: 1.0 // Score alto para todos os tokens listados
    }));
    
    CACHE_TIMESTAMP = now;
    return ALL_TOKENS_CACHE;
  } catch (error) {
    console.error('❌ Erro ao buscar todos os tokens:', error);
    
    // Se o cache tem dados antigos, usar eles mesmo assim
    if (ALL_TOKENS_CACHE.length > 0) {
      console.log('🔄 Usando cache antigo devido ao erro:', ALL_TOKENS_CACHE.length, 'tokens');
      return ALL_TOKENS_CACHE;
    }
  }

  return [];
}

// Função auxiliar para buscar dados de um token específico
async function fetchTokenData(symbol: string, coinGeckoId?: string) {
  try {
    let tokenId = coinGeckoId;
    
    // Se não temos o coinGeckoId, buscar o ID do token usando a lista completa
    if (!tokenId) {
      console.log(`🔍 Buscando token ${symbol} na lista completa...`);
      
      // Buscar na lista completa de tokens (mesma do buscador)
      const allTokens = await getAllTokensFromCoinGecko();
      
      if (allTokens.length > 0) {
        const symbolUpper = symbol.toUpperCase();
        
        // Primeiro, tentar encontrar um token com símbolo exato
        let token = allTokens.find(t => t.symbol === symbolUpper);
        
        if (token) {
          console.log(`✅ Token encontrado na lista completa: ${token.id} (${token.symbol})`);
          tokenId = token.id;
        } else {
          // Se não encontrar símbolo exato, tentar busca por nome
          token = allTokens.find(t => 
            t.name.toLowerCase().includes(symbol.toLowerCase()) ||
            t.symbol.toLowerCase().includes(symbol.toLowerCase())
          );
          
          if (token) {
            console.log(`⚠️ Token encontrado por busca aproximada: ${token.id} (${token.symbol})`);
            tokenId = token.id;
          } else {
            console.log(`❌ Token ${symbol} não encontrado na lista completa`);
            
            // Fallback para API de search (como antes)
            console.log(`🔄 Tentando API de search como fallback...`);
            const searchUrl = `${COINGECKO_BASE_URL}/search?query=${symbol}`;
            const searchResponse = await fetch(searchUrl, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'SenhorBarriga-Portfolio/1.0',
                'X-CG-API-KEY': COINGECKO_API_KEY
              },
              cache: 'no-store'
            });

            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              
              if (searchData.coins && Array.isArray(searchData.coins)) {
                // Buscar o token mais específico que corresponda exatamente ao símbolo
                let searchToken = searchData.coins.find((coin: any) => 
                  coin.symbol?.toUpperCase() === symbolUpper
                );
                
                if (!searchToken) {
                  console.warn(`⚠️ Símbolo exato não encontrado para ${symbol}, usando primeiro resultado`);
                  searchToken = searchData.coins[0];
                }
                
                if (searchToken) {
                  tokenId = searchToken.id;
                  console.log(`✅ Token encontrado via search: ${tokenId} (${searchToken.symbol})`);
                }
              }
            }
          }
        }
      }
    }

    if (!tokenId) {
      console.log(`❌ Não foi possível encontrar o token ${symbol}`);
      return null;
    }

    console.log(`🔍 Usando token ID: ${tokenId} para buscar dados detalhados`);

    // Buscar dados detalhados do token
    const detailUrl = `${COINGECKO_BASE_URL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const detailResponse = await fetch(detailUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SenhorBarriga-Portfolio/1.0',
        'X-CG-API-KEY': COINGECKO_API_KEY
      },
      cache: 'no-store'
    });

    if (!detailResponse.ok) {
      console.error(`❌ Erro ao buscar detalhes do token ${tokenId}:`, detailResponse.status, detailResponse.statusText);
      return null;
    }

    const detailData = await detailResponse.json();
    console.log(`📊 Dados detalhados para ${tokenId}:`, JSON.stringify(detailData, null, 2));

    return {
      symbol: detailData.symbol?.toUpperCase() || symbol.toUpperCase(),
      name: detailData.name || symbol,
      imageUrl: detailData.image?.large || detailData.image?.small || null,
      priceUsd: parseFloat(detailData.market_data?.current_price?.usd || '0'),
      priceChange24h: parseFloat(detailData.market_data?.price_change_percentage_24h || '0'),
      volume24h: parseFloat(detailData.market_data?.total_volume?.usd || '0'),
      marketCap: parseFloat(detailData.market_data?.market_cap?.usd || '0'),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar dados para ${symbol}:`, error);
    return null;
  }
}

// GET - Buscar preços de um token específico
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ 
        success: false, 
        message: 'Símbolo do token é obrigatório' 
      }, { status: 400 });
    }

    console.log('🔍 Buscando preço no CoinGecko para:', symbol);

    const tokenData = await fetchTokenData(symbol);

    if (tokenData) {
      console.log('✅ Dados processados:', tokenData);
      return NextResponse.json({ 
        success: true, 
        data: tokenData
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Token não encontrado no CoinGecko' 
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// POST - Buscar múltiplos tokens de uma vez
export async function POST(request: Request) {
  try {
    console.log('📥 POST /api/prices/coingecko recebido');
    
    const body = await request.json();
    const { tokens } = body; // Array de { symbol }

    console.log('📥 Body recebido:', JSON.stringify(body, null, 2));

    if (!tokens || !Array.isArray(tokens)) {
      console.log('❌ Tokens inválidos:', tokens);
      return NextResponse.json({ 
        success: false, 
        message: 'Lista de tokens é obrigatória' 
      }, { status: 400 });
    }

    console.log('🔍 Buscando preços no CoinGecko para múltiplos tokens:', tokens);

    // Buscar preços para todos os tokens em paralelo
    const pricePromises = tokens.map(async (token: any) => {
      try {
        const symbol = token.symbol;
        const coinGeckoId = token.coinGeckoId;
        console.log(`🔍 Buscando preço para ${symbol}${coinGeckoId ? ` (ID: ${coinGeckoId})` : ''}...`);
        
        const tokenData = await fetchTokenData(symbol, coinGeckoId);
        
        if (tokenData) {
          return {
            symbol,
            success: true,
            data: tokenData
          };
        } else {
          return {
            symbol,
            success: false,
            error: 'Token não encontrado'
          };
        }
      } catch (error) {
        console.error(`❌ Erro para ${token.symbol}:`, error);
        return {
          symbol: token.symbol,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
    });

    const results = await Promise.all(pricePromises);
    
    console.log('📊 Resultados finais:', results.map(r => ({ symbol: r.symbol, success: r.success, error: r.error })));

    return NextResponse.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
