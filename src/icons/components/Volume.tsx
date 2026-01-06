import * as React from "react";
import type { SVGProps } from "react";
const SvgVolume = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Volume Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M16.875 6.094a5.156 5.156 0 1 1 0 10.312m0-7.5a2.344 2.344 0 0 1 0 4.688m-2.344-2.344c0-5.625-1.406-9.375-1.406-9.375S7.5 6.094.469 7.5V15c7.031 1.406 12.656 5.625 12.656 5.625s1.406-3.75 1.406-9.375Z"
    />
  </svg>
);
export default SvgVolume;
