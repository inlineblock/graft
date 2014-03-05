define(['Graft'], function (Graft) {
  describe('Register', function () {
    beforeEach(function () {
      this.register = new Graft.Register();
    });

    afterEach(function () {
      this.register.destroy();
    });

    describe('#injectServices', function () {
      it('adds service to item', function () {
        var serviceOne = {};
        Graft.Directives.registerService('one', serviceOne);
        var item = {};
        Graft.Directives.injectServices(item, ['one']);

        chai.expect(item.one).to.equal(serviceOne);
      });
      it('adds service to item with renaming format (something as somethingelse)', function () {
        var serviceOne = {};
        Graft.Directives.registerService('one', serviceOne);
        var item = {};
        Graft.Directives.injectServices(item, ['one as two']);
        chai.expect(item.two).to.equal(serviceOne);
      });
    });

    describe('Registers', function () {
      it('#_register adds named item as uppercase to object', function () {
        var holder = {};
        var item = {item: 1};
        Graft.Directives._register('lower', item, holder);
        chai.expect(holder['LOWER']).to.equal(item);
      });

      it('#registerAttribute registers to _attributeDirectives', function () {
        var item = {item: 1};
        this.register.registerAttribute('hi', item);
        chai.expect(this.register._attributeDirectives['HI']).to.equal(item);
      });
      it('#registerElement registers to _elementDirectives', function () {
        var item = {item: 1};
        this.register.registerElement('hi', item);
        chai.expect(this.register._elementDirectives['HI']).to.equal(item);
      });
      it('#registerService registers to _services', function () {
        var item = {item: 1};
        this.register.registerService('hi', item);
        chai.expect(this.register._services['HI']).to.equal(item);
      });
    });

    describe('Getters', function () {
      it('#_getRegistered gets item from object with uppercased name', function () {
        var holder = {};
        var item = {item: 1};
        holder.ITEM = item;
        chai.expect(Graft.Directives._getRegistered('item', holder)).to.equal(item);
      });
      it('#getAttributeDirective gets from _attributeDirectives name to uppercase', function () {
        var item = {item: 1};
        this.register._attributeDirectives.HI = item;
        chai.expect(this.register.getAttributeDirective('hi')).to.equal(item);
      });
      it('#getElementDirective gets from _elementDirectives with name to uppercase', function () {
        var item = {item: 1};
        this.register._elementDirectives.HI = item;
        chai.expect(this.register.getElementDirective('hi')).to.equal(item);
      });
      it('#getService gets from _services with name to uppercase', function () {
        var item = {item: 1};
        this.register._services.HI = item;
        chai.expect(this.register.getService('hi')).to.equal(item);
      });
    });

    describe('Unregister' ,function () {
      it('#_unregister remove named item as uppercase to object', function () {
        var holder = {};
        var item = {};
        holder.UPPER = item;
        Graft.Directives._unregister('upper', holder);
        chai.expect(holder.UPPER).to.be.an('undefined');
      });
      it('#unregisterAttribute registers to _attributeDirectives', function () {
        var item = {item: 1};
        this.register.registerAttribute('hi', item);
        this.register.unregisterAttribute('hi');
        chai.expect(this.register.getAttributeDirective('hi')).to.equal(undefined);
      });
      it('#unregisterElement registers to _elementDirectives', function () {
        var item = {item: 1};
        this.register.registerElement('hi', item);
        this.register.unregisterElement('hi');
        chai.expect(this.register.getService('hi')).to.equal(undefined);
      });
      it('#unregisterService registers to _services', function () {
        var item = {item: 1};
        this.register.registerService('hi', item);
        this.register.unregisterService('hi');
        chai.expect(this.register.getService('hi')).to.equal(undefined);
      });
    });
  });
});
