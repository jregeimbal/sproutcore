// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/** 
  Popular customized picker position rules:
  default: initiated just below the anchor. 
           shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  menu :   same as default rule +
           default(1,4,3) or custom offset below the anchor for default location to fine tunned visual alignment +
           enforce min left(7px)/right(8px) padding to the window
  fixed :  default(1,4,3) or custom offset below the anchor for default location to cope with specific anchor and skip fitPositionToScreen
  pointer :take default [0,1,2,3,2] or custom matrix to choose one of four perfect pointer positions.Ex:
           perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
           fallback to perfect top (2)
*/
SC.PICKER_MENU = 'menu';
SC.PICKER_FIXED = 'fixed';
SC.PICKER_POINTER = 'pointer';

/** 
  Pointer layout for perfect right/left/top/bottom
*/
SC.POINTER_POSITIONS = 'perfect-right perfect-left perfect-top perfect-bottom'.w() ;

/**
  @mixin
  
  Any views you want to have an arrow "picker" applied can use this mixin.
  
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.PickerPointer = {
  
  /**
    A pointer position specified in SC.POINTER_POSITIONS
    
    @type String
  */
  pointerPosition: 'perfect-right',
  
  /** @private */
  renderMixin: function(context, firstTime) {
    console.log('%@.renderMixin<SC.PickerPointer>(context=%@, firstTime=%@)'.fmt(this, context, firstTime));
    if (firstTime) {
      context.addClass('sc-picker-pointer') ;
      context.push('<div class="picker-pointer"></div>') ;
    }
    
    var ary = SC.POINTER_POSITIONS ;
    var loc = ary.indexOf(this.get('pointerPosition')) ;
    for (var idx=0, len=ary.length; idx<len; ++idx) {
      context.setClass(ary[idx], (idx === loc) ? YES : NO) ;
    }
  }
  
};