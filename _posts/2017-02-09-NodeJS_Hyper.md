---
layout: post
title: How to Install NodeJS & Hyper
date: 2017-02-09
tags:
- how-to
---

## NodeJS

For the current NodeJS LTS:
1. Use Setup Script: `curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`
2. apt-get: `sudo apt-get install -y nodejs`

For the latest v7:
1. Use Setup Script: `curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -`
2. apt-get: `sudo apt-get install -y nodejs`


## Hyper

For current release:
1. Download deb - `wget https://hyper-updates.now.sh/download/linux_deb`
2. `sudo dpkg -i hyper.deb`

To build dev version from source:
1. Clone dev repo from github `git clone https://github.com/zeit/hyper.git`
2. Install linux dependencies: `sudo apt-get install icnsutils graphicsmagick xz-utils rpm`
3. Install node dependencies `cd hyper && npm install`
4. Test build:
	+ `npm run dev`
	+ In separate process `cd hyper && npm run app`
5. If all is working, generate binaries `npm run dist`
6. Install packaged binaries `cd dist && sudo dpkg -i hyper.deb`
7. Create symlink to /usr/bin `sudo ln -s /opt/Hyper/hyper /usr/bin/hyper`
