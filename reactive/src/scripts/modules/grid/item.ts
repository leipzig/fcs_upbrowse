'use strict';
/*!
 * @version: 1.1.1
 * @name: item
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import Grid from "./grid";
import * as ResizeSensor from 'css-element-queries/src/ResizeSensor';
import * as EQ from 'css-element-queries/src/ElementQueries';
import Panel from "./panel";

export default class GridItem {
    private width: number;
    private height: number;
    private minHeight: number;
    private x: number;
    private y: number;
    private auto: boolean;
    private gridStack: GridStack;
    private reClasses: string;
    private sensor: any;
    private classes: string;
    private collapsed: boolean;
    private resized: boolean;
    private grid: Grid;

    constructor(
        private _item: HTMLElement,
        private _id: number,
        private _panel: Panel,
    ) {
        $(this._item)
            .attr('data-item-id', this._id)
            .addClass('pos-a')
            .data('grid', this)
    }

    public init(grid: Grid, position: any) {
        let $this = $(this._item);
        $this.addClass('pos-a');
        this.grid = grid;
        if( position && position.removed ) {
            $this.fadeOut(0);
            return;
        }

        $this.fadeIn(0);
        this.classes = this.grid.getClasses(this._item);
        this.gridStack = $(this.grid.item).data('gridstack');
        this.minHeight = +this._item.getAttribute('data-gs-min-height');

        this.applyMaxSize();

        if( !position ) {
            this.width = +this._item.getAttribute('data-gs-width');
            this.height = +this._item.getAttribute('data-gs-height');
            this.x = +this._item.getAttribute('data-gs-x');
            this.y = +this._item.getAttribute('data-gs-y');

            if( !this.width ) this.width = this._getWidth();
            if( $this.find(this._panel.options.classes.body).hasClass('panel-no-scroll') || !this.height ) {
                this.height = this._getHeight();
            }
            if( !this.x || !this.y ) this.auto = true;
        } else {
            this.collapsed = true;
            this.setOptions( position );
            this.auto = false;
        }

        if( !this.pinPanel() ) return;
        this.addWidget(this._item, this.x, this.y, this.width, this.height, this.auto);
        this.triggerCollapse(position);
        $this.off('panel-collapsed-in panel-collapse-out panel-collapsed-out panel-closed')
            .on('panel-collapsed-in panel-collapse-out', this.collapse.bind(this))
            .on('panel-collapsed-out',() => {
                this.gridStack.minHeight(this.item, this.minHeight);
                $this.css('height', '');
            })
            .on('panel-collapse-in',() => {
                this.gridStack.minHeight(this.item, 0);
            })
            .on('panel-closed', this.remove.bind(this));
        $this.trigger('grid-stack-item-created');
    }


    public update(curPoint?: string) {
        let $this = $(this._item);
        if( !curPoint ) curPoint = this.grid.getCurrentClass();
        let position = this.grid.store.getSingle(curPoint, this._id - 1);
        if( position && position.removed || this.grid.destroyed ) {
            $this.fadeOut(0);
            return;
        }
        $this.css('display', '');

        if( !this.pinPanel() ) return;

        if( position ) {
            this.collapsed = true;
            this.setOptions( position );
            this.auto = false;
        } else {
            this.width = this._getWidth();
            this.height = this._getHeight();
            this.auto = true;
        }

        this.addWidget(this._item, this.x, this.y, this.width, this.height, this.auto);
        this.triggerCollapse(position);
        $(this._item).trigger('grid-stack-item-updated')
    }

    public fitWidget(curPoint?: string) {
        if( ! this.grid ) {
            return;
        }
        if( !curPoint ) curPoint = this.grid.getCurrentClass();
        let $this = $(this._item);
        let position = this.grid.store.getSingle(curPoint, this._id - 1);
        if( position && position.removed || this.grid.destroyed ) return;
        $this.css('display', '');

        if( $this.attr('class').indexOf('hidden-') >=0 && $this.is(':hidden') ) {
            return;
        }
        if(!position) {
            this.width = this._getWidth();
            this.height = this._getHeight();
            let node = this.getNode();
            if( !node ) return;
            this.x = node.x;
            this.y = node.y;
        } else {
            this.setOptions(position)
        }
        this.gridStack.update(this._item, this.x, this.y, this.width, this.height);
        $this.trigger('grid-stack-item-updated');
    }

    public remove() {
        this.gridStack.removeWidget(this._item, false);
        let data = this.grid.store.getSingle(this.grid.getCurrentClass(), this._id - 1 );
        data = data ? data: [];
        data['removed'] = true;
        this.grid.store.saveSingle(this.grid.getCurrentClass(), this._id - 1, data);
    }

    public collapse() {
        this.collapsed = true;
        this.saveCollapseItem();
        this.fitWidget();
        this.grid.shiftPositions();
        $(this._item).css('height', '');
    }

    public getNode() {
       return $(this._item).data('_gridstack_node');
    }

    public handleResizeStart(classes: string) {
        this.resized = true;
        this.reClasses = classes;
        $(this._item).removeClass(this.reClasses);
        this.classes = '';
    }

    public handleResizeStop(curPoint: string) {
        let $this = $(this._item);
        let width = $this.outerWidth();
        let columnWidth = '#' + this.grid.panelSizer;
        let columnNumber = Math.round(width / $(columnWidth).outerWidth());
        let nextCl = curPoint + columnNumber;
        let regexp = new RegExp(`${curPoint}\\d+`, 'g');
        this.classes = this.reClasses.replace(regexp, '') + ' ' + nextCl;
        $this.addClass(this.classes).css('width', '');
        this.resized = false;

        let collapse = $this.data('collapse');
        if( collapse ) {
            collapse.height = $this.outerHeight();
            $this.data('collapse', collapse);
            this.saveCollapseItem();
        }
    }

    public triggerCollapse(position: any) {
        let $this = $(this._item);
        if( position && position.collapse.collapsed ) {
            if(
                position.collapse.collapsed === 'in' && !$this.hasClass('collapsed') ||
                position.collapse.collapsed === 'out' && $this.hasClass('collapsed')
            ) {
                $this.find(this._panel.options.classes.collapse).trigger('click');
            }
        } else if( $this.hasClass('collapsed') ) {
            $this.find(this._panel.options.classes.collapse).trigger('click');
        }
        this.collapsed = true;
    }

    get id(): number {
        return this._id;
    }

    get item(): HTMLElement {
        return this._item;
    }

    get panel(): Panel {
        return this._panel;
    }

    private applyMaxSize() {
        let max = $(this.item).data('gsMaxWidth');
        if( max ) {
            let classes = this.classes.split(' ');
            for( let i = 0; i < classes.length; i++ ) {
                let regexp = new RegExp(`\\d+`, 'g');
                let num = classes[i].match(regexp);

                if( num && num[0] > max ) {
                    classes[i] = classes[i].replace(regexp, max);
                }
            }
            let newClasses = classes.join(' ');
            $(this.item).removeClass(this.classes).addClass(newClasses);
            this.classes = newClasses
        }
    }

    private saveCollapseItem() {
        let node = this.getNode();

        let collapse = $(this._item).data('collapse'),
            height: number,
            collapseHeight: number,
            h: number,
            collapsed: string;

        if( collapse ) {
            height = collapse.height;
            collapseHeight = collapse.collapseHeight;
            collapsed = collapse.collapsed;
            h = ( $(this._item).hasClass('collapsed') ? collapseHeight : height ) / this.grid.options.grid.cellHeight;
        }

        this.grid.store.saveSingle(this.grid.getCurrentClass(), this._id - 1, {
            x: node.x,
            y: node.y,
            w: node.width,
            h: h,
            classes: this.grid.getClasses(this._item),
            collapse: {
                collapsed: collapsed,
                height: height,
                collapseHeight: collapseHeight
            }
        });
    }

    private addWidget( ...args: any[] ) {
        if(this.sensor) {
            this.sensor.detach(this._item);
        }
        EQ.detach(this._item);
        this.gridStack.addWidget.apply(this.gridStack, args);
        let me = this;
        new EQ().init();
        this.sensor = new ResizeSensor(me._item, () => {
            if( ! me.resized ) {
                me.grid.update();
            }
        });
        this.resetScroll();
    }

    private setOptions(position: any) {
        $(this._item).removeClass(this.classes).addClass(position.classes);
        this.x = position.x;
        this.y = position.y;
        this.width = position.w;
        this.height = position.h;

        let $this = $(this._item);

        if( position.collapse.collapsed && this.collapsed ) {
            if( position.collapse.collapsed === 'in' ) {
                this.height = position.collapse.collapseHeight / this.grid.options.grid.cellHeight;
            } else if( position.collapse.collapsed === 'out' ) {
                this.height = position.collapse.height / this.grid.options.grid.cellHeight;
            }
            $this.data('collapse', {
               'collapsed': position.collapse.collapsed,
               'height': position.collapse.height,
               'collapseHeight': position.collapse.collapseHeight
            });
            this.collapsed = false;
        }

        this.classes = position.classes;
    }

    private _getWidth() {
        return Math.round( this._item.offsetWidth / $('#' + this.grid.panelSizer)[0].offsetWidth );
    }

    private _getHeight() {
        let height = 0;
        if($(this._item).hasClass('collapsed')) {
            height = $(this._item).outerHeight() / this.grid.options.grid.cellHeight;
        } else {
            $(this._item).height('');
            height =  Math.ceil(
                (
                    this.grid.options.gridVerticalPadding * 2
                    + $(this._item).find('.panel').outerHeight( true )
                    - $(this._item).find('.panel').height()
                    + ($(this._item).find('.panel-header').outerHeight( true ) || 0)
                    + ($(this._item).find('.panel-body').prop('scrollHeight') || 0)
                )
                / this.grid.options.grid.cellHeight
            );
        }
        return height;
    }

    private resetScroll() {
        let expand = (<any>this._item).resizeSensor.childNodes[0];
        let expandChild = expand.childNodes[0];
        let shrink = (<any>this._item).resizeSensor.childNodes[1];
        expandChild.style.width = '100000px';
        expandChild.style.height = '100000px';

        expand.scrollLeft = 100000;
        expand.scrollTop = 100000;

        shrink.scrollLeft = 100000;
        shrink.scrollTop = 100000;
    }

    private pinPanel() {
        let $this = $(this._item);
        let classes = $this.attr('class');
        if( classes.indexOf('hidden-') >=0 && $this.is(':hidden') ) {
            $this.removeClass(this.grid.options.grid.itemClass);
            if( classes.indexOf('panel-pinned') < 0 ) {
                $this.find( this._panel.options.classes.pin ).trigger('click').css('display', 'none');
            }
            return false;
        } else if( classes.indexOf('hidden-') >=0 && $this.is(':visible') && classes.indexOf('panel-pinned') >= 0 ) {
            $this.trigger('panel-pin-out').removeClass('panel-pinned');
            let $icon = $this.find( this._panel.options.classes.pin ).css('display', '').find('i');
            $this.addClass(this.grid.options.grid.itemClass);
            $icon.toggleClass($icon.attr('data-icon'));
            this._panel.init();
        }
        return true;
    }
}
