// test/array.js
//
// Builds a test context for arrays
//
// Copyright 2012, E14N https://e14n.com/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var assert = require('assert'),
    vows = require('vows'),
    si = require('setimmediate'),
    databank = require('../databank'),
    Databank = databank.Databank;

var arrayErrorContext = function(driver, params) {

    var context = {};

    context["When we create a " + driver + " databank"] = {

        topic: function() {
            if (!params.hasOwnProperty('schema')) {
                params.schema = {};
            }
            params.schema.inbox = {
                pkey: 'username'
            };

            return Databank.get(driver, params);
        },
        'We can connect to it': {
            topic: function(bank) {
                bank.connect(params, this.callback);
            },
            teardown: function(bank) {
                var callback = this.callback;
                // Workaround for vows bug
                setImmediate(function() {
                    bank.disconnect(function(err) {
                        callback();
                    });
                });
            },
            'without an error': function(err) {
                assert.ifError(err);
            },
            'and we remove from an uninitialized array': {
                topic: function(bank) {
                    var callback = this.callback;
                    bank.remove('bell', 'church', 1, function(err) {
                        if (!err) {
                            callback(new Error("Unexpected success"));
                        } else if (err.name == "NoSuchThingError") {
                            callback(null);
                        } else {
                            callback(err);
                        }
                    });
                    return undefined;
                },
                'it fails correctly': function(err) {
                    assert.ifError(err);
                }
            },
            'and we create an array then remove a nonexistent member from it': {
                topic: function(bank) {
                    var callback = this.callback;
                    bank.create('bell', 'school', [2, 3, 4], function(err, bell) {
                        if (err) {
                            callback(err);
                        } else {
                            bank.remove('bell', 'school', 5, callback);
                        }
                    });
                    return undefined;
                },
                "it works": function(err) {
                    assert.ifError(err);
                },
                "teardown": function(bank) {
                    var callback = this.callback;
                    if (bank && bank.del) {
                        bank.del('bell', 'school', function(err) {
                            callback(null);
                        });
                    } else {
                        callback(null);
                    }
                    return undefined;
                }
            }
        }
    };

    return context;
};

module.exports = arrayErrorContext;
