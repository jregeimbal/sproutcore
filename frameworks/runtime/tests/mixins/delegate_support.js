// ==========================================================================
// Project:   SproutCore - Property Observing Library
// Copyright: ©2012 Eloqua Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok isObj equals expects */

var obj1, obj2, obj3;
module("DelegateSupport", {
  
  setup: function() {
    obj1 = SC.Object.create({
      testMe1: function(){
        return 1;
      }
    });
    obj2 = SC.Object.create(SC.DelegateSupport, {
      delegate: obj1,
      
      runTest1: function(){
        var del = this.get('delegate');
        return this.invokeDelegateMethod(del, 'testMe1');
      },
      
      runTest2: function(val){
        var del = this.get('delegate');
        return this.invokeDelegateMethod(del, 'testMe2', val);
      },
      
      testMe1: function(){
        return 2;
      },
      
      testMe2: function(val){
        return val*val;
      }
    });
    
    // Test using a property path
    SC.mookaMooka = SC.Object.create({
      testMe1: function(){
        return 5;
      }
    });
    
    obj3 = SC.Object.create(SC.DelegateSupport, {
      delegate: 'SC.mookaMooka',
      
      runTest1: function(){
        var del = this.get('delegate');
        return this.invokeDelegateMethod(del, 'testMe1');
      },
      
      runTest2: function(val){
        var del = this.get('delegate');
        return this.invokeDelegateMethod(del, 'testMe2', val);
      },
      
      testMe1: function(){
        return 2;
      },
      
      testMe2: function(val){
        return val+val;
      }
    });
  },
  
  teardown: function() {
    delete SC.mookaMooka;
  }
  
});

test("should use delegate when it is an object", function() {
  var ret = obj2.runTest1();
  equals(ret, 1, "uses the delegate's method");
  ret = obj2.runTest2(2);
  equals(ret, 4, "doesn't use the delegate's method when it doesn't exist");
});

test("should use delegate when it is an string", function() {
  var ret = obj3.runTest1();
  equals(ret, 5, "uses the delegate's method");
  ret = obj3.runTest2(4);
  equals(ret, 8, "doesn't use the delegate's method when it doesn't exist");
});

