# ========= BUILD STAGE =========
FROM node:20-slim AS builder

WORKDIR /app

# Dependências de sistema para pacotes nativos (bcrypt, pdfkit, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Instala pnpm (versão compatível com Node 20)
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copia manifestos
COPY package.json pnpm-lock.yaml .pnpm-settings.yaml ./

# Instala dependências
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile

# Copia código fonte
COPY . .

# Build: Vite (front) + esbuild (back)
# --external:./vite exclui o módulo dev-only do bundle de produção
RUN pnpm exec vite build && \
    pnpm exec esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:./vite

# Instala apenas dependências de produção
RUN pnpm install --prod --no-frozen-lockfile

# ========= RUNTIME STAGE =========
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copia apenas o necessário para rodar
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Assets usados pelo email (servidos via Express em /email-assets)
COPY --from=builder /app/attached_assets ./attached_assets

EXPOSE 3000

CMD ["node", "dist/index.js"]
