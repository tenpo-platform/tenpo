import * as React from "react";
import type { SVGProps } from "react";
const SvgInvesting = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Investing Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M21.563 6.392c-1.022-2.386-.342-5.113-.342-5.113m0 0s-2.727.68-5.113-.341m5.113.34L11.25 11.25 6.563 6.563.468 12.656m0 8.907H22.03M6.563 9.843v9.845m9.375-9.375v9.375M1.874 14.53v5.156m9.375-6.093v6.094m9.375-11.72v11.72"
    />
  </svg>
);
export default SvgInvesting;
