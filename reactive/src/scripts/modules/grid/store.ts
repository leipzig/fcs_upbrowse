'use strict';
/*!
 * @version: 1.1.1
 * @name: store
 *
 * @author: https://themeforest.net/user/flexlayers
 */

export default class GridStore {
    constructor(
        private storageName: string,
        private storage: Storage = window.localStorage
    ) {}

    getMultiple(current: string, initial = false): any {
        let path: any = this.getPath(current);
        let data: any = this.parse( this.storage.getItem( path ));
        let initDataIndex = this.storageName;
        if( initial ) initDataIndex = this.storageName + '-initial';
        if( data && data[initDataIndex] ) {
            return data[initDataIndex];
        }
        return '';
    }

    saveMultiple( current: string, newData: any, initial = false ) {
        let path: any = this.getPath(current);
        let existData = this.parse( this.storage.getItem( path ));
        let data: any = existData ? existData: {};
        let initDataIndex = this.storageName;
        if( initial ) initDataIndex = this.storageName + '-initial';
        data[initDataIndex] = newData;
        this.storage.setItem( path, JSON.stringify( data, null, '   ' ) );
    }

    getSingle(current: string, id: number): any {
        let path: any = this.getPath(current);
        let data: any = this.parse( this.storage.getItem( path ));
        if( data && data[this.storageName] && data[this.storageName][id] ) {
            return data[this.storageName][id];
        }
        return '';
    }

    saveSingle( current: string, id: number, newData: any ) {
        let path: any = this.getPath(current);
        let data: any = this.parse( this.storage.getItem( path ));
        if( data && data[this.storageName] ) {
            data[this.storageName][id] = newData;
        }
        this.storage.setItem( path, JSON.stringify( data, null, '   ' ) );
    }

    destroy(current: string) {
        let path: any = this.getPath(current);
        this.storage.removeItem( path );
    }

    private getPath(current: string) {
        let path = current;
        let regexp = new RegExp(`[\/\#\?\\\.]`, 'g');
        path += window.location.pathname.replace(regexp, '-');
        return path;
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
