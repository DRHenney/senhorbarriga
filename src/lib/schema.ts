import { pgTable, serial, text, timestamp, decimal, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de usuários (atualizada para NextAuth)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  password: text('password'), // Opcional para login com Google
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabelas necessárias para NextAuth
export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey(account.provider, account.providerAccountId),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  compoundKey: primaryKey(vt.identifier, vt.token),
}));

// Tabela de carteiras
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  address: text('address').notNull().unique(),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de transações
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').references(() => wallets.id),
  type: text('type').notNull(), // 'deposit', 'withdrawal', 'swap', 'stake', 'unstake'
  amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
  token: text('token').notNull(),
  txHash: text('tx_hash'),
  status: text('status').default('pending'), // 'pending', 'completed', 'failed'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de posições DeFi
export const defiPositions = pgTable('defi_positions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').references(() => wallets.id),
  protocol: text('protocol').notNull(), // 'uniswap', 'aave', 'compound', etc.
  pool: text('pool').notNull(),
  tokenA: text('token_a').notNull(),
  tokenB: text('token_b').notNull(),
  amountA: decimal('amount_a', { precision: 18, scale: 8 }).notNull(),
  amountB: decimal('amount_b', { precision: 18, scale: 8 }).notNull(),
  apr: decimal('apr', { precision: 10, scale: 4 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de tokens do usuário
export const userTokens = pgTable('user_tokens', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
  price: decimal('price', { precision: 18, scale: 8 }).notNull(),
  value: decimal('value', { precision: 18, scale: 8 }).notNull(),
  purchaseDate: timestamp('purchase_date').notNull().defaultNow(), // Data da compra
  coinGeckoId: text('coin_gecko_id'), // ID do CoinGecko para identificação única
  imageUrl: text('image_url'), // URL da imagem do token
  marketCapRank: integer('market_cap_rank'), // Rank de capitalização de mercado
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de registros semanais
export const weeklyRecords = pgTable('weekly_records', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  poolLiquidity: decimal('pool_liquidity', { precision: 18, scale: 2 }).notNull(),
  gridBot: decimal('grid_bot', { precision: 18, scale: 2 }).notNull(),
  total: decimal('total', { precision: 18, scale: 2 }).notNull(),
  weekNumber: integer('week_number').notNull(),
  year: integer('year').notNull(),
  recordDate: timestamp('record_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de histórico de preços
export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  token: text('token').notNull(),
  price: decimal('price', { precision: 18, scale: 8 }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  source: text('source').notNull(), // 'coingecko', 'binance', etc.
});

// Relações entre as tabelas
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  accounts: many(accounts),
  sessions: many(sessions),
  tokens: many(userTokens),
  weeklyRecords: many(weeklyRecords),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  defiPositions: many(defiPositions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

export const defiPositionsRelations = relations(defiPositions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [defiPositions.walletId],
    references: [wallets.id],
  }),
}));

export const userTokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
}));

export const weeklyRecordsRelations = relations(weeklyRecords, ({ one }) => ({
  user: one(users, {
    fields: [weeklyRecords.userId],
    references: [users.id],
  }),
}));
