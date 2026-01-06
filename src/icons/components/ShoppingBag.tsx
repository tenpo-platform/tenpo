import * as React from "react";
import type { SVGProps } from "react";
const SvgShoppingBag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Shopping Bag Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M14.063 7.031H8.436m-1.406 0h-3.75L.703 19.22S3.75 22.03 11.25 22.03s10.547-2.812 10.547-2.812L19.219 7.03h-3.75M7.032 11.25V6.046c0-2.531 1.688-4.219 4.218-5.483 2.531 1.265 4.218 2.953 4.218 5.483v5.203"
    />
  </svg>
);
export default SvgShoppingBag;
