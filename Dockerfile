FROM node:22-alpine
ARG ASSET_ROOT='\/smartsfilter'
ENV ASSET_ROOT=$ASSET_ROOT
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Use a simple static server
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build"]
