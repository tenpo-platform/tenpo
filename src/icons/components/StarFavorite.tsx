import * as React from "react";
import type { SVGProps } from "react";
const SvgStarFavorite = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Star Favorite Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="m11.25 1.406.864 1.682a16.88 16.88 0 0 0 7.298 7.298l1.682.864-1.682.864a16.88 16.88 0 0 0-7.298 7.298l-.864 1.682-.864-1.682a16.88 16.88 0 0 0-7.298-7.298l-1.682-.864 1.682-.864a16.88 16.88 0 0 0 7.298-7.298z"
    />
  </svg>
);
export default SvgStarFavorite;
