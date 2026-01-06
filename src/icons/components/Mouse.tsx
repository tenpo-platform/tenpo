import * as React from "react";
import type { SVGProps } from "react";
const SvgMouse = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Mouse Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 5.625v3.75m-8.437 7.5V5.625S4.687.469 11.25.469s8.438 5.156 8.438 5.156v11.25s-1.875 5.156-8.438 5.156-8.437-5.156-8.437-5.156Z"
    />
  </svg>
);
export default SvgMouse;
