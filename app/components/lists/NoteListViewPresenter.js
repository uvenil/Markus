'use strict';

import FilterListViewPresenter from './FilterListViewPresenter';
import CategoryListViewPresenter from './CategoryListViewPresenter';
import ListViewStore from './ListViewStore';
import Database from '../../data/Database';

export default class NoteListViewPresenter {
    /**
     * Creates a new instance of NoteListViewPresenter.
     * @param {FilterListViewPresenter} filterListViewPresenter
     * @param {CategoryListViewPresenter} categoryListViewPresenter
     * @param {Database} database
     */
    construct(filterListViewPresenter, categoryListViewPresenter, database) {
        this._filterPresenter   = filterListViewPresenter;
        this._categoryPresenter = categoryListViewPresenter;
        this._store             = new ListViewStore();
        this._database          = database;
        this._sorting           = NoteListViewPresenter.DEFAULT_SORTING;
    }
}

NoteListViewPresenter.DEFAULT_SORTING = 2;

module.exports = NoteListViewPresenter;
