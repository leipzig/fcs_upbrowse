'use strict';
/*!
 * @version: 1.1.1
 * @name: animations
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import './dropdown/transition';
import 'velocity';
import 'velocity/velocity.ui';

$(function () {
    let $jsTransitionPanel = $('#js-transition-panel').find('.panel');
    let $jsTransition = $('#js-transition');

    $jsTransition.find('.animation-type select').change(function () {
        let $drop =$(this).parents('.select-dropdown').selectDropdown('hide').addClass('disabled');
        $jsTransitionPanel.velocity($(this).val(), {
            drag: $jsTransition.find('.animation-drag input').is(':checked'),
            stagger: $jsTransition.find('.animation-stagger select').val(),
            complete: function () {
                $(this).attr('style', '');
                $drop.removeClass('disabled');
            }
        })
    });

    let $singlePanel = $('#single-transition-panel').find('.panel');
    let $singleTransition = $('#single-transition');

    $singleTransition.find('.animation-type select').change(function () {
        let duration = $singleTransition.find('.animation-duration select').val();
            $singlePanel.transition({
            animation: $(this).val(),
            queue: $singleTransition.find('.animation-queue input').is(':checked'),
            duration: duration? duration : '500ms'
        })
    });

    let $doubledPanel = $('#doubled-transition-panel').find('.panel');
    let $doubledTransition = $('#doubled-transition');

    $doubledTransition.find('.animation-type1 select, .animation-type2 select').change(function () {
        let duration = $doubledTransition.find('.animation-duration select').val();
        $doubledPanel.transition({
            animation: $('.animation-type1 select').val(),
            queue: $doubledTransition.find('.animation-queue input').is(':checked'),
            duration: duration? duration : '500ms'
        }).transition({
            animation: $('.animation-type2 select').val(),
            queue: $doubledTransition.find('.animation-queue input').is(':checked'),
            duration: duration? duration : '500ms'
        })
    });

    let $groupedPanel = $('#grouped-transition-panel').find('.panel');
    let $groupedTransition = $('#grouped-transition');
    $groupedTransition.find('.animation-type select').change(function () {
        let duration = $groupedTransition.find('.animation-duration select').val();
        let interval = $groupedTransition.find('.animation-interval select').val();
            $groupedPanel.transition({
            animation: $(this).val(),
            queue: $groupedTransition.find('.animation-queue input').is(':checked'),
            duration: duration? duration : '500ms',
            interval: interval? interval : '200'
        })
    });

    let $groupedDubledPanel = $('#grouped-doubled-transition-panel').find('.panel');
    let $groupedDubledTransition = $('#grouped-doubled-transition');
    $groupedDubledTransition.find('.animation-type1 select, .animation-type2 select').change(function () {
        let duration = $groupedDubledTransition.find('.animation-duration select').val();
        let interval = $groupedDubledTransition.find('.animation-interval select').val();
        $groupedDubledPanel.transition({
            animation: $('.animation-type1 select').val(),
            queue: $groupedDubledTransition.find('.animation-queue input').is(':checked'),
            duration: duration? duration : '500ms',
            interval: interval? interval : '200'
        }).transition({
            animation: $('.animation-type2 select').val(),
            queue: $groupedDubledTransition.find('.animation-queue input').is(':checked'),
            duration: duration? duration : '500ms',
            interval: interval? interval : '200'
        })
    })
});
