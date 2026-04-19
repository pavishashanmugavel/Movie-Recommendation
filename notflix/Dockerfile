FROM node:20

WORKDIR /app

COPY . .

# Install server deps
WORKDIR /app/server
RUN npm install

# Install client deps
WORKDIR /app/client
RUN npm install

# Build frontend (Vite needs Node 20+)
RUN npm run build

# Back to server
WORKDIR /app/server

EXPOSE 5000

CMD ["npm", "start"]