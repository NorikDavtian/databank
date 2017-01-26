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

var arrayTruncateContext = function(driver, params) {

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
            'and we truncate an uninitialized array': {
                topic: function(bank) {
                    callback = this.callback;
                    bank.truncate("messages", "larry", 5, function(err, value) {
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
            'and we truncate an array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("messages",
                                        "evanp",
                                        [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.truncate("messages", "evanp", 6, this);
                        },
                        function(err) {
                            if (err) throw err;
                            bank.read("messages", "evanp", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, value) {
                    assert.ifError(err);
                    assert.isArray(value);
                    assert.lengthOf(value, 6);
                    var expected = [1, 3, 5, 7, 9, 11];
                    assert.deepEqual(value, expected);
                }
            },
            'and we truncate an array shorter than our truncate length': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("messages",
                                        "maj",
                                        [2, 4, 6, 8],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.truncate("messages", "maj", 10, this);
                        },
                        function(err) {
                            if (err) throw err;
                            bank.read("messages", "maj", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, value) {
                    assert.ifError(err);
                    assert.isArray(value);
                    assert.lengthOf(value, 4);
                    var expected = [2, 4, 6, 8];
                    assert.deepEqual(value, expected);
                }
            },
            'and we truncate an array to zero length': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("messages",
                                        "stav",
                                        [10, 12, 14, 16, 18],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.truncate("messages", "stav", 0, this);
                        },
                        function(err) {
                            if (err) throw err;
                            bank.read("messages", "stav", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, value) {
                    assert.ifError(err);
                    assert.isArray(value);
                    assert.lengthOf(value, 0);
                    var expected = [];
                    assert.deepEqual(value, expected);
                }
            }
        }
    };

    return context;
};

module.exports = arrayTruncateContext;
