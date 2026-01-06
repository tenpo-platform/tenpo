import * as React from "react";
import type { SVGProps } from "react";
const SvgBurger = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Burger Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M22.031 12.422c-.992-.469-2.293-.703-3.593-.703-2.695 0-4.493 1.406-7.188 1.406s-4.492-1.406-7.186-1.406c-1.301 0-2.602.234-3.595.703m20.156-7.266.469 3.75H1.406l.469-3.75S3.75.938 11.25.938s9.375 4.218 9.375 4.218Zm0 14.532.469-4.22H11.25s-1.406 1.407-4.687 2.813L4.688 15.47H1.406l.469 4.219s2.344 1.875 9.375 1.875 9.375-1.875 9.375-1.875Z"
    />
  </svg>
);
export default SvgBurger;
