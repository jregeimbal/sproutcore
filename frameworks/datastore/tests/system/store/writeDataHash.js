// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "write" event in the NestedStore portion of the diagram.

var store, child, storeKey, json;
module("SC.Store#writeDataHash", {
  setup: function() {
    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey = SC.Store.generateStoreKey();
    child = store.chain();  // test multiple levels deep
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 

// The transition from each base state performs the same operation, so just
// run the same test on each state.
function testWriteDataHash(shouldHaveNewMemory) {
  var oldrev = store.revisions[storeKey];
  
  // perform test
  var json2 = { foo: "bar" };
  equals(store.writeDataHash(storeKey, json2, SC.Record.READY_NEW), store, 'should return receiver');
  
  // verify
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'new edit state should be locked');
  
  if (shouldHaveNewMemory) {
    equals(store.readDataHash(storeKey), json2, 'should have new json data hash');
  } else {
    ok(store.readDataHash(storeKey) !== json2, 'should use existing memory space');
  }

  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone reference to revision');
  }
}


test("edit state=FREE - also writes a NEW hash", function() {
  
  // test preconditions
  equals(store.storeKeyEditState(storeKey), SC.Store.FREE, 'precond - edit state should be free');
  
  testWriteDataHash(YES);
});

test("edit state=LOCKED - also overwrites an EXISTING hash", function() {
  
  // test preconditions
  store.writeDataHash(storeKey, { foo: "bar" });
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - edit state should be locked');
  
  testWriteDataHash();

});

// ..........................................................
// PROPOGATING TO NESTED STORES
// 

test("change should propogate to child if child edit state = INHERITED", function() {
  // verify preconditions
  equals(child.storeKeyEditState(storeKey), SC.Store.INHERITED, 'precond - child edit state should be INHERITED');

  // perform change
  var json2 = { version: 2 };
  store.writeDataHash(storeKey, json2, SC.Record.READY_NEW);
  
  // verify
  same(child.readDataHash(storeKey), json2, 'child should pick up change');
  equals(child.readStatus(storeKey), SC.Record.READY_NEW, 'child should pick up new status');
});

test("change should not propogate to child if child edit state = LOCKED", function() {
  store.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
  store.editables = null ; // clear to simulate locked mode.

  // verify preconditions
  child.readEditableDataHash(storeKey);
  equals(child.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - child edit state should be LOCKED');

  // perform change
  var originalJson = SC.clone(json, YES);
  var json2 = { version: 2 };
  store.writeDataHash(storeKey, json2, SC.Record.READY_NEW);
  
  // verify
  same(child.readDataHash(storeKey), originalJson, 'child should NOT pick up change');
  equals(child.readStatus(storeKey), SC.Record.READY_CLEAN, 'child should NOT pick up new status');
});




