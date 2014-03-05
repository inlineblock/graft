# Graft
=======

Graft is an angular directive like library for Backbone.js. Other comparisons can be made with [X-tags](http://www.x-tags.org/) or [polymer](http://www.polymer-project.org/). 

Graft itself does not have any directives in it, but does provide a base View (Graft.View) that you can use and any children in its element will be evalulated for custom HTML tags or attributes.

### Graft.View
---
Graft.View is the base view you would use, instead of Backbone.View, if you wanted to get the advantages of directives. It also has defined lifecycle and its own methods for appending subviews, so that the subviews automatically get cleaned up.

#### Graft View's Lifecyle
setup -> build -> attach -> render

Methods *NOT* to override: initialize, remove

* Setup: This is where we setup data and occassionaly bind methods.
* Build: Build any subviews. Things that should only be called once
* Attach: Attach event listeners
* Render: Any rendering that can be done multiple times.

#### Graft.View attributes
* template: If this is set, it will make this.el.innerHTML = template. This can be a string or a function. If its a function (underscore template) it will run it with the current scope applied and this.options passed in, as well as this.model, and this.collection.
```javascript
var MyView = Graft.View.extend({
	template: _.template('hello <%= model.name %>)
});
var myModel = new Backbone.Model({
	name: 'Graft'
});
var myViewInstance = new MyView({
	model: myModel
});
```

