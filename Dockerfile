# ==================== ETAPA 1: GERAR O BUILD DO REACT ====================
FROM node:22-alpine AS build
WORKDIR /app

# Recebe a URL da API na hora do build (padrão: http://localhost:8080/api/)
ARG VITE_API_URL=http://localhost:8080/api/
ENV VITE_API_URL=$VITE_API_URL

# 1. Copia o package.json e instala as dependências (com cache)
COPY package*.json ./
RUN npm ci

# 2. Copia o código do React e gera a pasta dist/
COPY . .
RUN npm run build

# ==================== ETAPA 2: SERVIR COM NGINX ====================
FROM nginx:alpine AS final

# Copia nossa configuração que evita erro 404 ao dar F5
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia a pasta dist/ gerada na Etapa 1 para a pasta pública do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]