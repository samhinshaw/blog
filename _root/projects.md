---
title: Projects
template: page
heroColor: '#d7c079'
heroImage: lions-gate.jpg
heroText: Projects
---

<div class="columns is-desktop">
  <div class="column is-8 is-offset-2">

<h3 class="is-size-3">Professional Projects</h2>

---

<h4 class="is-size-4">
  <span>Rudaux</span>
  <span class="icon social-github">
    &nbsp;
    <a class="icon" href="https://github.com/samhinshaw/rudaux">
      <i class="social fab fa-github"></i>
    </a>
  </span>
</h4>

Rudaux is a Python module which provides automated administration for a course taught with [JupyterHub](https://github.com/jupyterhub/jupyterhub) (a multi-user Jupyter notebook server) and the [Canvas Learning Management System](https://github.com/instructure/canvas-lms).

The motivation for Rudaux is to reduce the setup burden on students and instructors so that both parties can focus on the course material. Rudaux orchestrates a system wherein students can click an assignment in the Canvas LMS which will authenticate them and send them straight to a Jupyter notebook in the browser. Their progress is saved on the course server as they go. Additionally, autograding (with [nbgrader](https://github.com/jupyter/nbgrader/)) is initiated for each assignment at its due date, sending the students' grades back to Canvas.

**Concepts demonstrated**

- Object-oriented programming with Python classes
- Writing modular, testable code
- Data management and transfer through multiple systems:
  - JupyterHub (ZFS fileserver)
  - nbgrader (SQLite database)
  - Canvas (REST API)
- Evaluation of client needs
- Learning quickly while staying on a project schedule

<h4 class="is-size-4">
  <a href="https://www.metabridge.org">MetaBridge</a>
  <span class="icon social-github">
    &nbsp;
    <a class="icon" href="https://github.com/samhinshaw/metabridge_shiny">
      <i class="social fab fa-github"></i>
    </a>
  </span>
</h4>

A systems biology-based integrative analysis platform for integration of metabolomics data. Built in [Shiny](https://shiny.rstudio.com/), this application allows users to upload a list of metabolites and get back a list of directly interacting enzymes and the genes that encode for those enzymes. Currently the only supported species is _Homo sapiens_. Some planned features include:

- R package of MetaBridge, implementing all of the methods used here for use in scripted analyses.

_NOTE: MetaBridge is hosted on Canadian soil at The University of British Columbia. No data uploaded to the server is saved._

<h4 class="is-size-4">
  <a href="https://www.metabridge.org/dev">MetaBridge 2.0</a>
  (In Development)
  <span class="icon social-github">
    &nbsp;
    <a class="icon" href="https://github.com/samhinshaw/metabridge_node">
      <i class="social fab fa-github"></i>
    </a>
  </span>
</h4>

MetaBridge 2.0 is a ground-up rewrite of MetaBridge. Written in React with Next.js, MetaBridge 2.0 will a scalable, performant version of the proof-of-concept application MetaBridge. As I write MetaBridge 2.0, you are welcome to follow its development! I am working as quickly as possible to reach feature parity with MetaBridge. From there, some planned features include:

- User session management. Save your current analysis, and reupload it at any time to pick up where you left off! This is intended to help users share their work, and remove some of the downsides of working with web tools.
- Public API for use in scripted analyses.

_NOTE: MetaBridge 2.0 is hosted on Canadian soil at The University of British Columbia. No uploaded data is retained on the server, and users can purge their uploaded data manually._

**Concepts demonstrated**

- Client-side rendering with React
- Server-side rendering and code-splitting with Next.js
- Server routing with Node.js
- <del>PostgreSQL for data storage</del> (not yet implemented)
- <del>GraphQL server & querying with Apollo</del> (not yet implemented)

## Personal Projects

---

<h3 class="is-size=3">
  <a href="https://get-fit.xyz">Get Fit</a>
  <span class="icon social-github">
    &nbsp;
    <a class="icon" href="https://github.com/samhinshaw/get_fit">
      <i class="social fab fa-github"></i>
    </a>
  </span>
</h3>

Get Fit is a fitness-tracking app to help with the difficulty of delayed gratification! We all know it's hard to stick to a workout schedule or a diet, but why? Humans are terrible at reasoning when it comes to delayed gratification, we always want everything now!! That's why I built this web app--to help tie long-term fitness goals to near-term rewards! Keep track of your diet and exercise and earn points towards short-term goals! It might take you a while to reach your ultimate goal, but you'll have fun along the way, and hopefully Get Fit will make it just a bit easier to not eat that tempting donut!

**Concepts demonstrated**

- Node.js server with and server routing Express
- Data visualization with D3.js
- Local user authentication with passport.js
- Secure password storage with bcryptjs
- Session management with cookies
- Email registration and validation with nodemailer
- User data storage and retrieval with MongoDB and Mongoose ODM
- Server-side logging in Node.js with Winston
- Client-side logging with Rollbar
- Client side DOM manipulation with vanilla JS and JQuery
- Webpack for client-side dependency management and code bundling
- Babel transpiling on client and server to enable ESNext features
- Asynchronous programming and routing with async/await and Promises
- Security-conscious sever with Snyk
- Deployment pipeline and server management with PM2
- Sass styling with Bulma
- View templating with Pug
- JavaScript-Python integration with PythonShell and PyMongo
- Server-side datetime handling with Moment.js
- Lightweight client-side datetime handling with date-fns
- Client-server timezone synchronization
- Code linting enforcement with ESLint
- Code style enforcement with Prettier
- Bruteforce prevention
- User input sanitization and validation
- Self-hosted webserver with Nginx on Vultr (a Virtual Private Server provider)

<h3 class="is-size=3">
  <a href="https://samhinshaw.com">This Website!</a>
  <span class="icon social-github">
    &nbsp;
    <a class="icon" href="https://github.com/samhinshaw/blog">
      <i class="social fab fa-github"></i>
    </a>
  </span>
</h3>

This website is a static site generated with [reptar](https://reptar.github.io)!

**Concepts demonstrated**

- Webpage templating with EJS
- Flexbox CSS with Bulma
- Client side DOM manipulation with vanilla JS and JQuery
- Self-hosted webserver with Nginx on Vultr (a Virtual Private Server provider)

<h3 class="is-size-3" id="open-source">
  Open-Source Contributions
</h3>

---

### [python-myfitnesspal](https://github.com/coddingtonbear/python-myfitnesspal/commits?author=samhinshaw)

An open API for MyFitnessPal written in Python. I have contributed:

- The ability to pull exercise data from public and authenticated MyFitnessPal profiles.
- The ability to determine when a diary entry has been marked as completed.
- Tests to validate API stability.

### [refined-twitter](https://github.com/sindresorhus/refined-twitter/commits?author=samhinshaw)

A Browser extension that simplifies the Twitter interface and adds useful features. I have contributed:

- Syntax highlighting in code snippets for the R programming language.

    </div>
  </div>
