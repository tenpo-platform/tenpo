import * as React from "react";
import type { SVGProps } from "react";
const SvgVideo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Video Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M2.344 3.281h14.062V7.97c2.344-.469 4.688-2.813 4.688-2.813s.937 2.346.937 6.094-.937 6.094-.937 6.094S18.75 15 16.406 14.062v5.157H2.344S.469 15.937.469 11.25s1.875-7.969 1.875-7.969Z"
    />
  </svg>
);
export default SvgVideo;
