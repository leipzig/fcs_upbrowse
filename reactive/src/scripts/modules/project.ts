'use strict';
/*!
 * @version: 1.1.1
 * @name: project
 *
 * @author: https://themeforest.net/user/flexlayers
 */

$(function () {
    $('.project-overview a[data-toggle="tab"][href="#project-timing"]').on('shown.bs.tab', function () {
        $('#calendar').fullCalendar('render');
    })
});
