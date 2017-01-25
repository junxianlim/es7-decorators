import assert from 'assert'

describe('EXAMPLE: @readonly', function () {
  it('causes the property to be readonly if true', () => {
    function readonly(value) {
      return function (target, key, descriptor) {
        descriptor.writable = value != null ? !value : false // defaults to false
        return descriptor
      }
    }
    const c = {
      @readonly(true)
      propA: 'foo',
      @readonly(false)
      propB: 'foo',
      @readonly() // defaults to true
      propC: 'foo',
    }

    assert.throws(
      () => {
        c.propA = 'bar'
      }
    )
    c.propB = 'baz'
    assert.equal(c.propB, 'baz')
    assert.throws(
      () => {
        c.propC = 'bar'
      }
    )
  })
})

describe('@enumerable', function () {
  it('makes the method enumerable or otherwise', () => {
    function enumerable(value) {
      return function (target, key, descriptor) {
        descriptor.enumerable = value != null ? value : false
        return descriptor
      }
    }

    const c = {
      @enumerable(false)
      propA: 'foo',
      @enumerable(true)
      propB: 'foo',
    }

    assert.deepEqual(Object.keys(c), ['propB'])
  })
})

describe('@alias', function () {
  it('creates an alias with the same functionality', () => {
    function alias(value) {
      return function (target, key, descriptor) {
        target[value] = descriptor.value
        return descriptor
      }
    }

    class C {
      constructor() {
        this.count = 0
      }

      @alias('addOne')
      increment() {
        this.count += 1
      }
    }

    const c = new C()

    c.increment()
    assert.equal(c.count, 1)

    c.addOne()
    assert.equal(c.count, 2)
  })
})

describe('@deprecated', function () {
  it('logs a deprecation message', () => {
    let logs = []
    function log(msg) {
      logs.push(msg)
    }

    function deprecated(value) {
      return function (target, key, descriptor) {
        log(value)
        return descriptor
      }
    }

    class C {
      @deprecated('Stop using me please.')
      method1() {}

      @deprecated('Stop, stop!')
      @deprecated('Come on, upgrade!')
      method2() {}
    }

    const c = new C()
    c.method1()
    c.method2();

    assert.deepEqual(logs, [
      'Stop using me please.', 'Come on, upgrade!', 'Stop, stop!'
      // FIX ME. Note the order the decorators were called.
    ])
  })
})

describe('EXAMPLE: @time', function () {
  it("calculates the time between start and end of function using console.time", () => {
    function time() {
      return function (target, key, descriptor) {
        const label = `${key}-${Date.now()}`

        const fn = descriptor.value
        const newFn = function() {
          console.time(label)
          fn.apply(this, arguments)
          console.timeEnd(label)
        }

        descriptor.value = newFn
        return descriptor
      }
    }

    class C {
      @time() // by right shouldn't need () in the future, but for now we do...
      method() {
        for (let i = 0; i < 1000000; i++) {
        }
      }
    }

    const c = new C()
    c.method()

    // No tests. Example only.
  })
})

describe('@debounce', function () {
  it("only executes the function when it hasn't been called for a given time", (done) => {
    function debounce(value) {
      return function (target, key, descriptor) {
        // YOUR IMPLEMENTATION HERE, or import lodash and use that (try not to)
        // Cheatsheet: https://davidwalsh.name/javascript-debounce-function
        let timeout;
        const fn = descriptor.value

        const newFn = function() {

          const context = this, args = arguments

          let later = function() {
            timeout = null
            fn.apply(context,args)
          }
          clearTimeout(timeout)
          timeout = setTimeout(later, value)
        }

        descriptor.value = newFn

        return descriptor
      }
    }

    class C {
      constructor() {
        this.count = 0
      }

      @debounce(500)
      onClick() {
        this.count++;
      }
    }

    const c = new C()
    c.onClick()
    c.onClick()
    c.onClick()

    setTimeout(() => {
      assert.deepEqual(c.count, 1) // clicked at most once
      done();
    }, 1000);
  })
})

describe('@memoize', function () {
  it("returns the result immediately if called with the same arguments", () => {

    // let cache = {}
    function memoize(value) {
      let cache = typeof cache === "undefined" ? {} : cache

      return function (target, key, descriptor) {

        const fn = descriptor.value
        const newFn = function() {

          if (arguments[0] in cache) {
            return cache[arguments[0]]

          } else {
            let result = fn.apply(this,arguments)
            cache[arguments[0]] = result

            return result
          }
        }

        // YOUR IMPLEMENTATION HERE
        descriptor.value = newFn
        return descriptor
      }
    }

    class Fibonacci {
      @memoize()
      static compute(n) {
        switch(true) {
          case (n < 1): {
            return 0;
          }
          case (n < 2): {
            return 1;
          }
          default: {
            return Fibonacci.compute(n - 2) + Fibonacci.compute(n - 1);
          }
        }
      }
    }

    let start = Date.now()
    Fibonacci.compute(38)
    let end = Date.now()

    assert.strictEqual(end - start > 500, false) // slow

    start = Date.now()
    Fibonacci.compute(38)
    end = Date.now()

    assert.strictEqual(end - start < 3, true) // instantaneous!
  })
})

describe('@promisify', function () {
  it("returns a promise that resolves to the function return value", (done) => {
    function promisify(value) {
      return function (target, key, descriptor) {
        // YOUR IMPLEMENTATION HERE

        const fn = descriptor.value
        const newFn = function() {

          return new Promise((resolve,reject) => {
            resolve(fn.call(this, arguments))
          })
        }

        descriptor.value = newFn

        return descriptor
      }
    }

    class C {
      @promisify()
      method(n) {
        return 1000
      }
    }

    const c = new C()
    const promise = c.method()
    assert.strictEqual(promise instanceof Promise, true)
    promise.then(val => {
      assert.strictEqual(val, 1000)
      done()
    });
  })
})

// and many many more that you can possibly think of
//
// Try looking at the following, write your own decorators and tests for them:
// https://github.com/AvraamMavridis/javascript-decorators
// https://github.com/jayphelps/core-decorators.js
//
// Study the code there and figure out why they work!
