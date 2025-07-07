import type { Message } from "../../interfaces/Message";
import { log } from "../../utils/logger";
import { Peer } from "../../classes/p2p/Peer";

const peer = new Peer();

chrome.runtime.onMessage.addListener((message: Message) => {
    if(message.type === 'TARGET') {
        peer.on('REGISTERED', () => {
            peer.listen(message.data.target);
            setHandlers();
        });
    }
});

function setHandlers() {
    peer.on('TEST', (message) => {
        log(message);
    });

    peer.on('GOTO', (message) => {
        if(message.data.href === window.location.href) return;

        chrome.runtime.sendMessage({
            type: 'GOTO',
            data: {
                href: message.data.href
            }
        });
    });

    peer.on('VIDEO', (message) => {
        const video = document.querySelector<HTMLVideoElement>('video');

        if (video) {
            const { action, time, volume, muted, playbackRate, fullscreen } = message.data;

            switch (action?.toUpperCase()) {
                case 'PLAY':
                    if (video.paused) video.play();
                    if (time !== undefined && Math.abs(video.currentTime - Number(time)) > 0.5) {
                        video.currentTime = Number(time);
                    }
                    break;
                case 'PAUSE':
                    if (!video.paused) video.pause();
                    if (time !== undefined && Math.abs(video.currentTime - Number(time)) > 0.5) {
                        video.currentTime = Number(time);
                    }
                    break;
                case 'SEEKED':
                    if (time !== undefined && Math.abs(video.currentTime - Number(time)) > 0.5) {
                        video.currentTime = Number(time);
                    }
                    break;
                case 'VOLUMECHANGE':
                    if (volume !== undefined) video.volume = Number(volume);
                    if (muted !== undefined) video.muted = muted === 'true';
                    break;
                case 'RATECHANGE':
                    // Note: property is sometimes 'playbackrate' (lowercase) in your broadcast
                    if (message.data.playbackrate !== undefined) {
                        video.playbackRate = Number(message.data.playbackrate);
                    } else if (playbackRate !== undefined) {
                        video.playbackRate = Number(playbackRate);
                    }
                    break;
                case 'ENDED':
                    if (!video.ended && time !== undefined) video.currentTime = Number(time);
                    break;
                case 'FULLSCREENCHANGE':
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
                case 'SYNC':
                    log('asked to sync on', video);
                    if (time !== undefined && Math.abs(video.currentTime - Number(time)) > 0.5) {
                        video.currentTime = Number(time);
                    }
                    if (message.data.paused !== undefined) {
                        if (message.data.paused === 'true' && !video.paused) {
                            video.pause();
                        } else if (message.data.paused === 'false' && video.paused) {
                            video.play();
                        }
                    }
                    if (message.data.volume !== undefined) video.volume = Number(message.data.volume);
                    if (message.data.muted !== undefined) video.muted = message.data.muted === 'true';
                    if (message.data.playbackrate !== undefined) video.playbackRate = Number(message.data.playbackrate);
                    // Handle ended state if needed
                    if (message.data.ended === 'true' && !video.ended) {
                        video.currentTime = video.duration;
                    }
                    if (message.data.fullscreen !== undefined) {
                        const shouldBeFullscreen = message.data.fullscreen === 'true';
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