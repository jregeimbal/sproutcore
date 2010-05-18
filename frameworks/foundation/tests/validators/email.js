// ========================================================================
// SC.Validator.Email Tests
// ========================================================================

/**
  The Test Suite for the Email field validator
  
  @author Mike Ball
  @version Beta1.1
  @since Beta1.1
*/

var validator = SC.Validator.Email.create();

module("Email Validator");

test("Bad Values",function(){
  ok(SC.typeOf(validator.validateCommit("    ")) === SC.T_ERROR, "spaces are not valid");
  ok(SC.typeOf(validator.validateCommit("")) === SC.T_ERROR, "an empty string is not valid");
  ok(SC.typeOf(validator.validateCommit("dadfa")) === SC.T_ERROR, "random letters are not valid");
  ok(SC.typeOf(validator.validateCommit("dadfa@")) === SC.T_ERROR, "random letters with at sign are not valid");
  ok(SC.typeOf(validator.validateCommit("dadfa@fdad")) === SC.T_ERROR, "missing extension is not valid");
  ok(SC.typeOf(validator.validateCommit("dadfa@fdad.")) === SC.T_ERROR, "missing extension is not valid");
});

test("Good Values",function(){
  same(validator.validateCommit("brandon@gmail.com"),"brandon@gmail.com", "A Valid email");
});


