# Burnify
Interactive Product Burn-Down Chart

## Introduction

**Burnify** is a jQuery plugin that creates highly interactive product burn-down charts to be embedded into any web application.

![](https://github.com/feroult/burnify/blob/master/sample.png)

## How it Works

### Import plugin:
```html
<link href="https://cdn.rawgit.com/feroult/burnify/master/src/jquery.burnify.css" rel="stylesheet" type="text/css">
<script src="https://cdn.rawgit.com/feroult/burnify/master/src/jquery.burnify.js"></script>

(...)

<div id="product-chart" />
```

### Burnify it:
```javascript
$("#product-chart").burnify(json, 800, 600);
```

### Json sample structure:
```javascript
{
    name: 'Burnify',
    points: 120,
    lastSprint: 13,
    mvpSprint: 10,
    sprints: [{
            done: 10
        }, {
            done: 10
        }, {
            done: 10
        }, {
            done: 6,
            added: 52
        }, {
            done: 8,
            added: 12
        }, {
            done: 8,
            added: 2,
            removed: 20
        }, {
            done: 4,
        }, {
            done: 6,
            added: 2
        }
    ]
}
```
