// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

module("SC.Validator.Date");

test("Converts into date if a value is given",function(){
  var num = 1234947136000; // represents time in secs
  var date = new Date(num);
  var validator = SC.Validator.Date.create();
  var c = validator.fieldValueForObject(1234947136000, '', '');
  equals(c, date.format(validator.get('format')), "Number converted to date format");
});

test("Converts into number when date string is given", function(){
  var da = "Feb 18, 2009 12:52:16 AM"; // date string
  var date = Date.parseDate(da);
  var validator = SC.Validator.Date.create();
  var d = validator.objectForFieldValue(da, '', '');
  equals(date.getTime(), d, "Date String compared with value in seconds");
  ok(SC.typeOf(d) === "number", "Number is obtained"); 	
});
