import { db } from './database';
import { users, wallets, transactions, defiPositions, priceHistory } from './schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

// Operações com Usuários
export const userOperations = {
  // Criar usuário
  async createUser(email: string, name: string, password: string) {
    return await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      name,
      password, // Em produção, criptografe a senha
    }).returning();
  },

  // Buscar usuário por email
  async getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  },

  // Buscar usuário com suas carteiras
  async getUserWithWallets(userId: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        wallets: true,
      },
    });
  },

  // Atualizar usuário
  async updateUser(userId: string, updates: Partial<typeof users.$inferInsert>) {
    return await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
  },
};

// Operações com Carteiras
export const walletOperations = {
  // Criar carteira
  async createWallet(userId: string, address: string, name: string) {
    return await db.insert(wallets).values({
      userId,
      address,
      name,
    }).returning();
  },

  // Buscar carteiras de um usuário
  async getUserWallets(userId: number) {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  },

  // Buscar carteira com transações
  async getWalletWithTransactions(walletId: number) {
    return await db.query.wallets.findFirst({
      where: eq(wallets.id, walletId),
      with: {
        transactions: true,
      },
    });
  },
};

// Operações com Transações
export const transactionOperations = {
  // Criar transação
  async createTransaction(
    walletId: number,
    type: string,
    amount: number,
    token: string,
    txHash?: string
  ) {
    return await db.insert(transactions).values({
      walletId,
      type,
      amount,
      token,
      txHash,
    }).returning();
  },

  // Buscar transações de uma carteira
  async getWalletTransactions(walletId: number) {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt));
  },

  // Buscar transações por período
  async getTransactionsByPeriod(startDate: Date, endDate: Date) {
    return await db.select()
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startDate),
          lte(transactions.createdAt, endDate)
        )
      )
      .orderBy(desc(transactions.createdAt));
  },

  // Buscar transações por tipo
  async getTransactionsByType(type: string) {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.type, type))
      .orderBy(desc(transactions.createdAt));
  },

  // Atualizar status da transação
  async updateTransactionStatus(transactionId: number, status: string) {
    return await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, transactionId))
      .returning();
  },
};

// Operações com Posições DeFi
export const defiOperations = {
  // Criar posição DeFi
  async createDefiPosition(
    walletId: number,
    protocol: string,
    pool: string,
    tokenA: string,
    tokenB: string,
    amountA: number,
    amountB: number,
    apr?: number
  ) {
    return await db.insert(defiPositions).values({
      walletId,
      protocol,
      pool,
      tokenA,
      tokenB,
      amountA,
      amountB,
      apr,
    }).returning();
  },

  // Buscar posições ativas de uma carteira
  async getActivePositions(walletId: number) {
    return await db.select()
      .from(defiPositions)
      .where(
        and(
          eq(defiPositions.walletId, walletId),
          eq(defiPositions.isActive, true)
        )
      );
  },

  // Buscar posições por protocolo
  async getPositionsByProtocol(protocol: string) {
    return await db.select()
      .from(defiPositions)
      .where(eq(defiPositions.protocol, protocol));
  },

  // Desativar posição
  async deactivatePosition(positionId: number) {
    return await db.update(defiPositions)
      .set({ isActive: false })
      .where(eq(defiPositions.id, positionId))
      .returning();
  },
};

// Operações com Histórico de Preços
export const priceOperations = {
  // Adicionar preço
  async addPrice(token: string, price: number, source: string) {
    return await db.insert(priceHistory).values({
      token,
      price,
      source,
      timestamp: new Date(),
    }).returning();
  },

  // Buscar histórico de preços de um token
  async getTokenPriceHistory(token: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db.select()
      .from(priceHistory)
      .where(
        and(
          eq(priceHistory.token, token),
          gte(priceHistory.timestamp, startDate)
        )
      )
      .orderBy(asc(priceHistory.timestamp));
  },

  // Buscar preço mais recente de um token
  async getLatestPrice(token: string) {
    const result = await db.select()
      .from(priceHistory)
      .where(eq(priceHistory.token, token))
      .orderBy(desc(priceHistory.timestamp))
      .limit(1);
    
    return result[0];
  },
};

// Operações de Relatórios e Analytics
export const analyticsOperations = {
  // Calcular valor total do portfólio de um usuário
  async calculateUserPortfolioValue(userId: number) {
    // Buscar todas as carteiras do usuário
    const userWallets = await walletOperations.getUserWallets(userId);
    
    let totalValue = 0;
    
    for (const wallet of userWallets) {
      // Buscar transações da carteira
      const transactions = await transactionOperations.getWalletTransactions(wallet.id);
      
      // Calcular valor baseado nas transações
      for (const tx of transactions) {
        if (tx.status === 'completed') {
          if (tx.type === 'deposit') {
            totalValue += Number(tx.amount);
          } else if (tx.type === 'withdrawal') {
            totalValue -= Number(tx.amount);
          }
        }
      }
    }
    
    return totalValue;
  },

  // Gerar relatório de transações por período
  async generateTransactionReport(startDate: Date, endDate: Date) {
    const transactions = await transactionOperations.getTransactionsByPeriod(startDate, endDate);
    
    const report = {
      totalTransactions: transactions.length,
      totalVolume: 0,
      byType: {} as Record<string, number>,
      byToken: {} as Record<string, number>,
    };
    
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      report.totalVolume += amount;
      
      // Contar por tipo
      report.byType[tx.type] = (report.byType[tx.type] || 0) + amount;
      
      // Contar por token
      report.byToken[tx.token] = (report.byToken[tx.token] || 0) + amount;
    }
    
    return report;
  },

  // Buscar top tokens por volume
  async getTopTokensByVolume(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const transactions = await transactionOperations.getTransactionsByPeriod(startDate, new Date());
    
    const tokenVolumes: Record<string, number> = {};
    
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      tokenVolumes[tx.token] = (tokenVolumes[tx.token] || 0) + amount;
    }
    
    // Ordenar por volume
    return Object.entries(tokenVolumes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([token, volume]) => ({ token, volume }));
  },
};
