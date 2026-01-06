import * as React from "react";
import type { SVGProps } from "react";
const SvgPizza = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Pizza Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M9.844 4.688S18.28 8.594 18.28 18.75M5.203 11.31a2.344 2.344 0 1 0 2.513-3.708M15 18.75a3.75 3.75 0 0 0-7.5 0m14.531 0H1.406C6.563 6.563 13.125 1.875 13.125 1.875s8.906 4.688 8.906 16.875Z"
    />
  </svg>
);
export default SvgPizza;
