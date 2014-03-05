define(['Graft/Graft'], function (Graft) {
  describe('AttributeDirective', function () {
    beforeEach(function () {
      this.el = document.createElement('div');
      this.$parentScope = {$parentScope: 1};
      this.model = {model: 1};
      this.collection = {collection: 1};
      this.directiveValue = 'hello';
      this.matchedAttribute = 'an-attribute';
      this.attributeDirective = new Graft.AttributeDirective({
        el: this.el,
        $parentScope: this.$parentScope,
        model: this.model,
        collection: this.collection,
        directiveValue: this.directiveValue,
        matchedAttribute: this.matchedAttribute,
        somethingElse: 1
      });
    });

    it('creates jQuery wrapped element as $el', function () {
      chai.expect(this.attributeDirective.$el[0]).to.equal(this.el);
    });

    it('copies el, $parentScope, model, collection, directiveValue, matchedAttribute to this', function () {
      chai.expect(this.attributeDirective.el).to.equal(this.el);
      chai.expect(this.attributeDirective.$parentScope).to.equal(this.$parentScope);
      chai.expect(this.attributeDirective.model).to.equal(this.model);
      chai.expect(this.attributeDirective.collection).to.equal(this.collection);
      chai.expect(this.attributeDirective.directiveValue).to.equal(this.directiveValue);
      chai.expect(this.attributeDirective.matchedAttribute).to.equal(this.matchedAttribute);
    });

    it('doesnt copy all options, but keeps as them as options', function () {
      chai.expect(this.attributeDirective.somethingElse).to.be.undefined;
      chai.expect(this.attributeDirective.options.somethingElse).to.equal(1);
    });
    
  });
});
