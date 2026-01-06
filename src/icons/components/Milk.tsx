import * as React from "react";
import type { SVGProps } from "react";
const SvgMilk = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Milk Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M.469 10.313V22.03H22.03V10.313m-21.562 0S2.344 7.03 5.156 4.687M.47 10.314H22.03m0 0s-1.875-3.282-4.687-5.626m-12.188 0h12.188m-12.188 0V2.345S7.031.469 11.25.469s6.094 1.875 6.094 1.875v2.344m0 0c-2.813 2.343-4.688 5.625-4.688 5.625V22.03"
    />
  </svg>
);
export default SvgMilk;
