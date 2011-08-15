// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var content, delegate ;
var Delegate = SC.Object.extend(SC.CollectionColumnDelegate, {
  columnWidth: 40,
  customColumnWidthIndexes: SC.IndexSet.create(3).add(5,2),
  contentIndexColumnWidth: function(view, content, index) {
    return this.get('customColumnWidthIndexes').contains(index) ? view.get('customColumnWidth') : this.get('columnWidth');
  },
  
  expected: function(view) {
    var ret = [],
        content = view.get('content'),
        loc = view.get('length');
        
    while(--loc>=0) {
      ret[loc] = this.contentIndexColumnWidth(view,content,loc);
    }
    
    return ret ;
  }
});

module("SC.HorizontalListView.columnOffsetForContentIndex", {
  setup: function() {
    content = "1 2 3 4 5 6 7 8 9 0".w().map(function(x) {
      return SC.Object.create({ value: x });
    }, this);
    
    // set this delegate if you want custom column widths
    delegate = Delegate.create();
    
  }
});

function verifyColumnOffsets(view, columnWidth, expected) {
  var loc = view.get('length'), actual, idx, cur=0;
  
  for(idx=0;idx<loc;idx++) {
    actual = view.columnOffsetForContentIndex(idx);
    equals(actual, cur, "content.columnWidthForContentIndex(%@) should be expected offset".fmt(idx));
    cur += expected ? expected[idx] : columnWidth;
  }
  
  ok(loc>0, 'content should have some length');
  equals(view.columnOffsetForContentIndex(loc), cur, 'content.columnWidthForContentIndex(length) should be columnWidth');  
  
}

// ..........................................................
// BASIC TESTS
// 

test("constant column widths", function() {
  var view = SC.HorizontalListView.create({ content: content, columnWidth: 40, customColumnWidthIndexes: null });
  verifyColumnOffsets(view, 40);
});

test("constant column widths with columnSpacing", function() {
  var view = SC.HorizontalListView.create({ content: content, columnWidth: 40, columnSpacing: 2, customColumnWidthIndexes: null });
  verifyColumnOffsets(view, 42);
});

test("custom column widths", function() {
  var view = SC.HorizontalListView.create({
    content: content,
    columnWidth: 30,
    customColumnWidth: 50,
    delegate: delegate
  });
  verifyColumnOffsets(view, 40, delegate.expected(view));
});

test("adding delegate should update calculation", function() {
  var view = SC.HorizontalListView.create({
    content: content,
    columnWidth: 30,
    customColumnWidth: 50
  });
  verifyColumnOffsets(view, 30);
  
  view.set('delegate', delegate);
  verifyColumnOffsets(view, 40, delegate.expected(view));
});

test("changing delegate from custom to not custom should update", function() {
  var view = SC.HorizontalListView.create({
    content: content,
    columnWidth: 12,
    customColumnWidth: 50,
    delegate: delegate
  });
  verifyColumnOffsets(view, 40, delegate.expected(view));
  
  delegate.set('customColumnWidthIndexes', null);
  verifyColumnOffsets(view, 40);
});

// ..........................................................
// SPECIAL CASES
// 

test("computed custom column width indexes", function() {
  
  delegate = Delegate.create({
    indexes: Delegate.prototype.customColumnWidthIndexes,
    useIndexes: NO,
    
    customColumnWidthIndexes: function() {
      return this.get('useIndexes') ? this.get('indexes') : null;
    }.property('useIndexes').cacheable()
  });

  var view = SC.HorizontalListView.create({
    content: content,
    columnWidth: 12,
    customColumnWidth: 50,
    delegate: delegate
  });
  verifyColumnOffsets(view, 40);


  delegate.set('useIndexes', YES);
  verifyColumnOffsets(view, 40, delegate.expected(view));  
});

