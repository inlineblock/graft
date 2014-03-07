define(['Graft'], function (Graft) {
  describe('Tools', function () {

    describe('#parseAttributeFromString', function () {
      it('parses non-functions correctly', function () {
        var parsed = Graft.Tools.parseAttributeFromString('something');
        chai.expect(parsed.isFunction).to.be.false;
        chai.expect(parsed.name).to.equal('something');
        chai.expect(parsed.assertion).to.equal(true);
      });

      it('parses non-functions with reversal (!something)', function () {
        var parsed = Graft.Tools.parseAttributeFromString('!something');
        chai.expect(parsed.isFunction).to.be.false;
        chai.expect(parsed.name).to.equal('something');
        chai.expect(parsed.assertion).to.equal(false);
      });

      it('parses functions (something())', function () {
        var parsed = Graft.Tools.parseAttributeFromString('something()');
        chai.expect(parsed.isFunction).to.be.true;
        chai.expect(parsed.name).to.equal('something');
        chai.expect(parsed.assertion).to.equal(true);
      });

      it('parses functions with reversal (!something())', function () {
        var parsed = Graft.Tools.parseAttributeFromString('!something()');
        chai.expect(parsed.isFunction).to.be.true;
        chai.expect(parsed.name).to.equal('something');
        chai.expect(parsed.assertion).to.equal(false);
      });
    });

    describe('#pluckAttributeWithStringFormat', function () {
      it('plucks a simple attribute', function () {
        var x = {a: 100};
        chai.expect(Graft.Tools.pluckAttributeWithStringFormat(x, 'a')).to.equal(x.a);
      });

      it('plucks a simple attribute with white space, ignoring whitespace', function () {
        var x = {a: 100};
        chai.expect(Graft.Tools.pluckAttributeWithStringFormat(x, ' a ')).to.equal(x.a);
      });

      it('plucks format with parans (eg methodName()) and runs it, returning its value', function () {
        var x = {
          methodName: function () {
            return 2;
          }
        };
        chai.expect(Graft.Tools.pluckAttributeWithStringFormat(x, 'methodName()')).to.equal(2);
      });

      it('plucks format with parans and whitespace (eg methodName()) and runs it, returning its value', function () {
        var x = {
          methodName: function () {
            return 2;
          }
        };
        chai.expect(Graft.Tools.pluckAttributeWithStringFormat(x, ' methodName() ')).to.equal(2);
      });

      it('plucks format with parans and (eg methodName()) and wont run it when third parameter is true', function () {
        var x = {
          methodName: function () {
            return 2;
          }
        };
        chai.expect(Graft.Tools.pluckAttributeWithStringFormat(x, 'methodName()', true)).to.equal(x.methodName);
      });
    });
    
    describe('#pluckAttribute', function () {
      it('plucks a simple attribute', function () {
        var x = {a: 100};
        chai.expect(Graft.Tools.pluckAttribute(x, 'a')).to.equal(x.a);
      });
    });

    describe('#getAttributeFromModelWithStringFormat', function () {
      beforeEach(function () {
        this.model = new Backbone.Model({a: 100});
        this.model['plucked'] = 5;
        this.model['methodName'] = function () {
          return 2;
        };
      });
      afterEach(function () {
        delete this.model;
      });

      it("returns backbone model's attribute with get", function() {
        chai.expect(Graft.Tools.getAttributeFromModelWithStringFormat(this.model, 'a')).to.equal(this.model.get('a'));
      });
      it("calls function and returns value on backbone model", function() {
        chai.expect(Graft.Tools.getAttributeFromModelWithStringFormat(this.model, 'methodName()')).to.equal(2);
      });
      it("returns method without calling it when dontCallFunctions option is set", function() {
        var options = { dontCallFunctions: true };
        chai.expect(Graft.Tools.getAttributeFromModelWithStringFormat(this.model, 'methodName()', options)).to.equal(this.model.methodName);
      });
      it("plucks the attribute from the model when pluckAttribute option is set", function() {
        var options = { pluckAttribute: true }
        chai.expect(Graft.Tools.getAttributeFromModelWithStringFormat(this.model, 'plucked', options)).to.equal(5);
      });
    });

  });
});
