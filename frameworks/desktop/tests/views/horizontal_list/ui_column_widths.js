// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*
  This test evaluates a list with custom column heights, outlines, 
  group views or any other non-standard behavior.
*/

// create a fake content array.  Generates a list with whatever length you
// want of objects with a title based on the index.  Cannot mutate.
var ContentArray = SC.Object.extend(SC.Array, {
  
  length: 0,
  
  objectAt: function(idx) {
    if (idx >= this.get('length')) return undefined;
    
    var content = this._content, ret ;
    if (!content) content = this._content = [];
    
    ret = content[idx];
    if (!ret) {
      ret = content[idx] = SC.Object.create({ 
        title: "ContentItem %@".fmt(idx),
        isDone: (idx % 3)===0,
        unread: (Math.random() > 0.5) ? Math.floor(Math.random() * 100) : 0
      });
    }
    
    return ret ;
  }
});

var pane = SC.ControlTestPane.design()
  .add("Custom Column Widths", SC.ScrollView.design({
    layout: { left: 0, height: 50, top: 0, width: 200 },
    hasVerticalScroller: NO,
    contentView: SC.HorizontalListView.design({
      content: ContentArray.create({ length: 100001 }),
      customColumnWidthIndexes: SC.IndexSet.create(2,5).add(10000,100),
      
      // used for testing
      adjustableColumns: SC.IndexSet.create(0,5),
      altColumnWidth: 10,
      
      contentIndexColumnWidth: function(view, content, index) {
        var ret =this.get('columnWidth');
        if (!this.customColumnWidthIndexes.contains(index)) return ret;
        return this.adjustableColumns.contains(index) ? this.get('altColumnWidth') : ret*2;
      },
      
      contentValueKey: "title",
      contentCheckboxKey: "isDone",
      contentUnreadCountKey: "unread",
      columnWidth: 20

    })
  }));

var pane2 = SC.ControlTestPane.design()
  .add("Custom Column Widths 2", SC.ScrollView.design({
    layout: { left: 0, height: 50, top: 0, width: 200 },
    hasVerticalScroller: NO,
    contentView: SC.HorizontalListView.design({
      content: ContentArray.create({ length: 100 }),
      customColumnWidthIndexes: SC.IndexSet.create(0,1000),
      
      contentIndexColumnWidth: function(view, content, index) {
        if (index % 2 === 0) {
          return 17;
        }
        else {
          return 48;
        }
      },
      
      contentValueKey: "title",
      contentCheckboxKey: "isDone",
      contentUnreadCountKey: "unread",
      columnWidth: 48

    })
  }));

pane.show(); // add a test to show the test pane
pane2.show();
window.pane = pane ;

function verifyChildViewsMatch(views, set) {
  var indexes = set.clone();
  views.forEach(function(view) {
    var idx = view.contentIndex ;
    if (indexes.contains(idx)) {
      ok(YES, "should find childView for contentIndex %@ (nowShowing=%@)".fmt(idx, set));
    } else {
      ok(NO, "should NOT find childView for contentIndex %@ (nowShowing=%@)".fmt(idx, set));
    }
    indexes.remove(idx);
  }, this);
  
  if (indexes.get('length') === 0) {
    ok(YES, "all nowShowing indexes should have matching child views");
  } else {
    ok(NO, "all nowShowing indexes should have matching child views (indexes not found: %@)".fmt(indexes));
  }
}

module("SC.HorizontalListView - ui_column_heights", pane.standardSetup());

// ..........................................................
// BASIC RENDER TESTS
// 

test("rendering only incremental portion", function() {
  var listView = pane.view("Custom Column Widths").contentView; 
  same(listView.get("nowShowing"), SC.IndexSet.create(0, 10), 'nowShowing should be smaller IndexSet');
  equals(listView.get('childViews').length, listView.get('nowShowing').get('length'), 'should have same number of childViews as nowShowing length');  
});

test("scrolling by small amount should update incremental rendering", function() {
  var scrollView = pane.view('Custom Column Widths'),
      listView   = scrollView.contentView,
      exp;
  
  same(listView.get('nowShowing'), SC.IndexSet.create(0,10), 'precond - nowShowing has incremental range');

  // SCROLL DOWN ONE LINE
  SC.run(function() {
    scrollView.scrollTo(61,0);
  });
  
  // top line should have scrolled out of view
  exp = SC.IndexSet.create(4,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);

  // SCROLL DOWN ANOTHER LINE
  SC.run(function() {
    scrollView.scrollTo(83,0);
  });
  
  // top line should have scrolled out of view
  exp = SC.IndexSet.create(5,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);


  // SCROLL UP ONE LINE
  SC.run(function() {
    scrollView.scrollTo(66,0);
  });
  
  // top line should have scrolled out of view
  exp = SC.IndexSet.create(4,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);
  
});

test("the 'nowShowing' property should be correct when scrolling", function() {
  var scrollView = pane2.view('Custom Column Widths 2'),
      listView   = scrollView.contentView,
      correctSet = SC.IndexSet.create(1, 7);
  
  // Scroll to point 36, which demonstrates a problem with the older list view
  // contentIndexesInRect code.
  SC.run(function() {
    scrollView.scrollTo(36,0);
  });
  same(listView.get("nowShowing"), correctSet, 'nowShowing should %@'.fmt(correctSet));
});

// ..........................................................
// CHANGING ROW HEIGHTS
// 

test("manually calling columnWidthDidChangeForIndexes()", function() {
  var scrollView = pane.view('Custom Column Widths'),
      listView   = scrollView.contentView,
      exp;

  same(listView.get('nowShowing'), SC.IndexSet.create(0,10), 'precond - nowShowing has incremental range');
  
  // adjust column height and then invalidate a portion range
  SC.run(function() {
    listView.set('altColumnWidth', 80);
    listView.columnWidthDidChangeForIndexes(listView.adjustableColumns);
  });

  // nowShowing should adjust
  same(listView.get('nowShowing'), SC.IndexSet.create(0,4), 'visible range should decrease since column heights for some columns doubled');
  
  // as well as offset and heights for columns - spot check
  var view = listView.itemViewForContentIndex(3);
  same(view.get('layout'), { top: 0, left: 120, bottom: 0, width: 80 });

});

