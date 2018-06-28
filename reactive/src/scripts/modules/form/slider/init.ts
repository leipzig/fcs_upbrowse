'use strict';
/*!
 * @version: 1.1.1
 * @name: slider
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'ionrangeslider';
import * as noUiSlider from './nouislider';
import * as moment from 'moment';

$(function () {
    ////////////////////////
    // Ion Slider
    let ionrangeslider = { type: 'double', min: 0, max: 1000, from: 200, to: 700, grid: true, keyboard: true};
    $('.ion-range.ion-range-simple').ionRangeSlider($.extend({}, ionrangeslider, {postfix: ' %'}));
    $('.ion-range.ion-range-negative').ionRangeSlider($.extend({}, ionrangeslider, {min: -1000, max: 1000, from: -500, to: 500, step: 250}));
    $('.ion-range.ion-range-month').ionRangeSlider({from: 3, to: 8, grid: true, type: 'double', values: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']});
    $('.ion-range.ion-range-no-grid').ionRangeSlider($.extend({}, ionrangeslider, {prefix: 'Weight: ', postfix: 'million pounds', decorate_both: false, grid: false}));
    $('.ion-range.ion-range-lock').ionRangeSlider($.extend({}, ionrangeslider, {from_fixed: true}));
    $('.ion-range.ion-range-interval').ionRangeSlider($.extend({}, ionrangeslider, {drag_interval: true}));
    $('.ion-range.ion-range-limits').ionRangeSlider({ type: 'double', min: 0, max: 100, from: 20, from_min: 10, from_max: 30, from_shadow: true, to: 80, to_min: 70, to_max: 90, to_shadow: true, grid: true, grid_num: 10});
    $('.ion-range.ion-range-time').ionRangeSlider({
        min: +moment().subtract(12, 'hours').format('X'),
        max: +moment().format('X'),
        from: +moment().subtract(6, 'hours').format('X'),
        grid: true,
        force_edges: true,
        prettify: function (num: any) {
            let m = moment(num, 'X').locale('ru');
            return m.format('Do MMMM, HH:mm');
        }
    });

    // Reset slider
    let $resetSlider = $('.ion-range.ion-range-reset').ionRangeSlider(ionrangeslider);
    let resetSlider = $resetSlider.data('ionRangeSlider');
    $('.btn-reset-ion-range-reset').click( () => resetSlider.reset() );
    $('.btn-disable-ion-range-reset').click( () => resetSlider.update({ disable: true }) );
    $('.btn-enable-ion-range-reset').click( () => resetSlider.update({ disable: false }) );
    $('.btn-update-ion-range-reset').click( () => resetSlider.update({ values: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'], from: 2, to: 4 }) );

    // Create Slider
    let createSlider: any = '';
    $('.btn-create-ion-range-create').click( () => { createSlider = $('.ion-range.ion-range-create')
        .ionRangeSlider({type: 'double', values: ['A','B','C','D','E', 'F','G','H','I','J'], grid: true}).data('ionRangeSlider') });
    $('.btn-update-ion-range-create').click( function(e: Event) {
        e.preventDefault();
        if( createSlider ) createSlider.update({ values: ['A','C','D','E', 'F','I','J'], from: 1, to: 5 });
    });
    $('.btn-destroy-ion-range-create').click( function(e: Event) {
        e.preventDefault();
        if( createSlider ) createSlider.destroy();
    });
    // End Ion Slider
    let slider = document.getElementById('test-slider');
    if(slider) noUiSlider.create(slider, {
        start: [20, 80],
        connect: true,
        step: 1,
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
            'min': 0,
            'max': 100
        },
        format: wNumb({
            decimals: 0
        })
    });

    // Note how these are 'string' values, not numbers.
    // Single Handle
    let range = [
        '0','2097152','4194304',
        '8388608','16777216','33554432',
        '67108864','134217728','268435456',
        '536870912','1073741824',
        '2147483648','4294967296',
        '8589934592'
    ];

    let bigValueSlider: any = document.getElementById('slider-huge'),
        bigValueSpan = document.getElementById('huge-value');

    if(bigValueSlider) {
        noUiSlider.create(bigValueSlider, {
            start: 5,
            step: 1,
            format: wNumb({
                decimals: 0
            }),
            range: {
                min: 0,
                max: 13
            }
        });
        bigValueSlider.noUiSlider.on('update', function ( values: any, handle: any ) {
            bigValueSpan.innerHTML = range[values[handle]];
        });
    }



    // Soft Limits
    let softSlider: any = document.getElementById('soft-limits');
    if(softSlider) {
        noUiSlider.create(softSlider, {
            start: 50,
            step: 1,
            range: {
                min: 0,
                max: 100
            },
            pips: {
                mode: 'values',
                values: [20, 80],
                density: 4
            },
            format: wNumb({
                decimals: 0
            })
        });

        softSlider.noUiSlider.on('change', function ( values: any, handle: any ) {
            if ( values[handle] < 20 ) {
                softSlider.noUiSlider.set(20);
            } else if ( values[handle] > 80 ) {
                softSlider.noUiSlider.set(80);
            }
        });
    }



    // Vertical
    let verticalSliderDanger = $('#vertical-slider-danger').height(350);
    let verticalSliderWarning = $('#vertical-slider-warning').height(350);
    let verticalSliderSuccess = $('#vertical-slider-success').height(350);
    let verticalSliderInfo = $('#vertical-slider-info').height(350);
    let verticalOptions = {
        start: [20, 80],
        connect: true,
        step: 1,
        orientation: 'vertical', // 'horizontal' or 'vertical'
        range: {
            'min': 0,
            'max': 100
        },
        pips: {
            mode: 'values',
            values: [20, 80],
            density: 4
        },
        format: wNumb({
            decimals: 0
        })
    };

    if( verticalSliderDanger.length ) noUiSlider.create(verticalSliderDanger[0], $.extend({}, verticalOptions, {start: [20, 50]}));
    if( verticalSliderWarning.length ) noUiSlider.create(verticalSliderWarning[0], $.extend({}, verticalOptions, {start: [10, 75]}));
    if( verticalSliderSuccess.length ) noUiSlider.create(verticalSliderSuccess[0], $.extend({}, verticalOptions, {start: [30, 80]}));
    if( verticalSliderInfo.length ) noUiSlider.create(verticalSliderInfo[0], $.extend({}, verticalOptions, {start: [5, 65]}));


    // Room Slider
    let roomSlider: any = document.getElementById('room-slider');
    if( roomSlider ) {
        noUiSlider.create(roomSlider, {
            start: [2, 5],
            connect: true,
            step: 1,
            orientation: 'horizontal', // 'horizontal' or 'vertical'
            range: {
                'min': 0,
                'max': 10
            },
            format: wNumb({
                decimals: 0
            })
        });

        roomSlider.noUiSlider.on('update', function ( values: any, handle: any ) {
            $(roomSlider).parent().find('.handle-' + handle).html(values[handle])
        });
    }

    // Year Slider
    let yearSlider: any = document.getElementById('year-slider');
    if( yearSlider ) {
        noUiSlider.create(yearSlider, {
            start: [2004, 2015],
            connect: true,
            step: 1,
            orientation: 'horizontal', // 'horizontal' or 'vertical'
            range: {
                'min': 1995,
                'max': 2017
            },
            format: wNumb({
                decimals: 0
            })
        });

        yearSlider.noUiSlider.on('update', function ( values: any, handle: any ) {
            $(yearSlider).parent().find('.handle-' + handle).html(values[handle])
        });
    }

    // Construction Slider
    let constructSlider: any = document.getElementById('construction-slider');
    if( constructSlider ) {
        noUiSlider.create(constructSlider, {
            start: [2000, 2012],
            connect: true,
            step: 1,
            orientation: 'horizontal', // 'horizontal' or 'vertical'
            range: {
                'min': 1990,
                'max': 2017
            },
            format: wNumb({
                decimals: 0
            })
        });

        constructSlider.noUiSlider.on('update', function ( values: any, handle: any ) {
            $(constructSlider).parent().find('.handle-' + handle).html(values[handle])
        });
    }

});
