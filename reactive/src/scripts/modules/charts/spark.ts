'use strict';
/*!
 * @version: 1.1.1
 * @name: spark
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'sparkline';

$(function () {
    let sparkOptions: any = {};

    $('.spark-line').each(function () {
        let opIndex = $(this).data('options');
        let options = {
            enableTagOptions: true,
            // disableInteraction: true,
            width: $(this).hasClass('spark-line-full') ? '100%' : 'auto',
            highlightLineColor: "#7f260f"
        };

        if ( opIndex && sparkOptions[opIndex] ) options = $.extend(true, {}, options, sparkOptions[opIndex]);

        let sparklineLogin = () => {
            $(this).sparkline('html', options);
        };
        sparklineLogin();

        $(this).parents('.grid-stack-item')
            .on('grid-stack-item-updated panel-fullscreen-maximized panel-fullscreen-minimized panel-fullscreen-in panel-fullscreen-out', function () {
                sparklineLogin();
            });
    });
});
