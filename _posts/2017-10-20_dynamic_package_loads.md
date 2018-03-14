---
layout: post
title: Lazy Loading R Packages in Shiny
date: 2017-10-20
excerpt: Lazy Loading of R Packages in Shiny via JavaScript event handling.
draft: false
---

## Introduction

Shiny is a powerful framework for quickly building user interfaces around R programs. However, [R is not a fast language](http://adv-r.had.co.nz/Performance.html), and this is particularly noticeable when loading R packages into memory. 

In Shiny, R packages are loaded during app initialization. Unfortunately, this occurs before [first paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint), as the app's UI is actually rendered from R. This leads to poor UX, because package loads are extremely penalizing. However, if you are simply loading packages for data manipulation, there is no reason to block initial page rendering with your package loads. 

Unfortunately, Shiny does not have the luxury of [non-blocking, asynchronous calls](https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/). However, we can still improve user experience by loading our packages that do not affect UI _after_ first paint.

Here I will present one solution for lazy-loading packages in Shiny.

## Implementation

### Visual Cues

In my app, my landing page has a large hero with a "Get Started" button. This presents a simple opportunity to inform users we are still loading. 

<center>
  <button class="button is-large is-primary" disabled id="getStarted" title="Let's Go!" type="button">
    <i class="fas fa-circle-notch fa-spin"></i>
    <span>&nbsp;Loading R Packages...</span>
  </button>
</center>
<br>

HTML Markup with <span class="hover-text" title="This button will appear slightly differently in bootstrap--I am using the Bulma CSS framework on my blog.">Bootstrap</span>:
```html
<button class="btn btn-default btn-lg disabled" id="getStarted" title="Let's Go!" type="button">
  <i class="fas fa-circle-notch fa-spin"></i>
   <span>&nbsp;Loading R Packages...</span>
</button>
``` 

The corresponding Shiny element is a bit more complex, as you need to use the `icon()` function. You may also need to add padding between your icon & button span with CSS rather than markup.
```r
actionButton(
  inputId = "getStarted", 
  label   = "Loading R Packages...",
  class   = "btn-primary btn-lg disabled", # css-tooltip
  title   = "Let's Go!",
  icon(
    name  = "circle-notch", 
    class = "fa-spin", 
    lib   = "font-awesome"
  )
)
```

### Data Transfer from JavaScript to R

In your client-side JavaScript, you can call the `onInputChange()` method on the global `Shiny` object to pass any object from JavaScript to Shiny. Shiny will then pass this object into R as a (nested) list. This method is designed to fire when a given JavaScript object changes. However, we can create our own event listeners to fire off a set value at our own discretion. 

In this case, we will simply be sending any non-null value: 
```js
const handlers = {
  lazyLoadPackages: val => {
    // First argument is input name in R
    // Second argument is value to send (or to depend on)
    Shiny.onInputChange('sessionInitialized', val);
  }
}
```

In JavaScript, one of the most common times to fire events is on completion of DOM loading (in JQuery, `$( document ).ready()` or as of HTML5, `DOMContentLoaded`). However, here we are depending on our Shiny session initialization. This is most easily accomplished in JQuery:

```js
$( document ).on('shiny:sessioninitialized', () => {
  // here we will simply pass 1
  handlers.lazyLoadPackages(1);
});
```

**Note:** You could fire on any event you want. For example, you could listen for a link hover and preemptively load the requisite R packages a user would need if they clicked that link. 

### Receive Client-Side Event & Load Packages

Now, in our Shiny App, we have to receive this value! Fortunately, `.onInputChange()` creates our Shiny input for us, so we can simply wait for the input to be sent:
```r
observeEvent(input$sessionInitialized, {
  # Lazy-load packages here
  library(tidyverse)
}, ignoreNULL = TRUE, ignoreInit = TRUE, once = TRUE)
```
Here we are ignoring the initialized input, any NULL values, and ensuring the event only fires once. 

**Disclaimer**: Be very careful when deciding which packages to delay loading. If you have any third party UI elements in your ui.R file, you can break rendering. One possible workaround for this is to render any third party UI elements with a delayed `renderUI()`. 

### Let the User Know!

Finally, we need to fire an event in our client-side JavaScript to inform users that the Shiny app has completed initialization. 

This is rather straightforward thanks to Dean Attali's ShinyJS package, which allows for JavaScript execution directly from R. 
```r
observeEvent(input$sessionInitialized, {
  library(tidyverse)
  runjs('handlers.initGetStarted();')
}, ignoreNULL = TRUE, ignoreInit = TRUE, once = TRUE)
```

But hang on, what is `.initGetStarted();`? This will be more specific to your use-case, but for my loading button, I needed to:  

- Change the button's text
- Removing the loading spinner
- Enable the button
- Enable my CSS tooltip

Thanks to HTML5's `classList()`, this is just some native JS. 
```js
{
  initGetStarted: () => {
    const getStartedButton = document.getElementById('getStarted');
    // change innerHTML
    getStartedButton.innerHTML = 'Get Started';
    // remove disabled class
    getStartedButton.classList.remove('disabled');
    // add css-tooltip class
    getStartedButton.classList.add('css-tooltip');
  }
}
```

And that's it! You're done! Your button will transform:

<center>
  <button class="button is-large is-primary" disabled id="getStarted" title="Let's Go!" type="button">
    <i class="fas fa-circle-notch fa-spin"></i>
    <span>&nbsp;Loading R Packages...</span>
  </button>
</center>
<br>
<center>
  <span class="icon is-large">
    <i class="fas fa-2x fa-arrow-down"></i>
  </span>
</center>
<br>
<center>
  <button class="button is-large is-primary" id="getStarted" title="Let's Go!" type="button">
    <span>Get Started</span>
  </button>
</center>
<br>