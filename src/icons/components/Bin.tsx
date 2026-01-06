import * as React from "react";
import type { SVGProps } from "react";
const SvgBin = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Bin Streamline Icon: https://streamlinehq.com"}</desc>
    <g stroke="currentColor" strokeWidth={1.5}>
      <path d="M3.281 6.563v13.593s2.344 1.875 7.969 1.875 7.969-1.875 7.969-1.875V6.563M0 5.156h22.5M8.438 9.375v8.438M14.063 9.375v8.438M7.106 5.156C7.456 3.11 9.028 1.673 11.25.563c2.222 1.11 3.793 2.547 4.144 4.593" />
    </g>
  </svg>
);
export default SvgBin;
