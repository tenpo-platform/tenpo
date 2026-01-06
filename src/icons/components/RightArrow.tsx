import * as React from "react";
import type { SVGProps } from "react";
const SvgRightArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Right Arrow Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M15.469 4.688c1.406 4.687 5.625 6.562 5.625 6.562m0 0s-4.219 1.875-5.625 6.563m5.625-6.563H0"
    />
  </svg>
);
export default SvgRightArrow;
