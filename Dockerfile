FROM oven/bun:alpine AS builder

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

COPY install.sh .

# Ensure the install.sh script is executable
RUN chmod +x install.sh

# COPY
COPY . .

# define port
EXPOSE 4173/tcp

# Set the entrypoint to run the install.sh script
ENTRYPOINT ["sh", "/install.sh"]
