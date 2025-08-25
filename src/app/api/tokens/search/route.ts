import { NextResponse } from 'next/server';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache global para tokens da CoinGecko
let ALL_TOKENS_CACHE: any[] = [];
let CACHE_TIMESTAMP = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Dados mockados para fallback
const MOCK_TOKENS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', marketCapRank: 1, score: 0.95 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', marketCapRank: 2, score: 0.90 },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB', imageUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', marketCapRank: 3, score: 0.85 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', marketCapRank: 5, score: 0.80 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', imageUrl: 'https://assets.coingecko.com/coins/images/975/large/Cardano.png', marketCapRank: 8, score: 0.75 },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', imageUrl: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png', marketCapRank: 12, score: 0.70 },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', imageUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink.png', marketCapRank: 15, score: 0.65 },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', imageUrl: 'https://assets.coingecko.com/coins/images/4713/large/matic.png', marketCapRank: 14, score: 0.68 },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', imageUrl: 'https://assets.coingecko.com/coins/images/12559/large/avalanche.png', marketCapRank: 20, score: 0.60 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', imageUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', marketCapRank: 10, score: 0.72 },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', imageUrl: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png', marketCapRank: 18, score: 0.62 },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', imageUrl: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png', marketCapRank: 22, score: 0.58 },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', imageUrl: 'https://assets.coingecko.com/coins/images/12504/large/uniswap.png', marketCapRank: 25, score: 0.55 },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', imageUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp.png', marketCapRank: 6, score: 0.78 },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', imageUrl: 'https://assets.coingecko.com/coins/images/100/large/stellar.png', marketCapRank: 30, score: 0.50 },
  // Tokens menores populares
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', imageUrl: 'https://assets.coingecko.com/coins/images/29850/large/pepe.png', marketCapRank: 35, score: 0.45 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', imageUrl: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg', marketCapRank: 40, score: 0.40 },
  { id: 'floki', name: 'Floki Inu', symbol: 'FLOKI', imageUrl: 'https://assets.coingecko.com/coins/images/16746/large/PNG_image.png', marketCapRank: 45, score: 0.35 },
  { id: 'baby-doge-coin', name: 'Baby Doge Coin', symbol: 'BABYDOGE', imageUrl: 'https://assets.coingecko.com/coins/images/16125/large/babydoge.jpg', marketCapRank: 50, score: 0.30 },
  { id: 'safe-moon', name: 'SafeMoon', symbol: 'SAFEMOON', imageUrl: 'https://assets.coingecko.com/coins/images/14362/large/174x174-white.png', marketCapRank: 55, score: 0.25 }
];

// Função para buscar todos os tokens da CoinGecko
async function getAllTokensFromCoinGecko() {
  const now = Date.now();
  
  // Verificar se o cache ainda é válido
  if (ALL_TOKENS_CACHE.length > 0 && (now - CACHE_TIMESTAMP) < CACHE_DURATION) {
    console.log('📦 Usando cache de tokens:', ALL_TOKENS_CACHE.length, 'tokens');
    return ALL_TOKENS_CACHE;
  }

  try {
    console.log('🔄 Buscando todos os tokens da CoinGecko...');
    
    // Buscar lista completa de tokens
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SenhorBarriga-Portfolio/1.0'
      },
      cache: 'no-store',
      next: { revalidate: 3600 } // Cache por 1 hora
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Busca completa funcionou:', data.length, 'tokens encontrados');
      
      // Processar e cachear os tokens
      ALL_TOKENS_CACHE = data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        imageUrl: coin.image,
        marketCapRank: coin.market_cap_rank,
        score: 1.0 // Score alto para todos os tokens listados
      }));
      
      CACHE_TIMESTAMP = now;
      return ALL_TOKENS_CACHE;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar todos os tokens:', error);
  }

  return [];
}

// GET - Buscar tokens na CoinGecko por nome ou símbolo
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        message: 'Query deve ter pelo menos 2 caracteres' 
      }, { status: 400 });
    }

    console.log('🔍 Buscando tokens para:', query);

    // Primeiro, tentar buscar na lista completa de tokens
    try {
      const allTokens = await getAllTokensFromCoinGecko();
      
      if (allTokens.length > 0) {
        const queryLower = query.toLowerCase();
        const filteredTokens = allTokens.filter(token => 
          token.name.toLowerCase().includes(queryLower) ||
          token.symbol.toLowerCase().includes(queryLower) ||
          token.id.toLowerCase().includes(queryLower)
        ).slice(0, 20); // Limitar a 20 resultados para performance

        console.log('✅ Tokens encontrados na busca completa:', filteredTokens.length);
        
        if (filteredTokens.length > 0) {
          return NextResponse.json({ success: true, tokens: filteredTokens });
        }
      }
    } catch (error) {
      console.log('⚠️ Busca completa falhou, tentando API de search:', error);
    }

    // Fallback: tentar a API de search da CoinGecko
    try {
      const searchUrl = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      console.log('🌐 Tentando API de search:', searchUrl);
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SenhorBarriga-Portfolio/1.0'
        },
        cache: 'no-store',
        next: { revalidate: 300 }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('✅ API de search funcionou:', searchData.coins?.length || 0, 'tokens encontrados');

        const tokens = (searchData.coins || [])
          .slice(0, 20)
          .map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            imageUrl: coin.large || coin.image || null,
            marketCapRank: coin.market_cap_rank || null,
            score: coin.score || 0
          }))
          .filter((token: any) => token.score > 0.001);

        if (tokens.length > 0) {
          return NextResponse.json({ success: true, tokens });
        }
      }
    } catch (error) {
      console.log('⚠️ API de search falhou, usando dados mockados:', error);
    }

    // Fallback final: usar dados mockados
    console.log('🔄 Usando dados mockados como fallback');
    const queryLower = query.toLowerCase();
    const filteredTokens = MOCK_TOKENS.filter(token => 
      token.name.toLowerCase().includes(queryLower) ||
      token.symbol.toLowerCase().includes(queryLower) ||
      token.id.toLowerCase().includes(queryLower)
    );

    console.log('✅ Tokens mockados encontrados:', filteredTokens.length);

    return NextResponse.json({ 
      success: true, 
      tokens: filteredTokens
    });

  } catch (error) {
    console.error('❌ Erro na busca de tokens:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
