// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/**
  @mixin
  
  Any views you want to be rendered with a translucent background can include 
  this mixin.
  
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.Translucent = {
  
  /** @private */
  displayProperties: 'isTranslucent',
  
  /**
    Is the shadow visible? Default is YES.
    
    @type Boolean
  */
  isTranslucent: YES,
  
  /** @private */
  isTranslucentBindingDefault: SC.Binding.oneWay().bool(),
  
  /** @private */
  renderMixin: function(context, firstTime) {
    // console.log('%@.renderMixin<SC.Translucent>(context=%@, firstTime=%@)'.fmt(this, context, firstTime));
    if (firstTime) {
      context.push(
        '<div class="translucent" style="position: absolute; top: 0px; bottom: 0px; right: 0px; left: 0px;"></div>'
      );
    }
    context.setClass('sc-translucent', this.get('isTranslucent')) ;
  }
  
};