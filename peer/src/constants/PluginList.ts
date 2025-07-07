import type { Plugin } from "../interfaces/Plugin";

export const PLUGINS_LIST: Plugin[] = [
    {
        name: "Youtube Plugin V1",
        targetUrl: "*://www.youtube.com/*",
        streamerPath: 'plugins/youtube/streamer.js',
        listenerPath: 'plugins/youtube/listener.js'
    },
    {
        name: "Youtube Plugin V2",
        targetUrl: "*://www.youtube.com/*",
        streamerPath: 'plugins/youtube/streamer.js',
        listenerPath: 'plugins/youtube/listener.js'
    },
    {
        name: "Youtube Plugin V3",
        targetUrl: "*://www.youtube.com/*",
        streamerPath: 'plugins/youtube/streamer.js',
        listenerPath: 'plugins/youtube/listener.js'
    }
]