import { NextResponse } from 'next/server';

const COINGECKO_API_KEY = 'CG-9W1U48SPhUME6EeyinMWDtJs';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Função auxiliar para buscar dados de um token específico
async function fetchTokenData(symbol: string, coinGeckoId?: string) {
  try {
    let tokenId = coinGeckoId;
    
    // Se não temos o coinGeckoId, buscar o ID do token usando a API de search
    if (!tokenId) {
      const searchUrl = `${COINGECKO_BASE_URL}/search?query=${symbol}`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SenhorBarriga-Portfolio/1.0',
          'X-CG-API-KEY': COINGECKO_API_KEY
        },
        // Remover cache para garantir dados sempre atualizados
        cache: 'no-store'
      });

      if (!searchResponse.ok) {
        console.error(`❌ Erro na busca do token ${symbol}:`, searchResponse.status, searchResponse.statusText);
        return null;
      }

      const searchData = await searchResponse.json();
      console.log(`🔍 Resultados da busca para ${symbol}:`, JSON.stringify(searchData, null, 2));

      // Encontrar o token mais relevante (geralmente o primeiro resultado)
      const token = searchData.coins?.[0];
      if (!token) {
        console.log(`⚠️ Nenhum token encontrado para ${symbol}`);
        return null;
      }

      tokenId = token.id;
      console.log(`✅ Token encontrado via search: ${tokenId} (${token.symbol})`);
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
      // Remover cache para garantir dados sempre atualizados
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
    const body = await request.json();
    const { tokens } = body; // Array de { symbol }

    if (!tokens || !Array.isArray(tokens)) {
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
    
    console.log('📊 Resultados finais:', results);

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
