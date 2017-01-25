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

var arrayAppendAllContext = function(driver, params) {

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
            'and we append many items to an existing array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("neighbors",
                                        "evanp",
                                        ["luke", "emma"],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.appendAll("neighbors",
                                           "evanp",
                                           ["jeff", "anna", "corbin"],
                                           this)
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.read("neighbors", "evanp", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, values) {
                    assert.ifError(err);
                    assert.isArray(values);
                    assert.lengthOf(values, 5);
                    var expected = ["luke", "emma", "jeff", "anna", "corbin"];
                    assert.deepEqual(values, expected);
                }
            },
            'and we prepend many items to an existing array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("neighbors",
                                        "maj",
                                        ["bill", "kara", "jane"],
                                        this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.prependAll("neighbors",
                                           "maj",
                                           ["dave", "clarisse"],
                                           this)
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.read("neighbors", "maj", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, values) {
                    assert.ifError(err);
                    assert.isArray(values);
                    assert.lengthOf(values, 5);
                    var expected = ["dave", "clarisse", "bill", "kara", "jane"];
                    assert.deepEqual(values, expected);
                }
            },
            'and we append many items to an uninitialized array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.appendAll("neighbors",
                                           "stav",
                                           ["mike", "jim", "chris"],
                                           this)
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.read("neighbors", "stav", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, values) {
                    assert.ifError(err);
                    assert.isArray(values);
                    assert.lengthOf(values, 3);
                    var expected = ["mike", "jim", "chris"];
                    assert.deepEqual(values, expected);
                }
            },
            'and we prepend many items to an uninitialized array': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.appendAll("neighbors",
                                           "amity",
                                           ["rita", "dan", "fred", "bob"],
                                           this)
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.read("neighbors", "amity", this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                "without an error": function(err, values) {
                    assert.ifError(err);
                    assert.isArray(values);
                    assert.lengthOf(values, 4);
                    var expected = ["rita", "dan", "fred", "bob"];
                    assert.deepEqual(values, expected);
                }
            }
        }
    };

    return context;
};

module.exports = arrayAppendAllContext;
