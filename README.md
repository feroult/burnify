# Burnify
Interactive Product Burn-Down Chart

## Introduction

**Burnify** is a d3 plugin that creates a highly interactive product burn-down chart to be embedded into any web application.

![](https://github.com/feroult/burnify/blob/master/sample.png)

## How it Works

### Import plugin:
```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>

<link href="https://cdn.rawgit.com/feroult/burnify/master/src/jquery.burnify.css" rel="stylesheet" type="text/css">
<script src="https://cdn.rawgit.com/feroult/burnify/master/src/jquery.burnify.js"></script>

(...)

<div id="product-chart" />
```

### Burnify it:
```javascript
burnify("#product-chart", json, 800, 600);
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
