'use strict';
/*!
 * @version: 1.1.1
 * @name: main
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import * as screenfull from 'screenfull';

interface PanelOptions {
    classes?: PanelClasses,
    animationDuration?: number,
    easing: string
}

interface PanelClasses {
    panel: string,
    header: string,
    body: string,
    footer: string,
    close: string,
    refresh: string,
    collapse: string,
    maximize: string,
    pin: string,
    full: string,
}

export default class Panel {
    private defaults: PanelOptions = {
        classes: {
            panel: '.panel',
            header: '.panel-header',
            body: '.panel-body',
            footer: '.panel-footer',
            close: '.panel-close-btn',
            refresh: '.panel-refresh-btn',
            collapse: '.panel-collapse-btn',
            maximize: '.panel-maximize-btn',
            pin: '.panel-pin-btn',
            full: '.panel-full-btn',
        },
        animationDuration: 150,
        easing: 'easeOutQuad'
    };

    private $panelBody: JQuery;
    private $panelHeader: JQuery;
    private $panelFooter: JQuery;
    private $panel: JQuery;

    constructor( private item: HTMLElement, private _options?: PanelOptions ) {
        this._options = $.extend(true, {}, this.defaults, _options);
        this.$panel = $(this.item).children(this._options.classes.panel);
        this.$panelFooter = this.$panel.children(this._options.classes.footer);
        this.$panelHeader = this.$panel.children(this._options.classes.header);
        this.$panelBody = this.$panel.children(this._options.classes.body);
    }

    public init() {
        this.$panelHeader.find(this._options.classes.close).off('click');
        this.$panelHeader
            .off('click', this._options.classes.close )
            .on('click', this._options.classes.close, this.close.bind(this))
            .off('click', this._options.classes.collapse )
            .on('click', this._options.classes.collapse, this.collapse.bind(this))
            .off('click', this._options.classes.refresh )
            .on('click', this._options.classes.refresh, this.refresh.bind(this))
            .off('click', this._options.classes.maximize )
            .on('click', this._options.classes.maximize, this.maximize.bind(this))
            .off('click', this._options.classes.pin )
            .on('click', this._options.classes.pin, this.pin.bind(this))
            .off('click', this._options.classes.full )
            .on('click', this._options.classes.full, this.toggleFull.bind(this));
        return this;
    }

    get options(): PanelOptions {
        return this._options;
    }

    private collapse( e: any ) {
        e.preventDefault();

        let $target = $(e.currentTarget);
        let $icon = $target.find('i');
        let $this = $(this.item);
        let collapse = $this.data('collapse'),
            collapseHeight,
            height;

        $icon.toggleClass($icon.attr('data-icon'));

        if( collapse ) {
            collapseHeight = collapse.collapseHeight;
            height =  collapse.height;
        } else {
            collapse = [];
        }

        if($this.hasClass('collapsed')) {
            collapseHeight = $this.outerHeight();
            $this.removeClass('collapsed');
            collapse.collapsed = 'out';
            $this.css('height', collapseHeight);
            $this.data('collapse', collapse);
            $this.trigger('panel-collapse-out');
            $this.velocity({outerHeight: [height, collapseHeight] }, {duration: this._options.animationDuration, queue: false, easing: this._options.easing, complete: function () {
                $this.trigger('panel-collapsed-out');
            }});
        } else {
            if( ! height ) height = $this.outerHeight();
            if( ! collapseHeight ) collapseHeight = this.$panelHeader.outerHeight() + $this.outerHeight() - $this.height();
            $this.addClass('collapsed');
            collapse = {
                'collapsed': 'in',
                'collapseHeight': collapseHeight,
                'height': height
            };
            $this.data('collapse', collapse);
            $this.trigger('panel-collapse-in');
            $this.velocity({outerHeight: collapseHeight }, {duration: this._options.animationDuration, queue: false, easing: this._options.easing, complete: function () {
                $this.trigger('panel-collapsed-in');
            }});
        }

    }

    private close(e: any) {
        e.preventDefault();
        let $this = $(this.item);
        $this.trigger('panel-closed');
        $this.fadeOut('fast');
    }

    private pin(e: any) {
        e.preventDefault();
        let $target = $(e.currentTarget);
        let $this = $(this.item);
        let $icon = $target.find('i');
        $this.toggleClass('panel-pinned');
        $icon.toggleClass($icon.attr('data-icon'));
        if( $this.hasClass('panel-pinned')) {
            $this.fadeOut('fast');
            $this.trigger('panel-pin-in');
        } else {
            $this.fadeIn('fast');
            $this.trigger('panel-pin-out');
        }
    }

    private maximize(e: any) {
        e.preventDefault();
        let $target = $(e.currentTarget);
        let $icon = $target.find('i');
        this.$panel.toggleClass('panel-maximized-screen');
        $icon.toggleClass($icon.attr('data-icon'));
        this.toggleIcons();
        if( this.$panel.hasClass('panel-maximized-screen')) {
            $(this.item).trigger('panel-fullscreen-maximized');
        } else {
            $(this.item).trigger('panel-fullscreen-minimized');
        }
    }

    private toggleFull(e: any) {
        e.preventDefault();
        if( screenfull.enabled ) {
            let $target = $(e.currentTarget);
            let $icon = $target.find('i');
            let _target = <Element>this.$panel[0];
            screenfull.toggle(_target);
            $icon.toggleClass($icon.attr('data-icon'));
            this.$panel.toggleClass('panel-full-screen');
            this.toggleIcons();
            if(this.$panel.hasClass('panel-full-screen')) {
                $(this.item).trigger('panel-fullscreen-in')
            } else {
                $(this.item).trigger('panel-fullscreen-out')
            }
        }

    }

    private toggleIcons() {
        if(this.$panel.hasClass('panel-full-screen') || this.$panel.hasClass('panel-maximized-screen')) {
            $(this.item).find(this._options.classes.close).hide('fast');
            $(this.item).find(this._options.classes.collapse).hide('fast');
        } else {
            $(this.item).find(this._options.classes.close).show('fast');
            $(this.item).find(this._options.classes.collapse).show('fast');
        }
        if(this.$panel.hasClass('panel-full-screen')) {
            $(this.item).find(this._options.classes.maximize).hide('fast');
        } else {
            $(this.item).find(this._options.classes.maximize).show('fast');
        }
        if(this.$panel.hasClass('panel-maximized-screen')) {
            $(this.item).find(this._options.classes.full).hide('fast');
        } else {
            $(this.item).find(this._options.classes.full).show('fast');
        }
    }

    private refresh(e: any) {
        e.preventDefault();
        let $target = $(e.currentTarget);
        let $icon = $target.find('i');

        let dataAttrs = $.extend({},$target.data());
        let $container = this.$panel.find('.loader-wrap');

        if(!$container[0]) {
            $container = $('<div />').addClass('loader-wrap');
            let loaderType = dataAttrs.loader || 'loading-icon';
            let $loader = $('<div />').addClass('loader').addClass(loaderType);
            $container.css('top', this.$panelHeader.height());
            $container.append($loader);
            this.$panel.append($container);
        }

        $icon.addClass('fa-spin');
        $container.fadeIn('fast');
        setTimeout(function() {
            $container.fadeOut('fast');
            $icon.removeClass('fa-spin');
        }, 3e3);
    }
}
