FROM node:22-alpine
ARG ASSET_ROOT='\/smartsfilter'
ENV ASSET_ROOT=$ASSET_ROOT
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000

CMD ["npm", "run", "dev"]
