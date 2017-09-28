---
layout: post
title: Wrapping Template Literals in VS Code
date: 2017-09-28
excerpt: How to get VS Code to wrap your template literals, not replace them.
draft: false
---

## Intro

Recently, I have been frustrated with VS Code not respecting ES6 template literals when constructing strings. 

Say you want turn a particular chunk of code into a string. Normally, you would highlight the text and type `'`. The highlighted text will automatically be surrounded by single quotes! However, if you attempt this with a backtick (`` ` ``), the entire text is replaced by a backtick (as you would expect with any other character). My main frustration is that this highlight-quoting works with backticks in markdown documents, but not JS files!

I decided to figure out how to get around this. First, I found an issue discussing the original implementation in markdown highlighting in the [vscode repository](https://github.com/Microsoft/vscode/issues/1307). This pointed me towards the [markdown language configuration options](https://github.com/Microsoft/vscode/blob/master/extensions/markdown/language-configuration.json). 

## Method 1: Language Configuration

If you would like to have any of these options apply to languages other than markdown, you can copy the markdown preferences! Open your language configuration preferences file via the command palette (&#8984;+&#8679;+P, 'Preferences: Configure Language Specific Settings...') and choose JavaScript. Then edit the line within the "[javascript]" field that gets created in your `settings.json` so yours looks something like this:

```js
  "[javascript]": {
    "surroundingPairs": ["`", "`"]]
  }
```

Voila! You are all good to go! You can update this for any language you would like.

## Method 2: Keybinding

If, instead, you wanted to be able to do this for any language with a keybind, the docs for vscode show you [how to implement and keybind your own snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets). 

The snippet below is what I came up with. 

```json
  {
    "key": "cmd+k `",
    "command": "editor.action.insertSnippet",
    "when": "editorTextFocus",
    "args": {
      "snippet": "`${1:${TM_SELECTED_TEXT}}`$0"
    }
  }
```

Open your keybindings file via the command palette (&#8984;+&#8679;+P, 'Preferences: Open Keyboard Shortcuts File') and paste this object at the end of your keybindings.json file. 

Whenever you want to surround some text with backticks, highlight the text and hit &#8984;+K and then \`. 
