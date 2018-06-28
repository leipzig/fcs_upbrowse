'use strict';
/*!
 * @version: 1.1.1
 * @name: main
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'jquery-ui/ui/widgets/sortable';

$(function () {
    $('.sortable-list').each(function () {
        let id = Math.round( Math.random() * 100000 );
        let newContainment = 'sortable-containment-' + id;
        let newSelector = 'sortable-list-' + id;
        $( this ).parents( '.sortable-containment' ).addClass( newContainment );
        $( this ).addClass( newSelector );
        $( <string>('.' + newSelector) ).sortable({
            containment: '.' + newContainment,
            revert: 100,
            items: '.sortable-list-item',
            cursor: "move",
            handle: '.sortable-list-handle',
        });
    })

    $('.sortable-columns').each(function () {
        let id = Math.round( Math.random() * 100000 );
        let newSelector = 'sortable-columns-' + id;
        $( this ).addClass( newSelector );
        $( <string>('.' + newSelector) ).sortable({
            containment: '.content-wrap',
            revert: 100,
            items: '.sortable-column',
            cursor: "move",
            // handle: '.sortable-column-handle',
            connectWith: '.sortable-columns',
            helper: 'clone',
            appendTo: '#main'
        });
    })
});
