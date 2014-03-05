# Graft

Graft is an angular directive like library for Backbone.js. Other comparisons can be made with [X-tags](http://www.x-tags.org/) or [polymer](http://www.polymer-project.org/). 

Graft itself does not have any directives in it, but does provide a base View (Graft.View) that you can use and any children in its element will be evalulated for custom HTML tags or attributes.


## Graft.View
---
Graft.View is the base view you would use, instead of Backbone.View, if you wanted to get the advantages of directives. It also has defined lifecycle and its own methods for appending subviews, so that the subviews automatically get cleaned up.

#### Passing options to a view class via the DOM

##### Automatically passed items
* this.model
* this.collection
* this.$parentScope in the created child, is the View that created it.

##### View's (element tagName)
Anything attribute that is prefixed via data- will become an options when the Directive View is created.


So lets say you wanted a ng-model like binding where you pass it a model and it will listen to a certain model attribute and do two-way binding.

```javascript
  var MyInput = Graft.View.extend({

    tagName: 'input',

    className: 'my-input',

    events: {
      'change': 'onInputChange'
    },

    options: {
      attribute: '',
      autoSave: false
    },

    attach: function () {
      // listen change:attribute
      this.listenTo(this.model, 'change:' + this.options.attribute, this.onModelChange);
    },

    getModelValue: function () {
      this.model.get(this.options.attribute);
    },
    
    onInputChange: function () {
      this.model.set(this.options.attribute, this.$el.val());
      if (this.options.autoSave) {
        this.model.save();
      }
    },

    onModelChange: function () {
      this.render();
    },

    render: function () {
      this.$el.val(this.getModelValue());
    }
  });
  Graft.Directives.registerElement('my-input', MyInput);
```

```html
  <my-input data-attribute="name" data-auto-save="true"></my-input>
```

That my-input tag will get REMOVED and replaced with the MyInput view's element.

##### Attributes (element attribute)
If it is a Attribute Directive, you can do the attribute value and will will accessible via "this.directiveValue". You can also access the matched attribute as "this.matchedAttribute".
```html
  <div my-custom-attribute="hello"></div>
```

#### Graft View's Lifecyle
setup -> build -> attach -> render

Methods *NOT* to override: initialize, remove

* Setup: This is where we setup data and occassionaly bind methods.
* Build: Build any subviews. Things that should only be called once
* Attach: Attach event listeners
* Render: Any rendering that can be done multiple times.

#### Graft.View Attributes
* template: If this is set, it will make this.el.innerHTML = template. This can be a string or a function. If its a function (underscore template) it will run it with the current scope applied and this.options passed in, as well as this.model, and this.collection.
```javascript
var MyView = Graft.View.extend({
	template: _.template('hello <%= model.name %>')
});
var myModel = new Backbone.Model({
	name: 'Graft'
});
var myViewInstance = new MyView({
	model: myModel
});
```

* transclude: This is similar to the [transclude option in angular's directives](http://docs.angularjs.org/api/ng/directive/ngTransclude). If this is true and this Graft.View is an automatically created via directive, it will take the transcludedElements (this.options.transcludedElements) and try to find a gr-transclude attribute in a child element and append those elements to it. If it cannot find a child with that attribute, it will append the items to itself. You can overrdie this behavior by overriding the _transcludeElements method in your view.
* services: An array of strings that are "services" you have registered with Graft.Directives.registerService, that you want to accessible via this.


```javascript
var applicationCache = new Backbone.Model();
var currentUser = new Backbone.Model();
// register so it can be accessed
Graft.Directives.registerService('currentUser', currentUser);

var MyView = Graft.View.extend({
	services: [
		'applicationCache', // will be available as this.applicationCache
		'currentUser as model' // you can say x as y, so currentUser will be this.model
	]
});
var myViewInstance = new MyView();
// myViewInstance.model == currentUser;
```


## Graft.AttributeDirective
---

So the Graft.View will traverse its children to find other directives and create it, but if its just a Attribute Directive, these should not own the DOM element like the View does, so we created a simplified class to extend from.

#### Graft.AttributeDirective's Lifecyle

setup -> attach -> render ~> update

Methods *NOT* to override: initialize, remove

* Setup: This is where we setup data and occassionaly bind methods.
* Attach: Attach event listeners
* Render: Any rendering that can be done multiple times.
* Update: this gets called if the directive is re-evaluated and is already built, we just call this again.


Example: 
```javascript
// Autofocus

var AutoFocus = Graft.AttributeDirective.extend({
	render: function () {
		this.$el.focus();
	},
	
	update: function () {
		this.render();
	}
  }, {
	nativeExists: function () {
		return ('autofocus' in document.createElement('input'));
	}
});

if (!AutoFocus.nativeExists()) {
	Graft.Directives.registerAttribute('autofocus', AutoFocus);
}

var MyViewClass = Graft.View.extend({
	template: 'HI <input name="name" autofocus />'
});
new MyViewClass();

```




## Graft.Directives - The Register
----

This is a register where you can register available View directives and Attribute directives as well as services. 

* Graft.Directives.registerService('name', item) - Any item that you may need.
* Graft.Directives.registerElement('name', Class) - Any tagName matched with the name
* Graft.Directives.registerAttribute('name', Class) - Any html attribute that is matched.


## Examples
---

The follows the ng-cloak example. So you can hide html via a css selector like [xe-cloak] then have it show up once it gets evaluated and created.

```javascript
var Cloak = Graft.AttributeDirective.extend({
	render: function () {
		// Cloak removes the matchedAttribute vs just 'xe-cloak'
		this.$el.removeAttr(this.options.matchedAttribute);
	}
});
Graft.Directives.registerAttribute('xe-cloak', Cloak);
  
```

#### A Example app
---


```html
<div id="crappy-app">
  <h1>Hi crappy app here</h1>
  <p>Enter your name here: <xe-input data-attribute="name" /></p>
</div>
```
