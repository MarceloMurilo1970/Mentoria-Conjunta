# Usa imagem base que já tem: node + libs nativas + node_modules
ARG BASE_IMAGE=760996456182.dkr.ecr.us-east-1.amazonaws.com/ecr_mentoria_base:latest
FROM ${BASE_IMAGE}

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80

# Copia código fonte (node_modules já estão na base)
COPY . .

# Recebe commit hash do build-arg
ARG COMMIT_HASH=dev
ENV VITE_COMMIT_HASH=${COMMIT_HASH}

# Build: Vite (front) + esbuild (back)
# --external:./vite mantém o require dinâmico do vite fora do bundle (só roda em dev)
RUN npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:./vite

# Trocar node_modules completo pelo prod-only (remove devDeps)
RUN rm -rf node_modules && mv node_modules_prod node_modules

EXPOSE 80

CMD ["node", "dist/index.js"]
