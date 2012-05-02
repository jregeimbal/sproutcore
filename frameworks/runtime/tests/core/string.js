// ========================================================================
// String.prototype Tests
// ========================================================================
/*globals module test ok isObj equals expects */


module("String object");

test("The String object should be prototyped with containsString", function() {
  var needle = 'Email Address', haystack = 'Email Address and Foo';

  equals(haystack.containsString(needle,true), true, haystack + ' should strictly contain ' + needle);

  equals(haystack.containsString(needle), true, haystack + ' should fuzzy contain ' + needle);

  needle = 'address email';
  equals(haystack.containsString(needle), true, haystack + ' should fuzzy contain ' + needle);

  equals(!haystack.containsString(needle, true), true, haystack + ' should not strictly contain ' + needle);
});

