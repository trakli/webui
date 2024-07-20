# Use the official Node.js image as the base image
FROM node:18.0.0

# Create destination directory
WORKDIR /app

# Update and install git
RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

# Copy the app, note .dockerignore
COPY . /app/

# Install dependencies and build the application
RUN npm install && npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Command to run the application
CMD ["npm", "start"]
