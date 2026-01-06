import * as React from "react";
import type { SVGProps } from "react";
const SvgShare = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Share Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="m7.547 7.913 6.98-4.106m0 14.886-6.98-4.106M18.28.469c-2.144 0-3.751.536-3.751.536v6.431s1.607.537 3.751.537 3.752-.537 3.752-.537V1.005S20.423.469 18.28.469Zm0 14.059c-2.144 0-3.751.536-3.751.536v6.431s1.607.536 3.751.536 3.752-.536 3.752-.536v-6.431s-1.608-.536-3.752-.536ZM4.221 7.498c-2.144 0-3.752.536-3.752.536v6.432s1.608.536 3.752.536 3.751-.536 3.751-.536V8.034s-1.607-.536-3.751-.536Z"
    />
  </svg>
);
export default SvgShare;
