import type { Message } from "../../../interfaces/Message";
import { log } from "../../../utils/logger";
import { Peer } from "../../p2p/Peer";
import { addListeners } from "../utils/listeners";

let uuid: string | undefined;
let tabId: number | undefined;
addListeners();

const peer = new Peer();

chrome.runtime.onMessage.addListener((message: Message) => {
    if(message.type === 'uuid') {
        uuid = message.data.uuid

        peer.on('registered', () => {
            peer.listen(message.data.uuid);
            setHandlers();
        });
    }

    if(message.type === 'tabId' && message.data.tabId) {
        tabId = parseInt(message.data.tabId);
        log('RECEIVED TABID:', tabId);
    }
});

function setHandlers() {
    peer.on('test', (message) => {
        log(message);
    });
    
    peer.on('goto', (message) => {
        if(message.data.href && tabId) {
            window.location.href = message.data.href;
            chrome.runtime.sendMessage({
                type: 'RELOAD_ME',
                data: {
                    tabId,
                    name: "Youtube",
                    targetUrl: "*://www.youtube.com/*",
                    streamerPath: 'plugins/youtube/streamer.js',
                    listenerPath: 'plugins/youtube/listener.js',
                    uuid
                }
            });
        }
    });

    peer.on('video', (message) => {
        const video = document.querySelector<HTMLVideoElement>('video');
        if (video) {
            const currentHref = window.location.href;
            const { action, time, volume, muted, playbackRate, fullscreen, href } = message.data;

            if (tabId && href && href !== currentHref) {
                window.location.href = message.data.href;
                chrome.runtime.sendMessage({
                    type: 'RELOAD_ME',
                    data: {
                        tabId,
                        name: "Youtube",
                        targetUrl: "*://www.youtube.com/*",
                        streamerPath: 'plugins/youtube/streamer.js',
                        listenerPath: 'plugins/youtube/listener.js',
                        uuid
                    }
                });
            }

            switch (action) {
                case 'play':
                    if (video.paused) video.play();
                    if (time !== undefined && Math.abs(video.currentTime - parseFloat(time)) > 0.5) {
                        video.currentTime = parseFloat(time);
                    }
                    break;
                case 'pause':
                    if (!video.paused) video.pause();
                    if (time !== undefined && Math.abs(video.currentTime - parseFloat(time)) > 0.5) {
                        video.currentTime = parseFloat(time);
                    }
                    break;
                case 'seeked':
                    if (time !== undefined) {
                        video.currentTime = parseFloat(time);
                    }
                    break;
                case 'volumechange':
                    if (volume !== undefined) video.volume = parseFloat(volume);
                    if (muted !== undefined) video.muted = muted === 'true';
                    break;
                case 'ratechange':
                    if (playbackRate !== undefined) video.playbackRate = parseFloat(playbackRate);
                    break;
                case 'ended':
                    if (!video.ended) video.currentTime = parseFloat(time ?? '0');
                    break;
                case 'fullscreenchange':
                    if (fullscreen !== undefined) {
                        const shouldBeFullscreen = fullscreen === 'true';
                        const isCurrentlyFullscreen = !!document.fullscreenElement;
                        if (shouldBeFullscreen && !isCurrentlyFullscreen) {
                            video.requestFullscreen?.();
                        } else if (!shouldBeFullscreen && isCurrentlyFullscreen) {
                            document.exitFullscreen?.();
                        }
                    }
                    break;
                default:
                    break;
            }
        } else {
            log('LOG THE SCRIPT IN A VIDEO PAGE');
        }

        log(message);
    });
}