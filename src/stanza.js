import * as helpers from './helpers';

const EXCLUDE = {
    constructor: true,
    parent: true,
    prototype: true,
    toJSON: true,
    toString: true,
    xml: true
};

export default function(JXT, opts) {
    class Stanza {
        constructor(data, xml, parent) {
            const self = this;
            const parentNode = (xml || {}).parentNode || (parent || {}).xml;
            const parentNS = (parentNode || {}).namespaceURI;

            self.xml = xml || helpers.createElement(self._NS, self._EL, parentNS);

            Object.keys(self._PREFIXES).forEach(function(prefix) {
                const namespace = self._PREFIXES[prefix];
                self.xml.setAttribute('xmlns:' + prefix, namespace);
            });

            self._extensions = {};

            for (let i = 0, len = self.xml.childNodes.length; i < len; i++) {
                const child = self.xml.childNodes[i];
                const ChildJXT = JXT.getDefinition(child.localName, child.namespaceURI);
                if (ChildJXT !== undefined) {
                    const name = ChildJXT.prototype._name;
                    self._extensions[name] = new ChildJXT(null, child);
                    self._extensions[name].parent = self;
                }
            }

            const proto = Object.getPrototypeOf(self);
            for (const key of Object.keys(data || {})) {
                const desc = Object.getOwnPropertyDescriptor(proto, key);
                if (desc.set) {
                    desc.set.call(self, data[key]);
                }
            }

            if (opts.init) {
                opts.init.apply(self, [data]);
            }
            return self;
        }

        toString() {
            return this.xml.toString();
        }

        toJSON() {
            let prop;
            const result = {};

            for (prop of Object.keys(this._extensions)) {
                if (this._extensions[prop].toJSON && prop[0] !== '_') {
                    result[prop] = this._extensions[prop].toJSON();
                }
            }

            // tslint:disable forin
            for (prop in this) {
                const allowedName = !EXCLUDE[prop] && prop[0] !== '_';
                const isExtensionName = JXT.getExtensions(this._EL, this._NS)[prop];
                if (allowedName && !isExtensionName) {
                    const val = this[prop];
                    if (typeof val === 'function') {
                        continue;
                    }

                    const type = Object.prototype.toString.call(val);
                    if (type.indexOf('Object') >= 0) {
                        if (Object.keys(val).length > 0) {
                            if (val._isJXT) {
                                result[prop] = val.toJSON();
                            } else {
                                result[prop] = val;
                            }
                        }
                    } else if (type.indexOf('Array') >= 0) {
                        if (val.length > 0) {
                            const vals = [];
                            const len = val.length;
                            for (let n = 0; n < len; n++) {
                                const nval = val[n];
                                if (typeof nval !== 'undefined') {
                                    if (nval._isJXT) {
                                        vals.push(nval.toJSON());
                                    } else {
                                        vals.push(nval);
                                    }
                                }
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
    }

    Stanza.prototype._isJXT = true;
    Stanza.prototype._name = opts.name;
    Stanza.prototype._eventname = opts.eventName;
    Stanza.prototype._NS = opts.namespace;
    Stanza.prototype._EL = opts.element || opts.name;
    Stanza.prototype._PREFIXES = opts.prefixes || {};
    Stanza.prototype._TAGS = opts.tags || [];

    return Stanza;
}
