---
layout: post
title: Ligature Support in Monospace Fonts
date: 2017-09-13
excerpt: Implementing ligature-supported monospace fonts across multiple platforms
---

<div class="has-text-centered">

```r
'ligatures' != 'symbols'
```

</div>

## Background

What a busy week! On Monday, I started using Visual Studio Code, replacing my previous text editor of choice, Atom. As it turns out, Wes Bos of the [Syntax Podcast](https://syntax.fm/) ([@WesBos](https://twitter.com/wesbos)) is doing the same right now. I learned about <span class="hover-text" title="from Latin: ligatus, 'bound'">ligature</span> implementation in programming fonts [via his twitter](https://twitter.com/kiliman/status/907709797193134082) yesterday. Then today, I saw a [blog post](https://blog.rstudio.com/2017/09/13/rstudio-v1.1---the-little-things/) about some of the smaller features implemented in RStudio 1.1, and, of course, ligature support was added! 

Perhaps the most compelling reasons for me to check this out was the beautiful new assignment operator in R.
```r
variable <- value
```

You may already know about ligatures and not even know it.  One classic example is implemented in Microsoft Word&mdash;the em dash. If you're wondering what it looks like, that was it right there! "&mdash;". All you have to do to use it is type two hypens between words and MSWord will autocomplete for you. Ligature support in modern code editors is as simple as that, but you're getting a lot more bang for your buck!

I found a fantastic [blog post by Scott Hanselman](https://www.hanselman.com/blog/MonospacedProgrammingFontsWithLigatures.aspx) detailing some of his findings. He links to three popular monospace fonts with ligature support, and I decided to go with the most popular, Fira Code. Fira Code is based on [Fira Mono](https://fonts.google.com/specimen/Fira+Mono), a font designed for Mozilla for the now-defunct FirefoxOS. 😕

Without any further ado, let's get to the **how**. 

## Installation

### System Applications

Clone the [Fira Code Repository](https://github.com/tonsky/FiraCode) and install the fonts per your OS:  
- Font Book (macOS)
- Fonts (Windows) 
- Font Viewer (GNOME Desktop Linux)

#### RStudio

First make sure you have version 1.1.x of RStudio installed. As of this writing, you must be on the [Preview](https://www.rstudio.com/products/rstudio/download/preview/) (really quite stable) or more experimental [Nightly](https://dailies.rstudio.com/) builds.  

Then set the default font to FiraCode and you're good to go!

#### VSCode

Open settings and add the following lines
```js
  // Enable ligature support
  "editor.fontLigatures": true,
  // Choose one:
  // for regular font:
  "editor.fontFamily": "Fira Code",
  // Specific styles may need alternate syntax
  // "editor.fontFamily": "FiraCode-Retina"
  // or
  // "editor.fontFamily": "Fira Code Retina"
```

#### Terminal 

I use Hyper as my terminal emulator for exactly this situation! I love being able to customize my terminal with ease.

In your `~/.hyper.js` config file, add:
```js
fontFamily: '"FiraCode-Retina", "Fira Code"',

// Install the hyper-ligatures plugin to 
// enable ligature support within Hyper
plugins: [
    'hyper-ligatures'
]
```

### Web

For web, you can use the WOFF2 webfont files. In your site's CSS, simply add:

```css
/* Make pre tags use Fira Code and use ligatures */

@font-face {
  /* Name your font */
  font-family: 'Fira Code';
  /* Link to your font files here! */
  src: url(../fonts/FiraCode-Regular.woff2);
}

code {
  /* Recognize that name? */
  font-family: 'Fira Code' /* fallback fonts */;
  /* enable ligatures with CSS3 */
  font-variant-ligatures: common-ligatures;
}
```

## Conclusion

That was it! You're done! For the moment, I'm enjoying ligatures due to their aesthetic, but I am curious if I will run into issues in the future with difficulty distinguishing between different operators. Specifically, in JavaScript, the difference between `==` and `===` can be <span class="hover-text" title="the double equals operator performs type-coercion, triple equals does not.">code-breaking</span>. But for now, I'm just going to enjoy!

For more comprehensive installation instructions and troubleshooting, check out the [Fira Code Wiki on GitHub](https://github.com/tonsky/FiraCode/wiki). 

Let me know what you think on [twitter](https://twitter.com/samhinshaw)!

*****

## Further Reading

[Fira Code - Wiki](https://github.com/tonsky/FiraCode/wiki)

[Wikipedia - Typographic Ligature](https://en.wikipedia.org/wiki/Typographic_ligature)

[Smashing Magazine - Typographic Etiquette](https://www.smashingmagazine.com/2011/08/mind-your-en-and-em-dashes-typographic-etiquette/)