'use strict';
/*!
 * @version: 1.1.1
 * @name: easy
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import * as EasyPieChart from 'easy-pie-chart';

$(function () {
    let easyPieOptions: any = {
        easyPie1: {
            barColor: '#31457a',
            trackColor: '#e5e5e5',
            scaleColor: false,
            lineWidth: 10,
            lineCap: 'butt',
            animate: {duration: 200, enabled: true},
            size: 90
        }
    };

    $('.easy-pie').each(function () {
        let opIndex = $(this).data('options');
        let percent = $(this).data('percent');
        let me = this;
        let options = {
            onStep: function (from: any, to: any, percent: any) {
                let $percent = $(me).find('.percent');
                if ($percent.length) {
                    $percent.text(Math.round(percent) + '%');
                }
            }
        };
        if (opIndex && easyPieOptions[opIndex] ) options = $.extend(true, {}, options, easyPieOptions[opIndex]);
        let chart = new EasyPieChart(this, options);
        if (percent) {
            chart.update(percent);
        }
    });
});

