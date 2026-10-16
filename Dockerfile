
FROM node:24-alpine
WORKDIR /app
COPY package.json function.js server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
