// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

sc_require('mixins/translucent');

/**
  @class
  
  Most SproutCore applications need modal panels. The default way to use the 
  panel pane is to simply add it to your page like this:
  
  {{{
    SC.Panel.create({
      contentView: SC.View.extend({
        layout: { width: 400, height: 200, centerX: 0, centerY: 0 },
      })
    }).append() ;
  }}}
  
  Panels by default fill the entire background and resize with the window. The
  background is colored with a semi-opaque background.
  
  @extends SC.Pane
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.Panel = SC.Pane.extend(SC.Translucent, {
  
  /** @private */
  layout: { left:0, right:0, top:0, bottom:0 },
  
  /** @private */
  classNames: ['sc-panel'],
  
  /**
    Can this panel become the key pane? Default is YES.
    
    @type Boolean
  */
  acceptsKeyPane: YES,
  
  /**
    Is this a modal panel? Default is NO.
    
    @type Boolean
  */
  isModal: NO,
  
  // ..........................................................
  // CONTENT VIEW
  // 
  
  /**
    Set this to the view you want to act as the content within the panel.
    
    @type SC.View
  */
  contentView: null,
  contentViewBindingDefault: SC.Binding.single(),
  
  /**
    This method is called to actually replace the content in the panel.  You 
    may override this if you want to change how the view is swapped out.
    
    @param {SC.View} newContent May be null.
  */
  replaceContent: function(newContent) {
    this.removeAllChildren() ;
    if (newContent) {
      this.appendChild(newContent) ;
      this.set('layout', { top: 0, left: 0, right: 0, bottom: 0 }) ;
     }
  },
  
  /**
    Invoked whenever the content property changes.  This method will simply
    call replaceContent.  Override replaceContent to change how the view is
    swapped out.
  */
  contentViewDidChange: function() {
    this.replaceContent(this.get('contentView')) ;
  }.observes('contentView'),
  
  // ..........................................................
  // INTERNAL SUPPORT
  //
   
  /** @private */
  createChildViews: function() {
    // if contentView is defined, then create the content
    var view = this.contentView ;
    if (view) {
      view = this.contentView = this.createChildView(view) ;
      this.childViews = [view] ;
    }
  },
  
  /** @private
    Extends SC.Pane's method - make panel keyPane when shown.
  */
  paneDidAttach: function() {
    var ret = sc_super() ;
    this.get('rootResponder').makeKeyPane(this) ;
    return ret ;
  },

  /** @private
    Suppress all mouse events on panel itself.
  */
  mouseDown: function(evt) { return YES; }
  
});
