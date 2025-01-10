# Use an official Node.js runtime as a parent image
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN chmod -R 777 /var/cache/nginx /var/run /var/log/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
