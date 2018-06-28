'use strict';
/*!
 * @version: 1.1.1
 * @name: menu
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import * as Ps from 'perfect-scrollbar';
import 'velocity';
import * as Hammer from 'hammerjs';

interface SidebarOptions {
    animationSpeed?: number;
    defaultState?: string;
    draggable?: boolean;
    easingClose?: string;
    easingOpen?: string;
    position?: string;
    scroll?: boolean;
    scrollOptions?: PerfectScrollbarSettings;
    triggerState?: string;
    triggerStateIcon?: any;
    type?: string;
    [key:string]: any;
}


export default class Sidebar {
    private _$dragTarget: JQuery;
    private _$overlay: JQuery;
    private _$triggerButton: JQuery;
    private _$sidebar: JQuery;
    private _$app: JQuery;
    private _state: string;
    private _defaultState: string;
    private _defaultWidth: number;
    private _triggerState: string;
    private _triggerWidth: number;
    private _cur_pos: number;
    private _hummer: any;
    private _viewWidth: number;
    private _type: string;
    private _width: number;
    private _id: string;
    private _defaults = {
        animationSpeed: 400,
        defaultState: 'open',
        draggable: true,
        easingClose: 'easeOutCubic',
        easingOpen: 'easeOutQuad',
        position: 'left',
        scroll: true,
        scrollOptions: {},
        triggerState: 'compact',
        triggerStateIcon: {open: 'm-icon-arrow-right', close: 'm-icon-arrow-left', normal: 'm-icon-arrow' },
        type: 'push',
    };

    constructor(public sidebar: Element | string, private options?: SidebarOptions, ) {
        this.options = $.extend({}, this._defaults, options);
        this._cur_pos = 0;
        this._viewWidth = window.innerWidth;
    }

    init() {
        this._$sidebar = $(this.sidebar);
        if( !this._$sidebar.length ) return;
        this._id = $(this.sidebar).height($(window).height()).css('overflow', 'auto').attr('id');
        if(!this._id) {
            throw new Error (`Element must have an unique 'id' attribute: \n ${this.sidebar}`);
        }
        this._$app = $('#app');
        this._$triggerButton = $('[data-sidebar="#' + this._id + '"]');
        this._$triggerButton.click( this._handleTriggerClick.bind(this) );
        this._defaultState = this._getDefaultState();
        this._$app.addClass(this._getCssClass('position') + ' ' + this._getCssClass('type' ) + ' ' + this._getCssClass('def-state', this._defaultState));


        if (this.options.draggable) {
            this._$dragTarget = $('<div class="' + this._id + '-drag-target"></div>').attr('data-sidebar', '#' + this._id);
            this._$app.append(this._$dragTarget);
            this._$dragTarget.on('click', function(){

                });
            this._hummer = new Hammer(this._$dragTarget[0]);
            this._hummer.on('pan', this._handlePan.bind(this));
            this._hummer.on('panend', this._handlePanEnd.bind(this));
            if (this.options.position === 'right') {
                this._$dragTarget.css({'right': 0});
            } else {
                this._$dragTarget.css({'left': 0});
            }
        } else {
            this._$dragTarget = $();
        }
        this._$overlay = $();

        this.setSidebarState();

        $(window).resize( this._handleResize.bind(this) );
        this._$app.on('state-change-init', () => {
            this._defaultState = this._getDefaultState();
            // if( this._defaultState === 'compact') {
                this._$app.css('paddingLeft', '');
            // }
            let oldDefState = this._getClass('sidebar-def-state');
            this._$app.removeClass(oldDefState).addClass(this._getCssClass('def-state', this._defaultState));
            this.setSidebarState()
        });

        this._attachHandles();
        this._initScroll();
        this._$sidebar.data('sidebar', this);
    }

    setSidebarState(change: boolean = false) {
        this._$sidebar.trigger('sidebar-before-state-change');
        this._$dragTarget.css({'left': this._width});
        this._triggerState = this._getTriggeredState();
        this._type = this._getType();
        this._setWidth();
        if( !this._state ) {
            this._state = this._defaultState;
            this._width = this._defaultWidth;
        }
        let defO = {
            state: this._defaultState,
            width: this._defaultWidth
        };
        let trO = {
            state: this._triggerState,
            width: this._triggerWidth
        };
        if( change && this._state === this._triggerState || !change && this._state !== this._defaultState ) {
            this._animateMenu(trO, defO );
            this._state = defO.state;
            this._width = defO.width;
        } else if( change && this._state === this._defaultState ) {
            this._animateMenu(defO, trO );
            this._state = trO.state;
            this._width = trO.width;
        } else {
            this._state = defO.state;
            this._width = defO.width;
        }
        this._$dragTarget.css({'left': this._width});
        this._setIcon();
    }

    public destroy() {
        this._$overlay.trigger('click').remove();
        this._$dragTarget.remove();
        this._$triggerButton.off('click');
        return this;
    }

    get state(): string {
        return this._state;
    }

    get width(): number {
        return this._width;
    }

    get type(): string {
        return this._type;
    }

    private _attachHandles() {
        this._$sidebar.trigger('sidebar-attach-handles');
    }

    private _initScroll() {
        if( !this.options.scroll ) return;
        let sidebar = this._$sidebar[0],
            me = this;

        Ps.initialize(sidebar, this.options.scrollOptions);
        $(window).on('resize', () => {
            $(me.sidebar).height($(window).height());
            Ps.update(sidebar)
        });

        // this.$sidebar.on('scroll', function() {
        //     me.storage.setItem('sidebarScrollTop', me.$sidebar.scrollTop().toString());
        // });
        this._$sidebar.trigger('sidebar-after-scroll-init');
    }

    private _setState( state: string ) {
        let old = this._getClass('sidebar-state');
        let newClsss = this._getCssClass('state', state);
        this._$app.removeClass(old).addClass(newClsss);
        this._attachHandles()
    }

    private _getDefaultState() {
        // let resState = this._getResponssiveState();
        // if( resState ) return resState;
        let state = this._getClass('sidebar-state');
        if( !state ) return this.options.defaultState;
        return state.replace('sidebar-state-', '');
    }

    private _getType() {
        let type = this._getClass('sidebar-type');
        if( !type ) return this.options.type;
        return type.replace('sidebar-type-', '');
    }

    private _getClass(statePrefix: string) {
        let classes = this._$app.attr('class').split(' ');
        let single = classes.filter(function(el: string){
            return el.indexOf(statePrefix) >= 0;
        });
        let first = single ? single[0] : '';
        this._$app.removeClass(single.join(' ')).addClass(first);
        return first;
    }

    private _getCssClass(option: string, value?: string | number) {
        return this._id + '-' + option + '-' + (value ? value : this.options[option]);
    }

    // private _getResponssiveState() {
    //     let state = '';
    //     if( window.innerWidth < this.options.mobile ) {
    //         state = 'close';
    //     } else if(window.innerWidth >= this.options.mobile && window.innerWidth < this.options.tablet ) {
    //         state = 'compact';
    //     }
    //     return state;
    // }

    private _getTriggeredState() {
        let state = this._getClass('sidebar-tr-state');
        if( !state ) return this.options.triggerState;
        return state.replace('sidebar-tr-state-', '');
    }

    private _setWidth() {
        let defaultClass = this._getCssClass('state', this._defaultState);
        let triggerClass = this._getCssClass('state', this._triggerState);
        let option = this._getClass('sidebar-option');
        let $html = $(`
            <div class="">
                <div class="${defaultClass} ${option}"><div class="sidebar-wrap"><div class="sidebar-content"></div></div></div>
                <div class="${triggerClass} ${option}"><div class="sidebar-wrap"><div class="sidebar-content"></div></div></div>
            </div>
        `).appendTo(this._$app);
        this._defaultWidth = $html.find('.' + defaultClass + ' .sidebar-content').width();
        this._triggerWidth = $html.find('.' + triggerClass + ' .sidebar-content').width();
        $html.remove();
    }

    private _setIcon() {
        let $icon = this._$triggerButton.find('.icon');
        let stateIcon = this.options.triggerStateIcon.normal;
        if( this._width < this._defaultWidth ) stateIcon = this.options.triggerStateIcon.open;
        if( this._width > this._defaultWidth  ) stateIcon = this.options.triggerStateIcon.close;
        $icon.removeClass(this.options.triggerStateIcon.open + ' ' + this.options.triggerStateIcon.close + ' ' + this.options.triggerStateIcon.normal)
            .addClass(stateIcon);
    }

    private _createOverlay() {
        let me = this;
        if( !$.contains(this._$app[0], this._$overlay[0]) ) {
            this._$overlay = $('<div id="' + this._id + '-overlay" class="' + this._id + '-overlay"></div>');
            this._$overlay.css('opacity', 0).click( function(){
                me.setSidebarState(true);
            });
            this._$app.append(this._$overlay);
        }
    }

    private _animateMenu (from: any, to: any) {
        let prop = {};

        if ( this._type === 'push' ) {
            if(this.options.position === 'left') {
                prop = {'paddingLeft': to.width };
                this._setState( to.state );
                this._$app.css(prop);
                this._$sidebar.css('left', 0);
                this._$dragTarget.css({right: '', left: to.width});
                this._$sidebar.trigger('sidebar-state-changed');
            }
        } else {
            let width = -1;
            let sideProp = {};
            if(this.options.position === 'left') {
                if( this._width < this._defaultWidth || this._width > this._defaultWidth && this._width < this._triggerWidth ) {
                    if( this._defaultState === 'compact') {
                        this._$sidebar.css('left', 0);
                    } else {
                        this._$sidebar.css({'left' : to.width - this._triggerWidth });
                    }
                    this._$sidebar.trigger('sidebar-state-changed');
                    return;
                } else if( this._width === this._triggerWidth ) {
                    sideProp = {'left' : [to.width - this._triggerWidth, this._cur_pos !== 0 ? this._cur_pos : 0 ]};
                    width = this._width;
                    this._$overlay.velocity({opacity: 0}, {
                        duration: this.options.animationSpeed, queue: false, easing: 'easeOutQuad', complete: function() {
                            $(this).remove();
                        }
                    });
                } else if( this._width < this._triggerWidth ) {
                    this._createOverlay();
                    sideProp = {'left' : [0, this._cur_pos !== 0 ? this._cur_pos : from.width - this._triggerWidth]};
                    // this._$app.addClass('js-open');
                    this._$app.css('paddingLeft', this._$app.css('paddingLeft'));
                    this._setState(to.state);
                    this._$overlay.velocity({opacity: 1}, {
                        duration: this.options.animationSpeed, queue: false, easing: 'easeOutQuad',
                    });
                } else {
                    return;
                }
            } else if(this.options.position === 'right') {

            }

            let me = this;
            this._$sidebar.velocity( sideProp, { duration: 400, queue: false, easing: 'easeInOutCubic', mobileHA: true, complete: function () {
                me._$dragTarget.css({right: '', left: to.width });
                if( width > me._defaultWidth ) {
                    // me._$app.removeClass('js-open');
                    me._setState(to.state);
                    me._$app.css('paddingLeft', '');
                }
                if( me._defaultState === 'compact') {
                    me._$sidebar.css('left', 0);
                }
                me._$sidebar.trigger('sidebar-state-changed');
            } });
        }
        this._cur_pos = 0;
    };

    private _handleResize() {
        if( window.innerWidth !== this._viewWidth ) {
            this._viewWidth = window.innerWidth;
            this.setSidebarState();
        }
    }

    private _handlePan(e: HammerInput) {
        if (e.pointerType === "touch") {
            let x = e.center.x;
            let velocityX = e.velocityX;

            if (this.options.position === 'left') {
                if (x < 0) {
                    x = 0;
                } else if (this._triggerWidth > this._defaultWidth && x > this._triggerWidth ) {
                    x = this._width;
                } else if (this._triggerWidth < this._defaultWidth && x > this._defaultWidth ) {
                    x = this._width;
                }
            }

            if (this.options.position === 'left') {
                if( this._type === 'slide' ) {
                    this._cur_pos = x - this._triggerWidth;
                    this._$sidebar.css('left', this._cur_pos + 'px');
                } else {
                    this._cur_pos = x;
                    this._$app.css('paddingLeft', this._cur_pos + 'px');
                }
                if(this._triggerWidth > this._defaultWidth) {
                    if (velocityX < 0 && x < Math.abs(this._defaultWidth - this._triggerWidth ) / 4 ) {
                        this.setSidebarState(true);
                        this._hummer.stop();
                    } else if (velocityX > 0 && x >= Math.abs(this._defaultWidth - this._triggerWidth ) / 4 ) {
                        this.setSidebarState(true);
                        this._hummer.stop();
                    }
                } else {
                    if (velocityX > 0 && x > Math.abs(this._defaultWidth - this._triggerWidth ) / 4 ) {
                        this.setSidebarState(true);
                        this._hummer.stop();
                    } else if (velocityX < 0 && x <= Math.abs(this._defaultWidth - this._triggerWidth ) / 4 ) {
                        this.setSidebarState(true);
                        this._hummer.stop();
                    }
                }
            } else {
                // if (x < (window.innerWidth - this.options.menuWidthCompact / 4)) {
                //     this.setSidebarState('open');
                // } else if (x >= (window.innerWidth - this.options.menuWidthCompact / 4)) {
                //     this.setSidebarState('close');
                // }
            }

            if(this._type === 'slide') {
                if ( this._width < this._triggerWidth ) {
                    this._createOverlay();
                }
                this._$overlay.css('left', 0);
                let opacity;
                if (this.options.position === 'left') {
                    opacity = x / this._triggerWidth;
                    this._$overlay.velocity({opacity: opacity }, {duration: 10, queue: false, easing: 'easeOutQuad'});
                } else {
                    // opacity = Math.abs((x - window.innerWidth) / this._triggerWidth);
                    // this._$overlay.velocity({opacity: opacity }, {duration: 10, queue: false, easing: 'easeOutQuad'});
                }
            }

        }
    }

    private _handlePanEnd(e: HammerInput) {
        if (e.pointerType === "touch") {
            let velocityX = e.velocityX;
            if (velocityX > 0.1 || velocityX < -0.5) {
                this.setSidebarState(true);
            }
        }
    }

    private _handleTriggerClick() {
        this.setSidebarState(true);
        return false;
    }
}
