import { NextResponse } from 'next/server';

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
    console.log('🌐 URL da busca:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SenhorBarriga-Portfolio/1.0'
      },
      cache: 'no-store',
      next: { revalidate: 300 } // Cache por 5 minutos para evitar rate limiting
    });

    console.log('📡 Status da resposta:', searchResponse.status, searchResponse.statusText);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Erro na busca da CoinGecko:', searchResponse.status, searchResponse.statusText, errorText);
      return NextResponse.json({ 
        success: false, 
        message: `Erro ao buscar na CoinGecko: ${searchResponse.status} ${searchResponse.statusText}` 
      }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    console.log('📊 Dados brutos da busca:', JSON.stringify(searchData, null, 2));
    console.log('📊 Resultados da busca:', searchData.coins?.length || 0, 'tokens encontrados');

    // Processar e filtrar resultados
    const tokens = (searchData.coins || [])
      .slice(0, 20) // Aumentar para 20 resultados
      .map((coin: any) => {
        console.log('🪙 Processando coin:', coin.name, coin.symbol, 'Score:', coin.score);
        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          imageUrl: coin.large || coin.image || null,
          marketCapRank: coin.market_cap_rank || null,
          score: coin.score || 0
        };
      })
      .filter((token: any) => {
        // Reduzir o filtro para incluir mais tokens
        const isValid = token.score > 0.01; // Reduzir de 0.1 para 0.01
        console.log(`🔍 Token ${token.name} (${token.symbol}) - Score: ${token.score} - Válido: ${isValid}`);
        return isValid;
      });

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
