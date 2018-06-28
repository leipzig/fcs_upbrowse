'use strict';
/*!
 * @version: 1.1.1
 * @name: init
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import Controller from './controller';
import Template from './template';
import Store from './store';
import View from './view';

const controller = new Controller(
    new Store('reactive-todo-list'),
    new View(new Template())
    ),
    todoSetView = () => controller.setView('all');

$(function () {
    $(window).on('hashchange', todoSetView);
    todoSetView();

    controller.count((total: number, active: number, completed: number) => {
        if ( !total ) {
            controller.addItem('At vero eos et accusamus et iusto odio.');
            controller.addItem('Buy a gift!');
            controller.addItem('Sed ut perspiciatis unde omnis iste!');
            controller.addItem('Et harum quidem rerum facilis est.');
            controller.addItem('Qui dolorem ipsum quia dolor.');
        }
    });
});

