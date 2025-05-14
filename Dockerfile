# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port (if needed)
EXPOSE 7000

# Start the app
CMD ["nodemon", "index.js"]
