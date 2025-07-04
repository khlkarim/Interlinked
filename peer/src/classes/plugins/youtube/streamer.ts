import { log } from "../../../utils/logger";
import { Peer } from "../../p2p/Peer";
import { addListeners } from "../utils/listeners";

addListeners();

const peer = new Peer();
peer.on('registered', (message) => {
    chrome.runtime.sendMessage(message);
});

peer.stream();

document.addEventListener('keydown', (event) => {
    if(event.key === 'T' || event.key === 't')
    {
        peer.broadcast({
            type: 'test',
            data: {
                test: 'testing'
            }
        });
    }
});

let video: HTMLVideoElement | null = null;

window.addEventListener('yt-navigate-finish', () => {
    log('Navigation finished:', window.location.href);
    peer.broadcast({
        type: 'goto',
        data: {
            href: window.location.href
        }
    });

    video = document.querySelector<HTMLVideoElement>('video');

    if (video !== null) {
        const videoHref = window.location.href;

        video.addEventListener('play', () => {
            if (video) {
                peer.broadcast({
                    type: 'video',
                    data: {
                        action: 'play',
                        time: video.currentTime.toString(),
                        href: videoHref
                    }
                });
            }
        });

        video.addEventListener('pause', () => {
            if (video) {
                peer.broadcast({
                    type: 'video',
                    data: {
                        action: 'pause',
                        time: video.currentTime.toString(),
                        href: videoHref
                    }
                });
            }
        });

        video.addEventListener('seeked', () => {
            if (video) {
                peer.broadcast({
                    type: 'video',
                    data: {
                        action: 'seeked',
                        time: video.currentTime.toString(),
                        href: videoHref
                    }
                });
            }
        });

        video.addEventListener('volumechange', () => {
            if (video) {
                peer.broadcast({
                    type: 'video',
                    data: {
                        action: 'volumechange',
                        volume: video.volume.toString(),
                        muted: video.muted.toString(),
                        href: videoHref
                    }
                });
            }
        });

        video.addEventListener('ratechange', () => {
            if (video) {
                peer.broadcast({
                    type: 'video',
                    data: {
                        action: 'ratechange',
                        playbackRate: video.playbackRate.toString(),
                        href: videoHref
                    }
                });
            }
        });

        video.addEventListener('ended', () => {
            if (video) {
                peer.broadcast({
                    type: 'video',
                    data: {
                        action: 'ended',
                        time: video.currentTime.toString(),
                        href: videoHref
                    }
                });
            }
        });

        [
            'fullscreenchange',
            'webkitfullscreenchange',
            'mozfullscreenchange',
            'msfullscreenchange'
        ].forEach(eventType => {
            document.addEventListener(eventType, () => {
                const isFullscreen = !!(document.fullscreenElement);
                peer.broadcast({
                    type: 'video',
                    data: {
                        action: 'fullscreenchange',
                        fullscreen: isFullscreen.toString(),
                        href: videoHref
                    }
                });
            });
        });
    } else {
        log('LOG THE SCRIPT IN A VIDEO PAGE');
    }
});