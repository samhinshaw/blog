---
layout: post
title: Encryption Commands for LetsEncrypt
date: 2017-02-09
tags:
- how-to
---


```bash
sudo letsencrypt certonly -a webroot --webroot-path=/home/shinshaw/serve/blog -d blog.samhinshaw.com

sudo nano /etc/nginx/snippets/ssl-blog.samhinshaw.com.conf

ssl_certificate /etc/letsencrypt/live/blog.samhinshaw.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/blog.samhinshaw.com/privkey.pem;
```
