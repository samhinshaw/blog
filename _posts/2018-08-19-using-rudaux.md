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

<!-- <nav class="level">
  <div class="level-item has-text-centered">
    <div>
      <a href='https://samhinshaw.github.io/rudaux-docs/' class='has-text-grey-darker'>
	     <span class="icon is-medium">
	       <i class="fas fa-book fa-lg"></i>
	     </span>
        <p class="heading" >Documentation</p>
      </a>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div>
      <a href='http://github.com/samhinshaw/rudaux' class='has-text-grey-darker'>
	     <span class="icon is-medium">
	       <i class="fab fa-github fa-lg"></i>
	     </span>
        <p class="heading">Source Code</p>
      </a>
    </div>
  </div>
</nav> -->

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

While this function is called initialization, it doubles as an 'update' function, and is designed to be run multiple times throughout the course. For example, if students drop the course, re-running `rudaux init` will sync your gradebook with Canvas. Similarly, if you do not wish to set up an entire term's assignments at the beginning of the term, re-running `rudaux init` will add new assignments to Canvas and schedule them for auto-grading.

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

After [course instantiation](#course-instantiation), rudaux executes the following methods:

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

### Grade an Assignment

This command was designed to be run as scheduled cron job, but can be run manually as well.

```sh
rudaux grade [-m] [-a] [--dir DIRECTORY] 'homework_1'
```

Optional arguments:

<dl>
  <dt><code>--dir DIRECTORY</code></dt>
  <dd>The directory containing configuration files.</dd>
  <dt><code>-a</code></dt>
  <dd>Tell rudaux this is not an interactive shell, do not prompt!</dd>
  <dt><code>-m</code></dt>
  <dd>Manual grading is necessary.</dd>
</dl>

Under the hood this is a bit more complex than course initialization:

The first step is similar to course initialization: rudaux instantiates the course and updates the nbgrader gradebook.

```py
course = Course(course_dir=args.directory, auto=args.auto)

course = course               \
  .get_students_from_canvas() \
  .sync_nbgrader()
```

Next, rudaux finds the assignment from the assignments listed in the configuration&mdash;essentially an array filter with some error handling.

Finally, rudaux collects and grades the assignments. If manual feedback was not indicated, feedback reports are generated and grades are submitted to Canvas.

```py
# collect and grade the assignment
assignment = assignment \
  .collect()            \
  .grade()

# and if no manual feedback is required, generate feedback reports
# and submit grades
if not args.manual:
  assignment    \
    .feedback() \
    .submit()
```

1. `.collect()` collects each student's assignment from the fileserver. If the fileserver has a ZFS snapshot named for that homework, it is assumed that the snapshot was scheduled to be taken at the assignment's due date, and the assignment is copied from that snapshot. Otherwise, the assignment is copied directly from the folder at the due date. Additionally, for each assignment `.collect()` successfully collects, `.collect()` also records a submission in the nbgrader gradebook. This is crucial, as **nbgrader will not assign grades to a student** when autograding an assignment if no submission is recorded for that student.
2. `.grade()` initiates containerized autograding of an assignment. It is important to note that currently, a notebook is executed with the entire instructors repository mounted into the container so that nbgrader has access to the gradebook. This containerization therefore provides limited security, as malicious code could alter grades for any student. However, other benefits of containerization still apply.
3. `.feedback()` generates HTML feedback reports for each student's graded assignment via the nbgrader API. These will be uploaded to Canvas during submission via the File Upload API.
4. `.submit()` submits the each student's grade to the Canvas gradebook. This method does not use the nbgrader gradebook API, as there is no API call to get a student's grade for a given assignment. Instead, rudaux repurposes logic from the nbgrader export function to tabulate a student's grade from the nbgrader gradebook.

### Submit Grades

This command only needs to be run on assignments which require manual feedback. If manual feedback is not necessary, the methods this command executes are already run by `rudaux grade`.

```sh
rudaux submit 'homework_1'
```

This command is almost the same as above, but instead of collecting and grading assignment, it just generates feedback and submits the grades to Canvas:

```py
assignment     \
  .feedback()  \
  .submit()
```
