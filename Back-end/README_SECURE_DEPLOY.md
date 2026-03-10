# Secure Deploy Notes

## Env
- ACCESS_TOKEN, REFRESH_TOKEN, CONNECTION_STRING, KAFKA_BROKERS

## Start with Cluster
`node cluster.js`

## Nginx (sample)
```
upstream tasty_kitchen {
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
}
server {
  listen 80;
  server_name your-domain;
  location / {
    proxy_pass http://tasty_kitchen;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

## Passport OAuth (plan)
- Use passport-google-oauth20/passport-github2
- On callback: issue Access/Refresh cookies via authController

