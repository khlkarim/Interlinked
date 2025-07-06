import type { Plugin } from "../interfaces/Plugin";

export const PLUGINS_LIST: Plugin[] = [
    {
        name: "Youtube Plugin",
        targetUrl: "*://www.youtube.com/*",
        streamerPath: 'plugins/youtube/streamer.js',
        listenerPath: 'plugins/youtube/listener.js'
    }
]