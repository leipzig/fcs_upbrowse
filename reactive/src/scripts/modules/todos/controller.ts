'use strict';
/*!
 * @version: 1.1.1
 * @name: controller
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import Store from './store';
import View from './view';
import {Item} from './item';

export default class Controller {
    private _activeRoute: string;
    private _lastActiveRoute: string;

    /**
     * @param  {!Store} store A Store instance
     * @param  {!View} view A View instance
     */
    constructor(private store: Store, private view: View) {
        view.bindAddItem(this.addItem.bind(this));
        view.bindEditItemSave(this.editItemSave.bind(this));
        view.bindEditItemCancel(this.editItemCancel.bind(this));
        view.bindRemoveItem(this.removeItem.bind(this));
        view.bindToggleItem((id: number, completed: any) => {
            this.toggleCompleted(id, completed);
            this._filter();
        });
        view.bindRemoveCompleted(this.removeCompletedItems.bind(this));
        view.bindToggleAll(this.toggleAll.bind(this));
        view.bindToggleFilter(this.setView.bind(this));

        this._activeRoute = '';
        this._lastActiveRoute = null;
    }

    /**
     * Set and render the active route.
     *
     * @param {string} raw '' | '#/all' | '#/active' | '#/completed'
     */
    setView(raw: string) {
        const route = raw.replace(/^#\//, '');
        this._activeRoute = route;
        this._filter();
        this.view.updateFilterButtons(route);
    }

    /**
     * Get the count of to do items.
     *
     * @param {number}  total
     * @param {number}  active
     * @param {number}  completed
     */
    count(calback: any) {
        this.store.count(calback);
    }

    /**
     * Add an Item to the Store and display it in the list.
     *
     * @param {!string} title Title of the new item
     */
    addItem(title: string) {
        this.store.insert({
            id: Date.now() + Math.floor(Math.random() * 10000),
            title,
            completed: false
        }, () => {
            this.view.clearNewTodo();
            this._filter(true);
        });
    }

    /**
     * Save an Item in edit.
     *
     * @param {number} id ID of the Item in edit
     * @param {!string} title New title for the Item in edit
     */
    editItemSave(id: number, title: string) {
        if (title.length) {
            this.store.update({id, title}, () => {
                this.view.editItemDone(id, title);
            });
        } else {
            this.removeItem(id);
        }
    }

    /**
     * Cancel the item editing mode.
     *
     * @param {!number} id ID of the Item in edit
     */
    editItemCancel(id: number) {
        this.store.find({id}, (data: Array<Item>) => {
            const title = data[0].title;
            this.view.editItemDone(id, title);
        });
    }

    /**
     * Remove the data and elements related to an Item.
     *
     * @param {!number} id Item ID of item to remove
     */
    removeItem(id: number) {
        this.store.remove({id}, () => {
            this._filter();
            this.view.removeItem(id);
        });
    }

    /**
     * Remove all completed items.
     */
    removeCompletedItems() {
        this.store.remove({completed: true}, this._filter.bind(this));
    }

    /**
     * Update an Item in storage based on the state of completed.
     *
     * @param {!number} id ID of the target Item
     * @param {!boolean} completed Desired completed state
     */
    toggleCompleted(id: number, completed: any) {
        this.store.update({id, completed}, () => {
            this.view.setItemComplete(id, completed);
        });
    }

    /**
     * Set all items to complete or active.
     *
     * @param {boolean} completed Desired completed state
     */
    toggleAll(completed: boolean) {
        this.store.find({completed: !completed}, (data: Array<Item>) => {
            for (let {id} of data) {
                this.toggleCompleted(id, completed);
            }
        });

        this._filter();
    }

    /**
     * Refresh the list based on the current route.
     *
     * @param {boolean} [force] Force a re-paint of the list
     */
    _filter(force?: boolean) {
        const route = this._activeRoute;

        if (force || this._lastActiveRoute !== '' || this._lastActiveRoute !== route) {
            this.store.find((<any>{
                '': null,
                'all': null,
                'active': {completed: false},
                'completed': {completed: true}
            })[route], this.view.showItems.bind(this.view));
        }

        this.store.count((total: number, active: number, completed: number) => {
            this.view.setItemsLeft(active);
            this.view.setClearCompletedButtonVisibility(completed);

            this.view.setCompleteAllCheckbox(completed === total);
            this.view.setMainVisibility(total);
        });

        this._lastActiveRoute = route;
    }
}
