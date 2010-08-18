// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var recordP, recordN, K, App ;
module("SC.NestedStore - mergeChanges", {
  setup: function() {
    SC.Store.nextStoreKey = 1 ;
    App = {} ;
    K = SC.Record ;
    App.R = SC.Record.extend({
      string: SC.Record.attr(String),
      number: SC.Record.attr(Number),
      bool: SC.Record.attr(Boolean)
    }) ;

    App.Delayed = SC.DataSource.extend({
      createRecord: function() { return YES ; },
      updateRecord: function() { return YES ; },
      destroyRecord: function() { return YES ; }
    }) ;

    App.parent = SC.Store.create({
      mergeNestedStoreChanges: YES,

      mergeConflict: function(storeKey, attribute, original, local, remote) {
        App.conflictCalled += 1 ;
        return local ;
      }
    }).from('App.Delayed') ;

    App.conflictCalled = 0 ;

    App.json = {
      guid: 1,
      string: "string",
      number: 23,
      bool: YES,
      array: [{str: "STRING", arr: [{s:"ssss"}]}, {str: "string2"}],
      hash: {num: 88 }
    } ;

    SC.RunLoop.begin();
    recordP = App.parent.createRecord(App.R, App.json, 1) ;
    SC.RunLoop.end();

    App.storeKey1 = recordP.get('storeKey') ;

    App.parent.writeStatus(App.storeKey1, K.READY_CLEAN) ;

    SC.RunLoop.begin();
    App.store = App.parent.chain({
      _notifyRecordPropertyChange: function(storeKey, statusOnly, key) {
        console.log("_notifyRecordPropertyChange called %@ - %@ - %@".fmt(storeKey, statusOnly, key)) ;
        sc_super();
      }
    }) ;
    SC.RunLoop.end();

    recordN = App.store.find(recordP) ;

    App.target = {
      guid: 1,
      string: "String!",
      number: 42,
      bool: YES,
      array: [{str: "STRING", arr: [{s:"SSSS"}]}, {str: "STRING@"}],
      hash: {num: 44 }
    } ;

  }
}) ;

test("Should merge changes when fields have changed on both sides",
    function() {
  console.log("START test 1") ;
  var j1 = SC.clone(App.json) ;
  j1.string = "String!" ;

  // First Make change to the local (nested) record
  equals(App.store.revisions[App.storeKey1], 2, "Nested Store should have rev") ;
  SC.RunLoop.begin();
  recordN.set('number', 42) ;
  recordN.set('array', [{str: "STRING", arr: [{s:"SSSS"}]}, {str: "STRING@"}]) ;
  recordN.set('hash', {num: 44 }) ;
  SC.RunLoop.end();
  equals(App.store.locks[App.storeKey1], 2, "Nested Store should have a lock") ;
  equals(App.store.revisions[App.storeKey1], 5, "Nested Store should have increased rev") ;
  equals(App.store.storeKeyEditState(App.storeKey1), SC.Store.EDITABLE, "Nested Record should have correct edit state") ;

  // Then make changes to the remote (parent) record 
  SC.RunLoop.begin();
  App.parent.writeDataHash(App.storeKey1, j1, K.READY_CLEAN) ;
  App.parent.dataHashDidChange(App.storeKey1);
  SC.RunLoop.end();
  equals(App.parent.revisions[App.storeKey1], 6, "Parent Store should have rev") ;

  // Check records are in the correct state
  equals(App.store.statuses[App.storeKey1], K.READY_DIRTY, "Nested Record should be in dirty state") ;

  SC.RunLoop.begin();
  App.store.commitChanges() ;
  SC.RunLoop.end();
  // Check the record has been merged correctly.

  var j2 = App.parent.dataHashes[App.storeKey1],
      expected = App.target ;

  equals(JSON.stringify(j2), JSON.stringify(expected), 'Merged Records should match' ) ;

  // check nested store record is in the right state.
  equals(App.store.statuses[App.storeKey1], K.READY_DIRTY, "Nested Record should be in ready dirty state") ;

  // check the parent record is in the right state.
  equals(App.parent.statuses[App.storeKey1], K.READY_DIRTY, "Parent Record should be in dirty state") ;

}) ;

test("Should push changes upto nested store when changes come from server",
    function() {

  console.log("START test 2") ;
  SC.RunLoop.begin() ;
  App.parent.pushRetrieve(App.R, 1, App.target, App.storeKey1) ;
  SC.RunLoop.end() ;

  var j2 = App.store.dataHashes[App.storeKey1] ;

  equals(JSON.stringify(j2), JSON.stringify(App.target), "Nested Record should get changes from server") ;

// check nested store record is in the right state.
  equals(App.store.statusString(App.storeKey1), "READY_CLEAN", "Nested Record should be in ready dirty state") ;

  // check the parent record is in the right state.
  equals(App.parent.statusString(App.storeKey1), "READY_CLEAN", "Parent Record should be in dirty state") ;


}) ;

test("Should cause conflict if the same attribute is changed on both sides",
    function() {

  console.log("START test 3") ;

  SC.RunLoop.begin();
  recordN.set('number', 52) ;
  SC.RunLoop.end();

  SC.RunLoop.begin() ;
  App.parent.pushRetrieve(App.R, 1, App.target, App.storeKey1) ;
  SC.RunLoop.end() ;
  
  var j1 = App.target ;
  j1.number = 52 ;

  var j2 = App.store.dataHashes[App.storeKey1],
      j3 = App.parent.dataHashes[App.storeKey1] ;
  equals(App.conflictCalled, 1, "mergeConflict should have been called") ;
  equals(JSON.stringify(j2), JSON.stringify(j1), "Nested Record should get changes from server") ;
  equals(JSON.stringify(j2), JSON.stringify(j3), "Nested Record should be the same as parent datahash") ;
}) ;

test("Should not make nested record become BUSY when commiting to dataSource",
    function() {

  console.log("START test 4") ;
  SC.RunLoop.begin();

  recordN.set('number', 42).set('string', "String!") ;
  recordN.set('array', [{str: "STRING", arr: [{s:"SSSS"}]}, {str: "STRING@"}]) ;
  recordN.set('hash', {num: 44 }) ;
  App.store.commitChanges() ;

  App.parent.commitRecords() ;
  SC.RunLoop.end();

  var j2 = App.store.dataHashes[App.storeKey1],
      j3 = App.parent.dataHashes[App.storeKey1] ;

  equals(JSON.stringify(j2), JSON.stringify(App.target),
      "Nested Record should get changes from server") ;
  equals(JSON.stringify(j2), JSON.stringify(j3),
      "Nested Record should be the same as parent datahash") ;
  SC.RunLoop.begin();
  equals(App.store.statusString(App.storeKey1), "READY_DIRTY",
      "Nested Record should be in READY state") ;
  equals(App.parent.statusString(App.storeKey1), "BUSY_COMMITTING", 
      "Parent Record should be in BUSY state") ;



}) ;