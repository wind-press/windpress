/**
 * @module generate-cache 
 * @package Yabe Siul
 * @since 2.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { iframeScope } from "../../constant"; 

const bc = new BroadcastChannel('siul_channel');

const originalAllSaved = iframeScope.allSaved;

iframeScope.allSaved = function () {
    originalAllSaved.apply(this, arguments);

    bc.postMessage({ key: 'generate-cache' });
};