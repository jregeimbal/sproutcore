// ========================================================================
// SC.Mock Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var obj; //global variables

// Test cases for pushStack and end functions
module("Mock",{
   
    setup: function(){
      obj = SC.Mock.create({
        methods: ['first', 'second']
      })
      
  }
});

test("To check if all private var and methods were created",function(){
  ok(obj.first, "should have first methods");
  ok(obj.second, "should have second methods"); 

  equals(obj._first_count, 0, "should have a count with zero")
  equals(obj._second_count, 0, "should have a count with zero")

  ok(obj.firstWasCalled, "should have first methods");
  ok(obj.secondWasCalled, "should have first methods");
});


test("To check if method calls work",function(){
  obj.first();
  equals(obj.firstWasCalled(), 1, "first was called once");
  equals(obj.secondWasCalled(), 0, "second was not called");

  obj.first();
  obj.second();

  equals(obj.firstWasCalled(), 2, "first was called again");
  equals(obj.secondWasCalled(), 1, "second was called");
});

