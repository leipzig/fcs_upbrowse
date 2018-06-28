'use strict';
/*!
 * @version: 1.1.1
 * @name: template
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import {Item} from './item';

const escapeForHTML = (s: string) => s.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');

export default class Template {
    /**
     * Format the contents of a items list.
     *
     * @param {Array<Item>} items Object containing keys you want to find in the template to replace.
     * @returns {!string} Contents for a items list
     */
    itemList(items: Array<Item>) {
        return items.reduce((a, item) => a + `
<li data-id="${item.id}"${item.completed ? ' class="completed"' : ''}>
	<span class="toggle-li-wrap">
        <label class="custom-control custom-checkbox mb-0 mr-0">
            <input type="checkbox" class="toggle custom-control-input" ${item.completed ? 'checked' : ''}>
            <span class="custom-control-indicator"></span>
        </label>
    </span>
    <div class="edit-wrap"></div>
    <span class="title">${escapeForHTML(item.title)}</span>
	<button class="destroy btn btn-sm btn-default"><i class="fa fa-close"></i></button>
</li>`, '');
    }

    /**
     * Format the contents of an "items left" indicator.
     *
     * @param {number} activeTodos Number of active todos
     *
     * @returns {!string} Contents for an "items left" indicator
     */
    itemCounter(activeTodos: number) {
        return `${activeTodos} item${activeTodos !== 1 ? 's' : ''} left`;
    }
}
