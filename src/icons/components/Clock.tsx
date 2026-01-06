import * as React from "react";
import type { SVGProps } from "react";
const SvgClock = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Clock Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 3.75v7.5l5.156 5.156m4.688-13.593s-4.219-1.407-9.844-1.407-9.844 1.407-9.844 1.407v16.875s4.219 1.406 9.844 1.406 9.844-1.407 9.844-1.407z"
    />
  </svg>
);
export default SvgClock;
