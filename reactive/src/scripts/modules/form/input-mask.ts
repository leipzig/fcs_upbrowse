'use strict';
/*!
 * @version: 1.1.1
 * @name: input-mask
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'inputmask/dist/inputmask/inputmask';
import 'inputmask/dist/inputmask/jquery.inputmask';
import 'inputmask/dist/inputmask/inputmask.date.extensions';
import 'inputmask/dist/inputmask/inputmask.extensions';

$(function () {
    ////////////////////////
    // Input Mask
    $('input.tax-mask').inputmask('99-9999999', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.phone-mask').inputmask('(999) 999-9999', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.dynamic-mask').inputmask('9-a{1,3}9{1,3}', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.optional-mask').inputmask('999[-999]', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.alternator-mask').inputmask('(999)|(aaa)', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.date-mask').inputmask('dd/mm/yyyy', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.date-time-mask').inputmask('mm/dd/yyyy hh:mm xm', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.url-mask').inputmask('url', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.ip-mask').inputmask('ip', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.email-mask').inputmask('email', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.mac-mask').inputmask('mac', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.vin-mask').inputmask('vin', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});
    $('input.currency-mask').inputmask('$ 999,9 .99', { 'onincomplete': triggerMaskIncomplete, oncomplete: triggerMaskComplete});

    function triggerMaskIncomplete() {
        let $parent = $( this ).parents('.form-group');
        if ( !$parent.hasClass( 'has-danger') ) {
            $(this).addClass('form-control-danger');
            $parent.addClass('has-danger');
            $('<div class="form-control-feedback mt-1 d-inline-block">Input is Incomplete</div>').appendTo($parent)
                .css('opacity', 0).addClass('transition drop in');
        }
    }
    function triggerMaskComplete() {
        let $parent = $( this ).parents('.form-group');
        if ( $parent.hasClass( 'has-danger') ) {
            $(this).removeClass('form-control-danger');
            $parent.removeClass('has-danger')
                .find('div.form-control-feedback').remove();
        }
    }
    // End Input Mask
});
