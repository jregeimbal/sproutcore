// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey8, json8;

module("SC.Store#BUSY_DIRTY", {
  setup: function() {
    
    store = SC.Store.create();
    
    json8 = {
      guid: "commitGUID8",
      string: "asdf",
      number: 123,
      bool: NO
    };
    
    SC.RunLoop.begin();
    storeKey8 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey8, json8, SC.Record.BUSY_DIRTY);
    SC.RunLoop.end();
  }
});

test("Confirm that busy dirty works", function() {
  var status;
  store.dataSourceDidComplete(storeKey8);
  status = store.readStatus(storeKey8);
  equals(status, SC.Record.READY_DIRTY, "should be READY_DIRTY");
  
});



