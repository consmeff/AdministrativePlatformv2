FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/consmmefadmin /tmp/dist
RUN set -eux; \
	if [ -d /tmp/dist/browser ]; then \
		cp -r /tmp/dist/browser/. /usr/share/nginx/html/; \
	else \
		cp -r /tmp/dist/. /usr/share/nginx/html/; \
	fi; \
	rm -rf /tmp/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]