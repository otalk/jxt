"use strict";

var _ = require('lodash');
var helpers = require('./helpers');


var field = exports.field = function (getter, setter) {
    return function () {
        var args = _.toArray(arguments);
        return {
            get: function () {
                return getter.apply(null, [this.xml].concat(args));
            },
            set: function (value) {
                setter.apply(null, ([this.xml].concat(args)).concat([value]));
            }
        };
    };
};

exports.field = field;
exports.attribute = field(helpers.getAttribute,
                          helpers.setAttribute);
exports.boolAttribute = field(helpers.getBoolAttribute,
                              helpers.setBoolAttribute);
exports.subAttribute = field(helpers.getSubAttribute,
                             helpers.setSubAttribute);
exports.text = field(helpers.getText,
                     helpers.setText);
exports.subText = field(helpers.getSubText,
                        helpers.setSubText);
exports.multiSubText = field(helpers.getMultiSubText,
                             helpers.setMultiSubText);
exports.subLangText = field(helpers.getSubLangText,
                            helpers.setSubLangText);
