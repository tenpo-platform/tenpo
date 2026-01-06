import * as React from "react";
import type { SVGProps } from "react";
const SvgMap = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Map Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M7.5 1.875c-1.238 0-4.687.469-7.031 1.875v16.875C2.813 19.219 6.262 18.75 7.5 18.75m0-16.875L15 3.75M7.5 1.875V18.75m7.5-15c1.238 0 4.688-.469 7.031-1.875V18.75c-2.343 1.406-5.793 1.875-7.031 1.875M15 3.75v16.875M7.5 18.75l7.5 1.875"
    />
  </svg>
);
export default SvgMap;
