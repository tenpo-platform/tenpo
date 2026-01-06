import * as React from "react";
import type { SVGProps } from "react";
const SvgEgg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Egg Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M14.063 14.063a2.813 2.813 0 0 0-2.813-2.813m7.969 2.813c0 5.177-4.219 7.968-7.969 7.968s-7.969-2.79-7.969-7.968S7.031.469 11.25.469s7.969 8.416 7.969 13.594ZM11.25 8.906a5.156 5.156 0 1 0 0 10.313 5.156 5.156 0 0 0 0-10.313Z"
    />
  </svg>
);
export default SvgEgg;
