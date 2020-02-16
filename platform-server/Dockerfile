FROM node:10

ARG mongoUrl="mongodb://mongo:27017"
ARG port=3000
WORKDIR /usr/src/app

COPY src/ ./src
COPY config/ ./config
COPY index.js .
COPY package.json .

ENV MONGO_URL ${mongoUrl}
ENV PORT=${port}
RUN npm install

CMD node index.js

