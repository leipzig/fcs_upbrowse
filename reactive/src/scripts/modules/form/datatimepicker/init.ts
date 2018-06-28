'use strict';
/*!
 * @version: 1.1.1
 * @name: init
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'moment';
import './main';

$(function () {
    ////////////////////////
    // Data Time Picker
    $('.datetimepicker.picker-simple').bsDatetimepicker({
        //showTodayButton: true
    });
    $('.datetimepicker.picker-format').bsDatetimepicker({
        showTodayButton: true,
        showClear: true,
        format: 'MMM D, YYYY    h:mm A'
    });
    $('.datetimepicker.picker-inline').bsDatetimepicker({
        inline: true,
        calendarWeeks: true,
        // sideBySide: true
    });
    $('.datetimepicker.picker-disabled').bsDatetimepicker({
        daysOfWeekDisabled: [0,5,6],
        disabledHours: [0,1,2,3,4,5,6,7,8,19,20,21,22,23]
    });

    let $linkedInputs = $('.datetimepicker.picker-range input'),
        $firstInput = $linkedInputs.first(),
        $lastInput = $linkedInputs.last();
    $firstInput.bsDatetimepicker();
    $lastInput.bsDatetimepicker({ useCurrent: false });
    $firstInput.on('dp.change', function (e: any) {
        $lastInput.data('DateTimePicker').minDate(e.date);
    });
    $lastInput.on('dp.change', function (e: any) {
        $firstInput.data('DateTimePicker').maxDate(e.date);
    });

    $('.datetimepicker').on('dp.show', function () {
        $('.bs-datetimepicker-widget.dropdown-menu').css('opacity', '0').addClass('transition scale in').on('click', function () {
            $(this).removeClass('transition scale in').css('opacity', '1');
        });
    });
    // End Data Time Picker
});
