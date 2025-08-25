import { NextResponse } from 'next/server';

const COINGECKO_API_KEY = 'CG-9W1U48SPhUME6EeyinMWDtJs';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

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

    console.log('🔍 Buscando tokens na CoinGecko para:', query);

    // Buscar tokens usando a API de search da CoinGecko
    const searchUrl = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SenhorBarriga-Portfolio/1.0'
      },
      cache: 'no-store'
    });

    if (!searchResponse.ok) {
      console.error('❌ Erro na busca da CoinGecko:', searchResponse.status, searchResponse.statusText);
      return NextResponse.json({ 
        success: false, 
        message: 'Erro ao buscar na CoinGecko' 
      }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    console.log('📊 Resultados da busca:', searchData.coins?.length || 0, 'tokens encontrados');

    // Processar e filtrar resultados
    const tokens = (searchData.coins || [])
      .slice(0, 10) // Limitar a 10 resultados
      .map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        imageUrl: coin.large || coin.image || null,
        marketCapRank: coin.market_cap_rank || null,
        score: coin.score || 0
      }))
      .filter((token: any) => token.score > 0.1); // Filtrar tokens com baixa relevância

    console.log('✅ Tokens processados:', tokens.length);

    return NextResponse.json({ 
      success: true, 
      tokens: tokens
    });

  } catch (error) {
    console.error('❌ Erro na busca de tokens:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
