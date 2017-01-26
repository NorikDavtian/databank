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
    Step = require('step'),
    si = require('setimmediate'),
    databank = require('../databank'),
    Databank = databank.Databank;

var arrayLengthContext = function(driver, params) {

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
            'and we get the length of an uninitialized array': {
                topic: function(bank) {
                    callback = this.callback;
                    bank.length("headphones", "larry", function(err, value) {
                        if (err) {
                            if (err.name == "NoSuchThingError") {
                                callback(null);
                            } else {
                                callback(err);
                            }
                        } else {
                            callback(new Error("Unexpected success"));
                        }
                    });
                    return undefined;
                },
                "it fails correctly": function(err) {
                    assert.ifError(err);
                }
            },
            'and we create an array and get its length': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("headphones",
                                        "evanp",
                                        ["wired", "bluetooth"],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.length("headphones", "evanp", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, length) {
                    assert.ifError(err);
                    assert.isNumber(length);
                    assert.equal(length, 2);
                }
            },
            'and we modify an array and get its length': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("headphones",
                                        "maj",
                                        ["wired", "bluetooth"],
                                        this);
                        },
                        function() {
                            bank.appendAll("headphones",
                                           "maj",
                                           ["running", "cups", "broken"],
                                           this)
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.length("headphones", "maj", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, length) {
                    assert.ifError(err);
                    assert.isNumber(length);
                    assert.equal(length, 5);
                }
            }
        }
    };

    return context;
};

module.exports = arrayLengthContext;
