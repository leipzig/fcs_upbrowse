'use strict';
/*!
 * @version: 1.1.1
 * @name: validation
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import './main';

$( function () {
    let wizard = {
        headerTag: "h3",
        bodyTag: "section",
        transitionEffect: "slideLeft",
        autoFocus: true,
        onInit: initSteps,
        onStepChanged: resizeJquerySteps,
        onStepChanging: validateStep,
        onFinishing: validateStep,
        labels: {
            cancel: "Cancel",
            current: "current step:",
            pagination: "Pagination",
            finish: "Finish",
            next: "Next",
            previous: "Prev",
            loading: "Loading ..."
        }
    };

    let fields =  {
        email: {
            identifier: 'email',
            rules: [ {type   : 'email', prompt : 'Please enter a valid e-mail'} ]
        },
        password: {
            identifier: 'password',
            rules: [
                {type   : 'empty', prompt : 'Please enter a password'},
                {type   : 'minLength[6]', prompt : 'Your password must be at least {ruleValue} characters'}
            ]
        },
        checked: {
            identifier: 'checked',
            rules: [ {type   : 'checked', prompt : 'You must agree to the terms and conditions'} ]
        }
    };
    // titleTemplate: '<span class="number">#index#.</span> #title#',
    // loadingTemplate: '<span class="spinner"></span> #text#'

    $(".wizard-buttons").steps( wizard );
    $(".wizard-navigation").steps( $.extend({}, wizard, {enableAllSteps: true} ));
    $(".wizard-navigation-icons").steps( $.extend({}, wizard, {enableAllSteps: true, titleTemplate: "#title#"} ));
    $(".wizard-navigation-vertical").steps( $.extend({}, wizard, {enableAllSteps: true, stepsOrientation: "vertical"} ));
    $(".wizard-navigation-vertical-tab").steps( $.extend({}, wizard, {enableFinishButton: false, enablePagination: false, enableAllSteps: true, titleTemplate: "#title#", cssClass: "tabcontrol", stepsOrientation: "vertical"} ));
    $(".wizard-navigation-tabs").steps( $.extend({}, wizard, {enableFinishButton: false, enablePagination: false, enableAllSteps: true, titleTemplate: "#title#", cssClass: "tabcontrol"} ));

    function validateStep(e: Event) {
        let $target = $(e.target);
        let $form = $target.parent('form');
        if ( ! $form.length ) return true;

        validateForm(e);
        return $form.form('is valid');
    }

    function validateForm(e: Event) {
        let $form = $(e.target).parent('form');

        $form.form({
            on: 'change',
            inline: true,
            fields: fields,
            selector: {ignore: ':hidden'},
            onInvalid: function () {
                resizeJquerySteps(e)
            }
        });
        $form.form('validate form');
    }

    function initSteps(e: Event) {
        let $target = $(e.target);
        $target.find('.content').height( $target.find('.body.current').outerHeight() );

        let $steps = $target.not('.vertical, .tabcontrol').find('.steps > ul > li');
        $steps.width(100 / $steps.length + '%');

        $(window).on('resize', () => { setTimeout(() => resizeJquerySteps(e), 100) });

        let $form = $target.parent('form');
        if ( ! $form.length ) return;
        $target.parent('.form-step-validation')
            .form({
                on: 'change',
                inline: true,
                fields: fields
            })
    }

    function resizeJquerySteps(e: Event) {
        $(e.target).find('.content').animate({ height: $(e.target).find('.body.current').outerHeight() }, 200);
    }
});
