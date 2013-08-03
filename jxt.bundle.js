(function(e){if("function"==typeof bootstrap)bootstrap("jxt",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeJxt=e}else"undefined"!=typeof window?window.jxt=e():global.jxt=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var _ = require('./vendor/lodash');
var serializer = new XMLSerializer();
var XML_NS = 'http://www.w3.org/XML/1998/namespace';
var TOP_LEVEL_LOOKUP = {};
var LOOKUP = {};
var LOOKUP_EXT = {};


var find = exports.find = function (xml, NS, selector) {
    var children = xml.querySelectorAll(selector);
    return _.filter(children, function (child) {
        return child.namespaceURI === NS && child.parentNode == xml;
    });
};

exports.findOrCreate = function (xml, NS, selector) {
    var existing = find(xml, NS, selector);
    if (existing.length) {
        return existing[0];
    } else {
        var created = document.createElementNS(NS, selector);
        xml.appendChild(created);
        return created;
    }
};

exports.init = function (self, xml, data) {
    self.xml = xml || document.createElementNS(self.NS, self.EL);
    if (!self.xml.parentNode || self.xml.parentNode.namespaceURI !== self.NS) {
        self.xml.setAttribute('xmlns', self.NS);
    }

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
    return self;
};

exports.getSubText = function (xml, NS, element) {
    var subs = find(xml, NS, element);
    if (!subs) {
        return '';
    }

    for (var i = 0; i < subs.length; i++) {
        if (subs[i].namespaceURI === NS) {
            return subs[i].textContent || '';
        }
    }
    
    return '';
};

exports.getMultiSubText = function (xml, NS, element, extractor) {
    var subs = find(xml, NS, element);
    var results = [];
    extractor = extractor || function (sub) {
        return sub.textContent || '';
    };

    for (var i = 0; i < subs.length; i++) {
        if (subs[i].namespaceURI === NS) {
            results.push(extractor(subs[i]));
        }
    }
    
    return results;
};

exports.getSubLangText = function (xml, NS, element, defaultLang) {
    var subs = find(xml, NS, element);
    if (!subs) {
        return {};
    }

    var lang, sub;
    var results = {};
    var langs = [];

    for (var i = 0; i < subs.length; i++) {
        sub = subs[i];
        if (sub.namespaceURI === NS) {
            lang = sub.getAttributeNS(XML_NS, 'lang') || defaultLang;
            langs.push(lang);
            results[lang] = sub.textContent || '';
        }
    }
    
    return results;
};


exports.setSubText = function (xml, NS, element, value) {
    var subs = find(xml, NS, element);
    if (!subs.length) {
        if (value) {
            var sub = document.createElementNS(NS, element);
            sub.textContent = value;
            xml.appendChild(sub);
        }
    } else {
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].namespaceURI === NS) {
                if (value) {
                    subs[i].textContent = value;
                    return;
                } else {
                    xml.removeChild(subs[i]);
                }
            }
        }
    }
};

exports.setMultiSubText = function (xml, NS, element, value, builder) {
    var subs = find(xml, NS, element);
    var values = [];
    builder = builder || function (value) {
        var sub = document.createElementNS(NS, element);
        sub.textContent = value;
        xml.appendChild(sub);
    };
    if (typeof value === 'string') {
        values = (value || '').split('\n');
    } else {
        values = value;
    }
    _.forEach(subs, function (sub) {
        xml.removeChild(sub);
    });
    _.forEach(values, function (val) {
        if (val) {
            builder(val);
        }
    });
};

exports.setSubLangText = function (xml, NS, element, value, defaultLang) {
    var sub, lang;
    var subs = find(xml, NS, element);
    if (subs.length) {
        for (var i = 0; i < subs.length; i++) {
            sub = subs[i];
            if (sub.namespaceURI === NS) {
                xml.removeChild(sub);
            }
        }
    }

    if (typeof value === 'string') {
        sub = document.createElementNS(NS, element);
        sub.textContent = value;
        xml.appendChild(sub);
    } else if (typeof value === 'object') {
        for (lang in value) {
            if (value.hasOwnProperty(lang)) {
                sub = document.createElementNS(NS, element);
                if (lang !== defaultLang) {
                    sub.setAttributeNS(XML_NS, 'lang', lang);
                }
                sub.textContent = value[lang];
                xml.appendChild(sub);
            }
        }
    }
};

