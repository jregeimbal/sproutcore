// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var view, del, content;
module("SC.HorizontalListView.columnDelegate", {
  setup: function() {
    del = SC.Object.create(SC.CollectionColumnDelegate);
    
    // fake empty array that implements delegate
    content = SC.Object.create(SC.CollectionColumnDelegate, SC.Array, SC.Freezable, {
      
      isFrozen: YES,
      
      length: 0,
      
      objectAt: function(idx) { return undefined; }
    });
    
  }
});

// ..........................................................
// BASIC CONFIGURATION
// 

test("no delegate and no content", function() {
  view = SC.HorizontalListView.create();
  equals(view.get('delegate'), null, 'precond - delegate should be null');
  equals(view.get('content'), null, 'precond - content should be null');
  equals(view.get('columnDelegate'), view, 'default column delegate should view');
});

test("with no delegate and content not delegate", function() {
  var array = [];
  view = SC.HorizontalListView.create({ content: array });

  equals(view.get('delegate'), null, 'precond - delegate should be null');
  ok(!view.get('content').isCollectionColumnDelegate, 'precond - content should not be CollectionColumnDelegate');
  equals(view.get('columnDelegate'), view, 'default column delegate should view');
});

test("with no delegate and content is delegate", function() {
  view = SC.HorizontalListView.create({ content: content });

  equals(view.get('delegate'), null, 'precond - delegate should be null');
  equals(view.get('content').isCollectionColumnDelegate, YES, 'precond - content should be CollectionColumnDelegate');
  equals(view.get('columnDelegate'), content, 'row delegate should be content');
});

test("with delegate and content is delegate", function() {
  view = SC.HorizontalListView.create({ delegate: del, content: content });

  equals(view.get('delegate').isCollectionColumnDelegate, YES, 'precond - delegate should be CollectionColumnDelegate');
  equals(view.get('content').isCollectionColumnDelegate, YES, 'precond - content should be CollectionColumnDelegate');
  equals(view.get('columnDelegate'), del, 'row delegate should be delegate');
});

// ..........................................................
// CHANGING PROPERTIES
// 

test("modifying delegate and content", function() {
  var callCount = 0 ;
  
  view = SC.HorizontalListView.create();
  view.addObserver('columnDelegate', function() { callCount++; });
  
  equals(view.get('delegate'), null, 'precond - delegate should be null');
  equals(view.get('content'), null, 'precond - content should be null');
  equals(view.get('columnDelegate'), view, 'default column delegate should view');
  
  // test setting content
  callCount=0;
  SC.run(function() { view.set('content', content); });
  ok(callCount>0, 'columnDelegate should change when setting content');
  equals(view.get('columnDelegate'), content, 'columnDelegate should change after setting content');

  // test setting delegate
  callCount=0;
  SC.run(function() { view.set('delegate', del); });
  ok(callCount>0, 'columnDelegate should change when setting delegate');
  equals(view.get('columnDelegate'), del, 'columnDelegate should change to delegate after setting delegate');

  // test changing content
  callCount=0;
  SC.run(function() { view.set('content', []); });
  ok(callCount>0, 'columnDelegate should change when setting content');
  equals(view.get('columnDelegate'), del, 'columnDelegate should stay delegate as long as delegate remains');

  // test changing delegate
  callCount=0;
  SC.run(function() { view.set('delegate', null); });
  ok(callCount>0, 'columnDelegate should change when setting delegate');
  equals(view.get('columnDelegate'), view, 'columnDelegate should go back to view when delegate and content cleared or dont implement');
  
});

// ..........................................................
// NOTIFICATIONS
// 

test("changing the columnWidth should invalidate all column widths", function() {
  var indexes = null;
  view = SC.HorizontalListView.create({
    content:  '1 2 3 4 5'.w(), // provide some contnet
    delegate: del,
    
    // override for testing
    columnWidthDidChangeForIndexes: function(passed) {
      indexes = passed;
    }
  });
  
  indexes = null;
  del.set('columnWidth', 30);
  same(indexes, SC.IndexSet.create(0,5), 'changing column width should call columnWidthDidChangeForIndexes(0..5)');
  
  // remove del and try again to verify that it stops tracking changes
  view.set('delegate', null);
  indexes = null;
  del.set('columnWidth', 23);
  equals(indexes, null, 'once delegate is removed changed columnWidth should not impact anything');
  
  // change column width on the view without a delegate to verify new observers
  // are setup.
  indexes = null;
  view.set('columnWidth', 14);
  same(indexes, SC.IndexSet.create(0,5), 'changing column width should call columnWidthDidChangeForIndexes(0..5)');
  
});


test("changing the customColumnWidthIndexes should invalidate impacted column widths", function() {
  var indexes = null;
  view = SC.HorizontalListView.create({
    content:  '1 2 3 4 5'.w(), // provide some contnet
    delegate: del,
    
    // override for testing
    columnWidthDidChangeForIndexes: function(passed) {
      indexes = passed;
    }
  });
  
  // try changing the index set
  indexes = null;
  var set = SC.IndexSet.create(2,2);
  del.set('customColumnWidthIndexes', set);
  same(indexes, set, 'setting customColumnWidthIndexes for first time should invalidate indexes only');

  // modify the set
  indexes = null ;
  set.add(1,3);
  same(indexes, set, 'modifying index set should invalidate all old and new indexes');
  
  // changing to a new set
  indexes =null ;
  var set2 = SC.IndexSet.create(0,1);
  del.set('customColumnWidthIndexes', set2);
  same(indexes, set.copy().add(set2), 'setting new indexes should invalidate both old and new indexes');


  // remove an set
  indexes =null ;
  del.set('customColumnWidthIndexes', null);
  same(indexes, set2, 'setting indexes to null should invalidate old index set');

  // try removing delegate
  del.set('customColumnWidthIndexes', set2);
  indexes = null;
  view.set('delegate', null);
  same(indexes, set2, 'removing delegate should invalidate old index set');

  // change delegate once removed.
  indexes = null ;
  del.set('customColumnWidthIndexes', set);
  equals(indexes, null, 'modifying delegate once removed should not change view');
  
});
