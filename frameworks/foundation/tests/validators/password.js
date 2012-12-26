// ========================================================================
// SC.Validator.Password Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */
module("SC.Validator.Password ");	
test("validate() a password", function() {
 var field = SC.$('input');
});

test("Checking fields can be synced" ,function(){
  var here = SC.Validator.Password ? YES : NO;
  ok(here, "Validator Exists!");
});