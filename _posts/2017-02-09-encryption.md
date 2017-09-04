---
layout: post
title: Encryption Commands for LetsEncrypt
date: 2017-02-09
excerpt: How to setup a LetsEncrypt HTTPS certificate on your webserver.
---

```bash
sudo letsencrypt certonly -a webroot --webroot-path=<web/server/directory> -d <domain-name>

sudo nano /etc/nginx/snippets/ssl-blog.samhinshaw.com.conf

ssl_certificate /etc/letsencrypt/live/blog.samhinshaw.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/blog.samhinshaw.com/privkey.pem;
```
