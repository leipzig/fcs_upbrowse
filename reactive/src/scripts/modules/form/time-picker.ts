'use strict';
/*!
 * @version: 1.1.1
 * @name: time-picker
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'timepicker';

$(function () {
    ////////////////////////
    // Time Picker
    let timepicker = {icons: {up: 'fa fa-angle-up', down: 'fa fa-angle-down'}, showMeridian: true};
    $('.timepicker.picker-simple').timepicker(timepicker);
    $('.timepicker.picker-second').timepicker($.extend({}, timepicker, {showSeconds: true}));
    $('.timepicker.picker-twenty-four').timepicker($.extend({}, timepicker, {showMeridian: false, showSeconds: true}));
    $('.timepicker').on('show.timepicker', function () {
        $('.bootstrap-timepicker-widget.dropdown-menu').css('opacity', '0').addClass('transition scale in').on('click', function () {
            $(this).removeClass('transition scale in').css('opacity', '1');
        });
    });
    // End Time Picker
});
