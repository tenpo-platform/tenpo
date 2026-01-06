import * as React from "react";
import type { SVGProps } from "react";
const SvgLeftArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Left Arrow Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M7.031 4.688C5.625 9.375 1.406 11.25 1.406 11.25m0 0s4.219 1.875 5.625 6.563M1.406 11.25H22.5"
    />
  </svg>
);
export default SvgLeftArrow;
