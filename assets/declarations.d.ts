declare module "*?raw"
{
    const content: string;
    export default content;
}

declare module "*?url"
{
    const url: string;
    export default url;
}

interface Window {
    windpress: {
        _version: string;

        _wp_version: string;

        _via_wp_org: string;

        is_ubiquitous: boolean;

        assets: {
            url: string;
        };

        user_data: {
            data_dir: {
                url: string;
            };

            cache_dir: string[];
        };

        _wpnonce: string;

        rest_api: {
            // The base URL of the WindPress REST API endpoint.
            url: string;

            // The nonce for authenticating requests to the WindPress REST API.
            nonce: string;
        };

        site_meta: {
            name: string;

            site_url: string;

            web_history: string;
        };

        current_user: {
            name: string;

            avatar: string;

            role: string;
        };
    };
}