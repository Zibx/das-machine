/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */
;
// By zibx on 11/14/16.

module.exports = (function () {
    'use strict';
    var apply = function(a, b){
        for(var i in b)
            a[i] = b[i];

        return a;
    };

    var State = function(name, states){
        this.listeners = {};
        var i, _i;
        this.name = name;
        this.transitions = {};
        this.listeners = [];

        if(states) {
            states.forEach(this.connect.bind(this));
        }
    };
    var Sp = State.prototype = {
        /**
         * Subscribe to state events
         * @param name - name of event
         * @param fn - function which would be called when event happens
         * @returns {State}
         */
        on: function(name, fn){
            if(typeof name === 'object'){
                for(var i in name)
                    this.on(i, name[i]);
            }else{
                (this.listeners[name] || (this.listeners[name] = [])).push(fn);
            }
            return this;
        },
        /**
         * Fire state event
         * @param name - name of event
         * @param a - any data param 1
         * @param b - any data param 2
         * @param c - any data param 3
         */
        fire: function(name, a, b, c){
            var listeners = this.listeners[name],
                i, _i;
            if(listeners)
                for( i = 0, _i = listeners.length; i < _i; i++){
                    listeners[i].call(this, a, b, c);
                }
            this.machine.fire(name, this, a, b, c);
        },
        /**
         * Make connection to another state
         * @param name - Another states name
         */
        connect: function(name){
            this.transitions[name] = true;
        },
        /**
         * Create connections and define not exists states
         * @param {...*} stateNames - state names that would be created if not exists. Current state would be connected to them
         * @returns {State} - current state
         */
        links: function(stateNames){

            var i, _i, name, state,
                states = this.machine.states,
                current = this.machine.current;
            for( i = 0, _i = arguments.length; i < _i; i++ ){
                name = arguments[i];
                if( !(name in states )) {
                    state = new State(name);
                    state.machine = this.machine;
                    states[name] = state;
                } else {
                    state = states[name];
                }
                current.connect(name);
            }
            return current;
        },
        /**
         * Create connection to another state, create this state if it is not defined and go to this new state.
         * @description A.link('B').link('C').link('A') would create a circular A->B->C->A state machine
         * @param name
         * @returns {State}
         */
        link: function(name){
            var state, states = this.machine.states;
            if( !(name in states )) {
                state = new State(name);
                state.machine = this.machine;
                states[name] = state;
            } else {
                state = states[name];
            }
            this.connect(name);
            this.machine.current = state;
            return state;
        }
    };


    var StateMachine = function(name){
        var i, cfg, newState, list;
        this.states = {};
        this.listeners = {};
        if(name){
            if(typeof name === 'string'){
                return this.add.apply(this, arguments)
            }else{
                cfg = name;

                for(i in cfg) {
                    this.add(i);
                }
                for(i in cfg) {
                    newState = this.pick(i);
                    newState.links.apply(newState, typeof cfg[i] === 'string' ? [cfg[i]]: cfg[i]);
                }
            }

        }
    };
    var SMp = StateMachine.prototype = {
        current: void 0,

        on: function(name, fn){
            if(typeof name === 'object'){
                for(var i in name)
                    this.on(i, name[i]);
            }else{
                (this.listeners[name] || (this.listeners[name] = [])).push(fn);
            }
            return this;
        },
        fire: function(name, a, b, c){
            var listeners = this.listeners[name],
                i, _i;
            if(listeners)
                for( i = 0, _i = listeners.length; i < _i; i++){
                    listeners[i].call(this, a, b, c);
                }
        },

        add: function(name, to){
            var newState = new State(name, to);
            newState.machine = this;

            this.states[name] = newState;
            if(!this.current)
                this.current = newState;

            return newState;
        },

        /**
         * Move to another state if current state have connection to that state and that state exists. Otherwise throw a error
         * @param name - name of state to go
         * @returns {State}
         */
        'goto': function(name){
            var currentState = this.current,
                linkExists = currentState.transitions[name],
                next = this.states[name];
            if(!linkExists)
                throw new Error('There is no connetcion between `'+ this.current.name +'`, which is the current one and `'+ name +'` states' + (next?'':'. Also you need to know that destination state was not defined'));

            if(!next)
                throw new Error('There is no state called `'+ name +'`. But there is a connection from the current state `'+ this.current.name +'` to `'+ name +'`');

            if(currentState)
                currentState.fire('leave', next);

            this.current = next;
            next.fire('enter', currentState);

            if(currentState === next)
                next.fire('stay');
            return next;
        },
        /**
         * Teleportation to another existed state. Works even if there is no direct connection. If state is not exists - throws error
          * @param name
         * @returns {State}
         */
        pick: function(name){
            var currentState = this.current;

            var next = this.states[name];

            if(!next)
                throw new Error('There is no state called `'+ name +'`');

            if(currentState)
                currentState.fire('leave', next);

            this.current = next;

            next.fire('enter', currentState);

            if(currentState === next)
                next.fire('stay');

            return next
        }
    };
    var toMachine = function(name){
        return function(){
            return this.machine[name].apply(this.machine, arguments);
        }
    };

    /* add functions from machines prototype to states prototype. wrap them in intelligent way */
    for(var i in SMp){
        if(Sp[i] === void 0 && typeof SMp[i] === 'function')
            Sp[i] = toMachine(i);
    }
    StateMachine.State = State;
    return StateMachine;
})();