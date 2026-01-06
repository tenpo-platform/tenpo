import * as React from "react";
import type { SVGProps } from "react";
const SvgBread = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Bread Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M19.219 10.781s-.469 3.281.937 8.907H6.094m13.125-8.907s2.343-.469 2.343-2.812-2.343-5.156-8.437-5.156H9.844m9.375 7.968h-3.75m0 0s-.469 3.281.937 8.907H2.344c1.406-5.625.937-8.907.937-8.907S.938 10.312.938 7.97 3.28 2.813 9.375 2.813s8.438 2.812 8.438 5.156-2.344 2.812-2.344 2.812Z"
    />
  </svg>
);
export default SvgBread;
