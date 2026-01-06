import * as React from "react";
import type { SVGProps } from "react";
const SvgUpArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Up Arrow Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M17.813 7.031c-4.688-1.406-6.563-5.625-6.563-5.625m0 0S9.375 5.625 4.688 7.031m6.562-5.625V22.5"
    />
  </svg>
);
export default SvgUpArrow;
