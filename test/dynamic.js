'use strict';

var test = require('tape');
var jxt = require('../');
var Registry = jxt.createRegistry();


var Child = Registry.define({
    name: 'child',
    namespace: 'test',
    element: 'childel',
    fields: {
        foo: jxt.attribute('foo', 'works')
    }
});

// Link Child to Base, before we define Base
Registry.withDefinition('baseel', 'test', function (Base) {
    Registry.extend(Base, Child);
});



test('withDefinition', function (t) {
    var Base = Registry.define({
        name: 'base',
        namespace: 'test',
        element: 'baseel'
    });

    var b = new Base();

    t.ok(b.child);
    t.equals(b.child.foo, 'works');
    t.end();
});
