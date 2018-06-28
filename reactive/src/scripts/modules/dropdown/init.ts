'use strict';
/*!
 * @version: 1.1.1
 * @name: dropdown
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import './main.js'
import './transition'
import './api'

$(function () {
    $('.dropdown-menu').parent().on('show.bs.dropdown', function () {
        let $menu = $(this).find('.dropdown-menu-content');
        if ( $(this).hasClass('dropup') ) {
            $menu.transition('slide up');
            return;
        }
        $menu.transition('slide down');
    }).on('hide.bs.dropdown', function () {
        let $menu = $(this).find('.dropdown-menu-content');
        $menu.transition('hide');
    });

    $('.simple-select.ui.select-dropdown').selectDropdown();
    $('.only-select.ui.select-dropdown').selectDropdown({action: 'select'});
    $('.nothing-select.ui.select-dropdown').selectDropdown({action: 'nothing'});
    $('.hide-select.ui.select-dropdown').selectDropdown({action: 'hide'});
    $('.combo-select.ui.select-dropdown').selectDropdown({action: 'combo'});
    $('.custom-select-dropdown.ui.select-dropdown').selectDropdown({action: function(text: string, value: any, element: HTMLElement) {
        $(element).parents('.custom-select-dropdown').selectDropdown('hide');
    }});
    $('.maximum-selection.ui.select-dropdown').selectDropdown({ maxSelections: 3 });
    $('.without-labels.ui.select-dropdown').selectDropdown({ useLabels: false, maxSelections: 3});
    $('.tags-allow-select.ui.select-dropdown').selectDropdown({allowAdditions: true});
    $('.remote-select-query.ui.select-dropdown').selectDropdown({apiSettings: { url: 'assets/select.json' }});

    $('.btn.clear-selects').on('click', function() {
        $('.clear-selects-dropdown.ui.select-dropdown').selectDropdown('restore defaults');
    });


    $('.ui.select-dropdown .menu').on('mousewheel', function (e: any) {
        e.stopPropagation();
    })

    $(document).on('click', '[data-mega="mega-dropdown"]', function(e) {
        let $this = $(this);
        let $menu = $($this.attr('href'));
        $menu.parents('.header-wrap').css('zIndex', 1000);
        $menu.transition({
            animation: 'slide down',
            onComplete: () => {
                $this.trigger('mega-dropdown-shown');
                if(!$menu.is(':visible')) $menu.parents('.header-wrap').css('zIndex', '');
            }
        });
        return false;
    });
    $(document).on('click', '.mega-dropdown-menu', function(e) {
        e.stopPropagation()
    });
    $(document).on('click', function(e) {
        $('.mega-dropdown-menu:visible').transition('slide').parents('.header-wrap').css('zIndex', '');
    });
});
