'use strict';
/*!
 * @version: 1.1.1
 * @name: checkbox
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import './main'

$(function () {
    $('.ui.checkbox.dynamic').uiCheckbox();
    $('.ui.checkbox.indeterminate').uiCheckbox('set indeterminate');
    $('.ui.checkbox.uncheckable').uiCheckbox({ uncheckable: false });
    $('.master.ui.checkbox').uiCheckbox({
        onChecked: function() { // check all children
            $(this).closest('.checkbox').siblings('.list').find('.checkbox').uiCheckbox('check');
        },
        onUnchecked: function() { // uncheck all children
            $(this).closest('.checkbox').siblings('.list').find('.checkbox').uiCheckbox('uncheck');
        }
    });
    $('.child.ui.checkbox').uiCheckbox({
        fireOnInit : true, // Fire on load to set parent value
        onChange   : function() { // Change parent state on each child checkbox change
            let $listGroup      = $(this).closest('.list'),
                $parentCheckbox = $listGroup.closest('.item').children('.checkbox'),
                $checkbox       = $listGroup.find('.checkbox'),
                allChecked      = true,
                allUnchecked    = true;

            $checkbox.each(function() { // check to see if all other siblings are checked or unchecked
                if( $(this).uiCheckbox('is checked') ) {
                    allUnchecked = false;
                } else {
                    allChecked = false;
                }
            });
            // set parent checkbox state, but dont trigger its onChange callback
            if (allChecked) {
                $parentCheckbox.uiCheckbox('set checked');
            } else if (allUnchecked) {
                $parentCheckbox.uiCheckbox('set unchecked');
            } else {
                $parentCheckbox.uiCheckbox('set indeterminate');
            }
        }
    });
    $('.attaching-events.ui.checkbox')
        .uiCheckbox('attach events', '.btn-checkbox-toggle')
        .uiCheckbox('attach events', '.btn-checkbox-check', 'check')
        .uiCheckbox('attach events', '.btn-checkbox-uncheck', 'uncheck');
});
