(function(root, factory) {

  // Set up just like Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    var requires = [],
      backboneIndex = -1,
      underscoreIndex = -1,
      jqueryIndex = -1;
    if (!root.Backbone) {
      requires.push('backbone');
      backboneIndex = requires.length-1;
    }
    if (!root._) {
      requires.push('underscore');
      underscoreIndex = requires.length-1;
    }
    if (!root.$) {
      requires.push('jquery');
      jqueryIndex = requires.length-1;
    }
    define(requires, function () {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      return factory(root,
                     backboneIndex   > -1 ? arguments[backboneIndex]   : root.Backbone,
                     underscoreIndex > -1 ? arguments[underscoreIndex] : root._,
                     jqueryIndex     > -1 ? arguments[jqueryIndex]     : root.$
                    );
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var $ = require('jquery');
    exports = factory(root, Backbone, _, $);

  // Finally, as a browser global.
  } else {
    root.Graft = factory(root, root.Backbone, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function (root, Backbone, _, $) {
  var requiresNodeRegistration = (root.html5 && !root.html5.supportsUnknownElements),
    Graft = {},
    Toolkit,
    View,
    Register,
    AttributeDirective;

  // Toolkit stuff that we want public.
  Tools = {

    _regexes: {
      as: /^(\s+)?(\w+)( as (\w+))?(\s+)?$/,
      isFunction: /^(\s+)?(!)?([\w]+)?(\(\))?(\s+)?$/
    },
    
    pluckElementAttributesFromScope: function ($scope, $elementOptions, pluckableAttributes) {
      var picked = _.pick($elementOptions, pluckableAttributes);
      return Tools.mapObject(picked, function (value, key) {
        return Tools.pluckAttributeWithStringFormat($scope, value);
      });
    },

    extractOptionsFromElement: function ($el) {
      return $el.data();
    },

    tagAttributeFormat: function (string) {
      return string.replace(/(\-|_|\s)+(.)?/g, function(match, separator, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    },

    extractAttributeValuesFromElement: function (el) {
      var attributes = {},
        attribute,
        i;
      for (i = 0; el && el.attributes && i < el.attributes.length; i++) {
        attribute = el.attributes[i];
        attributes[attribute.name] = attribute.value;
      }
      return attributes;
    },

    parseAs: function (string) {
      var matches = string.match(Tools._regexes.as);
      return {
        serviceName: matches[2],
        localName: matches[4]
      };
    },

    parseAttributeFromString: function (string) {
      var matches = string.match(Tools._regexes.isFunction);
      if (!matches) {
        throw new Error("Unable to parse attribute format %s".sprintf(string));
      }
      return {
        name: matches[3],
        assertion: !matches[2],
        isFunction: !!matches[4]
      };
    },

    parseAttributeFromStrings: function (string) {
      return _.map(string.split(/[\s,]+/), function (str) {
        return Tools.parseAttributeFromString(str);
      });
    },

    pluckAttribute: function (item, string) {
      return item[string];
    },

    pluckAttributeWithStringFormat: function (item, string, dontCallFunctions) {
      var parsed = Tools.parseAttributeFromString(string);
      
      if (parsed.isFunction && !dontCallFunctions) {
        return this.pluckAttribute(item, parsed.name)();
      }

      return this.pluckAttribute(item, parsed.name);
    },

    getAttributeFromModelWithStringFormat: function (model, string, options) {
      options = options || {};
      var parsed = Tools.parseAttributeFromString(string);

      if (options.pluckAttribute) {
        return this.pluckAttribute(model, parsed.name);
      } else if (!parsed.isFunction && !options.dontCallFunctions) {
        return model.get(parsed.name);
      }

      return this.pluckAttributeWithStringFormat(model, string, options.dontCallFunctions);
    },

    pluckAttributesWithStringFormats: function (item, string) {
      var plucked = {};
      _.each(plucked, function (name) {
        if (name in $scope) {
          plucked[name] = Tools.pluckAttributeWithStringFormat($scope, name);
        }
      });
      return plucked;
    },
 
    mapObject: function (object, callback, context) {
      var objectKeys = _.keys(object),
        objectValues = _.map(object, callback, context);
      return _.object(objectKeys, objectValues);
    }
  };

  // This exists because sooner or later we will make it so we can handle multiple Namespaces
  Register = function GraftRegister () {
    this.initialize();
  };
  _.extend(Register.prototype, {

    initialize: function () {
      this._clean();
    },

    _clean: function () {
      this._elementDirectives = {};
      this._attributeDirectives = {};
      this._services = {};
    },

    destroy: function () {
      this._clean();
    },

    _register: function (name, item, map) {
      name = name.toUpperCase();
      if (name in map) {
        console.warn('Name already exists ::', name);
      }
      map[name] = item;
    },

    _unregister: function (name, map) {
      name = name.toUpperCase();
      if (name in map) {
        delete map[name];
      } else {
        console.warn('Name does not exist ::', name);
      }
    },

    _getRegistered: function (name, map) {
      return map[name.toUpperCase()];
    },

    registerAttribute: function (name, klass) {
      return this._register(name, klass, this._attributeDirectives); 
    },

    registerElement: function (name, klass) {
      if (requiresNodeRegistration) {
        this._registerNodeWithBrowser(name);
      }
      return this._register(name, klass, this._elementDirectives);
    },

    registerService: function (name, item) {
      return this._register(name, item, this._services);
    },

    getService: function (name) {
      return this._getRegistered(name, this._services);
    },

    getAttributeDirective: function (name) {
      return this._getRegistered(name, this._attributeDirectives);
    },

    getElementDirective: function (name) {
      return this._getRegistered(name, this._elementDirectives);
    },

    unregisterAttribute: function (name) {
      return this._unregister(name, this._attributeDirectives); 
    },

    unregisterElement: function (name) {
      return this._unregister(name, this._elementDirectives);
    },

    unregisterService: function (name) {
      return this._unregister(name, this._services);
    },

    injectServices: function ($scope, services) {
      var asMatch,
        localName,
        serviceName,
        service,
        i = 0,
        l = services.length;
      for(i=0; i < l; i++) {
        asMatch = Tools.parseAs(services[i]);
        if (asMatch) {
          serviceName = asMatch.serviceName;
          localName = asMatch.localName || asMatch.serviceName;
          $scope[localName] = this.getService(serviceName);
        } else {
          throw new Error('invalid service "' + service + '"');
        }
      }
    },

    _registerNodeWithBrowser: function (tagName) {
      root.html5.elements = [root.html5.elements, tagName].join(' ');;
      root.html5.shivDocument(document);
    }
  });

  
  // The View/directive system
  View = Backbone.View.extend({

    // this never gets used by the class, but we want it accessible when extended
    pluckables: [
      'collection',
      'model'
    ],

    transclude: false, // default to false, its not super heavy, but heavy enough.

    options: {
      skipBuildTemplate: false,
    },

    constructor: function GraftView (o) {
      Backbone.View.apply(this , arguments);
    },

    initialize: function () {
      this._boundRelayEvents = {};
      this._subViews = {};
      this._setup();
      this.setup();
      this._build();
      this.build();
      this.attach();
      this.render();
    },

    _setup: function () {
      if ('$parentScope' in this.options) {
        this.$parentScope = this.options.$parentScope;
      }
      if (this.services && this.services.length) {
        Graft.Directives.injectServices(this, this.services);
      }
    },

    _build: function () {
      if (!this.options.skipBuildTemplate) {
        this.buildFromTemplate();
      }
      if (this.transclude && this.options.transcludedElements) {
        this._transcludeElements(this.options.transcludedElements);
      }
      if (!this.options.skipDirectives) {
        this.processDirectives();
      }
    },

    buildFromTemplate: function () {
      if (this.template) {
        var html;
        if (_.isFunction(this.template)) {
          html = this.template(this._getTemplateOptions());
        } else if (_.isString(this.template)) {
          html = this.template;
        }
        if (html) {
          this.$el.html(html);
        }
      }
    },

    setup: function () {},

    attach: function () {},
    detach: function () {},
    
    build: function () {},
    render: function () {},

    
    _getTemplateOptions: function () {
      var o = _.clone(this.options);
      if ('el' in o) {
        delete o.el;
      }
      o.cid = this.cid;
      if (this.model) {
        _.extend(o , {model: this.model});
      }
      if (this.collection) {
        _.extend(o , {collection: this.collection});
      }
      o.$scope = this;
      return _.extend(o , this.getTemplateOptions());
    },

    getTemplateOptions: function () {
      return {};
    },

    registerSubView: function (view) {
      return this.registerSubViewWithId(view , this.getIdForView(view));
    },

    registerSubViewWithId: function (view , id) {
      this._subViews[id] = view;
      this.listenTo(view , 'remove' , this.onSubViewRemove);
      return this;
    },

    unregisterSubView: function (view) {
      return this.unregisterSubViewId(this.getIdForView(view));
    },

    unregisterSubViewId: function (id) {
      if (id in this._subViews) {
        var view = this._subViews[id];
        this.stopListening(view , 'remove');
        delete this._subViews[id];
      }
    },

    onSubViewRemove: function (view) {
      this.removeSubView(view);
    },

    replace: function (selector, view) {
      if (arguments.length === 1) {
        view = selector;
        selector = false;
      }
      if (!selector) {
        this.$el.html('').append(view.$el);
        this.registerSubView(view);
      } else {
        this.removeSubViewById(selector);
        this.$(selector).first().html('').append(view.$el);
        this.registerSubViewWithId(view , selector);
      }
      return this;
    },

    append: function (selector, view) {
      if (arguments.length === 1) {
        view = selector;
        selector = false;
      }
      if (!selector) {
        this.$el.append(view.$el);
        this.registerSubView(view);
      } else {
        this.$(selector).first().append(view.$el);
        this.registerSubViewWithId(view , this.getIdForView(view));
      }
      return this;
    },

    prepend: function (selector, view) {
      if (arguments.length === 1) {
        view = selector;
        selector = false;
      }
      if (!selector) {
        this.$el.prepend(view.$el);
        this.registerSubView(view);
      } else {
        this.$(selector).first().prepend(view.$el);
        this.registerSubViewWithId(view , this.getIdForView(view));
      }
      return this;
    },

    getIdForView: function (view) {
      return view.cid || view.id;
    },

    getId: function () {
      return this.getIdForView(this);
    },

    removeSubView: function (view) {
      return this.removeSubViewById(this.getIdForView(view));
    },

    removeSubViewById: function (id) {
      if (this._subViews[id]) {
        var subview = this._subViews[id];
        this.stopListening(subview , 'remove');
        delete this._subViews[id];
        if (!subview._removed && subview.remove) {
          subview.remove();
        }
      }
      return this;
    },

    remove: function () {
      this._removed = true;
      this.trigger('remove' , this);
      _.chain(this._subViews).keys().each(this.removeSubViewById, this);
      this.detach();
      return Backbone.View.prototype.remove.apply(this , arguments);
    },

    bindEventsToView: function (view , events) {
      if (view && events) {
        _.each(events , function (method , event) {
          this.listenTo(view , event , this[method]);
        } , this);
      }
    },

    unbindEventsFromView: function (view , events) {
      if (view && events) {
        _.each(events , function (method , event) {
          this.stopListening(view , event);
        } , this);
      }
    },

    // (view, ['add', 'remove'])
    bindRelayEventsToView: function (view, events) {
      var relayed = {};
      _.each(events, function (event) {
        if (!this._boundRelayEvents[event]) {
          this._boundRelayEvents[event] = this.onRelayedEvent.bind(this, event); // this will cause event to passed first, so we know which one did it
        }
        relayed[event] = this._boundRelayEvents[event];
      }, this);
      this.listenTo(view, relayed);
    },

    unbindRelayEventsFromView: function (view, events) {
      var relayed = {};
      _.each(events, function (event) {
        if (this._boundRelayEvents[event]) {
          relayed[event] = this._boundRelayEvents[event];
        }
      }, this);
      this.stopListening(view, relayed);
    },

    onRelayedEvent: function (event) {
      this.trigger.apply(this, arguments);
    },

    _transcludeElements: function (elements) {
      // so if the transclude isn't found, we use add to include the current element
      // which then makes it append to itself.
      this.$('[transclude]').add(this.el).first().append(elements);
      return this;
    },

    _getDirectiveOptions: function () {
      return {
        $parentScope: this,
        collection: this.collection,
        model: this.model
      };
    },

    processDirectives: function () {
      this.processElementDirectives(this.el, this._getDirectiveOptions());
    },

    processElementDirectives: function (el, options) {
      var attributes = Tools.extractAttributeValuesFromElement(el),
        childNode,
        attribute,
        directiveKlass,
        directive,
        i;
      
      for (i = 0; i < el.childNodes.length; i++) {
        childNode = el.childNodes[i];
        if (childNode.tagName) {
          directiveKlass = Graft.Directives.getElementDirective(childNode.tagName);
          if (directiveKlass) {
            directive = this.createElementDirective(directiveKlass, childNode, options);
          } else {
            // recurse this deeper
            this.processElementDirectives(childNode, options);
          }
        }
      }

      for (i in attributes) if (attributes.hasOwnProperty(i)) {
        attribute = el.attributes[i];
        directive = this.processElementAttribute(attribute, el, options);
        if (directive && directive.stoppable) {
          if (directive.stopProcessing()) {
          }
        }
      }
      
    },

    processElementAttribute: function (attribute, el, options) {
      var attributeName = attribute.name,
        attributeValue = attribute.value,
        directiveName = attributeName.toUpperCase(),
        directiveKlass = Graft.Directives.getAttributeDirective(directiveName),
        directiveInstance;
      if (directiveKlass) {
        if (!el.__attributeDirectives__) {
          el.__attributeDirectives__ = {};
        }
        directiveInstance = el.__attributeDirectives__[directiveName];
        if (!directiveInstance) {
          directiveInstance = this.createAttributeDirective(directiveKlass, el, attributeName, attributeValue, options);
          el.__attributeDirectives__[directiveName] = directiveInstance;
        } else if (directiveInstance.update && _.isFunction(directiveInstance.update)) {
          directiveInstance.update();
        }
      }
      return directiveInstance;
    },

    createElementDirective: function (directiveKlass, el, options) {
      var $el = Backbone.$(el),
        elementOptions = Tools.extractOptionsFromElement($el),
        attributes = Tools.extractAttributeValuesFromElement(el),
        pluckedFromScope = Tools.pluckElementAttributesFromScope(options.$parentScope, elementOptions, directiveKlass.prototype.pluckables) || {},
        directiveInstance;
      directiveInstance = new directiveKlass(_.extend({}, options, elementOptions, pluckedFromScope, {
        attributes: attributes,
        transcludedElements: $el.children().detach()
      }));
      if ('class' in attributes && directiveInstance.$el) {
        // backbone's view might override it so lets append to what the view created
        directiveInstance.$el.addClass(attributes['class']);
      }
      directiveInstance.el.__directive__ = directiveInstance;
      $el.replaceWith(directiveInstance.el);
      this.registerSubView(directiveInstance);
      return directiveInstance;
    },

    createAttributeDirective: function (directiveKlass, el, attributeName, attributeValue, options) {
      var directiveInstance = new directiveKlass(_.extend({}, options || {}, {
        el: el,
        directiveValue: attributeValue,
        matchedAttribute: attributeName
      }));
      this.registerSubView(directiveInstance);

      return directiveInstance;
    }
  });

  AttributeDirective = function (o) {
    this.cid = _.uniqueId('directive');
    this._configure(o || {});
    this.initialize.apply(this, arguments);
  };

  _.extend(AttributeDirective.prototype, Backbone.Events, {

    options: {},

    _configure: function (o) {
      this.options = _.extend({}, this.options, o);

      _.extend(this, _.pick(o, [
        'collection',
        'el',
        'directiveValue',
        'matchedAttribute',
        'model',
        '$parentScope'
      ]));

      this.$el = Backbone.$(this.el);
      this.el = this.$el[0];
    },

    initialize: function () {
      this.setup();
      this.attach();
      this.render();
    },

    setup: function () {},
    attach: function () {},
    detach: function () {},
    render: function () {},
    remove: function () {
      this.trigger('remove', this);
      this.stopListening();
      this.detach();
      return this;
    }
  });

  AttributeDirective.extend = Backbone.View.extend;


  Graft.Directives = new Register(); 
  Graft.Register = Register;
  Graft.View = View;
  Graft.Tools = Tools;
  Graft.AttributeDirective = AttributeDirective;
  return Graft;
}));
