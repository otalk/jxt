import * as types from './types';
import * as helpers from './helpers';
import StanzaConstructor from './stanza';

class JXT {
    constructor() {
        this._LOOKUP = {};
        this._LOOKUP_EXT = {};
        this._TAGS = {};
        this._CB_DEFINITION = {};
        this._CB_TAG = {};
        this._ID = Symbol('JXT');
        this.utils = {
            ...types,
            ...helpers
        };
    }

    use(init) {
        if (!init || typeof init !== 'function') {
            return this;
        }
        if (!init[this._ID]) {
            init(this);
            init[this._ID] = true;
        }
        return this;
    }

    getDefinition(el, ns, required) {
        const JXTClass = this._LOOKUP[ns + '|' + el];
        if (required && !JXTClass) {
            throw new Error('Could not find definition for <' + el + ' xmlns="' + ns + '" />');
        }
        return JXTClass;
    }

    getExtensions(el, ns) {
        return this._LOOKUP_EXT[ns + '|' + el] || {};
    }

    withDefinition(el, ns, cb) {
        const name = ns + '|' + el;
        if (!this._CB_DEFINITION[name]) {
            this._CB_DEFINITION[name] = [];
        }
        this._CB_DEFINITION[name].push(cb);
        if (this._LOOKUP[name]) {
            cb(this._LOOKUP[name]);
        }
    }

    withTag(tag, cb) {
        if (!this._CB_TAG[tag]) {
            this._CB_TAG[tag] = [];
        }
        this._CB_TAG[tag].push(cb);
        this.tagged(tag).forEach(function(stanza) {
            cb(stanza);
        });
    }

    tagged(tag) {
        return this._TAGS[tag] || [];
    }

    build(xml) {
        const JXTClass = this.getDefinition(xml.localName, xml.namespaceURI);
        if (JXTClass) {
            return new JXTClass(null, xml);
        }
    }

    parse(str) {
        const xml = helpers.parse(str);
        if (!xml) {
            return;
        }
        return this.build(xml);
    }

    extend(ParentJXT, ChildJXT, multiName, hideSingle) {
        const parentName = ParentJXT.prototype._NS + '|' + ParentJXT.prototype._EL;
        const name = ChildJXT.prototype._name;
        const qName = ChildJXT.prototype._NS + '|' + ChildJXT.prototype._EL;

        this._LOOKUP[qName] = ChildJXT;

        if (!this._LOOKUP_EXT[qName]) {
            this._LOOKUP_EXT[qName] = {};
        }
        if (!this._LOOKUP_EXT[parentName]) {
            this._LOOKUP_EXT[parentName] = {};
        }
        this._LOOKUP_EXT[parentName][name] = ChildJXT;

        if (!multiName || (multiName && !hideSingle)) {
            this.add(ParentJXT, name, types.extension(ChildJXT));
        }
        if (multiName) {
            this.add(ParentJXT, multiName, types.multiExtension(ChildJXT));
        }
    }

    add(ParentJXT, fieldName, field) {
        field.enumerable = true;
        Object.defineProperty(ParentJXT.prototype, fieldName, field);
    }

    define(opts) {
        const self = this;
        const Stanza = StanzaConstructor(this, opts);
        const ns = Stanza.prototype._NS;
        const el = Stanza.prototype._EL;
        const tags = Stanza.prototype._TAGS;
        const name = ns + '|' + el;

        this._LOOKUP[name] = Stanza;

        tags.forEach(function(tag) {
            if (!self._TAGS[tag]) {
                self._TAGS[tag] = [];
            }
            self._TAGS[tag].push(Stanza);
        });

        const fieldNames = Object.keys(opts.fields || {});
        fieldNames.forEach(function(fieldName) {
            self.add(Stanza, fieldName, opts.fields[fieldName]);
        });

        if (this._CB_DEFINITION[name]) {
            this._CB_DEFINITION[name].forEach(function(handler) {
                handler(Stanza);
            });
        }

        tags.forEach(function(tag) {
            if (self._CB_TAG[tag]) {
                self._CB_TAG[tag].forEach(function(handler) {
                    handler(Stanza);
                });
            }
        });

        return Stanza;
    }

    // Expose methods on the required module itself
    static createRegistry() {
        return new JXT();
    }
}

Object.assign(JXT, helpers);
Object.assign(JXT, types);

export function createRegistry() {
    return new JXT();
}

export default JXT;
