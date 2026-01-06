import * as React from "react";
import type { SVGProps } from "react";
const SvgSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Search Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="m22.031 22.031-5.558-5.558a9.35 9.35 0 0 1-6.63 2.746C4.667 19.219.47 15.022.47 9.844S4.666.469 9.844.469s9.375 4.197 9.375 9.375A9.33 9.33 0 0 1 17.675 15"
    />
  </svg>
);
export default SvgSearch;
