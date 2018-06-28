'use strict';
/*!
 * @version: 1.1.1
 * @name: touch-spin
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'touchspin';

$(function () {
    ////////////////////////
    // Touch Spin
    let spinDefault = {min: 0, max: 100, step: 1, decimals: 0, boostat: 5, maxboostedstep: 100};
    $('input.spin-simple, input.spin').TouchSpin(spinDefault);
    $('input.spin-percent').TouchSpin($.extend({}, spinDefault, {postfix: '&nbsp;%&nbsp'}));
    $('input.spin-dollar').TouchSpin($.extend({}, spinDefault, {prefix: '&nbsp$&nbsp', max: 1000000, maxboostedstep: 100000}));
    $('input.spin-vertical').TouchSpin($.extend({}, spinDefault, {verticalbuttons: true, verticalupclass: 'fa fa-plus',
        verticaldownclass: 'fa fa-minus'}));
    $('input.spin-btn').TouchSpin($.extend({}, spinDefault, {postfix: 'Button', postfix_extraclass: 'btn btn-default'}));
    $('input.spin-btn-group').TouchSpin($.extend({}, spinDefault, {postfix: 'Button', postfix_extraclass: 'btn btn-default'}));
    // End Touch Spin
});
