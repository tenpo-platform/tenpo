import * as React from "react";
import type { SVGProps } from "react";
const SvgImage = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Image Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M1.406 15.938s2.696-4.22 5.904-6.563c3.08 2.344 6.08 6.563 6.08 6.563s2.14-2.813 3.852-3.75c1.711.937 3.852 3.75 3.852 3.75m0-13.125s-4.219-1.407-9.844-1.407-9.844 1.407-9.844 1.407v16.875s4.219 1.406 9.844 1.406 9.844-1.407 9.844-1.407zm-5.625 6.093a1.875 1.875 0 1 1 0-3.75 1.875 1.875 0 0 1 0 3.75Z"
    />
  </svg>
);
export default SvgImage;
