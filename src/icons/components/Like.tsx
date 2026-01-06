import * as React from "react";
import type { SVGProps } from "react";
const SvgLike = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Like Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M4.688 7.969H1.874S.469 10.312.469 14.063s1.406 6.093 1.406 6.093h2.813c7.03 0 13.125 1.64 13.125 1.64S22.03 16.876 22.03 7.97h-11.25V4.687C10.781 1.876 8.906.47 6.562.47v.469c0 1.928 0 3.856-1.406 6.268zm0 0S3.28 10.312 3.28 14.063c0 1.74.303 3.178.628 4.218"
    />
  </svg>
);
export default SvgLike;
