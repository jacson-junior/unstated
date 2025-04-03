import { Listener } from "./listener";

const CONTAINER_DEBUG_CALLBACKS: Array<(container: Container<any>) => any> = [];

export class Container<State extends object> {
  state!: State;
  private _listeners: Array<Listener> = [];

  constructor() {
    CONTAINER_DEBUG_CALLBACKS.forEach((cb) => cb(this));
  }

  setState<K extends keyof State>(
    updater:
      | ((prevState: Readonly<State>) => Pick<State, K> | State | null)
      | (Pick<State, K> | State | null),
    callback?: () => void,
  ): Promise<void> {
    return Promise.resolve().then(() => {
      let nextState;

      if (typeof updater === "function") {
        nextState = (updater as Function)(this.state);
      } else {
        nextState = updater;
      }

      if (nextState == null) {
        if (callback) callback();
        return;
      }

      this.state = Object.assign({}, this.state, nextState);

      const promises = this._listeners.map((listener) => listener());

      return Promise.all(promises).then(() => {
        if (callback) {
          return callback();
        }
      });
    });
  }

  subscribe(fn: Listener): void {
    this._listeners.push(fn);
  }

  unsubscribe(fn: Listener): void {
    this._listeners = this._listeners.filter((f) => f !== fn);
  }
}

export type ContainerType<State extends object> = {
  new (...args: any[]): Container<State>;
};

export function __SUPER_SECRET_CONTAINER_DEBUG_HOOK__(
  callback: (container: Container<any>) => any,
): void {
  CONTAINER_DEBUG_CALLBACKS.push(callback);
}
