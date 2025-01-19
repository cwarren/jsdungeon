# Use a lightweight Nginx image to serve static files
FROM nginx:alpine

# Copy the project files to the Nginx web root directory
COPY . /usr/share/nginx/html

# Expose port 8080 to access the server
EXPOSE 8080
