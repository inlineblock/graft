define(['Graft/Graft'] , function (Graft) {
  describe('View' , function () {
    beforeEach(function () {
      this.view = new Graft.View();
    });
    afterEach(function () {
      this.view.remove();
    });

    describe('service injection', function () {
      beforeEach(function () {
        this.service = {service: true};
        Graft.Directives.registerService('service', this.service);
      });
      afterEach(function () {
        Graft.Directives.unregisterService('service');
      });

      it('service gets array of items and injects them', function () {
        var klass = Graft.View.extend({
            services: [
              'service'
            ]
          }),
          view = new klass();
        chai.expect(view.service).to.equal(this.service);
      });
    });

    describe('remove' , function () {
      it('marks as removed when removed' , function () {
        chai.expect(this.view._removed).to.not.equal(true);
        this.view.remove();
        chai.expect(this.view._removed).to.equal(true);
      });
    
      it('fires the remove event' , function (done) {
        this.view.on('remove' , function () {
          done();
        });
        this.view.remove();
      });

    });

    describe('template' , function () { 
      it('renders string as template' , function () {
        var x = Graft.View.extend({
          template: 'eh'
        });
        this.view = new x;
        chai.expect(this.view.$el.text()).to.equal('eh');
      });
      it('renders _ templates' , function () {
        var x = Graft.View.extend({
          template: _.template('eh')
        });
        this.view = new x;
        chai.expect(this.view.$el.text()).to.equal('eh');
      });
      it('renders templates automatically with options as variable templates' , function () {
        var x = Graft.View.extend({
          template: _.template('eh<%=number%>')
        });
        this.view = new x({
          number: 12
        });
        chai.expect(this.view.$el.text()).to.equal('eh12');
      });

      it('renders templates with options and extend function as variable templates' , function () {
        var x = Graft.View.extend({
          template: _.template('eh-<%=number%>-<%=alpha%>-<%=beta%>'),
          getTemplateOptions: function () {
            return {number: 99, alpha: 'a'};
          }
        });
        this.view = new x({
          number: 12,
          beta: 'b'
        });
        chai.expect(this.view.$el.text()).to.equal('eh-99-a-b');
      });

      it('renders templates automatically with model exposed as variable templates' , function () {
        var x = Graft.View.extend({
          template: _.template('eh<%=model.get("number")%>')
        }),
        model = new Backbone.Model({
          number: 99
        });
        this.view = new x({
          model: model
        });
        chai.expect(this.view.$el.text()).to.equal('eh99');
      });
    });
    
    describe('append' , function () {
      it('appends subview' , function () {
        var y = new (Graft.View.extend({
          template: 'barf'
        }))();
        this.view.append(y);
        chai.expect(this.view.$el.html()).to.equal('<div>barf</div>');
      });

      it('appends multiple subview' , function () {
        var y = new (Graft.View.extend({
          template: 'y'
        }))(),
        z = new (Graft.View.extend({
          template: 'z'
        }))();
        this.view.append(y);
        this.view.append(z);
        chai.expect(this.view.$el.html()).to.equal('<div>y</div><div>z</div>');
      });

      it('appends specific CSS selector' , function () {
        var y = new (Graft.View.extend({
          template: 'y<div class="z"></div>'
        }))(),
        z = new (Graft.View.extend({
          template: 'z'
        }))();
        y.append('.z' , z);
        chai.expect(y.$el.html()).to.equal('y<div class="z"><div>z</div></div>');
      });

      it('registers appended subview' , function () {
        var y = new (Graft.View.extend({
          template: 'barf'
        }))();
        this.view.append(y);
        chai.expect(this.view._subViews).to.have.property(this.view.getIdForView(y)).to.equal(y);
      });
    });

    describe('prepend' , function () {
      it('prepend subview' , function () {
        var y = new (Graft.View.extend({
          template: 'barf'
        }))(),
          z = new (Graft.View.extend({
          template: 'z'
        }))();
        this.view.append(y);
        this.view.prepend(z);
        chai.expect(this.view.$el.html()).to.equal('<div>z</div><div>barf</div>');
      });
      it('appends specific CSS selector' , function () {
        var y = new (Graft.View.extend({
          template: 'y<div class="z">hello</div>'
        }))(),
        z = new (Graft.View.extend({
          template: 'z'
        }))();
        y.prepend('.z' , z);
        chai.expect(y.$el.html()).to.equal('y<div class="z"><div>z</div>hello</div>');
      });
    });

    describe('replace' , function () {
      it('replaces content with subviews' , function () {
        this.view.$el.html('replace me');
        chai.expect(this.view.$el.html()).to.equal('replace me');
        var y = new (Graft.View.extend({
          template: 'barf'
        }))();
        this.view.replace(y);
        chai.expect(this.view.$el.html()).to.equal('<div>barf</div>');
      });

      it('replaces content with subview of specfic CSS selector' , function () {
        this.view.$el.html('<div class="x">replace me</div>');
        chai.expect(this.view.$el.find('.x').html()).to.equal('replace me');
        var something = new (Graft.View.extend({
          template: 'x-content'
        }))();
        this.view.replace('.x' , something);
        chai.expect(this.view.$el.find('.x').html()).to.equal('<div>x-content</div>');
      });
      it('registers subview with selector' , function () {
        this.view.$el.html('<div class="x"></div>');
        var something = new (Graft.View.extend({
          template: 'x-content'
        }))();
        this.view.replace('.x' , something);
        chai.expect(this.view._subViews).to.have.property('.x').to.equal(something);
      });

      it('removes previous subview with same selector of new replace' , function () {
        this.view.$el.html('<div class="x"></div>');
        var something = new (Graft.View.extend({
          template: 'x-content'
        }))();
        this.view.replace('.x' , something);

        var newer = new (Graft.View.extend({
          template: 'x-content'
        }))();
        this.view.replace('.x' , newer);

        chai.expect(something._removed).to.equal(true);
        chai.expect(this.view._subViews).to.have.property('.x').to.equal(newer);
      });
    });

    describe('relayEvents', function () {
      beforeEach(function () {
        this.view = new Graft.View();
        this.relayed = new Graft.View();
      });
      it('#bindRelayEventsToView should relay event', function (callback) {
        this.view.bindRelayEventsToView(this.relayed, ['select']);
        this.view.on('select', function () {
          callback();
        });
        this.relayed.trigger('select');
      });
      it('#unbindRelayEventsFromView should remove event', function () {

        this.view.bindRelayEventsToView(this.relayed, ['select']);
        this.view.on('select', function () {
          throw Error('should not of been called');
        });
        this.view.unbindRelayEventsFromView(this.relayed, ['select']);
        this.relayed.trigger('select');
      });
    });

    describe('Element Directives', function () {
      it('#createElementDirective instantiates the directive class', function (callback) {
        var directiveKlass = function () {
          callback();
        };
        this.view = new Graft.View();
        this.view.createElementDirective(directiveKlass, this.view.el, {$parentScope: {}});
      });

      it('#createElementDirective instantiates the directive class grabbing options from data attributes', function (callback) {
        var $el = Backbone.$('<div data-attribute="123"></div>'),
          view = new Graft.View(),
          directiveKlass = function (o) {
            chai.expect(o.attribute).to.equal(123);
            callback();
          };
        view.createElementDirective(directiveKlass, $el[0], {$parentScope: {}});
      });

    });
    
    describe('#processDirectives', function () {
      beforeEach(function () {
        this.directiveKlass = Backbone.View.extend({
          className: 'my-directive',
        });
        Graft.Directives.registerElement('my-directive', this.directiveKlass);

        this.klass = Graft.View.extend({
          template: _.template('<div><my-directive></my-directive></div>')
        });
      });

      afterEach(function () {
        Graft.Directives.unregisterElement('my-directive');
      });

      it('creates registered directive instance', function (callback) {
        this.directiveKlass.prototype.initialize = function () {
          callback();
        };
        var view = new (this.klass);
      });

      it('creates registered directive class from html and replaces the el', function () {
        
        var view = new (this.klass);
        chai.expect(view.$('.my-directive')).to.have.length(1);
        chai.expect(view.$('my-directive')).to.have.length(0);

      });
    });

    describe('Attribute Directives', function () {
      it('#createAttributeDirective should instantiate given function with given element', function (callback) {
        var fakeEl = {};
        var fakeVal = {a:1};
        var fakeDirective = function (o) {
          if (o.el != fakeEl) {
            callback('not the el');
          } else if (fakeVal !== o.directiveValue) {
            callback('not the directive value');
          } else {
            callback();
          }
        };
        var x = new Graft.View();
        x.createAttributeDirective(fakeDirective, fakeEl, 'blah', fakeVal);
      });
      it('should create attribute directive from nested child', function (callback) {
        var attrDir = function () {
          callback();
        };
        var fake = Graft.View.extend({
          template: '<div><div xe-attr class="blah"></div></div>'
        });
        Graft.Directives.registerAttribute('xe-attr', attrDir);
        new fake();
        Graft.Directives.unregisterElement('xe-attr');
      });
    });

    describe('Transclusion', function () {
      beforeEach(function () {
        this.transcludableKlass = Graft.View.extend({
          transclude: true,
          template: '<div class="one"></div><div class="two basket" xe-transclude></div>'
        });
        Graft.Directives.registerElement('transcludable', this.transcludableKlass);
      });
      afterEach(function () {
        Graft.Directives.unregisterElement('transcludable');
      });
      it('#transcludedElements puts the elements in the basket', function () {
        var element = Backbone.$('<span>');
        var view = new (this.transcludableKlass)({
          transcludedElements: element
        });
        chai.expect($.contains(view.$el.find('.basket')[0], element[0])).to.be.true;
      });
      it('#transcludedElements automatically gets provided content', function () {
        var elementDirective = Graft.View.extend({
          template: '<transcludable><span class="find-me"></span></transcludable>'
        });
        var inst = new elementDirective();
        chai.expect(inst.$('.find-me').parent().hasClass('basket')).to.be.true;
      });
    });

  });
});
