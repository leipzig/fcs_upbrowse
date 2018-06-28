'use strict';
/*!
 * @version: 1.1.1
 * @name: main
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'hideseek';
import './dropdown/transition';

$(function () {
    let $app = $('body');
    $('.content-wrap').css('min-height', $app.height() - $('.header-wrap').height() );

    $(`[href='']`).click(function (e) {
        e.preventDefault();
    });

    $('.nav-tabs, .nav-pills').find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        let $tabs = $(this).parents('.nav-tabs, .nav-pills').find('a[data-toggle="tab"]').not($(e.target));
        $tabs.each(function () {
            $($(this).attr('href')).removeClass('active');
        })
    });

    $app.on('shown.bs.modal', '.modal', function (e) {
        $(this).addClass('transition scale in');
        $('.modal-backdrop').appendTo('#app');
    });

    $('.search-control').hideseek();

    $('.hamburger-btn').click( function() {
        $(this).toggleClass('active');
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        let $a = $('[href="'+ $(this).attr('href') + '"]');
        $a.parents('.nav').find('.nav-link').removeClass('active');
        $a.addClass('active');
    });

    $('.counter').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: $(this).data('counter')
        }, {
            duration: $(this).data('duration') || 1500,
            easing: 'swing',
            step: function (now: any) {
                $(this).text(Math.ceil(now));
            }
        });
    });

    $('.badge-counter').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: $(this).data('counter')
        }, {
            duration: $(this).data('duration') || 1500,
            easing: 'linear',
            step: function (now: any) {
                let val = Math.ceil(now),
                    data = $(this).data('counter-value');
                if ( val > data || ! data ) {
                    $(this).data('counter-value', val);
                    $(this).text(val);
                    $(this).transition({
                        animation : 'bounce In',
                    });
                }
            }
        });
    });

    $('[data-toggle="popover"]').popover();

    $('.input-group>input').focus(function () {
        $(this).siblings('.input-group-addon').addClass('bgc-primary bc-primary');
    }).blur(function () {
        $(this).siblings('.input-group-addon').removeClass('bgc-primary bc-primary');
    });

    $('.image-lazy[data-src]').each(function () {
        let img = new Image();
        img.onload = function() {
            $(this).removeClass('loading');
        };
        img.src = $(this).attr('data-src');
        $(img).addClass('loading ' +  $(this).attr('class'));
        $(this).replaceWith(img);
    })
});
