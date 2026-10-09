# Serves the app as static files, the same way Vercel does. No build step.
FROM nginx:1.27-alpine

COPY index.html styles.css app.js data.js sw.js /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80