exports.getAttribute = function (xml, attr, defaultVal) {
    return xml.getAttribute(attr) || defaultVal || '';
};

exports.setAttribute = function (xml, attr, value, force) {
    if (value || force) {
        xml.setAttribute(attr, value);
    } else {
        xml.removeAttribute(attr);
    }
};

exports.getBoolAttribute = function (xml, attr, defaultVal) {
    var val = xml.getAttribute(attr) || defaultVal || '';
    return val === 'true' || val === '1';
};

exports.setBoolAttribute = function (xml, attr, value) {
    if (value) {
        xml.setAttribute(attr, '1');
    } else {
        xml.removeAttribute(attr);
    }
};

exports.getSubAttribute = function (xml, NS, sub, attr, defaultVal) {
    var subs = find(xml, NS, sub);
    if (!subs) {
        return '';
    }

    for (var i = 0; i < subs.length; i++) {
        if (subs[i].namespaceURI === NS) {
            return subs[i].getAttribute(attr) || defaultVal || '';
        }
    }
    
    return '';
};

exports.setSubAttribute = function (xml, NS, sub, attr, value) {
    var subs = find(xml, NS, sub);
    if (!subs.length) {
        if (value) {
            sub = document.createElementNS(NS, sub);
            sub.setAttribute(attr, value);
            xml.appendChild(sub);
        }
    } else {
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].namespaceURI === NS) {
                if (value) {
                    subs[i].setAttribute(attr, value);
                    return;
                } else {
                    subs[i].removeAttribute(attr);
                }
            }
        }
    }
};

exports.toString = function () {
    return serializer.serializeToString(this.xml);
};

exports.toJSON = function () {
    var prop;
    var result = {};
    var exclude = {
        constructor: true,
        NS: true,
        EL: true,
        toString: true,
        toJSON: true,
        _extensions: true,
        prototype: true,
        xml: true,
        parent: true,
        _name: true
    };
    for (prop in this._extensions) {
        if (this._extensions[prop].toJSON) {
            result[prop] = this._extensions[prop].toJSON();
        }
    }
    for (prop in this) {
        if (!exclude[prop] && !((LOOKUP_EXT[this.NS + '|' + this.EL] || {})[prop]) && !this._extensions[prop] && prop[0] !== '_') {
            var val = this[prop];
            if (typeof val == 'function') continue;
            var type = Object.prototype.toString.call(val);
            if (type.indexOf('Object') >= 0) {
                if (Object.keys(val).length > 0) {
                    result[prop] = val;
                }
            } else if (type.indexOf('Array') >= 0) {
                if (val.length > 0) {
                    result[prop] = val;
                }
            } else if (!!val) {
                result[prop] = val;
            }
        }
    }
    return result;
};

exports.extend = function (ParentJXT, ChildJXT) {
    var parentName = ParentJXT.prototype.NS + '|' + ParentJXT.prototype.EL;
    var name = ChildJXT.prototype._name;
    var qName = ChildJXT.prototype.NS + '|' + ChildJXT.prototype.EL;

    LOOKUP[qName] = ChildJXT;
    if (!LOOKUP_EXT[qName]) {
        LOOKUP_EXT[qName] = {};
    }
    if (!LOOKUP_EXT[parentName]) {
        LOOKUP_EXT[parentName] = {};
    }
    LOOKUP_EXT[parentName][name] = ChildJXT;

    ParentJXT.prototype.__defineGetter__(name, function () {
        if (!this._extensions[name]) {
            var existing = exports.find(this.xml, ChildJXT.prototype.NS, ChildJXT.prototype.EL);
            if (!existing.length) {
                this._extensions[name] = new ChildJXT();
                this.xml.appendChild(this._extensions[name].xml);
            } else {
                this._extensions[name] = new ChildJXT(null, existing[0]);
            }
            this._extensions[name].parent = this;
        }
        return this._extensions[name];
    });
    ParentJXT.prototype.__defineSetter__(name, function (value) {
        var child = this[name];
        _.extend(child, value);
    });
};

