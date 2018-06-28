'use strict';
/*!
 * @version: 1.1.1
 * @name: store
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import {Item} from './item';

export default class Store {
    /**
     * @type {ItemList}
     */
    private liveItems: Array<Item>;

    /**
     * @type {Storage}
     */
    private localStorage: Storage;

    /**
     * @param {!string} name Database name
     * @param {function()} [callback] Called when the Store is ready
     */
    constructor(private name: string, callback?: any) {
        this.localStorage = window.localStorage;

        if (callback) {
            callback();
        }
    }

    /**
     * Read the local ItemList from localStorage.
     *
     * @returns {ItemList} Current array of todos
     */
    public getStorage() {
        return this.liveItems || JSON.parse(this.localStorage.getItem(this.name) || '[]');
    }

    /**
     * Write the local ItemList to localStorage.
     *
     * @param {ItemList} todos Array of todos to write
     */
    public setStorage(items: Array<Item>) {
        this.localStorage.setItem(this.name, JSON.stringify(this.liveItems = items));
    }

    /**
     * Update an item in the Store.
     *
     * @param {ItemUpdate} update Record with an id and a property to update
     * @param {function()} [callback] Called when partialRecord is applied
     */
    public update(update: Item, callback: any) {
        const id = update.id;
        const todos = this.getStorage();
        let i = todos.length;

        while (i--) {
            if (todos[i].id === id) {
                for (let k in update) {
                    todos[i][k] = (<any>update)[k];
                }
                break;
            }
        }

        this.setStorage(todos);

        if (callback) {
            callback();
        }
    }

    /**
     * Insert an item into the Store.
     *
     * @param {Item} item Item to insert
     * @param {function()} [callback] Called when item is inserted
     */
    public insert(item: Item, callback: any) {
        const todos = this.getStorage();
        todos.push(item);
        this.setStorage(todos);

        if (callback) {
            callback();
        }
    }

    /**
     * Remove items from the Store based on a query.
     *
     * @param {Item} query Query matching the items to remove
     * @param {function(ItemList)|function()} [callback] Called when records matching query are removed
     */
    public remove(query: Item, callback: any) {
        const todos = this.getStorage().filter((todo: Item) => {
            for (let k in query) {
                if ((<any>query)[k] !== (<any>todo)[k]) {
                    return true;
                }
            }
            return false;
        });

        this.setStorage(todos);

        if (callback) {
            callback(todos);
        }
    }

    /**
     * Count total, active, and completed todos.
     *
     * @param {function(number, number, number)} callback Called when the count is completed
     */
    public count(callback: any) {// todo
        this.find(null, (items: Array<Item>) => {
            const total = items.length;

            let i = total;
            let completed = 0;

            while (i--) {
                completed += items[i].completed ? 1 : 0;
            }
            callback(total, total - completed, completed);
        });
    }

    /**
     * Find items with properties matching those on query.
     *
     * @param {Item} query Query to match
     * @param {function(ItemList)} callback Called when the query is done
     *
     * @example
     * db.find({completed: true}, data => {
	 *	 // data shall contain items whose completed properties are true
	 * })
     */
    public find(query: Item, callback: any) {
        const todos = this.getStorage();

        callback(todos.filter((todo: Item) => {
            for (let k in query) {
                if ((<any>query)[k] !== (<any>todo)[k]) {
                    return false;
                }
            }
            return true;
        }));
    }
}
