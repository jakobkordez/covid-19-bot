FROM node:14

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY ./src ./src

CMD [ "node", "src/server.js" ]