import * as React from "react";
import type { SVGProps } from "react";
const SvgBookmark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Bookmark Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M3.281 2.344v19.453c4.219-1.172 7.969-4.922 7.969-4.922s3.75 3.75 7.969 4.922V2.344S16.406.469 11.25.469 3.281 2.344 3.281 2.344Z"
    />
  </svg>
);
export default SvgBookmark;
