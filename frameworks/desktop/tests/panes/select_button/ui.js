// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

//control test pane
var pane = SC.ControlTestPane.design()
     //sample1
    .add("Basic", SC.SelectButtonView, {
       objects: ['None', 'Low', 'Medium', 'High']
    })

    //sample2
    .add("Disabled", SC.SelectButtonView, {
       isEnabled: NO, objects: ['None', 'Low', 'Medium', 'High']
    })

    //sample3
    .add("NotVisible", SC.SelectButtonView, {
      isVisible: NO, objects: ['None', 'Low', 'Medium', 'High']
    })

    //sample4
    .add("SortedObjects", SC.SelectButtonView, {
      objects:['None', 'Low', 'Medium', 'High']
    })

    //sample5
    .add("UnsortedObjects", SC.SelectButtonView, {
      objects:['None', 'Low', 'Medium', 'High'],
      disableSort: YES
    })

    //sample6
    .add("redraw", SC.SelectButtonView, {
      layout: { width: '150', right: '0' }
    })

    //sample7
    .add("SelectButtonWithIcon", SC.SelectButtonView, {
      objects: [{ title: "None", icon: 'select-button-icon' },
        { title: "Low", icon: 'select-button-icon' },
        { title: "Medium", icon: 'select-button-icon' },
        { title: "High", icon: 'select-button-icon' }],
      nameKey: 'title',
      iconKey: 'icon',
      checkboxEnabled: YES
    })

    //sample8
    .add("SortKey", SC.SelectButtonView, {
      objects: [{ title: "None", pos: 3},
        { title: "Low", pos: 1},
        { title: "Medium", pos: 2 },
        { title: "High", pos: 4}],
      nameKey: 'title',
      disableSort: NO,
      sortKey: 'pos',
      checkboxEnabled: YES
    })

    //sample9
    .add("StaticLayout", SC.SelectButtonView, {
      useStaticLayout: YES,
      objects:['None', 'Low', 'Medium', 'High'],
      layout: { width: '150', right: '0' }
    })

    //sample10
    .add("DisableItem", SC.SelectButtonView, {
      objects: [{ title: "None", pos: 3, isEnabled: YES },
        { title: "Low", pos: 1, isEnabled: NO },
        { title: "Medium", pos: 2, isEnabled: YES },
        { title: "High", pos: 4, isEnabled: NO }],
      nameKey: 'title',
      disableSort: NO,
      isEnabledKey: 'isEnabled',
      sortKey: 'pos',
      checkboxEnabled: YES
    }) 
    
    //sample11
    .add("EmptyName", SC.SelectButtonView, {
      objects: [{ title: "None", pos: 3, isEnabled: YES, value: 10 },
        { title: "Low", pos: 1, isEnabled: NO, value: 12 },
        { title: "Medium", pos: 2, isEnabled: YES, value: 14 },
        { title: "High", pos: 4, isEnabled: NO, value: 16 }],
      nameKey: 'title',
      valueKey: 'value',
      disableSort: NO,
      isEnabledKey: 'isEnabled',
      sortKey: 'pos',
      checkboxEnabled: NO,
      emptyName: 'Fred'
    })
    .add("IgnoreCase",SC.SelectButtonView, {
       objects: ['None', 'Low', 'Medium', 'High'],
       ignoreCase: true
    });
    pane.show();

// ..........................................................
// TEST VIEWS
//

module('SC.SelectButtonView ui', pane.standardSetup()) ;

//test1
test("Check the visiblity of the selectButtons", function() {
  ok(pane.view('Basic').get('isVisibleInWindow'), 'Basic.isVisibleInWindow should be YES') ;
  ok(pane.view('Disabled').get('isVisibleInWindow'), 'Disabled.isVisibleInWindow should be YES') ;
  ok(!pane.view('NotVisible').get('isVisibleInWindow'), 'NotVisible.isVisibleInWindow should be NO') ;
  ok(pane.view('SortedObjects').get('isVisibleInWindow'), 'SortedObjects.isVisibleInWindow should be YES') ;
  ok(pane.view('UnsortedObjects').get('isVisibleInWindow'), 'UnsortedObjects.isVisibleInWindow should be YES') ;
  ok(pane.view('redraw').get('isVisibleInWindow'), 'redraw.isVisibleInWindow should be YES') ;
  ok(pane.view('SelectButtonWithIcon').get('isVisibleInWindow'), 'SelectButtonWithIcon.isVisibleInWindow should be YES') ;
  ok(pane.view('StaticLayout').get('isVisibleInWindow'), 'StaticLayout.isVisibleInWindow should be YES') ;
}) ;

