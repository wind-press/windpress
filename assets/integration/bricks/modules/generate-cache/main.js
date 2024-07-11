/**
 * @module generate-cache 
 * @package Yabe Siul
 * @since 2.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

const bc = new BroadcastChannel('siul_channel');

(function () {
    const __xhr = window.XMLHttpRequest;
    function XMLHttpRequest() {

        const xhr = new __xhr();

        const open = xhr.open;

        xhr.open = function (method, url) {
            if (method === 'POST' && url.includes('admin-ajax.php')) {
                const onreadystatechange = xhr.onreadystatechange;

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.data && response.data.action) {
                            if (response.data.action === 'bricks_save_post') {
                                bc.postMessage({ key: 'generate-cache' });
                            }
                        }
                    }

                    if (onreadystatechange) {
                        onreadystatechange.apply(this, arguments);
                    }
                };
            }

            open.apply(this, arguments);
        }

        return xhr;
    }

    window.XMLHttpRequest = XMLHttpRequest;
}());