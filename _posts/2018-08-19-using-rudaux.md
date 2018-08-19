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

> For a lengthier discussion on the motivation behind development of Rudaux, please read my blog post _[Developing Rudaux](designing-rudaux)_.

Rudaux was designed to integrate Canvas, JupyterHub, and nbgrader, and is designed with a few key operations in mind:

- Find external tool ID in Canvas
- Pull student list from Canvas and sync with nbgrader.
  - Add missing students to nbgrader database
  - Delete students from database that have withdrawn from course.
- Pull assignments from config file.
  - Add assignments to nbgrader database.
- Create student version of assignments with nbgrader assign.
  - Commit these files to the instructors repository & push.
  - Copy the student version to the public student repository.
  - Commit these files to the students repository & push.
- Create assignments in Canvas.
  - Generate urlencoded nbgitpuller links to JupyterHub, referencing the relevant notebook in the public students repository.
- Schedule grading.
  - Add cron jobs to crontab which will initiate autograding at the assignment due date.

## Table of Contents

1. Classes
2. High-level interface (CLI)

## Classes

```py
from rudaux import Course, Assignment
```

### Course

```py
dsci100 = Course('~/dsci100-instructors')
```

### Assignment

```py
class DataScienceAssignment(Assignment):
  course = dsci100

homework_1 = DataScienceAssignment('homework_1')
```

Similarly:

```py
homework_1 = DataScienceAssignment('homework_1', course=dsci100)
```

## High-level Interface (CLI)

### Initialize

```sh
rudaux init
```

### Grade

```sh
rudaux grade 'homework_1'
```

```py
course                                   \
  .get_external_tool_id()                \
  .get_students_from_canvas()            \
  .sync_nbgrader()                       \
  .assign(overwrite=args.overwrite)      \
  .create_canvas_assignments()           \
  .schedule_grading()
```

### Submit

```sh
rudaux submit 'homework_1'
```
