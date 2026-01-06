import * as React from "react";
import type { SVGProps } from "react";
const SvgDislike = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Dislike Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M4.688 14.531H1.874S.469 12.187.469 8.437s1.406-6.093 1.406-6.093h2.813c7.03 0 13.125-1.64 13.125-1.64S22.03 5.624 22.03 14.53h-11.25v3.281c0 2.813-1.875 4.22-4.219 4.22v-.47c0-1.928 0-3.856-1.406-6.268zm0 0S3.28 12.187 3.28 8.437c0-1.74.303-3.178.628-4.218"
    />
  </svg>
);
export default SvgDislike;
