# Base image
FROM node:20
# Setting work directory
WORKDIR /usr/app
# Copy package.json and package-lock.json (if available)
COPY package*.json ./
# Install Prisma dependencies
RUN apt-get update && apt-get install -y libssl-dev
# Install Loglask dependencies
RUN npm install
# Prisma generate
RUN npx prisma generate
# Copy source files
COPY . .
# Expose port 3000
EXPOSE 3000
# Start the server
CMD [ "npm", "start" ]