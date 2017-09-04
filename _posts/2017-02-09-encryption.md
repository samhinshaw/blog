---
layout: post
title: Encryption Commands for LetsEncrypt
date: 2017-02-09
excerpt: How to setup a LetsEncrypt HTTPS certificate on your webserver
draft: true
---

So you want to add an HTTPS certificate to your website? With [Let's Encrypt](https://letsencrypt.org/), it's easy!

These commands are specific to an nginx server. Let's say your site's domain is `example.com`, and is being served from `~/serve/blog`.

```bash
sudo letsencrypt certonly -a webroot --webroot-path=/home/user/serve/blog -d example.com

sudo nano /etc/nginx/snippets/ssl-example.com.conf

ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```
