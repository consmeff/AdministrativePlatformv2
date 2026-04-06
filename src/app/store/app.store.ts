import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

interface AppState {
  appName: string;
  initialized: boolean;
}

const initialState: AppState = {
  appName: 'consmmefadmin',
  initialized: false,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ appName }) => ({
    pageTitle: computed(() => appName()),
  })),
  withMethods((store) => ({
    setAppName(appName: string) {
      patchState(store, { appName });
    },
    markInitialized() {
      patchState(store, { initialized: true });
    },
  })),
);
