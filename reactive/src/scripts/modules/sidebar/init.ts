'use strict';
/*!
 * @version: 1.1.1
 * @name: sidebar
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import Sidebar from './sidebar';
import Menu from "./menu";

$(function () {
    new Menu('.sidebar-menu', new Sidebar('#sidebar')).init();

    $('#sidebar').on('sidebar-before-state-change', () => {
        $(this).find('.tab-links .nav-item:first').find('a').tab('show');
    }).on('sidebar-state-changed', setZIndex);
    $('#app').on('state-change-init', setZIndex);
    setZIndex();

    function setZIndex() {
        let $sidebar = $('#sidebar');
        let sidebar = $sidebar.data('sidebar');

        $('.sidebar-option-default.sidebar-state-compact .sidebar-menu').off('mouseenter mouseleave').hover(function () {
            $(this).parents('.sidebar-wrap').off('mouseenter mouseleave')
                .find('.profile, .tab-content').removeClass('transition fade right in');
            $sidebar.css( 'z-index', 1100 );
        }, function () {
            $sidebar.css( 'z-index', '' );
        });

        $('.sidebar-option-theme1.sidebar-state-compact .sidebar-wrap, .sidebar-option-theme4.sidebar-state-compact .sidebar-wrap').off('mouseenter mouseleave').hover(function () {
            $sidebar.css( 'z-index', 1100 ).find('.sidebar-menu').off('mouseenter mouseleave');
            if(sidebar.state === 'compact' && sidebar.type === 'slide') {
                sidebar.setSidebarState(true);
            } else if (sidebar.state === 'compact') {
                $sidebar.find('.profile, .tab-content').addClass('transition fade right in');
            }
        }, function () {
            $sidebar.css('z-index', '').find('.profile, .tab-content').removeClass('transition fade right in');
        });

        $('.sidebar-option-theme2.sidebar-state-compact .sidebar-wrap, .sidebar-option-theme3.sidebar-state-compact .sidebar-wrap').off('mouseenter mouseleave').hover(function () {
            $sidebar.css( 'z-index', 1100 ).find('.sidebar-menu').off('mouseenter mouseleave');
            if(sidebar.state === 'compact' && sidebar.type === 'slide') {
                sidebar.setSidebarState(true);
            } else if (sidebar.state === 'compact') {
                $sidebar.find('.tab-content').addClass('transition fade right in');
            }
        }, function () {
            $sidebar.css('z-index', '').find('.tab-content').removeClass('transition fade right in');
        });
    }
});
