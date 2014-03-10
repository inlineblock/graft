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

    describe('#splitAttributeValue splits string into key value object', function () {
      it("with correct length", function(){
        var threeParts = Graft.Tools.splitAttributeValue('attribute_value | model | collection', ['evaluators', 'modelName', 'collectionName']),
          twoParts = Graft.Tools.splitAttributeValue('attribute_value | model', ['evaluators', 'modelName']),
          onePart = Graft.Tools.splitAttributeValue('attribute_value', ['evaluators']);
        chai.expect(_.keys(threeParts).length).to.equal(3);
        chai.expect(_.keys(twoParts).length).to.equal(2);
        chai.expect(_.keys(onePart).length).to.equal(1);
      });
      it("with correct key values", function(){
        var parts = Graft.Tools.splitAttributeValue('attribute_value | model | collection', ['evaluators', 'modelName', 'collectionName']),
          keys = _.keys(parts);
        chai.expect(keys[0]).to.equal('evaluators');
        chai.expect(keys[1]).to.equal('modelName');
        chai.expect(keys[2]).to.equal('collectionName');
      });
      it("with correct values", function(){
        var parts = Graft.Tools.splitAttributeValue('attribute_value | model | collection', ['evaluators', 'modelName', 'collectionName']),
          values = _.values(parts);
        chai.expect(values[0]).to.equal('attribute_value');
        chai.expect(values[1]).to.equal('model');
        chai.expect(values[2]).to.equal('collection');
      });
      it("splits without array", function(){
        var parts = Graft.Tools.splitAttributeValue('attribute_value | model | collection'),

        chai.expect(parts[0]).to.equal('attribute_valuesfe');
        chai.expect(parts[1]).to.equal('model');
        chai.expect(parts[2]).to.equal('collection');
      });
    });
  });
});
