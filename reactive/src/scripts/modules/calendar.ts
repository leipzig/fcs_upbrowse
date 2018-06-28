'use strict';
/*!
 * @version: 1.1.1
 * @name: calendar
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'moment';
import 'fullcalendar/dist/fullcalendar';

$(function () {
    let options = {
        header: {
            left: 'prev, today, next',
            center: '',
            right: 'month,listWeek,listDay'
        },
        views: {
            listDay: { buttonText: 'day events' },
            listWeek: { buttonText: 'week events' },
        },
        navLinks: true, // can click day/week names to navigate views
        eventLimit: 0,
        editable: true,
        events: [
            {
                title: 'Event 1',
                start: '2017-02-23'
            },
            {
                title: 'Event consectetur adipiscing elit',
                start: '2017-02-23',
                end: '2018-03-1'
            },
            {
                title: 'Event 3',
                start: '2017-03-10'
            }
        ],
        dayRender: function (date: any, cell: any) {},
        viewRender: function( view: any, element: any ) {
            $('.fc-today-button').html(view.title);
            $('.fc-today').parents('.fc-content-skeleton').addClass('current-week bgc-white-darkest');
        }
    };
    let $calendar = $('#calendar').fullCalendar(options);

    function IsDateHasEvent(date: any) {
        var allEvents = [];
        allEvents = $('#calendar').fullCalendar('clientEvents');
        var event = <any>$.grep(allEvents, function (v: any) {
            return +v.start === +date;
        });
        return event.length > 0;
    }
    $calendar.fullCalendar('option', 'height', 'auto');
    $calendar.find('button').addClass('btn btn-default').removeClass('fc-button fc-state-default');
    $calendar.find('.fc-next-button span').removeClass().addClass('fa fa-angle-right');
    $calendar.find('.fc-prev-button span').removeClass().addClass('fa fa-angle-left');
});
