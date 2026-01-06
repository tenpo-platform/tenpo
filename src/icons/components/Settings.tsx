import * as React from "react";
import type { SVGProps } from "react";
const SvgSettings = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Settings Streamline Icon: https://streamlinehq.com"}</desc>
    <g stroke="currentColor" strokeWidth={1.5}>
      <path d="M15 11.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path d="M20.156 5.965c-.384-.388-2.118-1.878-4.218-3.09A20.3 20.3 0 0 0 11.25.937a20.3 20.3 0 0 0-4.687 1.936c-2.1 1.213-3.835 2.703-4.22 3.091v10.57c.385.388 2.12 1.878 4.22 3.09a20.3 20.3 0 0 0 4.687 1.938 20.3 20.3 0 0 0 4.688-1.937c2.1-1.213 3.834-2.703 4.218-3.091z" />
    </g>
  </svg>
);
export default SvgSettings;
