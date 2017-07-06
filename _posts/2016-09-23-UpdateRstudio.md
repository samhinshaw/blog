---
layout: post
title: Automatically Update Rstudio
date: 2016-09-23
tags:
- how-to
---

<img src="/images/rstudio.png" class="fit image">


Information on package downloads were obtained from the [RStudio website](https://support.rstudio.com/hc/en-us/articles/203842428-Getting-the-newest-RStudio-builds), and this automation was prompted by [a question asked by a student on GitHub](https://github.com/STAT545-UBC/Discussion/issues/334).

### Step 1. Write your script

I like to keep my automation scripts in `~/scripts`, but you may have a different personal preference.  In any case, the script I wrote is as follows:
```
echo "Commencing RStudio update on" $(date +"%A %b %d, %Y") at $(date +"%r")
cd /home/shinshaw/Downloads
mkdir rstudio && cd rstudio
wget -O rstudio.deb http://www.rstudio.org/download/latest/preview/desktop/ubuntu64/rstudio-latest-amd64.deb
sudo dpkg -i rstudio.deb
cd /home/shinshaw/Downloads
rm -r rstudio/
```
Notes:

- I am using absolute file paths here to ensure no weirdness occurs when running this script via crontab.
- You can change your `echo` messages to add any other useful information.  If you'd like to check datetime language, run `date --help` in terminal.
- You can change URL in the script to download any version of Rstudio you wish, as per the [RStudio website](https://support.rstudio.com/hc/en-us/articles/203842428-Getting-the-newest-RStudio-builds)!  You can choose from:
	- Release:
		+ stable
		+ preview
		+ daily
	- Installation Type
		+ desktop
		+ server
	- OS
		+ mac
		+ windows
		+ fedora32
		+ fedora64
		+ ubuntu32
		+ ubuntu64

Make sure the script you've saved is executable.  For me, this was:
```
chmod +x ~/scripts/updateRstudio.sh
```

### Step 2. Schedule Script

Next, you'll need to schedule this script to run at a given time.  I've chosen to update my RStudio build at 4am on Sunday morning.  This should make pretty certain that I'm not running into any errors. Now, it is very important that we access the root crontab scheduler, and not your personal crontab scheduler, as we'll be installing packages which requires elevated permissions. In terminal, type:
```
sudo crontab -e
```

This will open crontab in your default text editor, nano for me.  In crontab, add a line such as:
```
00 04 * * 7 /home/shinshaw/scripts/updateRstudio.sh >> /home/shinshaw/scripts/logs/updateRstudio.log 2>&1
```

Let's work through this line:

1. `00 04 * * 7 `
	+ This tells crontab when to run. Check the [crontab manual](http://man7.org/linux/man-pages/man5/crontab.5.html) (or ) for further details.
2. `/home/shinshaw/scripts/updateRstudio.sh`
	+ This tells crontab to execute my script
3. ` >> /home/shinshaw/scripts/logs/updateRstudio.log 2>&1`
	+ This tells crontab to save the stdout of my script to `~/scripts/logs/updateRstudio.log`, and `2>&1` tells it to include stderr as well.
