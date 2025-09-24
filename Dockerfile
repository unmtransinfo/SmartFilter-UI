FROM node:22-alpine
ARG ASSET_ROOT='\/smartsfilter'
ENV ASSET_ROOT=$ASSET_ROOT
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5173

CMD ["npm", "run", "dev"]
