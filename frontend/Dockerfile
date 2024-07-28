FROM node:latest as build
ARG VITE_GOOGLE_MAPS_API
ARG VITE_CLIENT_ID
ARG VITE_CLIENT_SECRET
ARG VITE_REDIRECT_URL

ENV VITE_GOOGLE_MAPS_API=$VITE_GOOGLE_MAPS_API
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_CLIENT_SECRET=$VITE_CLIENT_SECRET
ENV VITE_REDIRECT_URL=$VITE_REDIRECT_URL

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
COPY . ./
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]