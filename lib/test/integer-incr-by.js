// test/integer.js
//
// Test CRUD for integer scalars
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
    Step = require('step'),
    databank = require('../databank'),
    Databank = databank.Databank;

var integerIncrByContext = function(driver, params) {

    var context = {};

    context["When we create a " + driver + " databank"] = {

        topic: function() {
            if (!params.hasOwnProperty('schema')) {
                params.schema = {};
            }
            params.schema['computer-count'] = {
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
            'and we can insert an integer and increment it': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("coffees-drunk", "evanp", 3, this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.incrBy("coffees-drunk", "evanp", 2, this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                'without an error': function(err, value) {
                    assert.ifError(err);
                    assert.isNumber(value);
                    assert.equal(value, 5);
                }
            },
            'and we can insert an integer and decrement it': {
                topic: function(bank) {
                    Step(
                        function() {
                            bank.create("coffees-drunk", "bill", 9, this);
                        },
                        function(err, value) {
                            if (err) throw err;
                            bank.decrBy("coffees-drunk", "bill", 3, this);
                        },
                        this.callback
                    );
                    return undefined;
                },
                'without an error': function(err, value) {
                    assert.ifError(err);
                    assert.isNumber(value);
                    assert.equal(value, 6);
                }
            },
            'and we can increment an uninitialized value': {
                topic: function(bank) {
                    bank.incrBy("coffees-drunk", "jill", 7, this.callback);
                    return undefined;
                },
                'without an error': function(err, value) {
                    assert.ifError(err);
                    assert.isNumber(value);
                    assert.equal(value, 7);
                }
            },
            'and we can decrement an uninitialized value': {
                topic: function(bank) {
                    bank.decrBy("coffees-drunk", "jack", 5, this.callback);
                    return undefined;
                },
                'without an error': function(err, value) {
                    assert.ifError(err);
                    assert.isNumber(value);
                    assert.equal(value, -5);
                }
            }
        }
    };

    return context;
};

module.exports = integerIncrByContext;
