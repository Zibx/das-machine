

<!-- Start machine.js -->

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
*

## on(name, fn)

Subscribe to state events

### Params:

* *name* - name of event
* *fn* - function which would be called when event happens

### Return:

* **State** 

## fire(name, a, b, c)

Fire state event

### Params:

* *name* - name of event
* *a* - any data param 1
* *b* - any data param 2
* *c* - any data param 3

## connect(name)

Make connection to another state

### Params:

* *name* - Another states name

## links(stateNames)

Create connections and define not exists states

### Params:

* *stateNames* - state names that would be created if not exists. Current state would be connected to them

### Return:

* **State** - current state

## link(name)

Create connection to another state, create this state if it is not defined and go to this new state.

### Params:

* *name* 

### Return:

* **State** 

Move to another state if current state have connection to that state and that state exists. Otherwise throw a error

### Params:

* *name* - name of state to go

### Return:

* **State** 

## pick(name)

Teleportation to another existed state. Works even if there is no direct connection. If state is not exists - throws error

### Params:

* *name* 

### Return:

* **State** 

## for()

add functions from machines prototype to states prototype. wrap them in intelligent way

<!-- End machine.js -->

