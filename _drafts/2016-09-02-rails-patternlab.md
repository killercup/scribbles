---
title: Rails vs. PatternLab
categories:
- tech
- incomplete
---
Using the same views (templates, assets) in a Rails app and PatternLab should be possible. They're not making it very easy, though.

## going atomic

- goal: use atomic design structure and pattern lab with rails views
- so maybe use templates/assets that are valid for both rails and patternlab-{node,php}? what could go wrong?
- first hurdle: directories, schirectories

## a short rant about templating langs

- apparently most templates engines were written by satan and are maintained by nobody
- liquid, motherfucker, do you drink it?
- liquid is made by shopify instead of satan but liquid-rails is still not maintained by anyone
- node pattern lab engine liquid driver?! (snake oil is liquid right)
- conclusion: nope, scratch that, no liquid after all. back to the ~~drawing board~~ <ins>erb/haml world</ins>

## pattern lab means

- functional/logic-less templates
- i.e.: 'no you should not do that in a template'
- if you say 'arbitrary ruby code in templates' one more time…

## the rails way

- apparently the 'rails way' is 'use view helpers to generate a shit ton of markup'
- how the hell do you even render the possible states for `<%= f.text_field :label, blackbox, magically_use_random_global_variables: true %>`
- so maybe we need to compromise after all
- but since we are not using a restricting templating lang we need to restrict ourselves… somehow

## rails patter lab

- can't use patternlab-{node,php} since we are using erb/haml stuff now
- just implement the important stuff of patternlab in rails
- 80:20 style
- also, write down some rules, and require people to actually make components that are in the style guide or reject their code

## le rules

tbd.

## UI components

- can be rendered by themselves
	- just with mock data
	- without needing to instantiate a model/controller/presenter
- can be rendered in different contexts
	- e.g.: the same button components works in a white box and a form
	- the style guide can show these nested components
	- mock data can be used for nested components as well
- can be rendered in different states
	- usual states: hover, active, invalid, loading, disabled, etc.
	- but also stuff like 'hero element with special offer'
	- style guide can render each one

## going nuclear

1. develop this
2. open source it
3. write docs
4. be very proud
5. ???
6. PROFIT!
