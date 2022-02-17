export default class Tab {
  private tabId!: string;

  private window!: Window;

  constructor(window: Window) {
    // Thanks to: https://gist.github.com/6174/6062387
    this.tabId =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);
    this.window = window;
  }

  storageAvailable(storageType: 'localStorage' | 'sessionStorage'): Boolean {
    const test = 'vuex-multi-tab-state-test';
    try {
      this.window[storageType].setItem(test, test);
      this.window[storageType].removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  saveState(
    key: string,
    state: object,
    storageType: 'localStorage' | 'sessionStorage'
  ) {
    const toSave = JSON.stringify({
      id: this.tabId,
      state,
    });

    // Save the state in local storage
    this.window[storageType].setItem(key, toSave);
  }

  fetchState(
    key: string,
    storageType: 'localStorage' | 'sessionStorage',
    cb: Function
  ) {
    const value = this.window[storageType].getItem(key);

    if (value) {
      try {
        const parsed = JSON.parse(value);
        cb(parsed.state);
      } catch (e) {
        console.warn(
          `State saved in ${storageType} with key ${key} is invalid!`
        );
      }
    }
  }

  addEventListener(
    key: string,
    storageType: 'localStorage' | 'sessionStorage',
    cb: Function
  ) {
    return this.window.addEventListener('storage', (event: StorageEvent) => {
      if (!event.newValue || event.key !== key) {
        return;
      }

      try {
        const newState = JSON.parse(event.newValue);

        // Check if the new state is from another tab
        if (newState.id !== this.tabId) {
          cb(newState.state);
        }
      } catch (e) {
        console.warn(
          `New state saved in ${storageType} with key ${key} is invalid`
        );
      }
    });
  }
}
