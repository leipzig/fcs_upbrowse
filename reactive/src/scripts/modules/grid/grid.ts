'use strict';
/*!
 * @version: 1.1.1
 * @name: grid
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import 'lodash';
import 'jquery-ui/ui/data';
import 'jquery-ui/ui/disable-selection';
import 'jquery-ui/ui/focusable';
import 'jquery-ui/ui/ie';
import 'jquery-ui/ui/keycode';
import 'jquery-ui/ui/safe-active-element';
import 'jquery-ui/ui/safe-blur';
import 'jquery-ui/ui/scroll-parent';
import 'jquery-ui/ui/tabbable';
import 'jquery-ui/ui/unique-id';
import 'jquery-ui/ui/version';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/widgets/mouse';
import 'jquery-ui/ui/widgets/resizable';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui-touch-punch';
import 'gridstack';
import ResizableOptions = JQueryUI.ResizableOptions;
import DraggableOptions = JQueryUI.DraggableOptions;
import GridItem from "./item";
import GridStore from "./store";

interface GridOptions {
    grid: IGridstackOptions;
    resizable: ResizableOptions;
    draggable: DraggableOptions;
    panelSizer: string;
    columnGutter: number;
    gridVerticalPadding: number;
    innerClasses: string[];
    autoPosition: boolean;
    autoItems: string;
    hiddenClasses: Array<Object>;
}

export default class Grid {
    private _options: GridOptions;
    private resizeTimeout: any;
    private _panelSizer: string;
    private dataAttrId: number;
    private breakpoint: string;
    private updateState: boolean;
    private _destroyed: boolean;
    private _position: any;
    private _couldUpdate: boolean;

    private defaults = {
        panelSizer: 'col-1',
        columnGutter: 30,
        gridVerticalPadding: 10, // 15px
        innerClasses: ['.panel-header', '.panel-body', '.panel-footer'],
        autoPosition: true,
        grid: {
            itemClass: 'grid-stack-item',
            width: 12,
            placeholderClass: 'grid-stack-placeholder',
            verticalMargin: 0,
            cellHeight: 10,
            auto: false,
            animate: true,
        },
        resizable: {
            autoHide: false,
        },
        draggable: {
            cancel: ".panel-header a,.panel-header input,.panel-header button,.panel-header .ui",
            containment: 'parent',
            handle: '.grid-stack-handle',
            appendTo: 'parent',
            scroll: true,
        },
        hiddenClasses: [
            {'col-xs-': 'd-none'},
            {'col-sm-': 'd-sm-none'},
            {'col-md-': 'd-md-none'},
            {'col-lg-': 'd-lg-none'},
            {'col-xl-': 'd-xl-none'}
        ]
    };

    constructor(
        private _item: Element,
        private gridItems: Array<GridItem>,
        private _store: GridStore,
        options?: GridOptions
    ) {
        this._options = $.extend(true, {}, this.defaults, options);
        this.resizeTimeout = '';
        this._panelSizer = 'grid-stack-panel-sizer';
        this.dataAttrId = 0;
        this.breakpoint = this.getCurrentClass();
        this.updateState = false;
    }

    public init() {
        if( ! this.gridItems.length ) return this;
        this._addClasses();
        let me = this;

        let $grid = $(this._item).gridstack($.extend(true, {},
            this._options.grid,
            {draggable: this._options.draggable},
            {resizable: this._options.resizable}
        ));

        let curPoint = me.getCurrentClass();
        this.breakpoint = curPoint;
        let position = this._store.getMultiple(curPoint);
        if ( !position || !position.length ) {
            position = this._store.getMultiple(curPoint, true);
        }
        this._position = position;
        this._couldUpdate = false;
        this.initItems( this, () => {
            this._couldUpdate = true;
            if ( !position || !position.length ) {
                this.shiftPositions(true);
                this.shiftPositions();
            } else {
                this.shiftPositions();
            }

            this._destroyed = false;
            $grid
                .on('resizestart', this._handleResizeStart.bind(this))
                .on('resizestop', this._handleResizeStop.bind(this))
                .on('dragstop', this._handleDragStop.bind(this))
                .trigger('grid-stack-created')
                .data('grid', this);
            this.update();
        });
        return this;
    }

    public update(force?: boolean) {
        if ( this.destroyed || !this._couldUpdate ) return;
        let me = this;
        if( !me.updateState ) {
            setTimeout(() => {
                updateState();
                me.updateState = false;
            }, 150)
        }
        me.updateState = true;

        function updateState() {
            if(force) {
                me.updatePositions();
                me.shiftPositions();
                return;
            }
            let curPoint = me.getCurrentClass();
            if ( me.breakpoint !== curPoint ) {
                me.breakpoint = curPoint;
                me.updatePositions();
                me.shiftPositions();
            } else {
                me.updateCurrent();
            }
            $(me._item).trigger('grid-stack-updated');
        }
    }

    public updateCurrent() {
        let curPoint = this.getCurrentClass();
        let grid = $(this._item).data('gridstack');
        grid.batchUpdate();
        for( let i = 0; i < this.gridItems.length; i++ ) {
            this.gridItems[i].fitWidget(curPoint);
        }
        grid.commit();
    }

    public updatePositions() {
        let curPoint = this.getCurrentClass();
        let grid = $(this._item).data('gridstack');
        grid.removeAll(false);
        grid.batchUpdate();
        for( let i = 0; i < this.gridItems.length; i++ ) {
            this.gridItems[i].update(curPoint);
        }
        grid.commit();
    }

    public shiftPositions(initial = false) {
        let positions = [];
        let me = this;
        let position = this._store.getMultiple(this.getCurrentClass(), initial);
        for( let i = 0; i < this.gridItems.length; i++ ) {
            let id =  this.gridItems[i].id;
            if( position[id - 1] && position[id - 1].removed ) {
                positions.push({
                    removed: true
                });
            } else {
                let $item = $(this.gridItems[i].item);
                if( $item.is(':hidden') ) continue;
                let node = $item.data('_gridstack_node');
                let collapse = $item.data('collapse'),
                    height: number,
                    collapseHeight: number,
                    h: number,
                    collapsed: string;

                if( collapse ) {
                    height = collapse.height;
                    collapseHeight = collapse.collapseHeight;
                    collapsed = collapse.collapsed;
                    h = $item.hasClass('collapsed') ? collapseHeight : height;
                }

                if(node) {
                    positions[id - 1] = {
                        x: node.x,
                        y: node.y,
                        w: node.width,
                        h: node.height,
                        classes: me.getClasses(this.gridItems[i].item),
                        collapse: {
                            collapsed: collapsed,
                            height: height,
                            collapseHeight: collapseHeight
                        }
                    };
                }
            }
        }
        if( positions.length ) {
            this._store.saveMultiple(this.getCurrentClass(), positions, initial);
        }
    };

    public restore() {
        this.destroy();
        this.init();
        this.update();
        $(this._item).data('gridstack').enable();
    }

    public getCurrentClass(): string {
        let curCl = '';
        let classes = this._options.hiddenClasses;

        for (let i = 0; i < classes.length; ++i) {
            for (let el in classes[i]) {
                if ($('#' + el + 'hidden').is(':hidden')) {
                    curCl = el;
                    break;
                }
            }
        }

        return curCl;
    }

    public getClasses(target: any): string {
        return (<string>$(target).attr('class')).split(' ').map((x: string) => {
            let classes = this._options.hiddenClasses;
            for (let i = classes.length; i >= 0; --i) {
                for (let c in classes[i]) {
                    let regexp = new RegExp(`${c}\\d+`);
                    if (x.search(regexp) >= 0) {
                        return x;
                    }
                }
            }
            return '';
        }).join(' ');
    }

    public destroy() {
        if( this._destroyed ) return;
        this._store.saveMultiple(this.getCurrentClass(), []);
        $(this._item).data('gridstack').destroy(false);
        $(this._item).height('');
        for( let i = 0; i < this.gridItems.length; i++ ) {
            $(this.gridItems[i].item)
                .removeAttr('data-gs-x')
                .removeAttr('data-gs-y')
                .removeAttr('data-gs-width')
                .removeAttr('data-gs-height')
                .removeClass('pos-a')
                .data('_gridstack_node', '')
                .off('panel-collapse-in panel-collapse-out panel-collapsed-out panel-collapsed-in')
                .find('.resize-sensor').remove();
            this.gridItems[i].triggerCollapse('');
        }

        $(this._item).parent().css({overflow: ''});
        $(this._item).find(`#${this._panelSizer}`).remove();

        let classes = this._options.hiddenClasses;
        for (let i = classes.length; i >= 0; --i) {
            for (let el in classes[i]) {
                $(this._item).find(`#${el}hidden`).remove();
            }
        }
        this._destroyed = true;
        $(this._item).trigger('grid-stack-destroyed')
    }

    public remove() {
        this._store.destroy(this.getCurrentClass());
        $(this._item).trigger('grid-stack-data-removed');
        window.location.reload();
    }

    get panelSizer(): string {
        return this._panelSizer;
    }

    get options(): GridOptions {
        return this._options;
    }

    get item(): Element {
        return this._item;
    }

    get store(): GridStore {
        return this._store;
    }

    get destroyed(): boolean {
        return this._destroyed;
    }

    private _handleResizeStart(event: Event, ui: JQueryUI.ResizableUIParams) {
        let el = $(ui.element).data('grid');
        el.handleResizeStart(this.getClasses(ui.element));
        return event;
    }

    private _handleResizeStop(event: Event, ui: JQueryUI.ResizableUIParams) {
        let el = $(ui.element).data('grid');
        el.handleResizeStop(this.getCurrentClass());
        this.shiftPositions();
        return event;
    }

    private _handleDragStop() {
        this.shiftPositions()
    }

    private _addClasses() {
        let $row = $('<div class="row grid-stack-sizer"></div>');
        $row.prepend(`<div id='${this._panelSizer}' class='${this._options.panelSizer}' style="height: 0; min-height: 0;"></div>`);

        let classes = this._options.hiddenClasses;
        for (let i = classes.length; i >= 0; --i) {
            for (let el in classes[i]) {
                $row.prepend(`<div id='${el}hidden' class='${(<any>classes[i])[el]}' style="height: 0; min-height: 0;"></div>`);
            }
        }
        $(this._item).parent().css({overflow: 'hidden'}).prepend($row);
    }

    private initItems(context: any, cl?: any) {
        let position = this._position;
        let elems = this.gridItems.concat();
        if ( position.length ) elems = elems.sort(this.compare.bind(this));

        let process = function() {
            let el = elems.shift();
            let id = el.id;
            let itemPosition = position ? position[id - 1] : '';
            el.init(context, itemPosition);

            if (elems.length > 0) {
                setTimeout(process, 1);
            } else {
                if( cl ) cl();
            }
        };
        setTimeout(process, 50);
    }

    private compare(a:any, b: any) {
        let apos = this._position[a.id - 1] ? this._position[a.id - 1] : 0;
        let bpos = this._position[b.id - 1] ? this._position[b.id - 1] : 0;

        if (apos.y < bpos.y ) return -1;
        if (apos.y > bpos.y ) return 1;

        if (apos.y === bpos.y ) {
            if( apos.x < bpos.x ) return -1;
            if( apos.x > bpos.x ) return 1;
            if( apos.x === bpos.x ) return 0;
        }
        return 0;
    }
}
