'use strict';
/*!
 * @version: 1.1.1
 * @name: settings
 *
 * @author: https://themeforest.net/user/flexlayers
 */



// Here the theme settings are loaded from the cache
(function () {
    // calculate the sidebar position depending on the window initial size
    let app = document.querySelector('#app');
    let classes = app.getAttribute('class');
    let defaultData = {
        headerBg: 'header-bg-default',
        sidebarType: 'sidebar-type-push',
        sidebarState: 'sidebar-state-open',
        sidebarTrState: 'sidebar-tr-state-compact',
        sidebarBg: 'sidebar-bg-default',
        sidebarOption: 'sidebar-option-default',
    };
    let oldData = getTheme( classes, defaultData );
    removeClass.apply('', getArgs(oldData));

    let responsiveData: any = {};
    if(window.innerWidth >= 768 && window.innerWidth < 1600 ) {
        responsiveData.sidebarState = 'sidebar-state-compact';
    } else if(window.innerWidth < 768 ) {
        responsiveData.sidebarState = 'sidebar-state-close';
        responsiveData.sidebarType = 'sidebar-type-slide';
    }
    let newData: any;
    if(hasClass(app, 'no-saved-theme')) {
        newData = assign({}, defaultData, oldData, responsiveData);
    } else {
        let storage = window.localStorage;
        let themeStore = parse( storage.getItem('theme-settings') );
        newData = assign({}, defaultData, oldData, themeStore, responsiveData);
        storage.setItem('theme-settings', JSON.stringify(newData, null, '   '))
    }

    addClass.apply('', getArgs( newData ));

    function assign( target: any = {}, ...varArgs: any[] ) { // .length of function is 2
         if (target === null) { // TypeError if undefined or null
             throw new TypeError('Cannot convert undefined or null to object');
         }

         let to = Object(target);

         for (let index = 1; index < arguments.length; index++) {
             let nextSource = arguments[index];

             if (nextSource != null) { // Skip over if undefined or null
                 for (let nextKey in nextSource) {
                     // Avoid bugs when hasOwnProperty is shadowed
                     if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                         to[nextKey] = nextSource[nextKey];
                     }
                 }
             }
         }
         return to;
    }

    function getTheme( classes: string, data: any ) {
        if ( !classes ) return {};
        let classArray = classes.split(' ');
        let theme: any = {};
        let keys = Object.keys(data);

        for ( let i = 0; i < keys.length; i++ ) {
            let setting = keys[i].replace( /([A-Z])/g, function( $1 ) {
                return "-" + $1.toLowerCase();
            });
            let singleClass = classArray.filter( function ( el: any, pos: number ) {
                return el.indexOf( setting ) >= 0 && classArray.indexOf(el) === pos;
            }).join( ' ' );
            if( singleClass ) theme[ keys[i] ] = singleClass;
        }

        return theme;
    }

    function getArgs( data: any ) {
        let values = Object.keys(data).map(function(e) {
            return data[e]
        });

        return [ app ].concat(values);
    }

    function parse(row: any) {
        let stack = {};
        if ( typeof row === 'string' ) {
            try {
                stack = JSON.parse( row );
            } catch( error ) {
                console.error( 'JSON parse error: ' + error );
            }
        }
        return stack;
    }

    // add class to the element
    function addClass(...params: any[]) {
        let args = (params.length === 1 ? [params[0]] : Array.apply(null, params));
        let el = params[0];
        let classes = args.slice(1);
        if (el.classList) {
            el.classList.add.apply(el.classList, classes);
        } else {
            for( let i = 0; i < classes.length; i++ ) {
                el.className += ' ' + classes[i];
            }
        }
    }

    // remove class from the element
    function removeClass(...params: any[]) {
        let args = (params.length === 1 ? [params[0]] : Array.apply(null, params));
        let el = params[0];
        let classes = args.slice(1);
        if (el.classList) {
            el.classList.remove.apply(el.classList, classes);
        } else {
            for( let i = 0; i < classes.length; i++ ) {
                el.className = el.className.replace(new RegExp('(^|\\b)' + classes[i].split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        }
    }

    function hasClass(el: Element, className: string) {
        if (el.classList)
            return el.classList.contains(className);
        else
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
})();
