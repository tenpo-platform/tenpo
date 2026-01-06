import * as React from "react";
import type { SVGProps } from "react";
const SvgPin = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Pin Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M6.563 15.938c-3.282-3.282-3.282-7.5-3.282-7.5l4.688.468L13.594.937s2.812.47 5.156 2.813 2.813 5.156 2.813 5.156l-7.97 5.625.47 4.688s-4.22 0-7.5-3.282Zm0 0L.938 21.562"
    />
  </svg>
);
export default SvgPin;
