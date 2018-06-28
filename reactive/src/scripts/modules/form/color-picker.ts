'use strict';
/*!
 * @version: 1.1.1
 * @name: color-picker
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'tinycolor';
import 'colorpicker';

$(function () {
    ////////////////////////
    // Color Picker
    $('input.color-picker.picker-only-palette').spectrum({
        showPaletteOnly: true, hideAfterPaletteSelect:true, color: '#498033',
        palette: [['#ebebeb', '#c57a1f', '#2d6f70', 'rgb(53, 59, 74)', 'hsv 100 70 50'], ['#9a2e12', '#ba9d2b', '#498033', '#3a5190', '#5f368e']]
    });
    $('input.color-picker.picker-with-palette').spectrum({
        showAlpha: true,  showPalette: true, color: '#5f368e', showInitial: true, showInput: true,
        palette: [['#ebebeb', '#c57a1f', '#2d6f70', 'rgb(53, 59, 74)', 'hsv 100 70 50'], ['#9a2e12', '#ba9d2b', '#498033', '#3a5190', '#5f368e']]
    });
    $('input.color-picker.picker-toggle-palette').spectrum({
        showAlpha: true, showPaletteOnly: true, hideAfterPaletteSelect:true,
        togglePaletteOnly: true, togglePaletteMoreText: 'more', togglePaletteLessText: 'less',
        color: '#3a5190',
        palette: [['#ebebeb', '#c57a1f', '#2d6f70', 'rgb(53, 59, 74)', 'hsv 100 70 50'], ['#9a2e12', '#ba9d2b', '#498033', '#3a5190', '#5f368e']]
    });
    $('input.color-picker.picker-simple').spectrum({showAlpha: true});
    $('.input-group-addon input.color-picker').on('move.spectrum', function(e: Event, color: any) {
        $(this).parents('.input-group').find('> input').val(color.toRgbString());
    });
    $('input.color-picker').on('show.spectrum', function() {
        $('.sp-container').css('opacity', '0').addClass('transition fade in').on('click', function () {
            $(this).removeClass('transition scale in').css('opacity', '1');
        });
    });
    // End Color Picker
});