exports.topLevel = function (JXT) {
    var name = JXT.prototype.NS + '|' + JXT.prototype.EL;
    LOOKUP[name] = JXT;
    TOP_LEVEL_LOOKUP[name] = JXT;
};

exports.build = function (xml) {
    var JXT = TOP_LEVEL_LOOKUP[xml.namespaceURI + '|' + xml.localName];
    if (JXT) {
        return new JXT(null, xml);
    }
};

exports.XML_NS = XML_NS;
exports.TOP_LEVEL_LOOKUP = TOP_LEVEL_LOOKUP;
exports.LOOKUP_EXT = LOOKUP_EXT;
exports.LOOKUP = LOOKUP;

},{"./vendor/lodash":2}],2:[function(require,module,exports){
(function(global){/**
 * @license
 * Lo-Dash 1.3.1 (Custom Build) lodash.com/license
 * Build: `lodash include="each,extend,filter"`
 * Underscore.js 1.4.4 underscorejs.org/LICENSE
 */
;!function(t){function r(t){return typeof t.toString!="function"&&typeof(t+"")=="string"}function e(t){t.length=0,g.length<y&&g.push(t)}function n(t){var r=t.k;r&&n(r),t.b=t.k=t.object=t.number=t.string=null,h.length<y&&h.push(t)}function o(){}function u(){var t=h.pop()||{a:"",b:null,c:"",k:null,"false":!1,d:"",e:"",f:"","null":!1,number:null,object:null,push:null,g:null,string:null,h:"","true":!1,undefined:!1,i:!1,j:!1};t.g=v,t.b=t.c=t.f=t.h="",t.e="r",t.i=!0,t.j=!!X;for(var r,e=0;r=arguments[e];e++)for(var u in r)t[u]=r[u];
e=t.a,t.d=/^[^,]+/.exec(e)[0],r=Function,e="return function("+e+"){",u="var m,r="+t.d+",C="+t.e+";if(!r)return C;"+t.h+";",t.b?(u+="var s=r.length;m=-1;if("+t.b+"){",K.unindexedChars&&(u+="if(q(r)){r=r.split('')}"),u+="while(++m<s){"+t.f+";}}else{"):K.nonEnumArgs&&(u+="var s=r.length;m=-1;if(s&&n(r)){while(++m<s){m+='';"+t.f+";}}else{"),K.enumPrototypes&&(u+="var E=typeof r=='function';"),K.enumErrorProps&&(u+="var D=r===j||r instanceof Error;");var c=[];if(K.enumPrototypes&&c.push('!(E&&m=="prototype")'),K.enumErrorProps&&c.push('!(D&&(m=="message"||m=="name"))'),t.i&&t.j)u+="var A=-1,B=z[typeof r]&&t(r),s=B?B.length:0;while(++A<s){m=B[A];",c.length&&(u+="if("+c.join("&&")+"){"),u+=t.f+";",c.length&&(u+="}"),u+="}";
else if(u+="for(m in r){",t.i&&c.push("l.call(r, m)"),c.length&&(u+="if("+c.join("&&")+"){"),u+=t.f+";",c.length&&(u+="}"),u+="}",K.nonEnumShadows){for(u+="if(r!==y){var h=r.constructor,p=r===(h&&h.prototype),e=r===H?G:r===j?i:J.call(r),v=w[e];",k=0;7>k;k++)u+="m='"+t.g[k]+"';if((!(p&&v[m])&&l.call(r,m))",t.i||(u+="||(!v[m]&&r[m]!==y[m])"),u+="){"+t.f+"}";u+="}"}return(t.b||K.nonEnumArgs)&&(u+="}"),u+=t.c+";return C",r=r("i,j,l,n,o,q,t,u,y,z,w,G,H,J",e+u+"}"),n(t),r(_,z,R,a,U,l,X,o,D,P,V,A,N,M)}function a(t){return M.call(t)==j
}function c(t,n,u,i,l,s){var p=u===b;if(typeof u=="function"&&!p){u=o.createCallback(u,i,2);var m=u(t,n);if(typeof m!="undefined")return!!m}if(t===n)return 0!==t||1/t==1/n;var h=typeof t,y=typeof n;if(t===t&&(!t||"function"!=h&&"object"!=h)&&(!n||"function"!=y&&"object"!=y))return!1;if(null==t||null==n)return t===n;if(y=M.call(t),h=M.call(n),y==j&&(y=w),h==j&&(h=w),y!=h)return!1;switch(y){case O:case E:return+t==+n;case x:return t!=+t?n!=+n:0==t?1/t==1/n:t==+n;case S:case A:return t==n+""}if(h=y==C,!h){if(R.call(t,"__wrapped__")||R.call(n,"__wrapped__"))return c(t.__wrapped__||t,n.__wrapped__||n,u,i,l,s);
if(y!=w||!K.nodeClass&&(r(t)||r(n)))return!1;var y=!K.argsObject&&a(t)?Object:t.constructor,d=!K.argsObject&&a(n)?Object:n.constructor;if(y!=d&&(!f(y)||!(y instanceof y&&f(d)&&d instanceof d)))return!1}for(d=!l,l||(l=g.pop()||[]),s||(s=g.pop()||[]),y=l.length;y--;)if(l[y]==t)return s[y]==n;var v=0,m=!0;if(l.push(t),s.push(n),h){if(y=t.length,v=n.length,m=v==t.length,!m&&!p)return m;for(;v--;)if(h=y,d=n[v],p)for(;h--&&!(m=c(t[h],d,u,i,l,s)););else if(!(m=c(t[v],d,u,i,l,s)))break;return m}return Z(n,function(r,e,n){return R.call(n,e)?(v++,m=R.call(t,e)&&c(t[e],r,u,i,l,s)):void 0
}),m&&!p&&Z(t,function(t,r,e){return R.call(e,r)?m=-1<--v:void 0}),d&&(e(l),e(s)),m}function f(t){return typeof t=="function"}function i(t){return!(!t||!P[typeof t])}function l(t){return typeof t=="string"||M.call(t)==A}function s(t,r,e){var n=[];if(r=o.createCallback(r,e),U(t)){e=-1;for(var u=t.length;++e<u;){var a=t[e];r(a,e,t)&&n.push(a)}}else Y(t,function(t,e,o){r(t,e,o)&&n.push(t)});return n}function p(t,r,e){if(r&&typeof e=="undefined"&&U(t)){e=-1;for(var n=t.length;++e<n&&false!==r(t[e],e,t););}else Y(t,r,e);
return t}function m(t){return t}var g=[],h=[],b={},y=40,d=(d=/\bthis\b/)&&d.test(function(){return this})&&d,v="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),j="[object Arguments]",C="[object Array]",O="[object Boolean]",E="[object Date]",_="[object Error]",x="[object Number]",w="[object Object]",S="[object RegExp]",A="[object String]",P={"boolean":!1,"function":!0,object:!0,number:!1,string:!1,undefined:!1},I=P[typeof exports]&&exports,B=P[typeof module]&&module&&module.exports==I&&module,F=P[typeof global]&&global;
!F||F.global!==F&&F.window!==F||(t=F);var z=Error.prototype,D=Object.prototype,N=String.prototype,F=RegExp("^"+(D.valueOf+"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/valueOf|for [^\]]+/g,".+?")+"$"),q=Function.prototype.toString,R=D.hasOwnProperty,$=D.propertyIsEnumerable,M=D.toString,T=F.test(T=M.bind)&&T,G=F.test(G=Object.create)&&G,H=F.test(H=Array.isArray)&&H,J=F.test(J=Object.keys)&&J,G=F.test(t.attachEvent),L=T&&!/\n|true/.test(T+G),V={};V[C]=V[E]=V[x]={constructor:!0,toLocaleString:!0,toString:!0,valueOf:!0},V[O]=V[A]={constructor:!0,toString:!0,valueOf:!0},V[_]=V["[object Function]"]=V[S]={constructor:!0,toString:!0},V[w]={constructor:!0},function(){for(var t=v.length;t--;){var r,e=v[t];
for(r in V)R.call(V,r)&&!R.call(V[r],e)&&(V[r][e]=!1)}}();var K=o.support={};!function(){var t=function(){this.x=1},r=[];t.prototype={valueOf:1,y:1};for(var e in new t)r.push(e);for(e in arguments);K.argsObject=arguments.constructor==Object&&!(arguments instanceof Array),K.argsClass=a(arguments),K.enumErrorProps=$.call(z,"message")||$.call(z,"name"),K.enumPrototypes=$.call(t,"prototype"),K.fastBind=T&&!L,K.nonEnumArgs=0!=e,K.nonEnumShadows=!/valueOf/.test(r),K.unindexedChars="xx"!="x"[0]+Object("x")[0];
try{K.nodeClass=!(M.call(document)==w&&!({toString:0}+""))}catch(n){K.nodeClass=!0}}(1);var Q={a:"x,F,k",h:"var a=arguments,b=0,c=typeof k=='number'?2:a.length;while(++b<c){r=a[b];if(r&&z[typeof r]){",f:"if(typeof C[m]=='undefined')C[m]=r[m]",c:"}}"},G={a:"f,d,I",h:"d=d&&typeof I=='undefined'?d:u.createCallback(d,I)",b:"typeof s=='number'",f:"if(d(r[m],m,f)===false)return C"},F={h:"if(!z[typeof r])return C;"+G.h,b:!1};K.argsClass||(a=function(t){return t?R.call(t,"callee"):!1});var U=H||function(t){return t?typeof t=="object"&&M.call(t)==C:!1
},W=u({a:"x",e:"[]",h:"if(!(z[typeof x]))return C",f:"C.push(m)"}),X=J?function(t){return i(t)?K.enumPrototypes&&typeof t=="function"||K.nonEnumArgs&&t.length&&a(t)?W(t):J(t):[]}:W,Y=u(G),H=u(Q,{h:Q.h.replace(";",";if(c>3&&typeof a[c-2]=='function'){var d=u.createCallback(a[--c-1],a[c--],2)}else if(c>2&&typeof a[c-1]=='function'){d=a[--c]}"),f:"C[m]=d?d(C[m],r[m]):r[m]"}),Z=u(G,F,{i:!1});f(/x/)&&(f=function(t){return typeof t=="function"&&"[object Function]"==M.call(t)}),o.assign=H,o.createCallback=function(t,r,e){if(null==t)return m;
var n=typeof t;if("function"!=n){if("object"!=n)return function(r){return r[t]};var o=X(t);return function(r){for(var e=o.length,n=!1;e--&&(n=c(r[o[e]],t[o[e]],b)););return n}}return typeof r=="undefined"||d&&!d.test(q.call(t))?t:1===e?function(e){return t.call(r,e)}:2===e?function(e,n){return t.call(r,e,n)}:4===e?function(e,n,o,u){return t.call(r,e,n,o,u)}:function(e,n,o){return t.call(r,e,n,o)}},o.filter=s,o.forEach=p,o.forIn=Z,o.keys=X,o.each=p,o.extend=H,o.select=s,o.identity=m,o.isArguments=a,o.isArray=U,o.isEqual=c,o.isFunction=f,o.isObject=i,o.isString=l,o.VERSION="1.3.1",typeof define=="function"&&typeof define.amd=="object"&&define.amd?(t._=o, define(function(){return o
})):I&&!I.nodeType?B?(B.exports=o)._=o:I._=o:t._=o}(this);
})(window)
},{}]},{},[1])(1)
});
;