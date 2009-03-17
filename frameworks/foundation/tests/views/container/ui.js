// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var pane = SC.ControlTestPane.design({ height: 100 }) ;

pane.add("basic", SC.ContainerView, {
  isEnabled: YES
});
  
pane.add("disabled", SC.ContainerView, {
  isEnabled: NO
});

pane.add('content', SC.ContainerView, {
  contentView: SC.LabelView.extend({ value: 'dorkus' })
});

pane.show(); // add a test to show the test pane

// ..........................................................
// TEST VIEWS
// 
module('SC.ContainerView UI', pane.standardSetup()) ;

test("basic", function() {
  var view = pane.view('basic') ;
  ok(!view.$().hasClass('disabled'), 'should not have disabled class') ;
  ok(!view.$().hasClass('sel'), 'should not have sel class') ;
  
  ok(view.get('contentView') === null, 'default contentView should be null') ;
});

test("disabled", function() {
  var view = pane.view('disabled') ;
  ok(view.$().hasClass('disabled'), 'should have disabled class') ;
  ok(!view.$().hasClass('sel'), 'should not have sel class') ;
});

test('content', function(){
  var view = pane.view('content') ;
  var labelView = view.$('div') ;
  
  // layer locations are updated at the end of a run loop; simulate that here
  SC.RunLoop.begin() ;
  ok(view.get('contentView'), "should have a non-null contentView property") ;
  ok(labelView.html() === 'dorkus', "label view should have correct content") ;
  view.set('nowShowing', '') ;
  SC.RunLoop.end() ; // DOM will update now...
  
  SC.RunLoop.begin() ;
  view = pane.view('content') ;
  ok(!view.get('contentView'), "should have a null contentView property") ;
  
  // view.$('div') will return a div regardless; just verify it's not our 
  // label view...
  ok(view.$('div') !== labelView, "should not have the label view as content") ;
  SC.RunLoop.end() ;
});
