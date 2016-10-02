'use strict';

import AppStore from './AppStore';
import ListViewStore from './components/lists/ListViewStore';
import ListItemStore from './components/lists/ListItemStore';

export default class AppPresenter {
    constructor() {
        this._store = new AppStore();

        this._store.filterStore = new ListViewStore();
        this._store.filterStore.headerText = 'Notes';

        const filterEverythingStore = new ListItemStore();
        filterEverythingStore.itemId        = 'filter-everything';
        filterEverythingStore.primaryText   = 'Everything';
        filterEverythingStore.secondaryText = '88';
        this._store.filterStore.items.push(filterEverythingStore);

        const filterStarredStore = new ListItemStore();
        filterStarredStore.itemId        = 'filter-starred';
        filterStarredStore.primaryText   = 'Starred';
        filterStarredStore.secondaryText = '17';
        this._store.filterStore.items.push(filterStarredStore);

        const filterArchivedStore = new ListItemStore();
        filterArchivedStore.itemId        = 'filter-archived';
        filterArchivedStore.primaryText   = 'Archived';
        filterArchivedStore.secondaryText = '1';
        this._store.filterStore.items.push(filterArchivedStore);

        this._store.categoryStore = new ListViewStore();
        this._store.categoryStore.headerText = 'Categories';

        const category1Store = new ListItemStore();
        category1Store.itemId        = 'a1';
        category1Store.primaryText   = 'Android';
        category1Store.secondaryText = '2';
        this._store.categoryStore.items.push(category1Store);

        const category2Store = new ListItemStore();
        category2Store.itemId        = 'a2';
        category2Store.primaryText   = 'iOS';
        category2Store.secondaryText = '0';
        this._store.categoryStore.items.push(category2Store);

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
