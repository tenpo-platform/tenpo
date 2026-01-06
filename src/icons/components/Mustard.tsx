import * as React from "react";
import type { SVGProps } from "react";
const SvgMustard = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Mustard Streamline Icon: https://streamlinehq.com"}</desc>
    <g stroke="currentColor" strokeWidth={1.5}>
      <path d="M3.75 20.156 5.625 7.97h11.25l1.875 12.187s-2.344 1.875-7.5 1.875-7.5-1.875-7.5-1.875Z" />
      <path d="M14.64 11.719H7.86l-.93 6.055c1.124.288 2.558.507 4.32.507s3.198-.22 4.32-.507zM7.969 5.156V7.97h6.562V5.156zM11.016.469 9.844 5.156h2.812L11.484.47z" />
    </g>
  </svg>
);
export default SvgMustard;
