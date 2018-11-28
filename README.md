## jxt - JSON/XML Translation for the Browser

## What is this?

A basic framework for translating XML to dev-friendly JSON and back again, and can be used
both in the browser and in node.

## Installing

```sh
$ npm install jxt
```

## How to use it

First, we define the mapping between our XML and desired JSON:

```js
// Create a registry instance that will track our definitions and
// extensions.
var jxt = require('jxt').createRegistry();
var helpers = jxt.utils;

var Message = jxt.define({
    name: 'message',
    namespace: 'jabber:client',
    element: 'message',
    fields: {
        to: helpers.attribute('to'),
        from: helpers.attribute('from'),
        subject: helpers.textSub('jabber:client', 'subject'),
        body: helpers.textSub('jabber:client', 'body')
    }
});
```

Now, we can create `Message` objects, and set fields and treat it just like JSON, and it will map it to XML.

```js
var msg = new Message();
msg.to = 'foo@example.com';
msg.body = 'giving a demo of jxt';

console.log(msg.toJSON());
console.log(msg.toString());

// {to: 'foo@example.com', body: 'giving a demo of jxt'}
// <message xmlns="jabber:client" to="foo@example.com"><body>giving a demo of jxt</body></message>
```

Mappings can be extended:

```js
// jxt is our registry object

var Ext = jxt.define({
    name: 'demoExt',
    namespace: 'jxt',
    element: 'demo',
    fields: {
        text: jxt.text()
    }
});

jxt.extend(Message, Ext);

var msg = new Message();
msg.demoExt.text = 'an extension';

console.log(msg.toJSON());
console.log(msg.toString());
// {demoExt: {text: 'an extension'}}
// <message xmlns="jabber:client"><demo xmlns="jxt">an extension</demo></message>
```

## Predefined Field Types

-   attribute
-   b64Text
-   boolAttribute
-   boolSub
-   boolSubAttribute
-   dateAttribute
-   dateSub
-   dateSubAttribute
-   enumSub
-   langAttribute
-   multiTextSub
-   numberAttribute
-   numberSub
-   numberSubAttribute
-   subAttribute
-   langTextSub
-   textSub
-   text

## License

[MIT](./LICENSE)

## Created By

If you like this, follow [@lancestout](http://twitter.com/lancestout) on twitter.
