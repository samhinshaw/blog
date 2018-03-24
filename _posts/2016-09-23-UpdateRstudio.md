---
layout: post
title: Automatically Update Rstudio
date: 2016-09-23
excerpt: How to use Cron to automatically update Rstudio on unix-like systems. 
heroImage: overhead-coffee-mug.jpg
heroColor: '#F2D6BC'
imageAuthor: Jakub Dziubak
imageAuthorHandle: '@jckbck'
---

I like to use the preview or daily versions of RStudio to get access to the latest features. However, unlike the stable version, these versions do not offer the ability to check for updates within the application!

Here, we examine a method for automatically updating any channel of the RStudio IDE using the [Cron task scheduler](https://en.wikipedia.org/wiki/Cron) built into unix-like systems.
Information on package downloads were obtained from the [RStudio website](https://support.rstudio.com/hc/en-us/articles/203842428-Getting-the-newest-RStudio-builds), and this automation was prompted by [a question asked by a student on GitHub](https://github.com/STAT545-UBC/Discussion/issues/334).

### Step 1. Write your script

I like to keep my automation scripts in `~/scripts`, but you may have a different personal preference.  In any case, the script I wrote is as follows:

```bash
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
	- Release Channel
		+ stable
		+ preview
		+ daily
	- Installation Type
		+ desktop
		+ server
	- Operating System
		+ mac
		+ windows
		+ fedora32
		+ fedora64
		+ ubuntu32
		+ ubuntu64

Make sure the script you've saved is executable.

```bash
chmod +x ~/scripts/updateRstudio.sh
```

### Step 2. Schedule Script

Next, you'll need to schedule this script to run at a given time.  I've chosen to update my RStudio build at 4am on Sunday morning.  This should make pretty certain that I don't encounter any conflicts.

Cron is managed with a configuration file known as the crontab, and each user has their own copy. In implementing our automation it is necessary that we access the root crontab, and not a user crontab, as we'll be installing packages which requires elevated permissions. In terminal, type:

```bash
sudo crontab -e
```

This will open the root crontab in your default text editor.  Note: to [change your default text editor](https://superuser.com/questions/281617/change-default-text-editor-for-crontab-to-vim), set the EDITOR and VISUAL environment variables to your editor of choice in your shell login file. In crontab, add a line such as:

```bash
00 04 * * 7 /home/shinshaw/scripts/updateRstudio.sh >> /home/shinshaw/scripts/logs/updateRstudio.log 2>&1
```

Let's work through this line:

1. `00 04 * * 7 ` tells Cron when to run. Check the [crontab manual](http://man7.org/linux/man-pages/man5/crontab.5.html) for further details.
2. `/home/shinshaw/scripts/updateRstudio.sh` tells Cron to execute my script
3. `>>` tells Cron to append the stdout of my script to `/home/shinshaw/scripts/logs/updateRstudio.log`
4. `2>&1` tells Cron to include stderr as well.
