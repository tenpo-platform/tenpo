import * as React from "react";
import type { SVGProps } from "react";
const SvgTv = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Tv Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 4.688C4.688 4.688.938 6.094.938 6.094v14.062s3.75 1.407 10.312 1.407 10.313-1.407 10.313-1.407V6.094s-3.75-1.407-10.313-1.407Zm0 0C12.656 2.344 15 .938 15 .938m-3.75 3.75C9.844 2.344 7.5.938 7.5.938m3.75 17.812c-3.21 0-5.746-.337-7.5-.68V8.18c1.754-.343 4.29-.68 7.5-.68s5.746.337 7.5.68v9.89c-1.754.343-4.29.68-7.5.68Z"
    />
  </svg>
);
export default SvgTv;
