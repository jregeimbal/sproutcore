// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "read_locked" event in the NestedStore portion of the diagram.

var parent, store, storeKey, json;
module("SC.NestedStore#readEditableDataHash", {
  setup: function() {
    parent = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey = SC.Store.generateStoreKey();

    parent.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
    parent.editables = null ; // manually reset for testing state
    
    store = parent.chain();
  }
});

test("data state=INHERITED, parent locked = NO", function() {
  
  // test preconditions
  equals(parent.storeKeyEditState(storeKey), SC.Store.FREE, 'precond - parent edit state should be FREE');
  equals(store.storeKeyEditState(storeKey), SC.Store.INHERITED, 'precond - edit state should be INHERITED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  same(ret, json, 'should return equivalent json object');
  ok(!(ret===json), 'should not return same json instance');
  
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'edit state should be locked');
  
  // should not change revisions, but should copy it...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
});

test("data state=INHERITED, parent locked = YES", function() {
  
  // test preconditions
  parent.readEditableDataHash(storeKey);
  equals(parent.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - parent edit state should be LOCKED');
  equals(store.storeKeyEditState(storeKey), SC.Store.INHERITED, 'precond - edit state should be INHERITED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  same(ret, json, 'should return equivalent json object');
  ok(!(ret===json), 'should not return same json instance');
  
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'edit state should be locked');
  
  // should not change revisions, but should copy it...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});

test("data state=LOCKED (by read)", function() {
  
  // test preconditions
  store.readDataHash(storeKey);
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - edit state should be LOCKED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  same(ret, json, 'should return equivalent json object');
  ok(!(ret===json), 'should not return same json instance');
  
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'edit state should be locked');
  
  // should not change revisions, but should copy it...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});

test("data state=LOCKED (by write)", function() {
  
  // test preconditions
  json = store.readEditableDataHash(storeKey); // get editable json
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - edit state should be LOCKED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  equals(ret, json, 'should return same locked json instance');
  
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'edit state should be locked');
  
  // should not change revisions, but should copy it...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});


