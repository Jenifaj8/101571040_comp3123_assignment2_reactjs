
# Use the official Node.js LTS image
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 8081

# Start backend server
CMD ["npm", "start"]
