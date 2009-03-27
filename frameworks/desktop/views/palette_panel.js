// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/panel');
sc_require('mixins/shadow');

/**
  Displays a non-modal, default positioned, drag&drop-able palette pane.

  The default way to use the palette pane is to simply add it to your page like this:
  
  {{{
    SC.PalettePane.create({
      layout: { width: 400, height: 200, right: 0, top: 0 },
      contentView: SC.View.extend({
        layout: {} // doesn't matter...
      })
    }).append() ;
  }}}
  
  This will cause your palette pane to display.
  
  Palette pane is a simple way to provide non-modal messaging that won't 
  blocks the user's interaction with your application.  Palette panes are 
  useful for showing important detail informations with flexsible position.
  They provide a better user experience than modal panel.
  
  @extends SC.Panel
  @since SproutCore 1.0
*/
SC.PalettePanel = SC.Panel.extend(SC.Shadow, {
  
  classNames: 'sc-palette-pane',
  
  /** @pivate */
  isTranslucent: NO,
  
  /**
    Is this a modal palette? Default is NO.
    
    @type Boolean
  */
  isModal: NO,
  
  /**
  Is this an anchored palette? Default is NO.
  
    @type Boolean
  */
  isAnchored: NO,
  
  /** @private
    drag&drop palette to new position.
  */
  mouseDown: function(evt) {
    if (!this.get('isAnchored')) {
      var f = this.get("frame") ;
      this._mouseOffsetX = f ? (f.x - evt.pageX) : 0 ;
      this._mouseOffsetY = f ? (f.y - evt.pageY) : 0 ;
      
      this.set('layout', {
        width: f.width,
        height: f.height,
        left: this._mouseOffsetX + evt.pageX,
        top: this._mouseOffsetY + evt.pageY
      });
      this.updateLayout() ; // required on panes...
      
      // just do dragging...
      this.rootResponder.dragDidStart(this) ;
      
      return YES ;
    }
    else return NO ;
  },
  
  /** @private */
  mouseDragged: function(evt) {
    this.adjust({
      top: this._mouseOffsetY + evt.pageY,
      left: this._mouseOffsetX + evt.pageX,
    });
    this.updateLayout() ; // required on panes...
  }
  
});
