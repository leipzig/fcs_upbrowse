'use strict';
/*!
 * @version: 1.1.1
 * @name: theme-settings
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import Store from "./store";

$(function () {
    let store = new Store('theme-settings', window.localStorage);
    let storeData = store.getData();
    let $themes = $('.site-theme');
    let defaultData = {
        headerBg: 'header-bg-default',
        sidebarType: 'sidebar-type-push',
        sidebarState: 'sidebar-state-open',
        sidebarBg: 'sidebar-bg-default',
        sidebarOption: 'sidebar-option-default',
        sidebarTrState: 'sidebar-tr-state-compact',
    };
    updateAppClasses(storeData);

    $themes.click( function () {
        let $app = $('#app');
        let classes = $app.attr('class');
        let $sibling = $(this).parents('.site-themes').find('.site-theme');
        $sibling.removeClass('selected');
        let selected = $(this).addClass('selected').data('theme');

        if( !classes ) return;

        let classArray = classes.split(' ');
        let theme: any = {};
        let keys = Object.keys(defaultData);
        let removeClasses = '';

        for ( let i = 0; i < keys.length; i++ ) {
            let setting = keys[i].replace( /([A-Z])/g, function( $1 ) {
                return "-" + $1.toLowerCase();
            });

            if ( selected.indexOf( setting ) >= 0 ) {
                store.setData(selected, keys[i] );

                removeClasses = classArray.filter( function ( el: any ) {
                    return el.indexOf( setting ) >= 0;
                }).join( ' ' );

                break;
            }
        }

        if ( selected === 'sidebar-type-slide' ) {
            $('.site-theme[data-theme="sidebar-state-open"], .site-theme[data-theme="sidebar-tr-state-close"], .site-theme[data-theme="sidebar-tr-state-compact"]').hide(0);
            let $acitve = $('.site-theme[data-theme="sidebar-state-compact"], .site-theme[data-theme="sidebar-tr-state-open"]');
            $acitve.siblings().removeClass('selected');
            $acitve.addClass('selected');
            store.setData('sidebar-state-compact', 'sidebarState' );
            store.setData('sidebar-tr-state-open', 'sidebarTrState' );
            let state = classArray.filter( function ( el: any ) {
                return el.indexOf( 'sidebar-state' ) >= 0;
            }).join( ' ' );
            let stateTr = classArray.filter( function ( el: any ) {
                return el.indexOf( 'sidebar-tr-state' ) >= 0;
            }).join( ' ' );
            removeClasses += ' ' + state + ' ' + stateTr
            selected += ' sidebar-tr-state-open sidebar-state-compact';
        }

        if ( store.getData('sidebarType') !== 'sidebar-type-slide' ) {
            $themes.show(0);
        }
        updateAppClasses(store.getData());
        $app.removeClass(removeClasses).addClass(selected).trigger('state-change-init');
    });

    if ( storeData.sidebarType === 'sidebar-type-slide' ) {
        $('.site-theme[data-theme="sidebar-state-open"], .site-theme[data-theme="sidebar-tr-state-close"], .site-theme[data-theme="sidebar-tr-state-compact"]').hide(0);
    } else {
        $themes.show(0)
    }

    let $compact = $('.site-theme[data-theme="sidebar-state-compact"]');
    let $close = $('.site-theme[data-theme="sidebar-state-close"]');
    let $slide = $('.site-theme[data-theme="sidebar-type-slide"]');


    $(window).resize( function() {
        let storeData = store.getData();
        if(window.innerWidth < 1600 && window.innerWidth > 768 ) {
            if( storeData.sidebarState === 'sidebar-state-open' ) {
                $compact.click();
            }
        } else if(window.innerWidth <= 768 ) {
            if( storeData.sidebarType !== 'sidebar-type-slide' ) {
                $slide.click();
            }
            if( storeData.sidebarState !== 'sidebar-state-close' ) {
                $close.click();
            }
        }
    });

    $themes.each(function () {
        let data = $(this).data('theme');
        let $sibling = $(this).parents('.site-themes').find('.site-theme');
        for ( let i in storeData ) {
            if ( storeData[i] === data ) {
                $sibling.removeClass('selected');
                $(this).addClass('selected');
            }
        }
    });

    function updateAppClasses(data: any) {
        let values = Object.keys(data).map(function(e) {
            return data[e]
        });
        let $appClasses = $('#aside-settings-alert');
        $appClasses.html(values.join(' '));
    }
});
