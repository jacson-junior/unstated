import React from "react";
import type { ReactNode } from "react";
import { Container, ContainerType } from "./container";
import { Listener } from "./listener";
import { StateContext } from "./context";

export type SubscribeProps<
  Containers extends (ContainerType<any> | Container<any>)[],
> = {
  to: Containers;
  children: (
    ...instances: {
      [K in keyof Containers]: Containers[K] extends ContainerType<any>
        ? InstanceType<Containers[K]>
        : Containers[K];
    }
  ) => ReactNode;
};

type SubscribeState = Record<string, never>;

const DUMMY_STATE = {};

export class Subscribe<
  Containers extends (ContainerType<any> | Container<any>)[],
> extends React.Component<SubscribeProps<Containers>, SubscribeState> {
  state: SubscribeState = {};
  instances: Array<Container<any>> = [];
  unmounted = false;

  componentWillUnmount() {
    this.unmounted = true;
    this._unsubscribe();
  }

  _unsubscribe() {
    this.instances.forEach((container) => {
      container.unsubscribe(this.onUpdate);
    });
  }

  onUpdate: Listener = () => {
    return new Promise<void>((resolve) => {
      if (!this.unmounted) {
        this.setState(DUMMY_STATE, () => resolve());
      } else {
        resolve();
      }
    });
  };

  _createInstances(
    map: Map<any, Container<any>> | null,
    containers: (ContainerType<any> | Container<any>)[],
  ): Array<Container<any>> {
    this._unsubscribe();

    if (map === null) {
      throw new Error(
        "You must wrap your <Subscribe> components with a <Provider>",
      );
    }

    const instances = containers.map((ContainerItem) => {
      let instance;

      if (
        typeof ContainerItem === "object" &&
        ContainerItem instanceof Container
      ) {
        instance = ContainerItem;
      } else {
        instance = map.get(ContainerItem);

        if (!instance) {
          instance = new (ContainerItem as ContainerType<any>)();
          map.set(ContainerItem, instance);
        }
      }

      instance.unsubscribe(this.onUpdate);
      instance.subscribe(this.onUpdate);

      return instance;
    });

    this.instances = instances;
    return instances;
  }

  render() {
    return (
      <StateContext.Consumer>
        {(map) => {
          // We use Function.prototype.apply to pass the instances as separate arguments
          return this.props.children.apply(
            null,
            this._createInstances(map, this.props.to) as any,
          );
        }}
      </StateContext.Consumer>
    );
  }
}
