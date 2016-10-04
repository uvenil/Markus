'use strict';

import AppStore from './AppStore';
import ListViewStore from './components/lists/ListViewStore';
import ListItemStore from './components/lists/ListItemStore';
import FilterListViewPresenter from './components/lists/FilterListViewPresenter';
import CategoryListViewPresenter from './components/lists/CategoryListViewPresenter';
import EditorStore from './components/text/EditorStore';
import Database from './data/Database';

export default class AppPresenter {
    constructor() {
        this._store    = new AppStore();
        this._database = new Database();

        this._filterPresenter   = new FilterListViewPresenter(this._database);
        this._categoryPresenter = new CategoryListViewPresenter(this._database);

        this._store.filterStore   = this._filterPresenter.store;
        this._store.categoryStore = this._categoryPresenter.store;

        this._store.noteStore = new ListViewStore();

        const note1Store = new ListItemStore();
        note1Store.itemId        = 'b1';
        note1Store.primaryText   = 'Lorem Ipsum';
        note1Store.secondaryText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
        note1Store.tertiaryText  = '3 days ago';
        this._store.noteStore.items.push(note1Store);

        const note2Store = new ListItemStore();
        note2Store.itemId        = 'b2';
        note2Store.primaryText   = 'de Finibus Bonorum et Malorum';
        note2Store.secondaryText = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?';
        note2Store.tertiaryText  = '56 minutes ago';
        this._store.noteStore.items.push(note2Store);

        const note3Store = new ListItemStore();
        note3Store.itemId        = 'b3';
        note3Store.primaryText   = 'de Finibus Bonorum et Malorum';
        note3Store.secondaryText = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?';
        note3Store.tertiaryText  = '3 seconds ago';
        this._store.noteStore.items.push(note3Store);

        this._store.editorStore = new EditorStore();
    }

    get store() {
        return this._store;
    }

    handleFilterItemClick(index) {
        this._store.filterStore.selectedIndex   = index;
        this._store.categoryStore.selectedIndex = -1;
    }

    handleCategoryItemClick(index) {
        this._store.filterStore.selectedIndex   = -1;
        this._store.categoryStore.selectedIndex = index;
    }

    handleNoteItemClick(index) {
        this._store.noteStore.selectedIndex = index;
    }
}

module.exports = AppPresenter;
