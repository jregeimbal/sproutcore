// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/panel');

/**
  Displays a modal sheet pane animated drop down from top.

  The default way to use the sheet pane is to simply add it to your page like this:
  
  {{{
    SC.SheetPane.create({
      contentView: SC.View.extend({
        layout: { width: 400, height: 200, centerX: 0 }
      })
    }).append();
  }}}
  
  This will cause your sheet panel to display.  The default layout for a Sheet 
  is to cover the entire document window with a semi-opaque background, and to 
  resize with the window.
  
  @extends SC.Panel
  @since SproutCore 1.0
*/
SC.SheetPanel = SC.Panel.extend({
  
  classNames: 'sc-sheet-pane',
  
  init: function() {
    sc_super() ;
    this._targetLayout = this.get('layout') ;
    var f = this.get('frame') ;
    console.log(f);
    this.set('layout', {
      top: 0-f.height-20, // height of shadow...
      centerX: 0,
      width: f.width,
      height: f.height
    });
  },
  
  render: function(context, firstTime) {
    if (firstTime) {
      context.addClass('sc-transition-ease-out') ;
      if (SC.browser.webkit) this.invokeNext(this.applyTargetLayout) ;
      else this.applyTargetLayout() ;
    }
    sc_super() ;
  },
  
  applyTargetLayout: function() {
    var layout = this.get('layout') ;
    this.set('layout', this._targetLayout) ;
    this.updateLayout() ;
    this._targetLayout = layout ;
  },
  
  remove: function() {
    this.applyTargetLayout() ;
    if (SC.browser.webkit) this.invokeLater(this.performRemove, 300) ;
    else this.performRemove() ;
  },
  
  performRemove: function() {
    this.remove.base.apply(this) ;
  }
  
});