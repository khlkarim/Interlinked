import { log } from "../../utils/logger";
import { Peer } from "../../classes/p2p/Peer";

const peer = new Peer();
peer.on('REGISTERED', (message) => {
    peer.stream();

    chrome.runtime.sendMessage({
        type: 'STREAMER_UUID',
        data: {
            uuid: message.data.uuid
        }
    })
});
peer.on('NEW_CHILD', (message) => {
    peer.send(message.data.uuid, {
        type: 'GOTO',
        data: {
            href: window.location.href
        }
    });
});

document.addEventListener('keydown', (event) => {
    if(event.key === 'T' || event.key === 't')
    {
        peer.broadcast({
            type: 'TEST',
            data: {
                test: 'testing'
            }
        });
    }
});

let video = document.querySelector<HTMLVideoElement>('video');

window.addEventListener('yt-navigate-finish', () => {
    video = document.querySelector<HTMLVideoElement>('video');
    if(video) {
        video.pause();
    }

    peer.broadcast({
        type: 'GOTO',
        data: {
            href: window.location.href
        }
    })
});

if (video !== null) {
    video.addEventListener('play', () => {
        if (video) {
            peer.broadcast({
                type: 'VIDEO',
                data: {
                    action: 'PLAY',
                    time: video.currentTime.toString(),
                }
            });
        }
    });

    video.addEventListener('pause', () => {
        if (video) {
            peer.broadcast({
                type: 'VIDEO',
                data: {
                    action: 'PAUSE',
                    time: video.currentTime.toString(),
                }
            });
        }
    });

    video.addEventListener('seeked', () => {
        if (video) {
            peer.broadcast({
                type: 'VIDEO',
                data: {
                    action: 'SEEKED',
                    time: video.currentTime.toString(),
                }
            });
        }
    });

    video.addEventListener('volumechange', () => {
        if (video) {
            peer.broadcast({
                type: 'VIDEO',
                data: {
                    action: 'VOLUMECHANGE',
                    volume: video.volume.toString(),
                    muted: video.muted.toString(),
                }
            });
        }
    });

    video.addEventListener('ratechange', () => {
        if (video) {
            peer.broadcast({
                type: 'VIDEO',
                data: {
                    action: 'RATECHANGE',
                    playbackrate: video.playbackRate.toString(),
                }
            });
        }
    });

    video.addEventListener('ended', () => {
        if (video) {
            peer.broadcast({
                type: 'VIDEO',
                data: {
                    action: 'ENDED',
                    time: video.currentTime.toString(),
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
                type: 'VIDEO',
                data: {
                    action: 'FULLSCREENCHANGE',
                    fullscreen: isFullscreen.toString(),
                }
            });
        });
    });

    peer.on('NEW_CHILD', (message) => {
        if (video) {
            peer.send(message.data.uuid, {
                type: 'VIDEO',
                data: {
                    action: 'SYNC',
                    time: video.currentTime.toString(),
                    paused: video.paused.toString(),
                    volume: video.volume.toString(),
                    muted: video.muted.toString(),
                    playbackrate: video.playbackRate.toString(),
                    ended: video.ended.toString(),
                    fullscreen: (!!document.fullscreenElement).toString(),
                }
            });
        }
    });
} else {
    log('LOG THE SCRIPT IN A VIDEO PAGE');
}