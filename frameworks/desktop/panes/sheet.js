// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');

/**
  Displays a modal sheet pane that animates from the top of the viewport.

  The default way to use the sheet pane is to simply add it to your page like this:

  {{{
    SC.SheetPane.create({
      layout: { width: 400, height: 200, centerX: 0 },
      contentView: SC.View.extend({
      })
    }).append();
  }}}

  This will cause your sheet panel to display.  The default layout for a Sheet
  is to cover the entire document window with a semi-opaque background, and to
  resize with the window.

  @extends SC.PanelPane
  @since SproutCore 1.0
  @author Evin Grano
  @author Tom Dale
*/
SC.SheetPane = SC.PanelPane.extend(SC.Animatable, {
  classNames: 'sc-sheet',

  /**
    Speed of transition.  Should be expressed in msec.

    @property {Number}
  */
  transitions: {
    top:0.20
  },

  /**
    Displays the pane.  SheetPane will calculate the height of your pane, draw it offscreen, then
    animate it down so that it is attached to the top of the viewport.

    @returns {SC.SheetPane} receiver
  */
  append: function() {
    this.disableAnimation();
    var layout = this.get('layout');
    if (!layout.height || !layout.top) {
      layout = SC.View.convertLayoutToAnchoredLayout(layout, this.computeParentDimensions());
    }

    // Gently rest the pane atop the viewport
    layout.top = -1*layout.height;
    this.adjust(layout);
    this.updateLayout();
    this.enableAnimation();
    return sc_super();
  },

  /**
    Animates the sheet up, then removes it from the DOM once it is hidden from view.

    @returns {SC.SheetPane} receiver
  */
  remove: function() {
    // We want the functionality of SC.PanelPane.remove(), but we only want it once the animation is complete.
    // Store the reference to the superclass function, and it call it after the transition is complete.
    var that = this, args = arguments;
    this.invokeLater(function() { args.callee.base.apply(that, args) ;}, this.get('transitions').top.duration*1000);
    this.slideUp();

    return this;
  },

  /**
    Once the pane has been rendered out to the DOM, begin the animation.
  */
  paneDidAttach: function() {
    var ret = sc_super();
    // this.invokeLast(this.slideDown, this);
    this.slideDown();

    return ret;
  },

  slideDown: function(){
    this.adjust('top',0);
    this.updateLayout();
  },

  slideUp: function(){
    var layout = this.get('layout');
    if (!layout.height || !layout.top) {
      layout = SC.View.convertLayoutToAnchoredLayout(layout, this.computeParentDimensions());
    }
    this.adjust('top',-1*layout.height);
    this.updateLayout();
  },

  // Needed because of the runLoop and that it is animated...must lose focus because will break if selection is change on text fields that don't move.
  blurTo: function(pane) { this.setFirstResponder(''); },
  
});