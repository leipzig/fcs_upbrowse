'use strict';
/*!
 * @version: 1.1.1
 * @name: store
 *
 * @author: https://themeforest.net/user/flexlayers
 */

export default class Store {
    constructor(
        private storageName: string,
        private storage: Storage = window.localStorage
    ) {}

    getData(key?: string | number): any {
        let data: any = this.parse( this.storage.getItem( this.storageName ));
        if( key ) {
            if( data && data[key] ) {
                return data[key];
            } else {
                return '';
            }
        } else if( data ) {
            return data;
        } else {
            return {};
        }
    }

    setData( newData: any,  key: string | number ) {
        let data: any = this.parse( this.storage.getItem( this.storageName ));
        data = data ? data : {};
        data[key] = newData;
        this.storage.setItem( this.storageName, JSON.stringify( data, null, '   ' ) );
    }

    destroy() {
        this.storage.removeItem( this.storageName );
    }

    private parse(row: any) {
        let stack = '';
        if ( typeof row === 'string' ) {
            try {
                stack = JSON.parse( row );
            } catch( error ) {
                console.error( 'JSON parse error: ' + error );
            }
        }
        return stack;
    }
}
