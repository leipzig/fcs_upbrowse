'use strict';
/*!
 * @version: 1.1.1
 * @name: menu
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import Sidebar from "./sidebar";

interface MenuOptions {
    animationSpeed?: number;
    closeEasnig?: string;
    openEasnig?: string;
    triggerDelay?: number,
    triggerDuration?: number
    triggerScroll?: boolean;
    triggerScrollEasing?: string;
}

export default class Menu {
    private _$sidebar: JQuery;
    private _$menu: JQuery;
    private _defaults: MenuOptions = {
        animationSpeed: 400,
        closeEasnig: 'easeOutQuad',
        openEasnig: 'easeOutQuad',
        triggerDelay: 2000,
        triggerDuration: 800,
        triggerScroll: true,
        triggerScrollEasing: 'easeInOutQuad',
    };

    constructor (
        public menu: string,
        private _sidebar: Sidebar,
        private _options?: MenuOptions
    ) {
        this._options = $.extend({}, this._defaults, _options);
    }

    init() {
        this._sidebar.init();
        this._$sidebar = $(this._sidebar.sidebar);
        this._$menu = $(this.menu);
        this._attachHandles();
        this._triggerScroll();
        this._$sidebar.on('sidebar-attach-handles', this._attachHandles.bind(this) );
        this._$sidebar.on('sidebar-after-scroll-init', this._triggerScroll.bind(this) );
    }

    private _handleClick(e: Event) {
        e.stopPropagation();
        let $target = $(e.target);
        let $ref = $target.is('a') ? $target : $target.parents('a');
        let $content = this._$sidebar.find('.sidebar-menu').parent();

        let $next_el = $ref.next();
        let $parent = $ref.parents('ul').first();
        let me = this;

        if ($next_el.is('.sub-menu') && $next_el.is(':visible')) {
            $next_el.velocity("slideUp", { duration: this._options.animationSpeed, easing: this._options.openEasnig, complete: function () {
                $next_el.removeClass('menu-open');
                $ref.parent('li.active').removeClass('active-icon');
                if( !$ref.parent('li.active').find('li.current').length) {
                    $ref.parent('li.active').removeClass('active');
                }

                if( $ref.parent('li').hasClass('footer')) {
                    $content.find('.footer-menu-overlay').velocity({opacity: 0}, {
                        duration: me._options.animationSpeed, queue: false, easing: me._options.closeEasnig,
                        complete: function() {
                            $(this).remove();
                        }
                    })
                }
            }});
        } else if ($next_el.is('.sub-menu') && !$next_el.is(':visible')) {
            $parent.find('li.active').removeClass('active-icon');
            $parent.find('li.active').each(function () {
                if( !$(this).find('li.current').length ) {
                    $(this).removeClass('active');
                }
            });
            $parent.find('ul:visible').slideUp(this._options.animationSpeed, function () {
                $next_el.removeClass('menu-open');
            });
            $ref.parent('li').addClass('active active-icon');
            $next_el.velocity("slideDown", { duration: this._options.animationSpeed, easing: 'easeOutQuad', complete: function () {
                $next_el.addClass('menu-open');
            }}).find('> li > a').hide().transition('scale in');

            if( $ref.parent('li').hasClass('footer')) {
                $content.append('<div class="footer-menu-overlay"></div>');

                $('.footer-menu-overlay').velocity({opacity: .75}, {
                    duration: this._options.animationSpeed, queue: false, easing: 'easeOutQuad'
                }).click(function () {
                    $ref.trigger('click');
                });
            }
        }

        $next_el.is('.sub-menu') && e.preventDefault();

        // if ( this._options.closeOnClick === true ) {
        //     this.setSidebarState('sidebar-state-close');
        // }
    }

    private _handleHover(e: Event ) {
        let $target = $(e.target);
        let $ref = $target.is('li') ? $target : $target.parents('li');

        let $menu = $ref.children('ul');
        let menuHeight = $menu.height();
        let windowHeight = $(window).height();

        let offset = $ref.offset().top - $(document).scrollTop();
        if( windowHeight < menuHeight + offset && offset > menuHeight ) {
            $ref.addClass('upward')
        } else {
            $ref.removeClass('upward');
        }
        return this;
    }

    private _attachHandles () {
        $('.sidebar-option-default.sidebar-state-compact').find(this.menu + '> ul > li').not('.js-custom-click')
            .off('hover click').hover(this._handleHover.bind(this))
            .find('li').not('.js-custom-click').off('click').on('click', this._handleClick.bind(this));

        $('.sidebar-state-open, .sidebar-state-close, .sidebar-option-theme1.sidebar-state-compact, ' +
            '.sidebar-option-theme2.sidebar-state-compact, .sidebar-option-theme3.sidebar-state-compact, ' +
            '.sidebar-option-theme4.sidebar-state-compact')
            .find(this.menu + ' li').not('.js-custom-click').off('hover click').on('click', this._handleClick.bind(this));
    }

    private _triggerScroll () {
        // this._$menu.find('li.current').parents('li').find('> a').trigger('click');

        if( this._options.triggerScroll ) {
            setTimeout(() => {
                if( this._$sidebar.scrollTop() === 0 ) {
                    this._$menu.find('li.current').velocity(
                        'scroll', {container: this._$sidebar, offset: 0, duration: this._options.triggerDuration, queue: false, easing: this._options.triggerScrollEasing, mobileHA: false}
                    );
                }
            }, this._options.triggerDelay);
        }
    }
}