//test2
test("Basic", function() {
  var view=pane.view('Basic').$();
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('icon'), 'hasClass(icon) should be NO') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

//test3
test("Disabled", function() {
  var view=pane.view('Disabled').$() ;
  ok(view.hasClass('disabled'), 'hasClass(disabled) should be YES') ;
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('icon'), 'hasClass(icon) should be NO') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

//test4
test("NotVisible", function() {
  var view=pane.view('NotVisible').$();
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
  ok(!view.hasClass('sel'), 'should not have sel class') ;
}) ;

//test5
test("SortedObjects", function() {
   var view = pane.view('SortedObjects');
   equals(null,view.get('sortKey'), 'sortkey not specified') ;
   ok(view.$().hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
   ok(view.$().hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
   ok(view.$().hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
   ok(!view.$().hasClass('sel'), 'hasClass(sel) should be NO') ;
   ok(!view.$().hasClass('icon'), 'hasClass(icon) should be NO') ;
   ok(!view.$().hasClass('disabled'), 'hasClass(disabled) should be NO') ;
   ok(!view.$().hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

//test6
test("UnsortedObjects", function() {
   var view = pane.view('UnsortedObjects');
   equals(YES,view.get('disableSort'), 'Sorting disabled') ;

   ok(view.$().hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
   ok(view.$().hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
   ok(view.$().hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
   ok(!view.$().hasClass('sel'), 'hasClass(sel) should be NO') ;
   ok(!view.$().hasClass('icon'), 'hasClass(icon) should be NO') ;
   ok(!view.$().hasClass('disabled'), 'hasClass(disabled) should be NO') ;
   ok(!view.$().hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

//test7
test("redraw", function() {
  var view=pane.view('redraw');
  ok(view.$().hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.$().hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.$().hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.$().hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.$().hasClass('icon'), 'hasClass(icon) should be NO') ;
  ok(!view.$().hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.$().hasClass('def'), 'hasClass(def) should be NO');

  ok(view.get('objects').length === 0, "Objects should be empty");
  SC.RunLoop.begin();
  view.set('objects', ['Calendar', 'Work', 'Home']);
  SC.RunLoop.end();
  ok(view.get('objects').length === 3, "Objects length should be 3");
}) ;

//test8
test("SelectButtonWithIcon", function() {
  var view=pane.view('SelectButtonWithIcon').$();
  ok(view.hasClass('icon'), 'hasClass(Icon) should be YES') ;
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

//test9
test("Check if the objects are sorted based on sortKey", function() {
  var view=pane.view('SortKey');
  equals(view.get('objects')[2].title, 'None','Third object should be "None" ') ;
}) ;

//test10
test("StaticLayout", function() {
  var view = pane.view('StaticLayout');
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});

//test11
test("EmptyName", function() {
  var view = pane.view('EmptyName');
  // objects list is the same
  equals(view.get('objects')[0].title, 'Low','First object should be "Low", the emptyName is not in the objects list') ;
  equals(view.get('objects')[2].title, 'None','Third object should be "None", the emptyName is not in the objects list') ;
  // itemList has emptyName first regardless of sort
  equals(view.get('itemList')[0].title, 'Fred','First item in list should be "Fred", the emptyName out of sort') ;
  equals(view.get('itemList')[3].title, 'None','Fourth item in list should be "None" sorted as before') ;
});

test("IgnoreCase", function () {
  var view = pane.view('IgnoreCase');

  SC.RunLoop.begin();
  view.set('value','None');
  view.set('value','low');
  SC.RunLoop.end();

  equals(view.$('.sc-button-label').html(),'Low','Setting a different case still matches correct value');
});
