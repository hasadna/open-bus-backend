FROM node:18@sha256:995a5f4314885452a4a785abc25a0fec40e26c346559e11e709d58bb7a927cf4
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
