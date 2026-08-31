# brand

`brand-icon.svg` 是 Anyknown 的 mark，各產品共用。`fill="currentColor"`，所以直接 inline 進
DOM 就跟著文字顏色走；要當檔案用就自己指定 `color`。

不進 npm package（`package.json` 的 `files` 只有 `dist` 與 `LICENSE`）——這是品牌資產不是元件，
需要的產品從這裡複製一份過去。目前的複本：`product/apps/mobile/assets/source/brand-icon.svg`。
