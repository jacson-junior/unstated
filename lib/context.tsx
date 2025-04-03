import React from "react";
import { Container } from "./container";

export const StateContext = React.createContext<Map<
  any,
  Container<any>
> | null>(null);
