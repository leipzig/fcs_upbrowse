'use strict';
/*!
 * @version: 1.1.1
 * @name: view
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import {Item} from './item';
import Template from './template';

const _itemId = (e: any) => parseInt(e.data('id'), 10);
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

export default class View {
    static readonly $todoList = $('.todo-list');
    static readonly $todoItemCounter = $('.todo-count');
    static readonly $clearCompleted = $('.clear-completed');
    static readonly $wrap = $('.todo-list-wrap');
    static readonly $toggleAll = $('.toggle-all');
    static readonly $newTodo = $('.new-todo');
    static readonly $filterTodo = $('.filters');

    /**
     * @param {!Template} template A Template instance
     */
    constructor(private template: Template) {
        $(View.$todoList).on('dblclick','li .title', (e) => this._editItem(e));
    }

    /**
     * Populate the items with a list of items.
     *
     * @param {ItemList} items Array of items to display
     */
    public showItems(items: Array<Item>) {
        View.$todoList.html(this.template.itemList(items));
        return this;
    }

    /**
     * Remove an item from the view.
     *
     * @param {number} id Item ID of the item to remove
     */
    public removeItem(id: number) {
        const $elem = $(`[data-id='${id}']`);

        if ($elem.get(0)) {
            $elem.remove();
        }
        return this;
    }

    /**
     * Set the number in the 'items left' display.
     *
     * @param {number} itemsLeft Number of items left
     */
    public setItemsLeft(itemsLeft: number) {
        View.$todoItemCounter.html(this.template.itemCounter(itemsLeft));
        return this;
    }

    /**
     * Set the visibility of the "Clear completed" button.
     *
     * @param {boolean|number} visible Desired visibility of the button
     */
    public setClearCompletedButtonVisibility(visible: boolean | number) {
        View.$clearCompleted.css('display', !!visible ? 'block' : 'none');
        return this;
    }

    /**
     * Set the visibility of the main content and footer.
     *
     * @param {boolean|number} visible Desired visibility
     */
    public setMainVisibility(visible: boolean | number) {
        View.$wrap.css('display', !!visible ? 'block' : 'none');
        return this;
    }

    /**
     * Set the checked state of the Complete All checkbox.
     *
     * @param {boolean|number} checked The desired checked state
     */
    public setCompleteAllCheckbox(checked: boolean | number) {
        View.$toggleAll.prop('checked', !!checked);
        return this;
    }

    /**
     * Change the appearance of the filter buttons based on the route.
     *
     * @param {string} route The current route
     */
    public updateFilterButtons(route: string) {
        View.$filterTodo.find('.selected').removeClass();
        View.$filterTodo.find(`[data-id="${route}"]`).addClass('selected');
        return this;
    }

    /**
     * Clear the new item input
     */
    public clearNewTodo() {
        View.$newTodo.val('');
        return this;
    }

    /**
     * Render an item as either completed or not.
     *
     * @param {!number} id Item ID
     * @param {!boolean} completed True if the item is completed
     */
    public setItemComplete(id: number, completed: boolean) {
        const $listItem = $(`[data-id='${id}']`);

        if (!$listItem.get(0)) {
            return this;
        }

        $listItem.toggleClass('completed');

        // In case it was toggled from an event and not by clicking the checkbox
        $listItem.find('.toggle').prop('checked', completed);
        return this;
    }

    /**
     * Bring an item out of edit mode.
     *
     * @param {!number} id Item ID of the item in edit
     * @param {!string} title New title for the item in edit
     */
    public editItemDone(id: number, title: string) {
        const $listItem = $(`[data-id='${id}']`);
        let $edit = $listItem.find('.edit-wrap');

        $edit.find('>input').remove();
        $listItem.removeClass('editing');

        $listItem.find('.title').text(title);
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindAddItem(handler: any) {
        View.$newTodo.on('change', (event: Event) => {
            const title = $(event.target).val().trim();
            if (title) {
                handler(title);
            }
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindToggleFilter(handler: any) {
        View.$filterTodo.on('click', 'a', (event: Event) => {
            const id = $(event.target).data('id');
            if (id) {
                handler(id);
                event.preventDefault();
            }
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindRemoveCompleted(handler: any) {
        View.$clearCompleted.on('click', handler);
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindToggleAll(handler: any) {
        View.$toggleAll.on('click', (e: Event) => {
            handler($(e.target).prop('checked'));
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindRemoveItem(handler: any) {
        View.$todoList.on('click', '.destroy', (e: Event) => {
            handler(_itemId($(e.target).parents('li')));
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindToggleItem(handler: any) {
        View.$todoList.on('click', '.toggle', (e: Event) => {
            handler(_itemId($(e.target).parents('li')), $(e.target).prop('checked'));
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindEditItemSave(handler: any) {
        View.$todoList.on('blur', 'li .edit', (e:Event) => {
            if (!$(e.target).data('is-canceled')) {
                handler(_itemId($(e.target).parents('li')), $(e.target).val().trim());
            }
        });

        // Remove the cursor from the input when you hit enter just like if it were a real form
        View.$todoList.on('keypress', 'li .edit', (e: any) => {
            if (e.which === ENTER_KEY) {
                $(e.target).blur();
            }
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    public bindEditItemCancel(handler: any) {
        View.$todoList.find('li .edit').keyup((e: any) => {
            if (e.which === ESCAPE_KEY) {
                $(e.target).data('is-canceled', true);
                $(e.target).blur();

                handler(_itemId(e));
            }
        });
        return this;
    }

    /**
     * Put an item into edit mode.
     *
     * @param {!Event} event Fired Event Object
     */
    protected _editItem(event: Event) {
        const $listItem = $(event.target).parents('li');
        $listItem.addClass('editing');
        let $edit = $listItem.find('.edit-wrap');
        $('<input>').addClass('edit form-control').val($listItem.text().trim()).appendTo($edit).focus();
        return this;
    }
}
