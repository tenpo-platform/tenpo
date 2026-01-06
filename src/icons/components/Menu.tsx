import * as React from "react";
import type { SVGProps } from "react";
const SvgMenu = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Menu Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M0 4.219h22.5M0 11.25h22.5M0 18.281h22.5"
    />
  </svg>
);
export default SvgMenu;
