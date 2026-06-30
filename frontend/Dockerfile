FROM node:18-alpine

WORKDIR /app

# evita problemas de dependências nativas
RUN apk add --no-cache libc6-compat

# copiar dependências primeiro (cache do Docker)
COPY package.json package-lock.json* ./

RUN npm install

# copiar código
COPY . .

# desativar telemetria
ENV NEXT_TELEMETRY_DISABLED=1

# expor porta do Next.js
EXPOSE 3000

# importante para rodar dentro do Docker
ENV HOST=0.0.0.0
ENV PORT=3000

# Compilar no arranque para injetar as variáveis de ambiente em tempo de execução
CMD ["sh", "-c", "npm run build && npm run start"]