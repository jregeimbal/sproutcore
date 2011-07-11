// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  T.module("indexesOf");
  var expected = T.objects(10),
    array = T.newObject(expected);
  
  test("should return indexes of objects", function() {
      var indexes = [0,4,7];
      var testObjects = [];
      indexes.forEach(function (idx) {
        testObjects.push(array.objectAt(idx));
      });
      
      equals(array.indexesOf(testObjects),indexes.join(','),'array.indexesOf(testObjects) should be %@'.fmt(indexes.join(',')));
  });
  
  test("should return -1 when requesting objects not in array", function() {
    var newObjects = T.objects(3),
      newArray = T.newObject(newObjects);        
      
    equals(array.indexOf(newArray), -1, 'array.indexesOf(newObjects) should be -1');
  });
  
});
