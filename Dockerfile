FROM node:16.7
WORKDIR /app
COPY . .
EXPOSE 80
CMD ["npm","start"]
