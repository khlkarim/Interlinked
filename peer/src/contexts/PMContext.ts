import { createContext } from "react";
import type { PluginManager } from "../classes/PluginManager";

export const PMContext =  createContext<PluginManager | null>(null);