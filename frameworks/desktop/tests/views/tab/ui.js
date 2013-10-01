// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start sc_static*/


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {
  var iconURL= sc_static("/images/tests/people.gif");
  
  var pane = SC.ControlTestPane.design()
    
    .add("tabView1", SC.TabView, { 
      nowShowing: 'tab2',

      items: [
        { title: "tab1", value: "tab1" , icon: iconURL},
        { title: "tab2", value: "tab2" , icon: iconURL},
        { title: "tab3", value: "tab3" , icon: iconURL}
      ],
      
      itemTitleKey: 'title',
      itemValueKey: 'value',
      itemIconKey: 'icon',
      layout: { left:12, height: 200, right:12, top:12 }
      
  })
  
  .add("tabView2", SC.TabView, { 
    nowShowing: 'tab3',

    items: [
      { title: "tab1", value: "tab1" },
      { title: "tab2", value: "tab2" },
      { title: "tab3", value: "tab3" }
    ],
    
    itemTitleKey: 'title',
    itemValueKey: 'value',
    layout: { left:12, height: 200, right:12, top:12 }
    
    })
    .add("tabView3", SC.TabView, { 
    
      items: [
        { title: "tab1", value: "tab1" },
        { title: "tab2", value: "tab2" },
        { title: "tab3", value: "tab3" }
      ],
    
      itemTitleKey: 'title',
      itemValueKey: 'value',
      layout: { left:12, height: 200, right:12, top:12}
    })
    .add("tabView4", SC.TabView, { 
      nowShowing: 'tab1',
      tabLocation: SC.TOP_TOOLBAR_LOCATION,
      items: [
        { title: "really long tab1", value: "tab1" },
        { title: "even longer and more annoying tab2", value: "tab2" },
        { title: "tab3", value: "tab3" }
      ],
    
      itemTitleKey: 'title',
      itemValueKey: 'value',
      layout: { left:12, height: 200, right:12, top:12}
    });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.TabView ui', pane.standardSetup());
  
  test("Check that all tabViews are visible", function() {
    ok(pane.view('tabView1').get('isVisibleInWindow'), 'tabView1.isVisibleInWindow should be YES');
    ok(pane.view('tabView2').get('isVisibleInWindow'), 'tabView2.isVisibleInWindow should be YES');
    ok(pane.view('tabView3').get('isVisibleInWindow'), 'tabView3.isVisibleInWindow should be YES');
    ok(pane.view('tabView4').get('isVisibleInWindow'), 'tabView4.isVisibleInWindow should be YES');
   });
   
   
   test("Check that the tabView has the right classes set", function() {
     var viewElem=pane.view('tabView1').$();
     var views=pane.view('tabView1').$('div');
     ok(viewElem.hasClass('sc-view'), 'tabView1.hasClass(sc-view) should be YES');
     ok(viewElem.hasClass('sc-tab-view'), 'tabView1.hasClass(sc-tab-view) should be YES');
     ok(views[1].className.indexOf('sc-segmented-view')>=0, 'tabView1 should contain a segmented view');
     ok(views[0].className.indexOf('sc-container-view')>=0, 'tabView1 should contain a container view');
     ok(views[1].childNodes.length===3, 'tabView1 should have 3 options');
   });
  
  test("Check that the nowShowing initial tab is still selected", function() {
    equals(pane.view('tabView4').get('nowShowing'), 'tab1', 'tab1 of tabView4 should be nowShowing');
    ok(pane.view('tabView4').segmentedView.get('autoAdjustHeight'), 'autoAdjustHeight should have been passed in as true via binding');
    equals(pane.view('tabView4').containerView.getPath('layout.top'), SC.REGULAR_BUTTON_HEIGHT*2+1, 'containerView should adjust top to meet height');
  });

})();
