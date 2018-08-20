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

Rudaux was designed to integrate Canvas, JupyterHub, and nbgrader. It was designed to simplify course management generally, but there are a few operations in particular that would be nearly impossible without rudaux.

- Syncing students and assignments between Canvas and nbgrader.
- Constructing JupyterHub/nbgitpuller links for Canvas.
- Scheduled automated grading of Jupyter notebooks.

## Where Should I Run Rudaux?

One of rudaux's best features is its ability to schedule automatic grading of assignments. However, because of this, it is assumed that you will be executing these commands from your [grading server](designing-rudaux#grading-server) in a JupyterHub terminal. However, if you are not scheduling automated grading, you can run rudaux from wherever you wish! This gives you more flexibility in setting up access tokens and ssh keys.

## Configuration

To allow rudaux to be easily run from a [command-line interface](#command-line-interface) (CLI), we decided to read configuration options from a file rather than requiring them to be specified at runtime. Please read the [rudaux configuration documentation](https://samhinshaw.github.io/rudaux-docs/config#configuring-rudaux) for a detailed breakdown of the necessary options, including a sample `rudaux_config.py`.

## Classes

Rudaux has two main classes, `Course` and `Assignment`, which lets you perform operations on either the entire course at once, or on each assignment, respectively.

### Course

A `Course` needs a configuration file to be instantiated, and therefore must be pointed to the directory containing the config file.

_Note_: `course_dir` defaults to the current working directory.

```py
from rudaux import Course
dsci100 = Course(course_dir='/path/to/instructors/repository/')
```

<h4 id='course-instantiation'>Instantiation</h4>

Upon instantiation, rudaux performs a few operations:

1. Currently, it is assumed that the working directory (or, if provided, the `course_dir`) is your instructors' repository. Rudaux will therefore perform a `git pull` in this directory upon instantiation.

   _Note_: If the directory is in a dirty state, rudaux will prompt the user whether they wish to continue. This is important, as rudaux will commit changes and push to your tracked remote on your behalf. This prompt can be bypassed with `auto=True`.

2. Rudaux looks for `nbgrader_config.py` and `rudaux_config.py` and reads the options stored therein.

   _Note_: `course_dir` overrides `c.CourseDirectory.root` (an nbgrader option).

3. Rudaux looks for a Canvas access token in the user's environment.

4. Rudaux instantiates assignments for each assignment listed in the configuration file.

### Assignment

An assignment must be instantiated or subclassed with a `Course` object to have access to the course configuration options:

```py
homework_1 = DataScienceAssignment('homework_1', course=dsci100)
```

```py
class DataScienceAssignment(Assignment):
  course = dsci100

homework_1 = DataScienceAssignment('homework_1')
```

The latter method is more memory efficient, but I do not imagine there is an appreciable impact on the modern computer.

<h4 id='assignment-instantiation'>Instantiation</h4>

Upon instantiation, an Assignment's only action is to convert the due date/time into the system date/time.

<h2 id='command-line-interface'>Command-Line Interface</h2>

Rudaux has a command-line interface which allows instructors to perform preconstructed sets of commands in one go.

### Course Initialization

```sh
rudaux init
```

Under the hood, this performs a few operations:

```py
course = Course(course_dir=args.directory, auto=args.auto)

course                                   \
  .get_external_tool_id()                \
  .get_students_from_canvas()            \
  .sync_nbgrader()                       \
  .assign(overwrite=args.overwrite)      \
  .create_canvas_assignments()           \
  .schedule_grading()
```

After [course instantiation](#course-instantiation), rudaux executes the following functions:

1. `.get_external_tool_id()` queries the Canvas API to find the id of the external tool by the name provided within rudaux_config. As discussed in the [rudaux configuration documentation](https://samhinshaw.github.io/rudaux-docs/config#configuring-rudaux), this is necessary to link your LTI launch keys to assignment links created in Canvas.
2. `.get_students_from_canvas()` queries the Canvas API for your student list.
3. `.sync_nbgrader()` syncs student and assignment lists with nbgrader:
   - Add students into nbgrader gradebook that are present in Canvas.
   - Remove students from nbgrader gradebook that are not present in Canvas (likely withdrew from course).
   - Add assignments to gradebook which are present in config, but not in gradebook.
   - Remove assignments from gradebook which are no longer present in config.
4. `.assign()` assigns all assignments specified in the course config. This essentially runs `nbgrader assign` on each assignment, creating the student 'release' version from the instructor's master 'source'. However, there are some key activities to take note of:

   - The students' repo is cloned to a temporary directory.
   - The released assignments are committed to the instructors' repo, and pushed to the tracked remote.
   - The released assignments are copied the the students release directory. These changes then committed and pushed to the tracked remote.

   _Note_: `rudaux init -o` passes `overwrite=True` to this step, bypassing warnings about overwriting preexisting temporary directories.

5. `.create_canvas_assignments()` creates an assignment in Canvas for each assignment listed in the configuration file.
   - An nbgitpuller link pointing to the release version of the assignment in the students' repo is generated for each assignment.
   - The due date specified in the config file is set.
   - The number of points specified in the config file is set.
6. `.schedule_grading()` schedules a cron job for nbgrader autograding at the assignment's due date.

### Grade

```sh
rudaux grade 'homework_1'
```

### Submit

```sh
rudaux submit 'homework_1'
```
