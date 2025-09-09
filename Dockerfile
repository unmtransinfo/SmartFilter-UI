# Use Node LTS Alpine
FROM node:22-alpine

WORKDIR /app

# Copy package files for caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend
COPY . .

# Build production assets
RUN npm run build

# Use a simple static server to serve built files
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

