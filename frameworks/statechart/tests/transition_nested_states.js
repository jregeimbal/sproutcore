// ==========================================================================
// SC.Statechart Unit Test
// ==========================================================================
/*globals SC */

/**
  @author Michael Cohen
*/
var basic;
var advanced;
var sequence;

// ..........................................................
// CONTENT CHANGING
// 

module("SC.Statechart Mixin: Transient States", {
  setup: function() { 
    sequence = [];
    
    basic = SC.Object.create(SC.Statechart, {
      startStates: {'default': 'a'},
      startOnInit: NO,
      
      a: SC.Statechart.registerState({
        initialSubState: 'b',
        enterState: function() { sequence.push('enter:a'); },
        exitState: function() { sequence.push('exit:a'); },
        foo: function() { this.goState('b'); },
        bar: function() { this.goState('c'); },
        dog: function() { this.goState('d'); } 
      }),
      
      b: SC.Statechart.registerState({
        parentState: 'a',
        enterState: function() { sequence.push('enter:b'); },
        exitState: function() { sequence.push('exit:b'); }
      }),
      
      c: SC.Statechart.registerState({
        parentState: 'a',
        enterState: function() { sequence.push('enter:c'); },
        exitState: function() { sequence.push('exit:c'); }
      }),
      
      d: SC.Statechart.registerState({
        enterState: function() { sequence.push('enter:d'); },
        exitState: function() { sequence.push('exit:d'); },
        blah: function() { this.goState('a'); }
      })
    });
  },
  
  teardown: function() {
    basic.destroy();
    sequence = null;
  }
});

test("basic state transition", function() {
  sequence = [];
  
  basic.startupStatechart();
  equals(basic.currentState(), basic.b, "current state should be b");
  equals(sequence[0], 'enter:a', "should be 'enter:a'");
  equals(sequence[1], 'enter:b', "should be 'enter:b'");
  sequence = [];
  
  basic.sendEvent('bar');
  equals(basic.currentState(), basic.c, "current state should be c");
  equals(sequence[0], 'exit:b', "should be 'exit:b'");
  equals(sequence[1], 'enter:c', "should be 'enter:c'");
  sequence = [];
  
  basic.sendEvent('foo');
  equals(basic.currentState(), basic.b, "current state should be b");
  equals(sequence[0], 'exit:c', "should be 'exit:c'");
  equals(sequence[1], 'enter:b', "should be 'enter:b'");
  sequence = [];
  
  basic.sendEvent('dog');
  equals(basic.currentState(), basic.d, "current state should be d");
  equals(sequence[0], 'exit:b', "should be 'exit:b'");
  equals(sequence[1], 'exit:a', "should be 'exit:a'");
  equals(sequence[2], 'enter:d', "should be 'enter:d'");
  sequence = [];
  
  basic.sendEvent('blah');
  equals(basic.currentState(), basic.b, "current state should be b");
  equals(sequence[0], 'exit:d', "should be 'exit:d'");
  equals(sequence[1], 'enter:a', "should be 'enter:a'");
  equals(sequence[2], 'enter:b', "should be 'enter:b'");
  sequence = [];
  
  basic.sendEvent('bar');
  equals(sequence[0], 'exit:b', "should be 'exit:b'");
  equals(sequence[1], 'enter:c', "should be 'enter:c'");
  
});