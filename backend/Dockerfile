FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js ./
RUN mkdir -p /app/data && printf '[]' > /app/data/users.json
EXPOSE 3000
CMD ["npm", "start"]
