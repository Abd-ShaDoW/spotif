# Specify base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/app

# Copy package.json and package-lock.json to the working directory
COPY ./package*.json ./

# Install dependencies 
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/


# Copy the rest of the application code to the working directory
COPY . .

# Run `npx prisma generate` to generate the Prisma client
RUN npx prisma generate


# Exposing port 300
EXPOSE 3000


# Default command
CMD ["npm","start"]