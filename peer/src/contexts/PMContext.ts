import { createContext } from "react";
import { PluginManager } from "../classes/PluginManager";

export const PMContext =  createContext<PluginManager | null>(null);