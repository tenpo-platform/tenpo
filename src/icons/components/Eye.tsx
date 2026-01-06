import * as React from "react";
import type { SVGProps } from "react";
const SvgEye = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Eye Streamline Icon: https://streamlinehq.com"}</desc>
    <g stroke="currentColor" strokeWidth={1.5}>
      <path d="M11.25 2.813C5.625 2.813.563 11.25.563 11.25s5.062 8.438 10.687 8.438 10.688-8.438 10.688-8.438-5.063-8.437-10.688-8.437Z" />
      <path d="M14.531 11.25a3.281 3.281 0 1 1-6.562 0 3.281 3.281 0 0 1 6.562 0Z" />
    </g>
  </svg>
);
export default SvgEye;
