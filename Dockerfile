# Use Node LTS Alpine
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Build the frontend
RUN npm run build

# Expose port for serving
EXPOSE 3000

# Serve built files using a simple static server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]

