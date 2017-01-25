import assert from 'assert'

describe('@mixin', function () {
  it('causes the property to be readonly if true', () => {
    function mixin(args) {
      return klass => {
        // YOUR IMPLEMENTATION HERE
        for( let [k,v] of Object.entries(args)) {
          Object.defineProperty(klass.prototype, k, { value: v})
        }

        // Need help? See https://github.com/jayphelps/core-decorators.js/blob/master/src/mixin.js
        return klass;
      }
    }

    const BarMixin = {
      stuff1: 'stuff1',
      getStuff2() {
        return 'stuff2';
      }
    };

    @mixin(BarMixin)
    class Foo {
      myStuff() {
        return 'foo'
      }
    }

    const foo = new Foo()
    console.log('foo', foo.stuff1)
    assert.strictEqual(foo.stuff1, 'stuff1')
    assert.strictEqual(foo.getStuff2(), 'stuff2')
    assert.strictEqual(foo.myStuff(), 'foo')
  })
})
