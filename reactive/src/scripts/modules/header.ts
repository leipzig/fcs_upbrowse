'use strict';
/*!
 * @version: 1.1.1
 * @name: header
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import * as screenfull from 'screenfull';

$(function () {
    $('#header').on('focus', 'input', function (e: Event) {
        $(e.target).parent().addClass('header-hover');
    }).on('blur', 'input', function (e: Event) {
        $(e.target).parent().removeClass('header-hover');
    }).on('click', '.page-fullscreen', function (e: Event) {
        e.preventDefault();
        if( screenfull.enabled ) {
            let $target = $(e.currentTarget);
            let $icon = $target.find('i');
            let $body = $('html');
            screenfull.toggle($body[0]);
            $icon.toggleClass($icon.attr('data-icon'));
            $body.toggleClass('page-full-screen');
            if(this.$panel.hasClass('page-full-screen')) {
                $(this.item).trigger('page-fullscreen-in')
            } else {
                $(this.item).trigger('page-fullscreen-out')
            }
        }
    });
});
