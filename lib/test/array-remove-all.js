// test/array-remove-all.js
//
// Test removeAll() method for arrays
//
// Copyright 2017, Fuzzy.ai https://fuzzy.ai/
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

var arrayRemoveAllContext = function(driver, params) {

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
            'and we remove many items from an existing array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("combo",
                                        "lock1",
                                        [21, 37, 18, 42, 17, 4],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.removeAll("combo",
                                           "lock1",
                                           [37, 18, 4],
                                           this)
                        },
                        function(err) {
                            if (err) throw err;
                            bank.read("combo", "lock1", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, values) {
                    assert.ifError(err);
                    assert.isArray(values);
                    assert.lengthOf(values, 3);
                    var expected = [21, 42, 17];
                    assert.deepEqual(values, expected);
                }
            },
            'and we remove some absent items from an existing array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("combo",
                                        "lock2",
                                        [12, 19, 33, 41, 7],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.removeAll("combo",
                                           "lock2",
                                           [19, 33, 54, 27],
                                           this);
                        },
                        function(err) {
                            if (err) throw err;
                            bank.read("combo", "lock2", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, values) {
                    assert.ifError(err);
                    assert.isArray(values);
                    assert.lengthOf(values, 3);
                    var expected = [12, 41, 7];
                    assert.deepEqual(values, expected);
                }
            },
            'and we remove many items from an uninitialized array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.removeAll("combo",
                                           "lock3",
                                           [8, 29, 14, 41],
                                           this);
                        },
                        function(err) {
                            if (err && err.name == "NoSuchThingError") {
                                this(null);
                            } else if (err) {
                                this(err);
                            } else {
                                this(new Error("Unexpected success"));
                            }
                        },
                        this.callback
                    );
                    return undefined;
                },
                "failing correctly": function(err) {
                    assert.ifError(err);
                }
            }
        }
    };

    return context;
};

module.exports = arrayRemoveAllContext;
