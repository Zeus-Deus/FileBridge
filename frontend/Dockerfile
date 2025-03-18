FROM node:18-alpine as build

WORKDIR /app

# Pass the API token as a build argument
ARG REACT_APP_API_TOKEN
ENV REACT_APP_API_TOKEN=$REACT_APP_API_TOKEN

# Create a basic React app (this will generate a package.json etc.)
RUN npx create-react-app .

# Install Material-UI, icons and JSZip
RUN npm install @mui/material @emotion/react @emotion/styled @mui/icons-material jszip

# Copy your custom source files over the default ones
COPY ./src/ ./src/

# Build the app
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
