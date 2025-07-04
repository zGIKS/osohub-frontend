# Dockerfile for React frontend (Create React App, compatible with Vite)
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Serve static build with a lightweight web server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx sirve por defecto en el puerto 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
