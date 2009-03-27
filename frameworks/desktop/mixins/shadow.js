// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/**
  @mixin
  
  Any views you want to be rendered with a drop shadow can include this mixin.
  
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.Shadow = {
  
  /** @private */
  displayProperties: 'hasShadow',
  
  /**
    Is the shadow visible? Default is YES.
    
    @type Boolean
  */
  hasShadow: YES,
  
  /** @private */
  hasShadowBindingDefault: SC.Binding.oneWay().bool(),
  
  /** @private */
  renderMixin: function(context, firstTime) {
    console.log('%@.renderMixin<SC.Shadow>(context=%@, firstTime=%@)'.fmt(this, context, firstTime));
    if (firstTime) {
      context.push(
        '<div class="top-left-edge"></div>',
        '<div class="top-edge"></div>',
        '<div class="top-right-edge"></div>',
        '<div class="right-edge"></div>',
        '<div class="bottom-right-edge"></div>',
        '<div class="bottom-edge"></div>',
        '<div class="bottom-left-edge"></div>',
        '<div class="left-edge"></div>'
      );
    }
    context.setClass('sc-shadow', this.get('hasShadow')) ;
  }
  
};