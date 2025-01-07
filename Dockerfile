# Use a lightweight web server image
FROM nginx:alpine

# Copy build output to the web server's root directory
COPY dist/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
