// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals throws */

var content, controller, extra;

var TestObject = SC.Object.extend({
  title: "test",  
  toString: function() { return "TestObject(%@)".fmt(this.get("title")); }
});


// ..........................................................
// EMPTY
// 

module("SC.ArrayController - array_case - EMPTY", {
  setup: function() {
    content = [];
    controller = SC.ArrayController.create({ content: content });
    extra = TestObject.create({ title: "FOO" });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("state properties", function() {
  equals(controller.get("hasContent"), YES, 'c.hasContent');
  equals(controller.get("canRemoveContent"), YES, "c.canRemoveContent");
  equals(controller.get("canReorderContent"), YES, "c.canReorderContent");
  equals(controller.get("canAddContent"), YES, "c.canAddContent");
});

// addObject should append to end of array + notify observers on Array itself
test("addObject", function() {
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });
  
  SC.run(function() { controller.addObject(extra); });
  
  same(content, [extra], 'addObject(extra) should work');
  equals(callCount, 1, 'should notify observer that content has changed');
  equals(content.get('length'), 1, 'should update length of controller');
});

test("removeObject", function() {
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });
  
  SC.run(function() { controller.removeObject(extra); });
  
  same(content, [], 'removeObject(extra) should have no effect');
  equals(callCount, 0, 'should not notify observer since content did not change');
});

test("basic array READ operations", function() {
  equals(controller.get("length"), 0, 'length should be empty');
  equals(controller.objectAt(0), undefined, "objectAt() should return undefined");
});

test("basic array WRITE operations", function() {
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });
  
  controller.replace(0,1,[extra]);
  
  same(content, [extra], 'should modify content');
  equals(callCount, 1, 'should notify observer that content has changed');
  equals(content.get('length'), 1, 'should update length of controller');
});

test("arrangedObjects", function() {
  equals(controller.get("arrangedObjects"), controller, 'c.arrangedObjects should return receiver');
});


// ..........................................................
// NON-EMPTY ARRAY
// 

module("SC.ArrayController - array_case - NON-EMPTY", {
  setup: function() {
    content = "1 2 3 4 5".w().map(function(x) {
      return TestObject.create({ title: x });
    });
    
    controller = SC.ArrayController.create({ content: content });
    extra = TestObject.create({ title: "FOO" });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("state properties", function() {
  equals(controller.get("hasContent"), YES, 'c.hasContent');
  equals(controller.get("canRemoveContent"), YES, "c.canRemoveContent");
  equals(controller.get("canReorderContent"), YES, "c.canReorderContent");
  equals(controller.get("canAddContent"), YES, "c.canAddContent");
});

// addObject should append to end of array + notify observers on Array itself
test("addObject", function() {
  var expected = content.slice();
  expected.push(extra);
  
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });
  
  SC.run(function() { controller.addObject(extra); });
  
  same(content, expected, 'addObject(extra) should work');
  equals(callCount, 1, 'should notify observer that content has changed');
  equals(content.get('length'), expected.length, 'should update length of controller');
});

test("removeObject", function() {
  var expected = content.slice(), obj = expected[3];
  expected.removeObject(obj);
  
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });
  
  SC.run(function() { controller.removeObject(obj); });
  
  same(content, expected, 'removeObject(extra) should remove object');
  equals(callCount, 1, 'should notify observer that content has changed');
  equals(content.get('length'), expected.length, 'should update length of controller');
});

test("basic array READ operations", function() {
  equals(controller.get("length"), content.length, 'length should be empty');
  
  var loc = content.length+1; // verify 1 past end as well
  while(--loc>=0) {
    equals(controller.objectAt(loc), content[loc], "objectAt(%@) should return same value at content[%@]".fmt(loc, loc));
  }
});

test("basic array WRITE operations", function() {
  var expected = content.slice();
  expected.replace(3,1,[extra]);
  
  var callCount = 0;
  controller.addObserver('[]', function() { callCount++; });
  
  controller.replace(3,1,[extra]);
  
  same(content, expected, 'should modify content');
  equals(callCount, 1, 'should notify observer that content has changed');
  equals(content.get('length'), expected.length, 'should update length of controller');
});

test("arrangedObjects", function() {
  equals(controller.get("arrangedObjects"), controller, 'c.arrangedObjects should return receiver');
});

test("array orderBy using function", function(){
  var testFunc = function(a,b){ 
    if(a.get('title') > b.get('title')) return -1;
    else if (a.get('title') == b.get('title')) return 0; 
    else return 1; 
  };
  var expected = content.slice();
  expected.sort(testFunc);
  
  var testController = SC.ArrayController.create({
    content: content,
    orderBy: testFunc
  });
  same(testController.get('arrangedObjects').toArray(), expected, 'arrangedObjects should be sortable by a custom function');
});

// ..........................................................
// ADD SPECIAL CASES HERE
// 

test("verify rangeObserver fires when content is deleted", function() {
  
  content = "1 2 3 4 5".w().map(function(x) {
    return TestObject.create({ title: x });
  });
  
  controller = SC.ArrayController.create({ content: content });

  var cnt = 0,
      observer = SC.Object.create({ method: function() { cnt++; } });
  controller.addRangeObserver(SC.IndexSet.create(0,2), observer, observer.method);
      
  SC.RunLoop.begin();
  content.length = 0 ;
  content.enumerableContentDidChange(); 
  SC.RunLoop.end();

  equals(cnt, 1, 'range observer should have fired once');
});

test("verify updateSelectionAfterContentChange fires and clears selection upon content becoming an empty array", function(){
  
  var fired = false, selectedObj;
  
  function generateContent(item) {
    return TestObject.create({title: item});
  }
  content = "1 2 3 4 5".w().map(generateContent);
  
  controller = SC.ArrayController.create({
    
    content: content,
    
    updateSelectionAfterContentChange: function() {
      fired = true;
      return sc_super();
    }
    
  });
  
  same(controller.get('selection'), SC.SelectionSet.EMPTY, "Initial SelectionSet should === SC.SelectionSet.EMPTY");
  same(controller.getPath('selection.length'), 0, 'Initial Selection length should be 0');
  same(controller.getPath('arrangedObjects.length'), 5, 'The content length should be 5');
  
  SC.run(function(){ 
    selectedObj = controller.objectAt(0);
    controller.selectObject(selectedObj);
  });
  same(controller.getPath('selection.length'), 1, 'Selection length should  now be 1');
  same(controller.getPath('selection.firstObject'), selectedObj, 'The Selection Set\'s firstObject should be the content\'s first object');
  
  SC.run(function(){
    controller.set('content', []);
  });
  same(controller.getPath('arrangedObjects.length'), 0, 'After setting content to an empty array, content length should be 0');
  same(controller.get('selection'), SC.SelectionSet.EMPTY, "After setting content to an empty array, the SelectionSet should === SC.SelectionSet.EMPTY");
  same(controller.getPath('selection.length'), 0, 'After setting content to an empty array, Selection length should be 0');
});


// ..........................................................
// VERIFY SC.ARRAY COMPLIANCE
// 

// SC.ArraySuite.generate("SC.ArrayController", {
//   newObject: function(amt) {
//     if (amt === undefined || typeof amt === SC.T_NUMBER) {
//       amt = this.expected(amt);
//     }
//     return SC.ArrayController.create({ content: amt });
//   }
// });
