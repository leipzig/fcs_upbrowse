'use strict';
/*!
 * @version: 1.1.1
 * @name: picker
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import './main';

$(function () {
    let fields =  {
        name: {
            identifier: 'name',
            rules: [ {type   : 'empty', prompt : 'Please enter your name'} ]
        },
        email: {
            identifier: 'email',
            rules: [ {type   : 'email', prompt : 'Please enter a valid e-mail'} ]
        },
        url: {
            identifier: 'url',
            rules: [ {type   : 'url', prompt : 'Please enter a url'} ]
        },
        number: {
            identifier  : 'number',
            rules: [ {type   : 'number', prompt : 'Please enter a valid number'} ]
        },
        integer: {
            identifier  : 'integer',
            rules: [ {type   : 'integer[1..100]', prompt : 'Please enter an integer value'} ]
        },
        decimal: {
            identifier  : 'decimal',
            rules: [ {type   : 'decimal', prompt : 'Please enter a valid desimal number'} ]
        },
        exactCard: {
            identifier  : 'exact-card',
            rules: [ {type   : 'creditCard[visa,amex,maestro]', prompt : 'Please enter a valid credit card'} ]
        },
        visa: {
            identifier  : 'visa',
            rules: [ {type   : 'creditCard[visa]', prompt : 'Please enter a valid credit card'} ]
        },
        amex: {
            identifier  : 'amex',
            rules: [ {type   : 'creditCard[amex]', prompt : 'Please enter a valid credit card'} ]
        },
        mastercard: {
            identifier  : 'mastercard',
            rules: [ {type   : 'creditCard[mastercard]', prompt : 'Please enter a valid credit card'} ]
        },
        discover: {
            identifier  : 'discover',
            rules: [ {type   : 'creditCard[discover]', prompt : 'Please enter a valid credit card'} ]
        },
        unionpay: {
            identifier  : 'unionpay',
            rules: [ {type   : 'creditCard[unionpay]', prompt : 'Please enter a valid credit card'} ]
        },
        jcb: {
            identifier  : 'jcb',
            rules: [ {type   : 'creditCard[jcb]', prompt : 'Please enter a valid credit card'} ]
        },
        dinersClub: {
            identifier  : 'dinersClub',
            rules: [ {type   : 'creditCard[dinersClub]', prompt : 'Please enter a valid credit card'} ]
        },
        maestro: {
            identifier  : 'maestro',
            rules: [ {type   : 'creditCard[maestro]', prompt : 'Please enter a valid credit card'} ]
        },
        laser: {
            identifier  : 'laser',
            rules: [ {type   : 'creditCard[laser]', prompt : 'Please enter a valid credit card'} ]
        },
        visaElectron: {
            identifier  : 'visaElectron',
            rules: [ {type   : 'creditCard[visaElectron]', prompt : 'Please enter a valid credit card'} ]
        },
        card: {
            identifier  : 'card',
            rules: [ {type   : 'creditCard', prompt : 'Please enter a valid credit card'} ]
        },
        regex: {
            identifier  : 'regex',
            rules: [ {type   : 'regExp[/^[a-z0-9_-]{4,16}$/]', prompt : 'Please enter a 4-16 letter username'} ]
        },
        gender: {
            identifier: 'gender',
            rules: [ {type   : 'empty', prompt : 'Please select a gender'} ]
        },
        minCount: {
            identifier: 'minCount',
            rules: [ {type   : 'minCount[2]', prompt : 'Please select at least two skills'} ]
        },
        maxCount: {
            identifier  : 'maxCount',
            rules: [ {type   : 'maxCount[2]', prompt : 'Please select a max of two skills'} ]
        },
        exactCount: {
            identifier  : 'exactCount',
            rules: [ {type   : 'exactCount[2]', prompt : 'Please select two skills'} ]
        },
        password: {
            identifier: 'password',
            rules: [
                {type   : 'empty', prompt : 'Please enter a password'},
                {type   : 'minLength[6]', prompt : 'Your password must be at least {ruleValue} characters'}
            ]
        },
        minLength: {
            identifier: 'minLength',
            rules: [
                {type   : 'minLength[6]', prompt : 'Please type at least {ruleValue} characters'}
            ]
        },
        exactLength: {
            identifier  : 'exactLength',
            rules: [ {type   : 'exactLength[6]', prompt : 'Please enter exactly 6 characters'} ]
        },
        maxLength: {
            identifier  : 'maxLength',
            rules: [ {type   : 'maxLength[6]', prompt : 'Please enter at most 6 characters'} ]
        },
        checked: {
            identifier: 'checked',
            rules: [ {type   : 'checked', prompt : 'You must agree to the terms and conditions'} ]
        },
        color: {
            identifier: 'color',
            rules: [ {type: 'regExp', value: /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/i,} ]
        },
        match: {
            identifier  : 'match2',
            rules: [ {type   : 'match[match1]', prompt : 'Please put the same value in both fields'} ]
        },
        different: {
            identifier  : 'different2',
            rules: [ {type   : 'different[different1]', prompt : 'Please put different values for each field'} ]
        }
    };
    $('.form-validation')
        .form({
            on: 'change',
            inline : true,
            fields: fields
        });
    $('.form-validation-submit')
        .form({
            on: 'submit',
            inline : true,
            fields: fields
        });
    $('.form-validation-blur')
        .form({
            on: 'blur',
            inline : true,
            fields: fields
        });
    $('.form-validation-error-list')
        .form({
            on: 'submit',
            onFailure: function() {
                $(this).find('.modal').modal('show');
                return false;
            },
            fields: fields
        })
});
