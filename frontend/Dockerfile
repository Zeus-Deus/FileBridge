FROM node:18-alpine as build

WORKDIR /app

# Create a basic React app directly
RUN npx create-react-app .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build files
COPY --from=build /app/build /usr/share/nginx/html

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
