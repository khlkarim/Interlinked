import { YoutubePlugin } from "./YoutubePugin";

export class PluginManager 
{
    static bindPluginByName(name: string, channel: RTCDataChannel) {
        switch(name) {
            case 'youtube':
                return new YoutubePlugin(channel);
        }
    }
}