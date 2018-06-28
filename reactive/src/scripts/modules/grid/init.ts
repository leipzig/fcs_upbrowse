'use strict';
/*!
 * @version: 1.1.1
 * @name: grid
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import GridStore from "./store";
import Grid from './grid';
import Panel from "./panel";
import * as Ps from 'perfect-scrollbar';
import GridItem from "./item";
import '../dropdown/transition'
import * as EQ from 'css-element-queries/src/ElementQueries';


$(function () {
    let $restore = $('.restore-grid');
    let $destroy = $('.destroy-grid');
    let $remove = $('.remove-data');
    let $grid = $('.panel-grid');

    $('#loader-wrap').fadeOut('slow');
    new EQ().init();

    $grid.each(function (index: number) {
        let $this = $(this);
        if( $this.hasClass('grid-stack')) {
            let gridItems: GridItem[] = [];
            let id = 1;
            let grid: Grid;

            $this.on('grid-stack-item-created', '.grid-stack-item', function () {
                $(this).find('> .panel').transition({
                    animation: 'fade in',
                    duration: 300,
                    queue: false,
                });
            });

            $this.find('.grid-stack-item').each( function() {
                let panel = new Panel(this).init();
                let $body = $(this).find(panel.options.classes.body).not('.panel-no-scroll');
                $this.on('grid-stack-created', function () {
                    if( $body.length ) {
                        Ps.destroy($body[0]);
                        Ps.initialize($body[0], {
                            theme: 'panel-theme',
                            minScrollbarLength: 40,
                            wheelPropagation: true,
                            suppressScrollX: true
                        });
                    }
                }).on('grid-stack-updated', function () {
                    if( $body.length ) {
                        Ps.update($body[0]);
                    }
                });

                let i = this.getAttribute('data-item-id');
                id = i ? i : id;
                gridItems.push(new GridItem(this, id++, panel));
            });

            $this.on('grid-stack-created', function () {
                $destroy.css('opacity', 1).off('click').click(function () {
                    grid.destroy();
                    return false;
                });
                $remove.css('opacity', 1).off('click').click(function () {
                    grid.remove();
                    return false;
                });

            }).on('grid-stack-destroyed', function () {
                $destroy.css('opacity', .1).off('click').click(function () {
                    return false;
                });
            }).on('grid-stack-data-removed', function () {
                $remove.css('opacity', .1).off('click').click(function () {
                    return false;
                });
            })

            grid = new Grid(this, gridItems, new GridStore('grid-stack-' + index)).init();

            $restore.click(function () {
                $this.find('> .panel-wrap > .panel').transition('reset').removeClass('visible');
                grid.restore();
                return false;
            });
            $remove.click(function () {
                grid.remove();
                return false;
            });
            $destroy.click(function () {
                grid.destroy();
                return false;
            });
        } else {
            $this.find('.panel-wrap').each( function() {
                new Panel(this).init();
            });

            $('.restore-grid, .destroy-grid, .remove-data').css('opacity', .1).click(function () {
                return false;
            });

            let animation = $this.data('animation');

            $this.find('.panel-wrap > .panel').transition({
                animation: animation ? animation : 'fade up',
                duration: 400,
                interval: 50,
                queue: false
            });
        }
    });

    if(!$grid.length) {
        $('.restore-grid, .destroy-grid, .remove-data').css('opacity', .1).click(function () {
            return false;
        });
    }
});
