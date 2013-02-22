// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey8, json8;

module("SC.Store#INFLIGHT_CALLBACK", {
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
    store.writeDataHash(storeKey8, json8, SC.Record.BUSY_LOADING);
    SC.RunLoop.end();
  }
});

test("Confirm that busy dirty works", function() {
  var status = store.readStatus(storeKey8), callbackFired = NO;
  ok(!callbackFired, "callback has not yet fired");
  store.setAdditionalCallbackForStoreKey(storeKey8,function(){
    callbackFired = YES;
  });
  store.dataSourceDidComplete(storeKey8);
  status = store.readStatus(storeKey8);
  
  ok(callbackFired, "callback should have fired");
  
});



