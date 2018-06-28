'use strict';
/*!
 * @version: 1.1.1
 * @name: aside
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import * as Ps from 'perfect-scrollbar';
import 'velocity';
import * as Hammer from 'hammerjs';

interface AsideOptions {
    animationSpeed?: number;
    draggable?: boolean;
    easingOpen?: string;
    easingClose?: string;
    overlay?: string;
    position?: string;
    triggerButton?: String | Element;
    scroll?: boolean;
    scrollOptions?: PerfectScrollbarSettings;
    setInStorage?: boolean;
    defaultState?: string
    closeButton?: string;
}


export default class Aside {
    private storage: Storage;
    private $dragTarget: JQuery;
    private $overlay: JQuery;
    private $triggerButton: JQuery;
    private $aside: JQuery;
    private state: string;
    private id: string;
    private initial: any;
    private width: number;
    private defaults = {
        animationSpeed: 400,
        draggable: true,
        defaultState: 'aside-close',
        easingOpen: 'easeOutQuad',
        easingClose: 'easeOutQuad',
        asideWidthClosed: '105%',
        asideWidthOpen: 0,
        overlay: 'aside-overlay',
        position: 'right',
        triggerButton: '.aside-trigger',
        scroll: true,
        scrollOptions: {suppressScrollX: true},
        setInStorage: false,
        closeButton: '.panel-close-btn',
    };

    constructor(private aside: Element | string, private options?: AsideOptions ) {
        this.options = $.extend({}, this.defaults, options);
        this.storage = window.localStorage;
        this.state = this.options.defaultState;
        this.$aside = $(this.aside);
        this.width = this.$aside.width();
    }

    init() {
        if( !$(this.aside).length ) return;
        this.id = $(this.aside).attr('id');
        if(!this.id) {
            console.error('Aside must have an unique `id` attribute');
        }
        let $app = $('#app');
        this.$aside.height(window.innerHeight - $('.header-wrap').height());
        this.$triggerButton = $(this.options.triggerButton + '[data-aside="#' + this.id + '"]');
        this.$triggerButton.on('click', this.handleTriggerShown.bind(this) );

        if (this.options.draggable) {
            this.$dragTarget = $('<div class="drag-aside-target"></div>').attr('data-aside', '#' + this.id);
            $app.append(this.$dragTarget);
            this.$dragTarget.on('click', function(){

            });
            let hummer = new Hammer(this.$dragTarget[0], {});
            hummer.on('pan', this.handlePan.bind(this));
            hummer.on('panend', this.handlePanEnd.bind(this));
        } else {
            this.$dragTarget = $();
        }
        this.$overlay = $();

        if (this.options.position === 'left') {
            $app.addClass('aside-left');
            this.$dragTarget.css({'left': 0});
        } else {
            $app.addClass('aside-right');
            this.$dragTarget.css({'right': 0});
        }

        this.setAsideState(this.storage.getItem('aside-state') || this.options.defaultState);
        $(window).resize( this.handleResize.bind(this) );
        this.initScroll();
        this.$aside.find(this.options.closeButton).click(this.handleClose.bind(this));

        $app.on('panel-pin-in', ( e: Event ) => {
            let $target = $(e.target);
            let $panel = $('<div class="panel-wrap"></div>').append($target.find('> .panel'));
            let id = 'dynamic-tab-' + $target.data('item-id');
            let $newTab = $(`<section class="tab-pane" id="${id}" role="tabpanel"></section>`)
                .appendTo( this.$aside.find('.tab-content').first() );
            $newTab.append($panel);
            let icon = $target.data('smart-icon');
            if(!icon) {
                icon = 'fa fa-th';
            }

            $(`<li class="nav-item"><a class="nav-link clear-style aside-trigger" data-aside="#aside" data-toggle="tab" href="#${id}" role="tab"><i class="${icon}"></i></a></li>`)
                .prependTo( $('#header').find('.smart-links .nav') ).addClass('transition bounce In');

            this.$triggerButton = $(this.options.triggerButton + '[data-aside="#' + this.id + '"]');
            this.$triggerButton.off('click').on('click', this.handleTriggerShown.bind(this) );
            this.$aside.find(this.options.closeButton).off('click').click(this.handleClose.bind(this));
            this.initScroll();
        }).on('panel-pin-out', ( e: Event ) => {
            let $target = $(e.target);
            let id = 'dynamic-tab-' + $target.data('item-id');
            let $tab = this.$aside.find(`.tab-content > #${id}`);
            let $panel = $tab.find('.panel-wrap > .panel');

            $panel.prependTo( $target ).transition('fade up in').find('.panel-body').css('height', '');
            $tab.remove();
            $('#header').find(`.smart-links .nav [href="#${id}"]`).remove();
            this.$triggerButton = $(this.options.triggerButton + '[data-aside="#' + this.id + '"]');
            this.$triggerButton.off('click').on('click', this.handleTriggerShown.bind(this) );
            this.setAsideState('aside-close');
        });


        this.$aside.data(this);
    }

    setAsideState(newState = '') {
        let $app = $('#app');
        let state = this.storage.getItem('aside-state') || this.state;

        if( !newState ) {
            if (state === 'aside-open') {
                newState = 'aside-close';
            } else {
                newState = 'aside-open';
            }
        }

        if( this.state !== newState || this.initial ) {
            this.animateToggling(newState);

            if( newState === 'aside-open' ) {
                if ($(window).innerWidth() < 992 ) {
                    this.createOverlay();
                }
                this.$overlay.velocity({opacity: 1 }, {duration: this.options.animationSpeed, queue: false, easing: 'easeOutQuad'});
            } else {
                this.$overlay.velocity({opacity: 0 }, {duration: this.options.animationSpeed, queue: false, easing: 'easeOutQuad',  complete: function () {
                    $(this).remove();
                }});
            }
        }

        if( this.options.setInStorage ) {
            this.storage.setItem('aside-state', newState);
        }

        if(state === 'aside-close') {
            $app.removeClass(state).addClass(newState);
        }

        if(newState === 'aside-open') {
            $app.addClass('aside-header-fixed');
        }

        this.state = newState;

        setTimeout(() => {
            if(state !== 'aside-close') {
                $app.removeClass(state).addClass(newState);
            }
            if(newState === 'aside-close') {
                $app.removeClass('aside-header-fixed');
            }
            $(this.aside).trigger('aside-state-changed');
        }, this.options.animationSpeed );
    }

    public destroy() {
        let $overlay = $(this.options.overlay);
        $overlay.trigger('click');
        this.$dragTarget.remove();
        $(this.options.triggerButton).off('click');
        $overlay.remove();
        return this;
    }

    public show() {
        $( this.options.triggerButton ).trigger('click');
        return this;
    }

    public hide() {
        $('').trigger('click');
        return this;
    }

    private animateToggling (state: string) {
        let prop = {};
        let easing = this.options.easingOpen;
        let initial: any;

        if ( state === 'aside-close' ) {
            initial = this.initial ? this.initial : 0;
            prop = {'translateX' : [this.width + 10, initial]};
        } else {
            initial = this.initial ? this.initial : this.width + 10;
            prop = {'translateX' : [0, initial] };
            easing = this.options.easingClose
        }

        this.initial = 0;
        let me = this;
        this.$aside.velocity( prop, { duration: this.options.animationSpeed, queue: false, easing: easing, complete: function () {
            let drag = $(window).width() - me.$aside.offset().left;
            me.$dragTarget.css({right: drag > 0 ? drag : 0, left: ''});
        }});
    };

    private handleTriggerShown(e: Event) {
        let $target = $(e.target);
        $target = $target.is('a') ? $target : $target.parents('a');

        if( this.state === 'aside-open' && $target.hasClass('aside-trigger') && $target.hasClass('active') ) {
            this.$aside.find(this.options.closeButton).trigger('click');
            return;
        }
        this.setAsideState('aside-open');
    }

    private handleResize() {
        this.$aside.height(window.innerHeight - $('.header-wrap').height());
        this.width = this.$aside.width();
        if (window.innerWidth < 992 ) {
            this.setAsideState('aside-close');
        }
        if (window.innerWidth >= 992 ) {
            this.setAsideState(this.state);
        }
    }

    private initScroll() {
        if( !this.options.scroll ) return;
        let $panel = this.$aside.find('.panel'),
            me = this;

        $panel.each(function () {
            let $this = $(this);
            let $body = $this.find('.panel-body');
            if($body.hasClass('ps-container')) Ps.destroy($body[0]);
            $body.innerHeight( me.$aside.height() - $this.find('.panel-header').height() );
            Ps.initialize($body[0], me.options.scrollOptions);
        });

        $(window).on('resize', () => {
            let $panel = this.$aside.find('.panel');
            $panel.each(function () {
                let $this = $(this);
                let $body = $this.find('.panel-body');
                $body.height(me.$aside.outerHeight(true) - $this.find('.panel-header').height() );
                Ps.update($body[0])
            });
        });
    }

    private createOverlay() {
        let me = this;
        if( !this.$overlay.length ) {
            this.$overlay = $('<div id="' + this.options.overlay + '" class="' + this.options.overlay + '"></div>');
        }
        this.$overlay.css('opacity', 0).click( function(){
            me.setAsideState('aside-close');
        });
        $('#app').append(this.$overlay);
    }

    private handlePan(e: HammerInput) {
        if (e.pointerType === "touch") {
            let x = e.center.x;
            if ($(window).innerWidth() < 992 ) {
                this.createOverlay();
            }

            let w = $(this.$aside).width();
            if (x < window.innerWidth - w) {
                x = window.innerWidth - w
            } else if (x > window.innerWidth) {
                x = window.innerWidth
            }

            this.initial = w - (window.innerWidth - x) + 'px';
            this.$aside.css('transform', 'translateX(' + this.initial + ')');
            this.$dragTarget.css({right: window.innerWidth - x, left: ''});
            let opacity;
            opacity = Math.abs((x - window.innerWidth) / this.width);
            this.$overlay.velocity({opacity: opacity }, {duration: 10, queue: false, easing: 'easeOutQuad'});
        }
    }

    private handlePanEnd(e: HammerInput) {
        if (e.pointerType === "touch") {
            let velocityX = e.velocityX;
            let x = e.center.x;

            let w = $(this.$aside).width();
            if (x < window.innerWidth - w) {
                x = window.innerWidth - w
            } else if (x > window.innerWidth) {
                x = window.innerWidth
            }

            this.initial = w - (window.innerWidth - x) + 'px';

            if (velocityX < -0.3) {
                this.setAsideState('aside-open');
                return;
            } else if ( velocityX > 0.5) {
                this.setAsideState('aside-close');
                return;
            }

            if (x < (window.innerWidth - w / 2) || velocityX < -0.3) {
                this.setAsideState('aside-open');
            } else if (x >= (window.innerWidth - w / 2) || velocityX > 0.5) {
                this.setAsideState('aside-close');
            }
        }
    }

    private handleClose() {
        this.setAsideState('aside-close');
        setTimeout(() => {
            $(this.options.triggerButton).removeClass('active');
        }, this.options.animationSpeed );
        return false;
    }
}
