import * as React from "react";
import type { SVGProps } from "react";
const SvgRemoveXCross = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Remove X Cross Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="m20.625 1.875-18.75 18.75m18.75 0L1.875 1.875"
    />
  </svg>
);
export default SvgRemoveXCross;
