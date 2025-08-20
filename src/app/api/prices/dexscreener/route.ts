import { NextResponse } from 'next/server';

// Função auxiliar para buscar preços usando token profiles
async function fetchTokenProfile(symbol: string) {
  try {
    const profileUrl = `https://api.dexscreener.com/token-profiles/latest/v1/${symbol}`;
    
    const response = await fetch(profileUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SenhorBarriga-Portfolio/1.0'
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    console.log(`📊 Profile data para ${symbol}:`, JSON.stringify(data, null, 2));
    
    if (data && data.price) {
      return {
        symbol: symbol,
        name: data.name || symbol,
        priceUsd: parseFloat(data.price || '0'),
        priceChange24h: parseFloat(data.priceChange24h || '0'),
        volume24h: parseFloat(data.volume24h || '0'),
        liquidity: parseFloat(data.liquidity || '0'),
        updatedAt: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Erro ao buscar profile para ${symbol}:`, error);
    return null;
  }
}

// GET - Buscar preços de tokens do DexScreener
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const chain = searchParams.get('chain') || 'ethereum'; // default para ethereum

    if (!symbol) {
      return NextResponse.json({ 
        success: false, 
        message: 'Símbolo do token é obrigatório' 
      }, { status: 400 });
    }

    console.log('🔍 Buscando preço para:', symbol, 'na chain:', chain);

    // Primeiro, tentar buscar dados do token no DexScreener
    const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${symbol}`;
    
    const response = await fetch(dexScreenerUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SenhorBarriga-Portfolio/1.0'
      },
      next: { revalidate: 30 } // Cache por 30 segundos
    });

    if (!response.ok) {
      console.error('❌ Erro na API do DexScreener:', response.status, response.statusText);
      return NextResponse.json({ 
        success: false, 
        message: 'Erro ao buscar dados do DexScreener' 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('📥 Dados recebidos do DexScreener:', JSON.stringify(data, null, 2));

    // Processar os dados recebidos
    if (data.pairs && data.pairs.length > 0) {
      // Pegar o primeiro par (geralmente o mais relevante)
      const pair = data.pairs[0];
      
      const tokenData = {
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        priceUsd: parseFloat(pair.priceUsd || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
        dexId: pair.dexId,
        chainId: pair.chainId,
        pairAddress: pair.pairAddress,
        url: pair.url,
        updatedAt: new Date().toISOString()
      };

      console.log('✅ Dados processados:', tokenData);

      return NextResponse.json({ 
        success: true, 
        data: tokenData
      });
    } else {
      console.log('⚠️ Nenhum par encontrado para:', symbol);
      return NextResponse.json({ 
        success: false, 
        message: 'Token não encontrado no DexScreener' 
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
    const { tokens } = body; // Array de { symbol, chain }

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Lista de tokens é obrigatória' 
      }, { status: 400 });
    }

    console.log('🔍 Buscando preços para múltiplos tokens:', tokens);

    // Buscar preços para todos os tokens em paralelo
    const pricePromises = tokens.map(async (token: any) => {
      try {
        const symbol = token.symbol;
        const chain = token.chain || 'ethereum';
        
        console.log(`🔍 Buscando preço para ${symbol}...`);
        
        // Primeiro, tentar a API principal
        const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${symbol}`;
        
        const response = await fetch(dexScreenerUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SenhorBarriga-Portfolio/1.0'
          },
          next: { revalidate: 30 }
        });

        if (!response.ok) {
          console.error(`❌ Erro para ${symbol}:`, response.status, response.statusText);
          
          // Tentar fallback com token profiles
          console.log(`🔄 Tentando fallback para ${symbol}...`);
          const fallbackData = await fetchTokenProfile(symbol);
          
          if (fallbackData) {
            return {
              symbol,
              success: true,
              data: fallbackData
            };
          }
          
          return {
            symbol,
            success: false,
            error: `HTTP ${response.status}`
          };
        }

        const data = await response.json();
        console.log(`📥 Dados recebidos para ${symbol}:`, JSON.stringify(data, null, 2));
        
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          
          const result = {
            symbol,
            success: true,
            data: {
              symbol: pair.baseToken.symbol,
              name: pair.baseToken.name,
              priceUsd: parseFloat(pair.priceUsd || '0'),
              priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
              volume24h: parseFloat(pair.volume?.h24 || '0'),
              liquidity: parseFloat(pair.liquidity?.usd || '0'),
              dexId: pair.dexId,
              chainId: pair.chainId,
              pairAddress: pair.pairAddress,
              url: pair.url,
              updatedAt: new Date().toISOString()
            }
          };
          
          console.log(`✅ Sucesso para ${symbol}:`, result);
          return result;
        } else {
          console.log(`⚠️ Nenhum par encontrado para ${symbol}, tentando fallback...`);
          
          // Tentar fallback com token profiles
          const fallbackData = await fetchTokenProfile(symbol);
          
          if (fallbackData) {
            return {
              symbol,
              success: true,
              data: fallbackData
            };
          }
          
          return {
            symbol,
            success: false,
            error: 'Token não encontrado'
          };
        }
      } catch (error) {
        console.error(`❌ Erro para ${token.symbol}:`, error);
        
        // Tentar fallback em caso de erro
        try {
          const fallbackData = await fetchTokenProfile(token.symbol);
          if (fallbackData) {
            return {
              symbol: token.symbol,
              success: true,
              data: fallbackData
            };
          }
        } catch (fallbackError) {
          console.error(`❌ Erro no fallback para ${token.symbol}:`, fallbackError);
        }
        
        return {
          symbol: token.symbol,
          success: false,
          error: 'Erro na requisição'
        };
      }
    });

    const results = await Promise.all(pricePromises);
    
    console.log('✅ Resultados dos preços:', results);

    return NextResponse.json({ 
      success: true, 
      results 
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
