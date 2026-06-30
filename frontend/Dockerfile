FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8081

ENV BROWSER=none

CMD ["npx", "expo", "start", "--web", "--port", "8081"]
