// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
var pane, view, elem, rect1, rect2, rect3;
module("SC.SegmentedView", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
        SC.SegmentedView.extend({
          items: [
          { value: "Item1", icon: iconURL },
          { value: "Item2", icon: iconURL },
          { value: "Item3", icon: iconURL },
          { value: "Item4", icon: iconURL, alwaysSetValue: YES, action: 'test'},
          { value: "Item5", icon: iconURL, action: 'test'}],
          itemTitleKey: 'value',
          itemValueKey: 'value',
          itemIconKey: 'icon',
          itemActionKey: 'action',
          itemAlwaysSetValueKey: 'alwaysSetValue',
          value: "Item1 Item3".w(),
          allowsEmptySelection: NO,
          layout: { height: 25 } 
        })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();
    
    view = pane.childViews[0];
    
    elem = view.get('layer').childNodes[0];
    rect1 = elem.getBoundingClientRect();
    elem = view.get('layer').childNodes[1];
    rect2 = elem.getBoundingClientRect();
    elem = view.get('layer').childNodes[2];
    rect3 = elem.getBoundingClientRect();
    elem = view.get('layer').childNodes[3];
    rect4 = elem.getBoundingClientRect();
    elem = view.get('layer').childNodes[4];
    rect5 = elem.getBoundingClientRect();
  }, 
  
  teardown: function() {
    pane.remove();
    pane = view = elem = rect1 = rect2 = rect3 = rect4 = null ;
  }
});

test("Check that properties are mapped correctly", function() {
    view.triggerItemAtIndex(1);
    SC.RunLoop.begin();
    view.set('isEnabled', YES);
    SC.RunLoop.end();
    equals(view.get('value'), "Item2", "the second item should be selected.");
    var items=view.displayItems();
    equals(items[0][0], "Item1", 'Computed properties should match');
    equals(items[0][1], "Item1", 'Computed properties should match');
    equals(items[0][2], true, 'Computed properties should match');
    equals(items[0][3], iconURL, 'Computed properties should match');
    equals(items[0][4], null, 'Computed properties should match');
    equals(items[0][5], null, 'Computed properties should match');
    equals(items[0][6], 0, 'Computed properties should match');
    
    var firstItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { pageX: rect1.left + 2, pageY: rect1.top + 2 });
    view.mouseDown(firstItemEvent);
    equals(view._isMouseDown, YES, 'mousedown');
    equals(view.get('activeIndex'), 0, '');
    
 });



 test("Check that mouse actions work", function() {
   view.triggerItemAtIndex(1);
   SC.RunLoop.begin();
   view.set('isEnabled', YES);
   SC.RunLoop.end();
   
   // Test Mouse Down
   // it now gets the item by the position, so we have to pass a position
   var firstItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { pageX: rect1.left + 2, pageY: rect1.top + 2 });
   view.mouseDown(firstItemEvent);
   
   equals(view._isMouseDown, YES, 'Mouse down flag on mousedown should be ');
   equals(view.get('activeIndex'), 0, 'The active item is the first segment.');
   
   // Test Mouse Up
   elem = view.get('layer').childNodes[1];
      
   view.mouseUp(firstItemEvent);
   equals(view._isMouseDown, NO, 'Mouse down flag on mouseup should be ');
   equals(view.get('activeIndex'), -1, 'There shouldnt be any active item');
   
   // Test third item
   elem = view.get('layer').childNodes[2];
   var thirdItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { pageX: rect3.left + 2, pageY: rect3.top + 2 });

   // mouse down and move
   view.mouseDown(thirdItemEvent);
   view.mouseMoved(thirdItemEvent);
   equals(view._isMouseDown, YES, 'Mouse down flag on mousemoved should be ');
   equals(view.get('activeIndex'), 2, 'The active item is the third segment.');
   
   // try moving mouse while mouse down
   var secondItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { pageX: rect2.left + 1, pageY: rect2.top + 1 });
   view.mouseMoved(secondItemEvent);
   equals(view._isMouseDown, YES, 'Mouse down flag on mousemoved should be ');
   equals(view.get('activeIndex'), 1, 'The active item should have changed to the second segment.');
   
   // and check that mouse out cancels.
   var noItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { pageX: rect1.left - 5, pageY: rect1.top - 5 });

   view.mouseExited(noItemEvent);
   equals(view._isMouseDown, YES, 'Mouse down flag on mouseout should still be ');
   equals(view.get('activeIndex'), -1, 'The active item is no longer specified.');

   // Test fourth item
   elem = view.get('layer').childNodes[3];
   var fourthItemEvent = SC.Event.simulateEvent(elem, 'mouseDown', { pageX: rect4.left + 2, pageY: rect4.top + 2 });

   // mouse click
   view.mouseDown(fourthItemEvent);
   view.mouseUp(fourthItemEvent);
   equals(view.get('value'), 'Item4', 'Click Item4 with an action and alwaysSetValue is YES: The value should be');

   //Test fifth item
   elem = view.get('layer').childNodes[4];
   var fifthItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { pageX: rect5.left + 2, pageY: rect5.top + 2 });

   // mouse down and move has action
   view.mouseDown(fifthItemEvent);
   view.mouseUp(fifthItemEvent);
   equals(view.get('value'), 'Item4', 'Click Item5 with an action and alwaysSetValue is undefined: The value should be');

});


