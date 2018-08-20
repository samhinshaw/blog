---
layout: post
title: Using Rudaux
date: 2018-08-19
excerpt: How to use rudaux to manage a course with Canvas, JupyterHub, and nbgrader.
heroImage: radio-telescope-bw.jpg
heroColor: '#1F1F1F'
imageAuthor: Galen Crout
imageLink: https://unsplash.com/@galen_crout
---

> This post is focused on the main functions of rudaux and how to implement it in your course's workflow. For a discussion on the motivation behind and development of rudaux, please read my blog post _[Designing Rudaux](designing-rudaux)_.

## What is Rudaux For?

Rudaux was designed to integrate Canvas, JupyterHub, and nbgrader. It was designed to simplify course management, but there are a few operations in particular that would be nearly impossible without rudaux.

- Syncing students and assignments between Canvas and nbgrader.
- Constructing JupyterHub/nbgitpuller links for Canvas.
- Scheduled automated grading of Jupyter notebooks.

<!-- * Find external tool ID in Canvas
* Pull student list from Canvas and sync with nbgrader.
  - Add missing students to nbgrader database
  - Delete students from database that have withdrawn from course.
* Pull assignments from config file.
  - Add assignments to nbgrader database.
* Create student version of assignments with nbgrader assign.
  - Commit these files to the instructors repository & push.
  - Copy the student version to the public student repository.
  - Commit these files to the students repository & push.
* Create assignments in Canvas.
  - Generate urlencoded nbgitpuller links to JupyterHub, referencing the relevant notebook in the public students repository.
* Schedule grading.
  - Add cron jobs to crontab which will initiate autograding at the assignment due date. -->

## Configuration

To allow rudaux to be easily run from a [command-line interface](#command-line-interface), we decided to read configuration options from a file rather than requiring them to be specified at runtime. Please read the [rudaux configuration documentation](https://samhinshaw.github.io/rudaux-docs/config#configuring-rudaux) for a detailed breakdown of the necessary options, including a sample `rudaux_config.py`.

## Classes

Rudaux has two main classes, `Course` and `Assignment`, which lets you perform operations on either the entire course at once, or on each assignment, respectively.

### Course

A `Course` needs a configuration file to be instantiated, and must be pointed to the directory containing the config file.

Note: If no directory is provided, rudaux defaults to the current directory.

```py
from rudaux import Course
dsci100 = Course(course_dir='/path/to/instructors/repository/')
```

Upon instantiation, rudaux performs a few operations:

1. Currently, it is assumed that this is your instructors' repository, and rudaux will therefore perform a `git pull` in this directory upon instantiation.

   If the directory is in a dirty state, rudaux will prompt the user whether they wish to continue. This is important, as rudaux commits to git on your behalf. This prompt can be bypassed with `auto=True`.

2. Rudaux looks for `nbgrader_config.py` and `rudaux_config.py` and reads the options stored therein. If rudaux cannot find either of these files, it will exit. Note: the `c.CourseDirectory.root` configuration option in nbgrader is overridden with the provided `course_dir`.

3. Rudaux looks for a Canvas access token in the user's environment.

4. Rudaux instantiates assignments for each assignment listed in the configuration file.s

### Assignment

The assignment object

<h2 id='command-line-interface'>Command-Line Interface</h2>

Rudaux has a command-line interface (CLI) which allows instructors to perform preconstructed sets of commands in one go.

### Course Initialization

```sh
rudaux init
```

Rudaux init performs a few operations on the course.

1. Interface

```py
course                                   \
  .get_external_tool_id()                \
  .get_students_from_canvas()            \
  .sync_nbgrader()                       \
  .assign(overwrite=args.overwrite)      \
  .create_canvas_assignments()           \
  .schedule_grading()
```

### Grade

```sh
rudaux grade 'homework_1'
```

### Submit

```sh
rudaux submit 'homework_1'
```
