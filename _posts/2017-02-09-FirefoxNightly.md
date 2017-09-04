---
layout: post
title: How to Install Firefox Nightly
date: 2017-02-09
draft: true
---


1. Untar/unzip: `cd ~/Downloads/ && tar xjf firefox-51.0.tar.bz2`
2. Remove old firefox directory `sudo rm -r /opt/firefox`
3. Move new firefox installation to /opt `sudo mv firefox /opt/firefox`
4. Create symlink for binary in /usr/bin: `sudo ln -s /opt/firefox/firefox /usr/bin/firefox`
