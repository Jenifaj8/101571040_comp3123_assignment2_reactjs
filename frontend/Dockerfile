
# Build the React application
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Use relative API URLs through Nginx
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Serve React using Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Add custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
