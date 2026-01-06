import * as React from "react";
import type { SVGProps } from "react";
const SvgLocationPin = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Location Pin Streamline Icon: https://streamlinehq.com"}</desc>
    <g stroke="currentColor" strokeWidth={1.5}>
      <path d="M4.954 3.079a8.906 8.906 0 0 0 0 12.595c2.887 2.887 4.89 3.78 6.297 5.889 1.405-2.11 3.466-3.057 6.297-5.889A8.906 8.906 0 0 0 4.954 3.08Z" />
      <path d="M14.53 9.373a3.28 3.28 0 1 1-6.56 0 3.28 3.28 0 0 1 6.56 0Z" />
    </g>
  </svg>
);
export default SvgLocationPin;
