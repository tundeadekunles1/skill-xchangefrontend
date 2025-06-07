# # stage1 - build react app first 
# FROM node:18.1.0 as build
# WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH
# COPY ./package.json /app/
# COPY . /app
# RUN npm install
# RUN npm run build

# # stage 2 - build the final image and copy the react build files
# FROM nginx:1.17.8-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx/nginx.conf /etc/nginx/conf.d
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build React app
FROM node:18.1.0 AS build
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.17.8-alpine

# Remove the default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app to Nginx's public folder
COPY --from=build /app/build /usr/share/nginx/html

# Optional: Use a custom Nginx config (recommended for React Router)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 8080

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
