/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */
;// QUOKKA 2016
// By zibx on 11/14/16.
var assert = require('chai').assert;
var StateMachine = require('../machine' );

var testIt = function(state){
    var shouldFrom, shouldTo;
    assert.equal(state instanceof StateMachine.State, true);

    assert.equal(state.name, 'A');

    state = state.goto('B')
        .on('enter', function(from){
            assert.equal(from.name, shouldFrom);
        })
        .on('leave', function (to) {
            assert.equal(to.name, shouldTo);
        });
    assert.equal(state.name, 'B');

    shouldTo = 'C';
    state = state.goto('C');
    assert.equal(state.name, 'C');

    state = state.goto('A');
    assert.equal(state.name, 'A');

    shouldFrom = 'A';
    state = state.goto('B');
    assert.equal(state.name, 'B');

    shouldTo = shouldFrom = 'B';
    state = state.goto('B');
    assert.equal(state.name, 'B');

    shouldTo = 'D';
    state = state.goto('D');
    assert.equal(state.name, 'D');

    shouldFrom = 'D';
    state = state.goto('B');
    assert.equal(state.name, 'B');

    /* you can not go to the state without connection to it */
    assert.throw(function(){
        state = state.goto('A');
    }, 'There is no connetcion between `B`, which is the current one and `A` states');
    assert.equal(state.name, 'B');


    /* but you can use teleport! */
    state.on('stay', function(){
        shouldTo = 'A';
        debugger;
        state = this.pick('A');
    });
    shouldFrom = shouldTo = 'B';

    state.goto('B');

    assert.equal(state.name, 'A');

};


describe('initialize', function() {
    /* You can see different syntax of defining the same state machine. Pick the one that you prefer */

    it('should init in first way', function () {
        var test = new StateMachine('A', ['B'])
            .add('B', ['C', 'D', 'B'])
            .on('enter', function (from) {
                console.log('enter B from ' + from.name)
            })
            .add('C', ['A'])
            .add('D', ['B']);

        testIt(test.pick('A'));
    });
    it('should init with full state definition', function () {
        var test = new StateMachine({
            A: 'B',
            B: ['C','D','B'],
            C: 'A',
            D: 'B'
        });

        assert.equal(test instanceof StateMachine, true);
        testIt(test.pick('A'));
    });

    it('should init with linking syntax. Like knitting', function () {
        var test = new StateMachine('A').link('B').link('C').link('A')
            .pick('B').link('B')
            .pick('B').link('D').link('B')
            .pick('A');
        testIt(test);
    });
    it('should init with linking syntax. Like knitting. Without first state in machine cfg', function () {
        var test = new StateMachine()
            .add('A').link('B').link('C').link('A')
            .pick('B').link('B')
            .pick('B').link('D').link('B')
            .pick('A');
        testIt(test);
    });
    it('should init with multilinks syntax', function () {
        var test = new StateMachine()
            .add('A').link('B').links('B', 'C', 'D')
            .pick('D').link('B')
            .pick('C').link('A');
        testIt(test);
    });
});
