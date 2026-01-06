import * as React from "react";
import type { SVGProps } from "react";
const SvgHeart = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Heart Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 7.266a5.39 5.39 0 1 0-10.781 0l.002.284c0 6.466 4.312 10.778 10.779 14.013 6.468-3.235 10.78-7.546 10.78-14.013l.001-.284a5.39 5.39 0 0 0-10.781 0Zm0 0V7.5"
    />
  </svg>
);
export default SvgHeart;
