import * as React from "react";
import type { SVGProps } from "react";
const SvgCartLike = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Cart Like Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M10.781 3.297A1.88 1.88 0 0 0 8.906 1.41a1.88 1.88 0 0 0-1.875 1.888c0 2.266 1.5 3.776 3.75 4.909 2.25-1.133 3.75-2.643 3.75-4.909a1.88 1.88 0 0 0-1.875-1.888 1.88 1.88 0 0 0-1.875 1.888Zm0 0v-.016m7.031 1.875h3.75c-.937 7.032-3.28 10.313-3.28 10.313s-1.876.937-6.094.937-6.094-.937-6.094-.937l-3.985-15H0m9.844 19.687a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm8.437 0a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Z"
    />
  </svg>
);
export default SvgCartLike;
