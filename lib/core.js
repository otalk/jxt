'use strict';

var _ = require('underscore');
var xmlshim = require('ltx-dom-shim');

var helpers = require('./helpers');
var types = require('./types');

var LOOKUP = {};
var LOOKUP_EXT = {};
var TOP_LEVEL_LOOKUP = {};


function topLevel(JXT) {
    var name = JXT.prototype._NS + '|' + JXT.prototype._EL;
    LOOKUP[name] = JXT;
    TOP_LEVEL_LOOKUP[name] = JXT;
}

function toString(xml) {
    return xmlshim.serializeToString(xml);
}

function toJSON(jxt) {
    var prop;
    var result = {};
    var exclude = {
        constructor: true,
        _EL: true,
        _NS: true,
        _extensions: true,
        _name: true,
        parent: true,
        prototype: true,
        toJSON: true,
        toString: true,
        xml: true
    };

    for (prop in jxt._extensions) {
        if (jxt._extensions[prop].toJSON && prop[0] !== '_') {
            result[prop] = jxt._extensions[prop].toJSON();
        }
    }

    for (prop in jxt) {
        if (!exclude[prop] && !((LOOKUP_EXT[jxt._NS + '|' + jxt._EL] || {})[prop]) && !jxt._extensions[prop] && prop[0] !== '_') {
            var val = jxt[prop];
            if (typeof val === 'function') {
                continue;
            }
            var type = Object.prototype.toString.call(val);
            if (type.indexOf('Object') >= 0) {
                if (Object.keys(val).length > 0) {
                    result[prop] = val;
                }
            } else if (type.indexOf('Array') >= 0) {
                if (val.length > 0) {
                    var vals = [];
                    for (var n in val) {
                        var nval = val[n];
                        vals.push(nval.toJSON !== undefined ? nval.toJSON() : nval);
                    }
                    result[prop] = vals;
                }
            } else if (val !== undefined && val !== false && val !== '') {
                result[prop] = val;
            }
        }
    }

    return result;
}


exports.build = function (xml) {
    var JXT = TOP_LEVEL_LOOKUP[xml.namespaceURI + '|' + xml.localName];
    if (JXT) {
        return new JXT(null, xml);
    }
};


exports.parse = function (str, JXT, lookupContext) {
    lookupContext = lookupContext || TOP_LEVEL_LOOKUP;
    var nodes = xmlshim.parseFromString(str, 'application/xml').childNodes;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType === 1) {
            // Check for parse errors because browsers are stupid
            if (nodes[i].nodeName === 'parsererror') {
                // Matches Firefox parse error
                throw new Error({name: 'parsererror', message: 'Could not parse: ' + str});
            } else if (nodes[i].childElementCount > 0 && nodes[i].childNodes[0].nodeName === 'parsererror') {
                // Matches Webkit parse error
                throw new Error({name: 'parsererror', message: 'Could not parse: ' + str});
            }

            var xml = nodes[i];
            if (JXT) {
                return new JXT(null, xml);
            } else {
                JXT = lookupContext[xml.namespaceURI + '|' + xml.localName];
                return new JXT(null, xml);
            }
        }
    }
    throw new Error({name: 'parsererror', message: 'Could not parse: ' + str});
};


exports.extend = function (ParentJXT, ChildJXT, multiName) {
    var parentName = ParentJXT.prototype._NS + '|' + ParentJXT.prototype._EL;
    var name = ChildJXT.prototype._name;
    var qName = ChildJXT.prototype._NS + '|' + ChildJXT.prototype._EL;

    LOOKUP[qName] = ChildJXT;
    if (!LOOKUP_EXT[qName]) {
        LOOKUP_EXT[qName] = {};
    }
    if (!LOOKUP_EXT[parentName]) {
        LOOKUP_EXT[parentName] = {};
    }
    LOOKUP_EXT[parentName][name] = ChildJXT;

    exports.add(ParentJXT, name, types.extension(ChildJXT));
    if (multiName) {
        exports.add(ParentJXT, multiName, types.multiExtension(ChildJXT));
    }
};

exports.add = function (ParentJXT, fieldName, field) {
    field.enumerable = true;
    Object.defineProperty(ParentJXT.prototype, fieldName, field);
};

exports.define = function (opts) {
    var StanzaConstructor = function (data, xml, parent) {
        var self = this;

        var parentNode = (xml || {}).parentNode || (parent || {}).xml;
        var parentNS = (parentNode || {}).namespaceURI;

        self.xml = xml || helpers.createElement(self._NS, self._EL, parentNS);

        _.each(opts.prefixes || {}, function (namespace, prefix) {
            self.xml.setAttribute('xmlns:' + prefix, namespace);
        });

        self._extensions = {};

        _.each(self.xml.childNodes, function (child) {
            var childName = child.namespaceURI + '|' + child.localName;
            var ChildJXT = LOOKUP[childName];
            if (ChildJXT !== undefined) {
                var name = ChildJXT.prototype._name;
                self._extensions[name] = new ChildJXT(null, child);
                self._extensions[name].parent = self;
            }
        });

        _.extend(self, data);

        if (opts.init) {
            opts.init.apply(self, [data]);
        }

        return self;
    };

    StanzaConstructor.prototype = {
        constructor: {
            value: StanzaConstructor
        },
        _name: opts.name,
        _eventname: opts.eventName,
        _NS: opts.namespace,
        _EL: opts.element,
        toString: function () { return toString(this.xml); },
        toJSON: function () { return toJSON(this); }
    };

    var fieldNames = Object.keys(opts.fields || {});
    fieldNames.forEach(function (fieldName) {
        exports.add(StanzaConstructor, fieldName, opts.fields[fieldName]);
    });

    if (opts.topLevel) {
        topLevel(StanzaConstructor);
    }

    return StanzaConstructor;
};
