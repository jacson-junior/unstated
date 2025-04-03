import type { ReactNode } from "react";
import { Container } from "./container";
import { StateContext } from "./context";

export interface ProviderProps {
  inject?: Array<Container<any>>;
  children: ReactNode;
}

export function Provider(props: ProviderProps) {
  return (
    <StateContext.Consumer>
      {(parentMap) => {
        const childMap = new Map<any, Container<any>>(parentMap || []);

        if (props.inject) {
          props.inject.forEach((instance) => {
            childMap.set(instance.constructor, instance);
          });
        }

        return (
          <StateContext.Provider value={childMap}>
            {props.children}
          </StateContext.Provider>
        );
      }}
    </StateContext.Consumer>
  );
}
