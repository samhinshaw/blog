---
layout: post
title: Dynamic Loading of R Packages in Shiny
date: 2017-10-20
excerpt: Dynamic Loading of R Packages in Shiny with JavaScript event handling.
draft: true
---

## Introduction

Shiny is an incredible tool for quickly building user interfaces around R programs. However, R can be a slow language, and this is particularly noticeable when loading R packages into memory. 

In Shiny, R packages are loaded during app initialization, which occurs before first paint, as the UI is actually rendered from R. This leads to poor UX, because package loads are extremely penalizing. However, if you are simply loading packages for data manipulation, there is no reason to block page rendering with your package loads. 

Unfortunately, Shiny does not have the luxury of non-blocking, asynchronous calls. Ideally, penalizing package loads would be accomplished with an async call to load R packages while the user can interact with the main process, however, R (and by extension, Shiny) is single-threaded, and all calls block the main process. 

However, we can still improve user experience by allowing partial render before we load our R packages which do not affect the UI. Here I will present one solution for on-demand loading of R packages.

## Implementation

### Visual Cues

In my app, I have decided to have a landing page with a large hero including a "Get Started" button. This presents a simple opportunity to inform users we are still loading. 

<center>
  <button class="button is-large is-primary" disabled id="getStarted" title="Let's Go!" type="button">
    <i class="fa fa-circle-o-notch fa fa-spin"></i>
    <span>&nbsp;Loading R Packages...</span>
  </button>
</center>
<br>

HTML Markup with Bootstrap:
```html
<button class="btn btn-default btn-lg disabled" id="getStarted" title="Let's Go!" type="button">
  <i class="fa fa-circle-o-notch fa fa-spin"></i>
   <span> Loading R Packages...</span>
</button>
``` 

The corresponding Shiny element is a bit more complex, as you need to use the `icon()` function: 
```r
actionButton(
  inputId = "getStarted", 
  label   = "Loading R Packages...",
  class   = "btn-primary btn-lg disabled", # css-tooltip
  title   = "Let's Go!",
  icon(
    name  = "circle-o-notch", 
    class = "fa fa-spin", 
    lib   = "font-awesome"
  )
)
```

### Data Transfer from JavaScript to R

You can call the `onInputChange()` method on the global `Shiny` object to pass any object from JavaScript to Shiny, which will get turned into an R list upon receipt. This method  is designed to fire when a given JavaScript object changes. However, we can use our own event listeners to fire off a set value at our own discretion. 

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

In JavaScript, one of the most common events to listen for is `DOMContentLoaded`, to fire JavaScript events that depend on the DOM. However, here we are depending on our Shiny session to be loaded, we must listen for the `shiny:sessioninitialized` event. This is most easily accomplished in JQuery:

```js
$(document).on('shiny:sessioninitialized', () => {
  // here we will simply pass 1
  handlers.lazyLoadPackages(1);
});
```

**Note:** You could fire on any event you want. For example, you could listen for a link hover and preemptively load the requisite R packages a user would need if they clicked that link. 

### Receive JS Event & Load Packages

Now, in our Shiny App, we have to receive this value! Fortunately, `.onInputChange()` creates our input for us, so we can simply wait for the input to be sent:
```r
observeEvent(input$sessionInitialized, {
  # Load packages here
  library(tidyverse)
}, ignoreNULL = TRUE, ignoreInit = TRUE, once = TRUE)
```
Here we are ignoring the initialized input, any NULL values, ensuring the event only fires once. 

**Disclaimer**: Be very careful when deciding which packages to delay loading. If you have any third party UI elements in your ui.R file, you can break rendering. The workaround is to render any third party UI with a delayed renderUI call. 

### Let the User Know!

Finally, we need to fire an event in our client-side JavaScript to inform users  

This is incredibly simple thanks to Dean Attali's ShinyJS package, which lets you execute JavaScript directly from R. 
```r
observeEvent(input$sessionInitialized, {
  library(tidyverse)
  runjs('handlers.initGetStarted();')
}, ignoreNULL = TRUE, ignoreInit = TRUE, once = TRUE)
```

And what is `.initGetStarted();`? This will be more specific to your use-case, but for my loading button, I needed to:  

- Change the button's text
- Removing the loading spinner
- Enable the button
- Enable my CSS tooltip

Thanks to HTML5, this is just some simple native JS. 
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

<br>
<center>
  <button class="button is-large is-primary" id="getStarted" title="Let's Go!" type="button">
    <span>Get Started</span>
  </button>
</center>
<br>