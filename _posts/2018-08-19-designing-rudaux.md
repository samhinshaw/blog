---
layout: post
title: Designing Rudaux
date: 2018-08-19
excerpt: Canvas and JupyterHub Integration in UBC's Data Science 100.
heroImage: paint-strokes.jpg
heroColor: '#525659'
imageAuthor: Samuel Zeller
imageLink: https://unsplash.com/@samuelzeller
---

<nav class="level">
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
</nav>

> This post is focused on the motivation and design process in building Rudaux. For information on how to use Rudaux to integrate Canvas and JupyterHub, please read _[Using Rudaux](../using-rudaux)_.

<h2 id='motivation'>Motivation</h2>

Rudaux was designed to be an interface for course administration that automates away a lot of the tedious functions that an instructor might otherwise have to perform. These functions are vital to keep the course running smoothly, but take up valuable time and mindshare from the instructor during the semester, when they should be focusing on instruction. Some examples of these tasks include:

- Managing assignments in their learning management system.
- Grading assignments.
- Return grades to students.

For its initial release, Rudaux was designed expressly with the UBC's new Data Science 100 course by [Tiffany Timbers](https://twitter.com/TiffanyTimbers) in mind. Therefore, we had some specific goals in mind which led us to using Canvas with JupyterHub for our teaching platform. This created the need for tools which would leverage Instructure's powerful API for Canvas to automate a great deal of course administration requirements. This automation would allow the instructor to focus on teaching, while maintaining many of the benefits that integration of Canvas & JupyterHub provide to students. In particular, it means Canvas becomes the single web address students need to think about for all of their course needs. From there, they can view their assignments, launch them in JupyterHub, and receive feedback on their graded assignments, all in one place.

## Pieces of the System

- [Canvas](#canvas)
- [GitHub Repositories](#github-repositories)
- [Configuration](#configuration)
- [JupyterHub Servers](#jupyterhub-servers)

<h2 id='canvas'>Canvas</h2>

[Canvas](https://www.canvaslms.com/) was the ideal choice for our Learning Management System (LMS). The University of British Columbia (UBC) is launching its installation of Canvas this fall, and it brings a whole host of features that other LMSs do not offer.

> Insert some stuff about Canvas here

<h3 id='lti-authentication'>LTI Authentication</h3>
<!-- 
<blockquote>
  <p>
    The
    <a href="https://en.wikipedia.org/wiki/Learning_Tools_Interoperability">LTI Authentication protocol</a>
    has some confusing terminology, so I have defined some terms here in a relevant context:
  </p>
  <dl>
    <dt>LTI Consumer:</dt>
    <dd>The service sending the launch request. Usually this will be your LMS. In our case, this refers to Canvas.</dd>
    <dt>LTI Tool Provider:</dt>
    <dd>The service receiving the launch request, and 'providing the service'. In our case this is JupyterHub.</dt>
    <dt>LTI Consumer Key:</dt>
    <dd>A long randomly generated hex string that serves as the first half of our authentication token. This is similar to a username or a public key.</dd>
    <dt>LTI Consumer Secret:</dt>
    <dd>A long randomly generated hex string that serves as the second half of our authentication token. This is similar to a password or a private key.</dd>
    <dt>LTI User ID</dt>
    <dd>An anonymous user ID generated by the LTI consumer.</dd>
  </dl>
</blockquote> -->

To manage access to our JupyterHub server, we are using the [ltiauthenticator module](https://github.com/jupyterhub/ltiauthenticator) for JupyterHub written by Yuvi Panda ([@yuvipanda](https://twitter.com/yuvipanda)). This module receives LTI launch requests from LTI consumers such as Canvas and passes the user's ID to JupyterHub as a username. If the launch request contains a Canvas ID parameter, it uses that as the user's ID. Otherwise, it uses the LTI User ID (see '[Course Privacy](#course-privacy)' for more information).

For more detailed information on setting up LTI authentication between Canvas and JupyterHub, please read the [ltiauthenticator documentation](https://github.com/jupyterhub/ltiauthenticator#canvas).

<h2 id='github-repositories'>GitHub Repositories</h2>

Borrowing from the Master of Data Science Model, and to maximize compatibility with nbgrader, we chose to store all of our course documents in one private GitHub repository, and a subset of these&mdash;the student files in a public repository.

We refer to the first, private repository as our **instructors' repository**. In this repository we have the master copies of the assignments (the `source/` step of nbgrader), which contains the solutions as well as the tests. We also have the `gradebook.db` SQLite database checked-in to version control. We intend to implement a more appropriate solution for managing this in the future, but for the first run of the course, we believe it to be an acceptable solution.

Our second, public repository only contains the student copies of the assignments (the `release/` step of nbgrader). We refer to this as the **students' repository**. Each link we provide in Canvas has a query string attached which triggers nbgitpuller to sync the student's home directory to this repository and redirect them to the assignment's notebook.

<h2 id='jupyterhub-servers'>JupyterHub Servers</h2>

We use two JupyterHub servers to administer DSCI 100. These virtual machines for these servers are provisioned with Terraform, and set up with Ansible. [Ian Allison](https://github.com/ianabc) put in a tremendous amount of work setting up these servers and making their deployments programmatic and reproducible. All of the code for setting up these servers is available in our [infrastructure repository](https://github.ubc.ca/UBC-DSCI/dsc100-infra).

The first Jupyterhub server is dedicated solely to student use. Students log in by clicking on a LTI-enabled link in Canvas, and are authenticated and redirected to the notebook for that assignment. Using [dockerspawner](https://github.com/jupyterhub/dockerspawner), a docker container is spawned for each user, and their home directory is mapped to a folder on a ZFS fileserver. The directory structure of is roughly thus, where `/tank/home` is the mount point of the ZFS fileserver:

```sh
/tank/home
└── dsci100
    ├── canvas-user-id-1
    │   └── student-repo-name
    │       └── materials
    │           ├── assignment1
    │           └── assignment2
    └── canvas-user-id-2
        └── student-repo-name
            └── materials
                ├── assignment1
                └── assignment2
```

By contrast, the grading server is only accessible to the instructor and TAs. This JupyterHub server uses [Shibboleth authentication](<https://en.wikipedia.org/wiki/Shibboleth_(Shibboleth_Consortium)>) for login and access control with UBC credentials. The grading is not done on the same server that students are using, as nbgrader can be quite resource-intensive, and we do not wish to degrade students' experience.

## Rudaux Internals

Rudaux consists of 3 main parts.

1. A `Course` class, which facilitates operations on an entire course.
2. An `Assignment` class, which facilitates operations on individual assignments.
3. A command line interface, which parses common commands and runs the associated python code, without the need for the instructor to write a python script.

Integrated Technologies

- nbgrader
- ltiauthenticator
- nbgitpuller
- jupyterhub
- github

<h2 id='reflections'>Reflections</h2>

I had trouble deciding where some functions belonged. Notably, at first glance the `assign()` function makes most sense in the `Assignment` class. However, I ended up keeping this on the `Course` class, as it required cloning git repositories, a feature I did not wish to duplicate for each assignment.

Another obstacle was where best to store state. I could store state within each class, but it would not be persisted through multiple script calls. Worried about keeping state in sync, for the initial release, I have opted to not persist state, and simply re-fetch fresh information at runtime.

<h2 id='looking-forward'>Looking Forward</h2>

It would be interesting to implement a `Student` class, for operations needing to be done on specific students.

Furthermore, it would be great to contribute some further functionality to the nbgrader API. Where some functionality was lacking, I simply dug into the nbgrader source code and copied the relevant portions into rudaux. However, I would much prefer the