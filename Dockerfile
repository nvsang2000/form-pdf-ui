# Stage 1: Build React app
FROM oven/bun:latest
WORKDIR /app

COPY package*.json bun.lockb* ./
RUN bun install 

COPY . .

RUN bun run build

EXPOSE 35500
CMD ["bun", "run", "preview"]
