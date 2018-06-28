'use strict';
/*!
 * @version: 1.1.1
 * @name: init
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import './main';

$(function () {
    ////////////////////////
    // Data Picker
    $('.bs-datepicker.picker-simple').bsDatepicker({
        todayBtn: true,
        todayHighlight: true
    });
    $('.bs-datepicker.picker-disabled').bsDatepicker({
        todayBtn: true,
        todayHighlight: true,
        daysOfWeekDisabled: [0,5,6]
    });
    $('.bs-datepicker.picker-format').bsDatepicker({
        todayBtn: true,
        todayHighlight: true,
        format: 'mm - dd - yyyy'
    });
    $('.bs-datepicker.picker-range').bsDatepicker({
        todayBtn: true,
        todayHighlight: true
    }).find('input').each(function() {
        $(this).bsDatepicker('clearDates');
    });
    $('.bs-datepicker').on('show', function () {
        $('.bs-datepicker-dropdown').css('opacity', '0').addClass('transition scale in').on('click', function () {
            $(this).removeClass('transition scale in').css('opacity', '1');
        });
    });
    // End Data Picker
});
