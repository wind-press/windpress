<script setup></script>

<template>
    <div>
        <main class="max-w:lg mx:auto px:24 px:32@md">
            <div class="max-w:screen-xs mx:auto py:64 py:96@xs">
                <div class="text:center">
                    <p class="f:16 fg:sky-80 font:semibold line-height:24px">404</p>
                    <h1 class="f:36 f:48@xs fg:gray-95 font:bold letter-spacing:-0.025em line-height:40px line-height:1@xs mt:8">{{ __('This page does not exist.', 'windpress') }}</h1>
                    <p class="f:18 fg:gray-50 line-height:28px mt:8">{{ __('Sorry, we couldn\'t find the page you\'re looking for.', 'windpress') }}</p>
                </div>
                <div class="mt:48">
                    <h2 class="f:16 fg:gray-50 font:semibold line-height:24px">{{ __('Popular pages', 'windpress') }}</h2>
                    <ul role="list" class="{bt:1|solid|gray-20}>:not([hidden])~:not([hidden]) bl:0>:not([hidden])~:not([hidden]) bx:0 by:1|solid|gray-20 mt:16">
                        <li class="flex align-items:flex-start ml:16>:not([hidden])~:not([hidden]) position:relative py:24">
                            <div class="flex-shrink:0">
                                <span class="flex align-items:center bg:gray-20 h:48 justify-content:center r:8 w:48">
                                    <font-awesome-icon :icon="['fas', 'book']" class="f:24 fg:sky-80" />
                                </span>
                            </div>
                            <div class="flex:1|1|0 min-w:0">
                                <h3 class="f:16 fg:gray-95 font:medium line-height:24px my:0">
                                    <span class="{box-shadow:#ffffff|0|0|0|2,|#0ea5e9|0|0|0|4,|#000000|0|0|0|0}:focus-within r:2">
                                        <a href="https://wind.press/docs" target="_blank" class="box-shadow:0|0|#000000:focus fg:inherit outline-offset:2:focus outline:2px|solid|transparent:focus text-decoration-line:none">
                                            <span class="abs inset:0" aria-hidden="true"></span>
                                            {{ __('Documentation', 'windpress') }}
                                        </a>
                                    </span>
                                </h3>
                                <p class="f:16 fg:gray-50 line-height:24px my:0">{{ __('A complete knowledge-base of the product', 'windpress') }}</p>
                            </div>
                            <div class="flex align-items:center align-self:center flex-shrink:0">
                                <font-awesome-icon :icon="['far', 'chevron-right']" class="fg:gray-40" />
                            </div>
                        </li>

                        <li class="flex align-items:flex-start ml:16>:not([hidden])~:not([hidden]) position:relative py:24">
                            <div class="flex-shrink:0">
                                <span class="flex align-items:center bg:gray-20 h:48 justify-content:center r:8 w:48">
                                    <font-awesome-icon :icon="['fas', 'user-headset']" class="f:24 fg:sky-80" />
                                </span>
                            </div>
                            <div class="flex:1|1|0 min-w:0">
                                <h3 class="f:16 fg:gray-95 font:medium line-height:24px my:0">
                                    <span class="{box-shadow:#ffffff|0|0|0|2,|#0ea5e9|0|0|0|4,|#000000|0|0|0|0}:focus-within r:2">
                                        <a href="https://wind.press/support" target="_blank" class="box-shadow:0|0|#000000:focus fg:inherit outline-offset:2:focus outline:2px|solid|transparent:focus text-decoration-line:none">
                                            <span class="abs inset:0" aria-hidden="true"></span>
                                            {{ __('Support', 'windpress') }}
                                        </a>
                                    </span>
                                </h3>
                                <p class="f:16 fg:gray-50 line-height:24px my:0">{{ __('How can we help you?', 'windpress') }} </p>
                            </div>
                            <div class="flex align-items:center align-self:center flex-shrink:0">
                                <font-awesome-icon :icon="['far', 'chevron-right']" class="fg:gray-40" />
                            </div>
                        </li>

                        <li class="flex align-items:flex-start ml:16>:not([hidden])~:not([hidden]) position:relative py:24">
                            <div class="flex-shrink:0">
                                <span class="flex align-items:center bg:gray-20 h:48 justify-content:center r:8 w:48">
                                    <font-awesome-icon :icon="['fas', 'rss']" class="f:24 fg:sky-80" />
                                </span>
                            </div>
                            <div class="flex:1|1|0 min-w:0">
                                <h3 class="f:16 fg:gray-95 font:medium line-height:24px my:0">
                                    <span class="{box-shadow:#ffffff|0|0|0|2,|#0ea5e9|0|0|0|4,|#000000|0|0|0|0}:focus-within r:2">
                                        <a href="https://wind.press/blog" class="box-shadow:0|0|#000000:focus fg:inherit outline-offset:2:focus outline:2px|solid|transparent:focus text-decoration-line:none">
                                            <span class="abs inset:0" aria-hidden="true"></span>
                                            {{ __('Blog', 'windpress') }}
                                        </a>
                                    </span>
                                </h3>
                                <p class="f:16 fg:gray-50 line-height:24px my:0">{{ __('Read our latest news and articles', 'windpress') }}</p>
                            </div>
                            <div class="flex align-items:center align-self:center flex-shrink:0">
                                <font-awesome-icon :icon="['far', 'chevron-right']" class="fg:gray-40" />
                            </div>
                        </li>
                    </ul>
                    <div class="mt:32">
                        <router-link :to="{ name: 'home' }" class="{box-shadow:#ffffff|0|0|0|2,|#0ea5e9|0|0|0|4,|#000000|0|0|0|0}:focus-within f:16 fg:sky-40:hover fg:sky-80 font:medium line-height:24px text-decoration-line:none">
                            {{ __('Or go back to home', 'windpress') }}
                            <span aria-hidden="true"> &rarr;</span>
                        </router-link>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>