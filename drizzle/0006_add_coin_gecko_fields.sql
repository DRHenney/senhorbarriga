-- Adicionar campos para identificação única do token no CoinGecko
ALTER TABLE "user_tokens" ADD COLUMN "coin_gecko_id" text;
ALTER TABLE "user_tokens" ADD COLUMN "image_url" text;
ALTER TABLE "user_tokens" ADD COLUMN "market_cap_rank" integer;
