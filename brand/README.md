# brand

`brand-icon.svg` is the Anyknown mark, shared by every product. It uses `fill="currentColor"`, so inlined in the
DOM it follows the text color; when you use it as a file, set `color` yourself.

It is not in the npm package (`files` in `package.json` lists only `dist` and `LICENSE`). It is a brand asset, not a
component; products that need it copy it from here. Current copy: `product/apps/mobile/assets/source/brand-icon.svg`.

`icons/` holds 24px line icons drawn by Senlima (memory / questions / input-mode), with `stroke="currentColor"` and
stroke-width 2, the same spec as the icons in the components. Use them the same way: inline them in the DOM, or copy
them into the product.
